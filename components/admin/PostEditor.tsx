'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import styles from './PostEditor.module.css';
import MediaPicker from './MediaPicker';

// ===== 画像圧縮 =====
const TARGET_SIZE_BYTES = 800 * 1024;
const MAX_DIMENSION = 1920;

function isHeic(file: File): boolean {
  return file.type === 'image/heic' || file.type === 'image/heif' || /\.(heic|heif)$/i.test(file.name);
}

async function compressImage(file: File): Promise<File> {
  if (file.size <= TARGET_SIZE_BYTES) return file;
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width >= height) { height = Math.round((height / width) * MAX_DIMENSION); width = MAX_DIMENSION; }
        else { width = Math.round((width / height) * MAX_DIMENSION); height = MAX_DIMENSION; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      const tryQuality = (q: number) => {
        canvas.toBlob((blob) => {
          if (!blob) { resolve(file); return; }
          if (blob.size <= TARGET_SIZE_BYTES || q <= 0.1) resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
          else tryQuality(Math.max(q - 0.1, 0.1));
        }, 'image/jpeg', q);
      };
      tryQuality(0.85);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

// ===== HTML → プレーンテキスト =====
function htmlToPlainText(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n[h2]$1[/h2]\n\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n[h3]$1[/h3]\n\n')
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, inner) => {
      const items = [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim()).join('\n');
      return `\n\n[ul]\n${items}\n[/ul]\n\n`;
    })
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, inner) => `\n\n[quote]${inner.replace(/<[^>]+>/g, '').trim()}[/quote]\n\n`)
    .replace(/<\/p>\s*<p>/gi, '\n\n').replace(/<p[^>]*>/gi, '').replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n').trim();
}

// ===== コンテンツパース（編集時） =====
interface ProductData {
  amazonUrl: string; rakutenUrl: string;
  title: string; image: string; price: string; brand: string;
}

function parsePostContent(html: string): {
  body: string; products: ProductData[]; images: { url: string; id: number }[];
} {
  const products: ProductData[] = [];
  let processed = html.replace(
    /<div[^>]*class="[^"]*hl-product-card[^"]*"[^>]*(?:\/>|>[\s\S]*?<\/div>)/g,
    (fullMatch) => {
      const get = (attr: string) => { const m = fullMatch.match(new RegExp(`data-${attr}="([^"]*)"`)); return m ? m[1] : ''; };
      products.push({
        amazonUrl: get('amazon-url'), rakutenUrl: get('rakuten-url'),
        title: get('title'), image: get('image'), price: get('price'), brand: get('brand'),
      });
      return `[product:${products.length - 1}]`;
    }
  );

  const images: { url: string; id: number }[] = [];
  processed = processed.replace(/<figure[^>]*>([\s\S]*?)<\/figure>/g, (fullMatch) => {
    const srcM = fullMatch.match(/src="([^"]*)"/);
    const idM = fullMatch.match(/wp-image-(\d+)/);
    if (!srcM) return '';
    images.push({ url: srcM[1], id: idM ? parseInt(idM[1], 10) : 0 });
    return `[image:${images.length - 1}]`;
  });

  const placeholders: Record<string, string> = {};
  processed = processed.replace(/\[product:\d+\]/g, (m) => {
    const key = `__PROD_${Object.keys(placeholders).length}__`;
    placeholders[key] = m;
    return key;
  });
  let body = htmlToPlainText(processed);
  Object.entries(placeholders).forEach(([key, val]) => { body = body.replace(key, val); });

  return { body, products, images };
}

// ===== Types =====
interface UploadedImage {
  uid: number; localUrl: string; url?: string; id?: number; uploading: boolean; error?: string;
}
interface Category { id: number; name: string; slug: string; }
interface InitialData {
  id: string; title: string; date: string; categoryIds: number[];
  content: string; status: 'publish' | 'draft';
  featuredMediaId?: number; featuredImageUrl?: string;
}
interface Props { categories: Category[]; initialData?: InitialData; }

// ===== 商品カードエディター =====
function ProductCardEditor({ index, data, onInsert, onRemove, onUpdate }: {
  index: number; data: ProductData;
  onInsert: (i: number) => void;
  onRemove: (i: number) => void;
  onUpdate: (i: number, d: Partial<ProductData>) => void;
}) {
  const [amazonInput, setAmazonInput] = useState(data.amazonUrl);
  const [rakutenInput, setRakutenInput] = useState(data.rakutenUrl);
  const [fetching, setFetching] = useState(false);
  const [fetchErr, setFetchErr] = useState('');
  const [editing, setEditing] = useState(false);

  async function handleFetch() {
    const url = amazonInput || rakutenInput;
    if (!url) return;
    setFetching(true); setFetchErr('');
    try {
      const res = await fetch(`/api/product-metadata?url=${encodeURIComponent(url)}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'エラー');
      onUpdate(index, { amazonUrl: amazonInput, rakutenUrl: rakutenInput, title: d.title || '', image: d.image || '', price: d.price || '', brand: d.brand || '' });
    } catch (e: unknown) {
      setFetchErr(e instanceof Error ? e.message : 'エラー');
    } finally { setFetching(false); }
  }

  const hasMeta = data.title || data.image;

  return (
    <div className={styles.productCard}>
      <div className={styles.productIndex}>[product:{index}]</div>

      <div className={styles.productInputRow}>
        <input type="url" value={amazonInput} onChange={(e) => setAmazonInput(e.target.value)}
          placeholder="Amazon URL (amzn.to / amazon.co.jp)" className={styles.input} />
        <button type="button" onClick={handleFetch} disabled={fetching || (!amazonInput && !rakutenInput)} className={styles.fetchBtn}>
          {fetching ? '取得中...' : '取得'}
        </button>
      </div>
      <input type="url" value={rakutenInput} onChange={(e) => setRakutenInput(e.target.value)}
        placeholder="楽天 URL（任意）" className={styles.input} style={{ marginTop: '8px' }} />

      {fetchErr && <p className={styles.error} style={{ marginTop: '8px' }}>{fetchErr}</p>}

      {hasMeta && !editing && (
        <div className={styles.productPreview}>
          {data.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.image} alt={data.title} className={styles.productThumb} />
          )}
          <div className={styles.productInfo}>
            {data.brand && <span className={styles.productBrand}>{data.brand}</span>}
            <p className={styles.productTitle}>{data.title}</p>
            {data.price && <span className={styles.productPrice}>{data.price}</span>}
          </div>
        </div>
      )}

      {editing && (
        <div className={styles.productEditFields}>
          <input type="text" value={data.title} onChange={(e) => onUpdate(index, { title: e.target.value })} placeholder="商品名" className={styles.input} />
          <input type="text" value={data.brand} onChange={(e) => onUpdate(index, { brand: e.target.value })} placeholder="ブランド" className={styles.input} />
          <input type="text" value={data.price} onChange={(e) => onUpdate(index, { price: e.target.value })} placeholder="価格（例：¥3,980）" className={styles.input} />
          <input type="url" value={data.image} onChange={(e) => onUpdate(index, { image: e.target.value })} placeholder="画像URL" className={styles.input} />
        </div>
      )}

      <div className={styles.productFooter}>
        <button type="button" onClick={() => onInsert(index)} className={styles.insertBtn} style={{ padding: '5px 12px', flex: 'none' }}>本文に挿入</button>
        {hasMeta && (
          <button type="button" onClick={() => setEditing((v) => !v)} className={styles.removeTextBtn}>
            {editing ? '完了' : '編集'}
          </button>
        )}
        <button type="button" onClick={() => onRemove(index)} className={styles.removeTextBtn}>削除</button>
      </div>
    </div>
  );
}

// ===== メインエディター =====
export default function PostEditor({ categories, initialData }: Props) {
  const router = useRouter();
  const parsed = initialData ? parsePostContent(initialData.content) : null;
  const todayStr = new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState(initialData?.title ?? '');
  const [date, setDate] = useState(initialData?.date ?? todayStr);
  const [selectedCats, setSelectedCats] = useState<number[]>(initialData?.categoryIds ?? []);
  const [body, setBody] = useState(parsed?.body ?? '');
  const [images, setImages] = useState<UploadedImage[]>(
    parsed?.images.map((img, i) => ({ uid: i, localUrl: img.url, url: img.url, id: img.id, uploading: false })) ?? []
  );
  const [products, setProducts] = useState<ProductData[]>(parsed?.products ?? []);
  const [eyecatch, setEyecatch] = useState<UploadedImage | null>(
    initialData?.featuredImageUrl && initialData.featuredMediaId
      ? { uid: -1, localUrl: initialData.featuredImageUrl, url: initialData.featuredImageUrl, id: initialData.featuredMediaId, uploading: false }
      : null
  );
  const [isEyecatchDragging, setIsEyecatchDragging] = useState(false);
const [isDraggingOnBody, setIsDraggingOnBody] = useState(false);
  const [ogpCache, setOgpCache] = useState<Record<string, { title: string; description: string; image: string | null; siteName: string; favicon: string } | null>>({});
  const [affiliateCache, setAffiliateCache] = useState<Record<string, { title: string; image: string; price: string; brand: string } | null>>({});
  const fetchingUrls = useRef<Set<string>>(new Set());
  const fetchingAffiliateUrls = useRef<Set<string>>(new Set());
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [eyecatchStatus, setEyecatchStatus] = useState<'idle' | 'fetching' | 'done' | 'error'>('idle');
  const [slashMenu, setSlashMenu] = useState<{ top: number; left: number; query: string } | null>(null);
  const [slashIndex, setSlashIndex] = useState(0);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

const eyecatchInputRef = useRef<HTMLInputElement>(null);
  const autoFetchedUrlRef = useRef<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const slashStartRef = useRef<number>(-1);

  const SLASH_COMMANDS = [
    { label: 'H2 見出し',   icon: 'H2', insert: '[h2][/h2]',         cursor: 4,  action: 'insert' },
    { label: 'H3 小見出し', icon: 'H3', insert: '[h3][/h3]',         cursor: 4,  action: 'insert' },
    { label: 'リスト',      icon: 'UL', insert: '[ul]\n\n[/ul]',     cursor: 5,  action: 'insert' },
    { label: '引用',        icon: '❝',  insert: '[quote][/quote]',   cursor: 7,  action: 'insert' },
    { label: '画像を挿入',  icon: '🖼',  insert: '',                  cursor: 0,  action: 'media' },
  ] as const;

  function applySlashCommand(cmdIndex: number) {
    const ta = textareaRef.current;
    if (!ta || slashStartRef.current < 0) return;
    const cmd = SLASH_COMMANDS[cmdIndex];
    setSlashMenu(null);
    if (cmd.action === 'media') {
      // /を削除してからメディアピッカーを開く
      const before = body.slice(0, slashStartRef.current);
      const after = body.slice(ta.selectionStart);
      setBody(before + after);
      setShowMediaPicker(true);
      slashStartRef.current = -1;
      return;
    }
    const before = body.slice(0, slashStartRef.current);
    const after = body.slice(ta.selectionStart);
    const newBody = before + cmd.insert + after;
    setBody(newBody);
    const pos = slashStartRef.current + cmd.cursor;
    requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = pos; ta.focus(); });
    slashStartRef.current = -1;
  }

  function handleMediaSelect(item: { id: number; source_url: string; alt_text: string; title: { rendered: string } }) {
    const uid = ++uidRef.current;
    const newImg = { uid, localUrl: item.source_url, url: item.source_url, id: item.id, uploading: false };
    setImages((prev) => {
      const idx = prev.length;
      insertAtCursor(`[image:${idx}]`);
      return [...prev, newImg];
    });
    setShowMediaPicker(false);
  }

  function handleBodyChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setBody(val);
    const pos = e.target.selectionStart;
    // カーソル直前のテキストから現在行を取得
    const lineStart = val.lastIndexOf('\n', pos - 1) + 1;
    const lineText = val.slice(lineStart, pos);
    if (lineText.startsWith('/')) {
      const query = lineText.slice(1).toLowerCase();
      const ta = e.target;
      // カーソル位置の座標を擬似的に取得（textarea上部からの行数で計算）
      const lines = val.slice(0, pos).split('\n');
      const lineHeight = 22;
      const top = lines.length * lineHeight + 4;
      slashStartRef.current = lineStart;
      setSlashIndex(0);
      setSlashMenu({ top, left: 0, query });
    } else {
      setSlashMenu(null);
      slashStartRef.current = -1;
    }
  }

  function handleBodyKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!slashMenu) return;
    const filtered = SLASH_COMMANDS.filter(c => c.label.toLowerCase().includes(slashMenu.query) || c.icon.toLowerCase().includes(slashMenu.query));
    if (e.key === 'ArrowDown') { e.preventDefault(); setSlashIndex(i => (i + 1) % filtered.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSlashIndex(i => (i - 1 + filtered.length) % filtered.length); }
    else if (e.key === 'Enter' || e.key === 'Tab') {
      if (filtered.length > 0) { e.preventDefault(); applySlashCommand(SLASH_COMMANDS.indexOf(filtered[slashIndex])); }
    } else if (e.key === 'Escape') { setSlashMenu(null); slashStartRef.current = -1; }
  }

  // note.com URLを本文から検出してアイキャッチを自動取得
  useEffect(() => {
    const match = body.match(/https:\/\/note\.com\/[^\s"'<>]+/);
    const noteUrl = match?.[0] ?? '';

    if (!noteUrl || noteUrl === autoFetchedUrlRef.current) return;
    if (eyecatch) return; // すでにアイキャッチがあれば何もしない

    autoFetchedUrlRef.current = noteUrl;
    setEyecatchStatus('fetching');

    (async () => {
      try {
        const ogpRes = await fetch(`/api/ogp?url=${encodeURIComponent(noteUrl)}`);
        const ogp = await ogpRes.json();
        if (!ogp.image) throw new Error('OGP image not found');

        const imgRes = await fetch(`/api/fetch-image?url=${encodeURIComponent(ogp.image)}`);
        if (!imgRes.ok) throw new Error('Image fetch failed');

        const blob = await imgRes.blob();
        const ext = blob.type.includes('png') ? 'png' : 'jpg';
        const file = new File([blob], `note-eyecatch-${Date.now()}.${ext}`, { type: blob.type || 'image/jpeg' });

        await setEyecatchFile(file);
        setEyecatchStatus('done');
      } catch {
        setEyecatchStatus('error');
        autoFetchedUrlRef.current = ''; // リセットして再試行可能に
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body]);
  const uidRef = useRef(parsed?.images.length ?? 0);
  const dragIndexRef = useRef<number | null>(null);

  function handleImageDragStart(i: number) {
    dragIndexRef.current = i;
  }

  function handleImageDrop(dropIndex: number) {
    const from = dragIndexRef.current;
    if (from === null || from === dropIndex) return;
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(dropIndex, 0, moved);
      return next;
    });
    // body内の [image:N] を新しいインデックスにリマップ
    setBody((prev) => {
      const total = images.length;
      const order = Array.from({ length: total }, (_, i) => i);
      const [movedIdx] = order.splice(from, 1);
      order.splice(dropIndex, 0, movedIdx);
      const inverse: number[] = new Array(total);
      order.forEach((origIdx, newIdx) => { inverse[origIdx] = newIdx; });
      return prev.replace(/\[image:(\d+)\]/g, (_, n) => {
        const ni = parseInt(n, 10);
        return `[image:${ni < total ? inverse[ni] : ni}]`;
      });
    });
    dragIndexRef.current = null;
  }

  // 本文からスタンドアロンURLを抽出（YouTubeとアフィリエイトURLは除外）
  const standaloneUrls = useMemo(() => {
    const urls: string[] = [];
    for (const para of body.split('\n\n')) {
      const t = para.trim();
      if (/^https?:\/\/\S+$/.test(t) &&
          !/(?:youtube\.com|youtu\.be)/i.test(t) &&
          !/(?:amazon\.co\.jp|amzn\.to|amzn\.asia|rakuten\.co\.jp)/i.test(t) &&
          !/^\[(?:image|product|h2|h3)/.test(t)) {
        if (!urls.includes(t)) urls.push(t);
      }
    }
    return urls;
  }, [body]);

  // 本文からAmazon/楽天URLを抽出
  const standaloneAffiliateUrls = useMemo(() => {
    const urls: string[] = [];
    for (const para of body.split('\n\n')) {
      const t = para.trim();
      if (/^https?:\/\/\S+$/.test(t) &&
          /(?:amazon\.co\.jp|amzn\.to|amzn\.asia|rakuten\.co\.jp)/i.test(t)) {
        if (!urls.includes(t)) urls.push(t);
      }
    }
    return urls;
  }, [body]);

  // OGP一括フェッチ（デバウンス付き）
  useEffect(() => {
    const timer = setTimeout(() => {
      for (const url of standaloneUrls) {
        if (url in ogpCache || fetchingUrls.current.has(url)) continue;
        fetchingUrls.current.add(url);
        fetch(`/api/ogp?url=${encodeURIComponent(url)}`)
          .then((r) => r.json())
          .then((data) => setOgpCache((prev) => ({ ...prev, [url]: data?.title ? data : null })))
          .catch(() => setOgpCache((prev) => ({ ...prev, [url]: null })))
          .finally(() => fetchingUrls.current.delete(url));
      }
    }, 600);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [standaloneUrls]);

  // アフィリエイトURL一括フェッチ（デバウンス付き）
  useEffect(() => {
    const timer = setTimeout(() => {
      for (const url of standaloneAffiliateUrls) {
        if (url in affiliateCache || fetchingAffiliateUrls.current.has(url)) continue;
        fetchingAffiliateUrls.current.add(url);
        fetch(`/api/product-metadata?url=${encodeURIComponent(url)}`)
          .then((r) => r.json())
          .then(async (data) => {
            if ((data?.title || data?.image) && data.image) {
              setAffiliateCache((prev) => ({ ...prev, [url]: data }));
            } else if (data?.title || data?.image) {
              // imageが空の場合はogpでフォールバック
              try {
                const ogpRes = await fetch(`/api/ogp?url=${encodeURIComponent(url)}`);
                const ogp = await ogpRes.json();
                setAffiliateCache((prev) => ({ ...prev, [url]: { ...data, image: data.image || ogp.image || '' } }));
              } catch {
                setAffiliateCache((prev) => ({ ...prev, [url]: data }));
              }
            } else {
              setAffiliateCache((prev) => ({ ...prev, [url]: null }));
            }
          })
          .catch(() => setAffiliateCache((prev) => ({ ...prev, [url]: null })))
          .finally(() => fetchingAffiliateUrls.current.delete(url));
      }
    }, 600);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [standaloneAffiliateUrls]);

  function toggleCategory(id: number) {
    setSelectedCats((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  }

  async function setEyecatchFile(input: File) {
    const file = await compressImage(input);
    const uid = ++uidRef.current;
    const item: UploadedImage = { uid, localUrl: URL.createObjectURL(file), uploading: true };
    setEyecatch(item);
    try {
      const fd = new FormData();
      fd.append('image', file, file.name);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setEyecatch((prev) => prev && prev.uid === uid ? { ...prev, url: data.url, id: data.id, uploading: false } : prev);
    } catch {
      setEyecatch((prev) => prev && prev.uid === uid ? { ...prev, uploading: false, error: 'アップロード失敗' } : prev);
    }
  }

function insertAtCursor(text: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const before = body.slice(0, start);
    const after = body.slice(ta.selectionEnd);
    const prefix = before.length > 0 && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : '';
    const suffix = after.length > 0 && !after.startsWith('\n\n') ? (after.startsWith('\n') ? '\n' : '\n\n') : '';
    const inserted = prefix + text + suffix;
    const newBody = before + inserted + after;
    setBody(newBody);
    const newCursor = start + inserted.length;
    requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = newCursor; ta.focus(); });
  }

  function addProduct() {
    setProducts((prev) => [...prev, { amazonUrl: '', rakutenUrl: '', title: '', image: '', price: '', brand: '' }]);
  }

  function updateProduct(i: number, data: Partial<ProductData>) {
    setProducts((prev) => prev.map((p, idx) => idx === i ? { ...p, ...data } : p));
  }

  function removeProduct(i: number) {
    setProducts((prev) => prev.filter((_, idx) => idx !== i));
    setBody((prev) =>
      prev.replace(/\[product:(\d+)\]/g, (m, n) => {
        const idx = parseInt(n, 10);
        if (idx === i) return '';
        if (idx > i) return `[product:${idx - 1}]`;
        return m;
      })
    );
  }


  const handleBodyDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); setIsDraggingOnBody(true); }
  }, []);
  const handleBodyDragLeave = useCallback(() => setIsDraggingOnBody(false), []);
  const handleBodyDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOnBody(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/') || isHeic(f));
    if (!files.length) return;

    // ドロップ時点のカーソル位置を保存
    const ta = textareaRef.current;
    const insertPos = ta ? ta.selectionStart : null;

    const compressed = await Promise.all(files.map(compressImage));
    const newItems: UploadedImage[] = compressed.map((file) => ({
      uid: ++uidRef.current, localUrl: URL.createObjectURL(file), uploading: true,
    }));

    // 現在の images 長 = これから追加される画像の開始インデックス
    let startIdx = 0;
    setImages((prev) => { startIdx = prev.length; return [...prev, ...newItems]; });

    // プレースホルダーを本文に即時挿入
    const placeholders = newItems.map((_, i) => `[image:${startIdx + i}]`).join('\n\n');
    if (insertPos !== null && ta) {
      const before = body.slice(0, insertPos);
      const after = body.slice(insertPos);
      const prefix = before.length > 0 && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : '';
      const suffix = after.length > 0 && !after.startsWith('\n\n') ? (after.startsWith('\n') ? '\n' : '\n\n') : '';
      setBody(before + prefix + placeholders + suffix + after);
    } else {
      setBody((prev) => prev + (prev.endsWith('\n\n') ? '' : '\n\n') + placeholders);
    }

    // バックグラウンドでアップロード
    newItems.forEach(async (item, relIdx) => {
      const file = compressed[relIdx];
      try {
        const fd = new FormData();
        fd.append('image', file, file.name);
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        setImages((prev) => prev.map((img) =>
          img.uid === item.uid ? { ...img, url: data.url, id: data.id, uploading: false } : img
        ));
      } catch {
        setImages((prev) => prev.map((img) =>
          img.uid === item.uid ? { ...img, uploading: false, error: 'アップロード失敗' } : img
        ));
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body]);

  async function handleSubmit(e: React.FormEvent, postStatus: 'publish' | 'draft' = 'publish') {
    e.preventDefault();
    setErrorMsg('');
    if (!title.trim()) { setErrorMsg('タイトルを入力してください'); return; }
    if (images.some((img) => img.uploading) || eyecatch?.uploading) { setErrorMsg('画像アップロード中です。しばらくお待ちください。'); return; }
    if (images.some((img) => img.error) || eyecatch?.error) { setErrorMsg('アップロードに失敗した画像があります。削除して再度追加してください。'); return; }

    setStatus('saving');
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('date', `${date}T09:00:00`);
      formData.append('body', body);
      formData.append('products', JSON.stringify(products));
      formData.append('postStatus', postStatus);
      selectedCats.forEach((id) => formData.append('categoryIds', String(id)));
      images.forEach((img) => {
        if (img.url && img.id) {
          formData.append('imageUrls', img.url);
          formData.append('imageIds', String(img.id));
        }
      });
      if (eyecatch?.url && eyecatch.id) {
        formData.append('eyecatchUrl', eyecatch.url);
        formData.append('eyecatchId', String(eyecatch.id));
      } else if (eyecatch === null && initialData?.featuredMediaId) {
        formData.append('eyecatchId', '0');
      }

      const endpoint = initialData ? `/api/admin/posts/${initialData.id}` : '/api/admin/posts';
      const method = initialData ? 'PUT' : 'POST';
      const res = await fetch(endpoint, { method, body: formData });
      const text = await res.text();
      let data: { success?: boolean; error?: string } = {};
      try { data = JSON.parse(text); } catch {
        throw new Error(res.status === 413 ? '画像が大きすぎます。枚数を減らしてください。' : `サーバーエラー (${res.status})`);
      }
      if (!res.ok || !data.success) throw new Error(data.error || `HTTP ${res.status}`);
      setStatus('done');
      setTimeout(() => router.push('/admin'), 1200);
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : '不明なエラーが発生しました');
    }
  }

  const isSubmitting = status === 'saving';

  const previewContentNodes = body.split('\n\n').map((para, i) => {
    const t = para.trim();
    if (!t) return null;
    const h2m = t.match(/^\[h2\]([\s\S]*?)\[\/h2\]$/);
    const h3m = t.match(/^\[h3\]([\s\S]*?)\[\/h3\]$/);
    const ulm = t.match(/^\[ul\]\n?([\s\S]*?)\n?\[\/ul\]$/);
    const qtm = t.match(/^\[quote\]([\s\S]*?)\[\/quote\]$/);
    if (h2m) return <h2 key={i}>{h2m[1]}</h2>;
    if (h3m) return <h3 key={i}>{h3m[1]}</h3>;
    if (ulm) return <ul key={i}>{ulm[1].split('\n').filter(Boolean).map((item, j) => <li key={j}>{item.trim()}</li>)}</ul>;
    if (qtm) return <blockquote key={i}><p>{qtm[1]}</p></blockquote>;
    const prodM = t.match(/^\[product:(\d+)\]$/);
    if (prodM) {
      const p = products[parseInt(prodM[1], 10)];
      if (!p) return null;
      const isAmazon = /amazon\.co\.jp|amzn\.to|amzn\.asia/i.test(p.amazonUrl);
      return (
        <div key={i} className="sal-affiliate-card">
          {p.image && <div className="sal-affiliate-image"><img src={p.image} alt={p.title} loading="lazy" /></div>}
          <div className="sal-affiliate-body">
            {p.brand && <div className="sal-affiliate-brand">{p.brand}</div>}
            <h3 className="sal-affiliate-title">{p.title || <span style={{ opacity: 0.4 }}>タイトル未入力</span>}</h3>
            <div className="sal-affiliate-footer">
              {p.price && <div className="sal-affiliate-price">{p.price}<span className="sal-affiliate-tax">（税込）</span></div>}
              <div className="sal-affiliate-buttons">
                {p.amazonUrl && <a href={p.amazonUrl} className="sal-affiliate-btn sal-affiliate-btn--amazon" target="_blank" rel="noopener noreferrer"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" width={50} height={12} /><span>で探す</span></a>}
                {p.rakutenUrl && <a href={p.rakutenUrl} className="sal-affiliate-btn sal-affiliate-btn--rakuten" target="_blank" rel="noopener noreferrer"><span className="sal-affiliate-rakuten-r">R</span><span>楽天で探す</span></a>}
              </div>
            </div>
          </div>
        </div>
      );
    }
    const imgM = t.match(/^\[image:(\d+)\]$/);
    if (imgM) {
      const img = images[parseInt(imgM[1], 10)];
      if (!img) return null;
      return (
        <figure key={i} className="wp-block-image" style={{ position: 'relative' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.localUrl} alt="" style={{ opacity: img.uploading ? 0.5 : 1 }} />
          {img.uploading && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#ff764d', background: 'rgba(0,0,0,0.4)' }}>アップロード中...</div>}
        </figure>
      );
    }
    if (/^https?:\/\/\S+$/.test(t) && /(?:amazon\.co\.jp|amzn\.to|amzn\.asia|rakuten\.co\.jp)/i.test(t)) {
      const meta = affiliateCache[t];
      if (meta === undefined) return <p key={i} style={{ opacity: 0.4, wordBreak: 'break-all', fontSize: '12px' }}>{t} — 取得中...</p>;
      if (meta === null) return <p key={i} style={{ wordBreak: 'break-all' }}><a href={t}>{t}</a></p>;
      const isAmazon = /amazon\.co\.jp|amzn\.to|amzn\.asia/i.test(t);
      return (
        <div key={i} className="sal-affiliate-card">
          {meta.image && <div className="sal-affiliate-image"><img src={meta.image} alt={meta.title} loading="lazy" /></div>}
          <div className="sal-affiliate-body">
            {meta.brand && <div className="sal-affiliate-brand">{meta.brand}</div>}
            <h3 className="sal-affiliate-title">{meta.title}</h3>
            <div className="sal-affiliate-footer">
              {meta.price && <div className="sal-affiliate-price">{meta.price}<span className="sal-affiliate-tax">（税込）</span></div>}
              <div className="sal-affiliate-buttons">
                {isAmazon
                  ? <a href={t} className="sal-affiliate-btn sal-affiliate-btn--amazon" target="_blank" rel="noopener noreferrer"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" width={50} height={12} /><span>で探す</span></a>
                  : <a href={t} className="sal-affiliate-btn sal-affiliate-btn--rakuten" target="_blank" rel="noopener noreferrer"><span className="sal-affiliate-rakuten-r">R</span><span>楽天で探す</span></a>
                }
              </div>
            </div>
          </div>
        </div>
      );
    }
    if (/^https?:\/\/\S+$/.test(t) && !/(?:youtube\.com|youtu\.be)/i.test(t) && !/(?:amazon\.co\.jp|amzn\.to|rakuten\.co\.jp)/i.test(t)) {
      const ogp = ogpCache[t];
      if (ogp === undefined) return <p key={i} style={{ opacity: 0.4, wordBreak: 'break-all' }}>{t} — 取得中...</p>;
      if (ogp === null) return <p key={i} style={{ wordBreak: 'break-all' }}><a href={t}>{t}</a></p>;
      return (
        <a key={i} href={t} target="_blank" rel="noopener noreferrer" className="link-card">
          {ogp.image && <div className="link-card-image">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={ogp.image} alt="" loading="lazy" /></div>}
          <div className="link-card-body">
            <div className="link-card-title">{ogp.title}</div>
            {ogp.description && <div className="link-card-description">{ogp.description}</div>}
            <div className="link-card-meta">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="link-card-favicon" src={ogp.favicon} alt="" width={16} height={16} loading="lazy" />
              <span className="link-card-domain">{ogp.siteName}</span>
            </div>
          </div>
        </a>
      );
    }
    return <p key={i} style={{ whiteSpace: 'pre-wrap' }}>{t}</p>;
  });

  const eyecatchUrl = eyecatch?.localUrl;

  const previewPanel = (
    <div className="journal-article-page" style={{ background: 'transparent' }}>
      <article className="journal-article">
        <div className="journal-article-body">
          {/* アイキャッチ（プレビュー上で直接設定） */}
          <div
            className={`journal-article-hero ${styles.heroDrop} ${isEyecatchDragging ? styles.heroDropActive : ''} ${eyecatchUrl ? '' : styles.heroDropEmpty}`}
            onDragOver={(e) => { e.preventDefault(); setIsEyecatchDragging(true); }}
            onDragLeave={() => setIsEyecatchDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsEyecatchDragging(false);
              const f = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith('image/') || isHeic(f));
              if (f) void setEyecatchFile(f);
            }}
            onClick={() => eyecatchInputRef.current?.click()}
          >
            <input ref={eyecatchInputRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void setEyecatchFile(f); e.target.value = ''; }} />
            {eyecatchUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={eyecatchUrl} alt="" style={{ opacity: eyecatch?.uploading ? 0.5 : 1 }} />
                <div className={styles.heroOverlay}>
                  <span>{eyecatch?.uploading ? 'アップロード中...' : 'クリックで差し替え'}</span>
                  <button type="button" className={styles.heroRemoveBtn}
                    onClick={(e) => { e.stopPropagation(); setEyecatch(null); }}>削除</button>
                </div>
              </>
            ) : (
              <div className={styles.heroPlaceholder}>
                <span className={styles.heroPlaceholderIcon}>＋</span>
                <span>アイキャッチを設定</span>
                <span className={styles.heroPlaceholderHint}>クリック / ドラッグ&ドロップ ・ JPG・PNG・HEIC</span>
              </div>
            )}
          </div>
          {(eyecatchStatus === 'fetching' || eyecatchStatus === 'done' || eyecatchStatus === 'error' || eyecatch?.error) && (
            <p className={styles.heroStatus} style={{ color: eyecatch?.error || eyecatchStatus === 'error' ? '#e74c3c' : eyecatchStatus === 'done' ? '#4caf50' : '#ff764d' }}>
              {eyecatch?.error ? eyecatch.error
                : eyecatchStatus === 'fetching' ? 'noteのアイキャッチを取得中...'
                : eyecatchStatus === 'done' ? 'noteのアイキャッチを自動設定しました'
                : 'アイキャッチの自動取得に失敗しました'}
            </p>
          )}
          <div className="journal-article-header">
            {/* カテゴリ（プレビュー上で直接選択） */}
            <div className={styles.heroCats}>
              {categories.map((cat) => (
                <label key={cat.id} className={styles.catLabel}>
                  <input type="checkbox" checked={selectedCats.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)} className={styles.catCheckbox} />
                  <span className={`${styles.catChip} ${selectedCats.includes(cat.id) ? styles.catChipActive : ''}`}>
                    {cat.name}
                  </span>
                </label>
              ))}
            </div>
            <time className="journal-article-date">{date}</time>
            <h1 className="journal-article-title">{title || <span style={{ opacity: 0.3 }}>タイトル未入力</span>}</h1>
          </div>
          {body.trim() ? (
            <div className="journal-article-content">
              {previewContentNodes}
            </div>
          ) : (
            <p style={{ fontSize: '12px', color: '#555', padding: '24px 0' }}>本文を入力するとプレビューが表示されます</p>
          )}
        </div>
      </article>
    </div>
  );

  return (
    <>
    <div className={styles.editorLayout}>
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* タイトル */}
      <div className={styles.field}>
        <label className={styles.label}>タイトル *</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="記事タイトル" className={styles.input} required />
      </div>

      {/* 投稿日 */}
      <div className={styles.field}>
        <label className={styles.label}>投稿日</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className={`${styles.input} ${styles.dateInput}`} />
      </div>

      {/* アフィリリンク */}
      <div className={styles.field}>
        <div className={styles.sectionHeader}>
          <label className={styles.label}>アフィリリンク</label>
          <button type="button" onClick={addProduct} className={styles.addProductBtn}>+ 商品を追加</button>
        </div>
        {products.length > 0 && (
          <div className={styles.productList}>
            {products.map((p, i) => (
              <ProductCardEditor
                key={i}
                index={i}
                data={p}
                onInsert={(idx) => insertAtCursor(`[product:${idx}]`)}
                onRemove={removeProduct}
                onUpdate={updateProduct}
              />
            ))}
          </div>
        )}
      </div>

      {/* 本文 */}
      <div className={styles.field}>
        <div className={styles.sectionHeader}>
          <label className={styles.label}>本文</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button type="button" className={styles.cancelBtn} style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 700 }}
              onClick={() => {
                const ta = textareaRef.current;
                if (!ta) return;
                const sel = body.slice(ta.selectionStart, ta.selectionEnd).trim() || '見出し';
                insertAtCursor(`[h2]${sel}[/h2]`);
              }}>H2</button>
            <button type="button" className={styles.cancelBtn} style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 700 }}
              onClick={() => {
                const ta = textareaRef.current;
                if (!ta) return;
                const sel = body.slice(ta.selectionStart, ta.selectionEnd).trim() || '見出し';
                insertAtCursor(`[h3]${sel}[/h3]`);
              }}>H3</button>
            <button type="button" className={styles.cancelBtn} style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 700 }}
              onClick={() => {
                const ta = textareaRef.current;
                if (!ta) return;
                const sel = body.slice(ta.selectionStart, ta.selectionEnd).trim();
                const items = sel ? sel.split('\n').map(l => l.trim()).filter(Boolean).join('\n') : '項目1\n項目2\n項目3';
                insertAtCursor(`[ul]\n${items}\n[/ul]`);
              }}>UL</button>
            <button type="button" className={styles.cancelBtn} style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 700 }}
              onClick={() => {
                const ta = textareaRef.current;
                if (!ta) return;
                const sel = body.slice(ta.selectionStart, ta.selectionEnd).trim() || '引用テキスト';
                insertAtCursor(`[quote]${sel}[/quote]`);
              }}>引用</button>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <textarea
            ref={textareaRef}
            value={body}
            onChange={handleBodyChange}
            onKeyDown={handleBodyKeyDown}
            rows={20}
            className={styles.textarea}
            style={{ ...(isDraggingOnBody ? { outline: '2px dashed #ff764d', outlineOffset: '-2px' } : {}), minHeight: '400px' }}
            placeholder={'本文を入力してください。段落は空行で区切ります。\n/ でブロック挿入メニューを表示。'}
            onDragOver={handleBodyDragOver}
            onDragLeave={handleBodyDragLeave}
            onDrop={handleBodyDrop}
          />
          {slashMenu && (() => {
            const filtered = SLASH_COMMANDS.filter(c =>
              !slashMenu.query || c.label.toLowerCase().includes(slashMenu.query) || c.icon.toLowerCase().includes(slashMenu.query)
            );
            if (filtered.length === 0) return null;
            return (
              <div style={{
                position: 'absolute', top: `${slashMenu.top}px`, left: '8px', zIndex: 100,
                background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)', minWidth: '180px', overflow: 'hidden',
              }}>
                {filtered.map((cmd, idx) => (
                  <div
                    key={cmd.icon}
                    onMouseDown={(e) => { e.preventDefault(); applySlashCommand(SLASH_COMMANDS.indexOf(cmd)); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '8px 14px', cursor: 'pointer', fontSize: '13px',
                      background: idx === slashIndex ? '#3a3a3a' : 'transparent',
                      color: idx === slashIndex ? '#fff' : '#a0a0a0',
                    }}
                    onMouseEnter={() => setSlashIndex(idx)}
                  >
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '11px', color: '#ff764d', width: '20px' }}>{cmd.icon}</span>
                    <span>{cmd.label}</span>
                  </div>
                ))}
              </div>
            );
          })()}
          {isDraggingOnBody && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', color: '#ff764d', fontSize: '13px', fontWeight: 700, letterSpacing: '1px' }}>
              ここにドロップして挿入
            </div>
          )}
        </div>
      </div>

      {errorMsg && <p className={styles.error}>{errorMsg}</p>}
      {status === 'done' && <p className={styles.success}>保存しました！ダッシュボードに戻ります...</p>}
      {status === 'saving' && <p className={styles.info}>保存中...</p>}

      <div className={styles.actions}>
        <button type="button" onClick={() => router.push('/admin')} className={styles.cancelBtn} disabled={isSubmitting}>
          キャンセル
        </button>
        <button type="button" onClick={(e) => handleSubmit(e, 'draft')} disabled={isSubmitting || status === 'done'} className={styles.cancelBtn}>
          {isSubmitting ? '...' : '下書き保存'}
        </button>
        <button type="submit" disabled={isSubmitting || status === 'done'} className={styles.submitBtn}>
          {isSubmitting ? '送信中...' : initialData ? '更新する' : '投稿する'}
        </button>
      </div>
    </form>
    <div className={styles.previewCol}>{previewPanel}</div>
    </div>
    {showMediaPicker && (
      <MediaPicker
        onSelect={handleMediaSelect}
        onClose={() => setShowMediaPicker(false)}
      />
    )}
    </>
  );
}
