'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import styles from './PostEditor.module.css';

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
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'")
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
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingOnBody, setIsDraggingOnBody] = useState(false);
  const [ogpCache, setOgpCache] = useState<Record<string, { title: string; description: string; image: string | null; siteName: string; favicon: string } | null>>({});
  const fetchingUrls = useRef<Set<string>>(new Set());
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [eyecatchStatus, setEyecatchStatus] = useState<'idle' | 'fetching' | 'done' | 'error'>('idle');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoFetchedUrlRef = useRef<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // note.com URLを本文から検出してアイキャッチを自動取得
  useEffect(() => {
    const match = body.match(/https:\/\/note\.com\/[^\s"'<>]+/);
    const noteUrl = match?.[0] ?? '';

    if (!noteUrl || noteUrl === autoFetchedUrlRef.current) return;
    if (images.length > 0) return; // 手動アップロードがあれば何もしない
    if (initialData?.featuredMediaId && initialData.featuredMediaId > 0) return; // 既存アイキャッチがあれば何もしない

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

        await addFiles([file]);
        setEyecatchStatus('done');
      } catch {
        setEyecatchStatus('error');
        autoFetchedUrlRef.current = ''; // リセットして再試行可能に
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body]);
  const uidRef = useRef(parsed?.images.length ?? 0);

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

  function toggleCategory(id: number) {
    setSelectedCats((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  }

  async function addFiles(files: FileList | File[]) {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/') || isHeic(f));
    const compressed = await Promise.all(arr.map(compressImage));
    const newItems: UploadedImage[] = compressed.map((file) => ({
      uid: ++uidRef.current, localUrl: URL.createObjectURL(file), uploading: true,
    }));
    setImages((prev) => [...prev, ...newItems]);

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
  }

  function removeImage(i: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
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

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false); void addFiles(e.dataTransfer.files);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (images.some((img) => img.uploading)) { setErrorMsg('画像アップロード中です。しばらくお待ちください。'); return; }
    if (images.some((img) => img.error)) { setErrorMsg('アップロードに失敗した画像があります。削除して再度追加してください。'); return; }

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

  const eyecatchUrl = images[0]?.localUrl ?? initialData?.featuredImageUrl;

  const previewPanel = (
    <div className="journal-article-page" style={{ background: 'transparent' }}>
      <article className="journal-article">
        <div className="journal-article-body">
          {eyecatchUrl && (
            <div className="journal-article-hero">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={eyecatchUrl} alt="" />
            </div>
          )}
          <div className="journal-article-header">
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

      {/* カテゴリ */}
      <div className={styles.field}>
        <label className={styles.label}>カテゴリ</label>
        <div className={styles.categoryGrid}>
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
      </div>

      {/* 画像 */}
      <div className={styles.field}>
        <label className={styles.label}>画像</label>
        <div
          className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
            onChange={(e) => e.target.files && void addFiles(e.target.files)} />
          <p className={styles.dropzoneText}>クリックまたはドラッグ&ドロップで画像を追加</p>
          <p className={styles.dropzoneHint}>JPG・PNG・HEIC 複数枚OK ／ 最初の1枚がアイキャッチになります</p>
          {eyecatchStatus === 'fetching' && <p className={styles.dropzoneHint} style={{ color: '#ff764d' }}>noteのアイキャッチを取得中...</p>}
          {eyecatchStatus === 'done' && <p className={styles.dropzoneHint} style={{ color: '#4caf50' }}>noteのアイキャッチを自動設定しました</p>}
          {eyecatchStatus === 'error' && <p className={styles.dropzoneHint} style={{ color: '#e74c3c' }}>アイキャッチの自動取得に失敗しました</p>}
        </div>

        {initialData?.featuredImageUrl && images.length === 0 && (
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={initialData.featuredImageUrl} alt="現在のアイキャッチ" style={{ width: '80px', height: '54px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #3a3a3a' }} />
            <span style={{ fontSize: '11px', color: '#666' }}>現在のアイキャッチ（新しい画像をアップロードすると差し替わります）</span>
          </div>
        )}

        {images.length > 0 && (
          <div className={styles.previewGrid}>
            {images.map((img, i) => (
              <div key={img.uid} className={styles.previewItem}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.localUrl} alt={`preview-${i}`} className={styles.previewImg}
                  style={{ opacity: img.uploading ? 0.4 : 1 }} />
                {img.uploading && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#ff764d', background: 'rgba(0,0,0,0.5)' }}>
                    uploading...
                  </div>
                )}
                {img.error && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#e74c3c', background: 'rgba(0,0,0,0.7)', padding: '4px', textAlign: 'center' }}>
                    失敗
                  </div>
                )}
                <div className={styles.previewActions}>
                  {!img.uploading && !img.error && (
                    <button type="button" onClick={() => insertAtCursor(`[image:${i}]`)} className={styles.insertBtn}>挿入</button>
                  )}
                  <button type="button" onClick={() => removeImage(i)} className={styles.removeBtn} aria-label="削除">×</button>
                </div>
                <span className={styles.imageIndex}>[image:{i}]</span>
              </div>
            ))}
          </div>
        )}
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
            onChange={(e) => setBody(e.target.value)}
            rows={20}
            className={styles.textarea}
            style={{ ...(isDraggingOnBody ? { outline: '2px dashed #ff764d', outlineOffset: '-2px' } : {}), minHeight: '400px' }}
            placeholder={'本文を入力してください。段落は空行で区切ります。\n\n画像をここにドラッグ&ドロップして挿入できます。'}
            onDragOver={handleBodyDragOver}
            onDragLeave={handleBodyDragLeave}
            onDrop={handleBodyDrop}
          />
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
  );
}
