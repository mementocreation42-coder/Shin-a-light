'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import styles from './PostEditor.module.css';
import MediaPicker from './MediaPicker';
import { compressImage, isHeic } from '@/lib/imageCompress';
import {
  autoGrow, parseBodySegments, spliceSeg, findLiveSeg, insertBlockAt, removeSegFromBody,
  getTextBlockFormat, projectTextForEditor, editorTextToRaw, formattedTextToPlain,
  bracketToEditor, editorToBracket,
  type BodySeg,
} from './bodyBlocks';
import { useDraftAutosave } from './useDraftAutosave';

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

// 本文のブロック分解・記法の投影は bodyBlocks.ts（hl-fishing から移植）に集約

// 退避時刻は「さっき」か「いつ」かが分かれば十分なので、直近は相対表示にする
function formatSavedAt(ts: number): string {
  const diffSec = Math.floor((Date.now() - ts) / 1000);
  if (diffSec < 60) return 'たった今';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}分前`;
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ===== Types =====
interface UploadedImage {
  uid: number; localUrl: string; url?: string; id?: number; uploading: boolean; error?: string; file?: File;
}
interface Category { id: number; name: string; slug: string; }
interface InitialData {
  id: string; title: string; date: string; categoryIds: number[];
  content: string; status: 'publish' | 'draft';
  featuredMediaId?: number; featuredImageUrl?: string;
}
interface Props { categories: Category[]; initialData?: InitialData; }

// 改行後のキャレット位置を測り、固定ヘッダーや画面下端に隠れないよう追従する。
function scrollCaretIntoView(fallback: HTMLTextAreaElement) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const active = document.activeElement;
      const ta = active instanceof HTMLTextAreaElement ? active : fallback;
      if (!ta.isConnected) return;

      const style = window.getComputedStyle(ta);
      const mirror = document.createElement('div');
      Object.assign(mirror.style, {
        position: 'fixed',
        left: '-9999px',
        top: '0',
        visibility: 'hidden',
        whiteSpace: 'pre-wrap',
        overflowWrap: style.overflowWrap,
        wordBreak: style.wordBreak,
        boxSizing: style.boxSizing,
        width: `${ta.getBoundingClientRect().width}px`,
        padding: style.padding,
        border: style.border,
        font: style.font,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
      });
      mirror.textContent = ta.value.slice(0, ta.selectionStart);
      const marker = document.createElement('span');
      marker.textContent = '\u200b';
      mirror.appendChild(marker);
      document.body.appendChild(mirror);

      const lineHeight = parseFloat(style.lineHeight) || 32;
      const caretY = ta.getBoundingClientRect().top + marker.offsetTop + lineHeight - ta.scrollTop;
      const safeTop = 88;
      const safeBottom = window.innerHeight - 96;
      mirror.remove();

      if (caretY > safeBottom) {
        window.scrollBy({ top: caretY - safeBottom + lineHeight });
      } else if (caretY < safeTop) {
        window.scrollBy({ top: caretY - safeTop - lineHeight });
      }
    });
  });
}

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
    <div className={styles.productCard} data-product-index={index}>
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
  // 編集中は Markdown 風の記法で保持し、保存時に [h2]…[/h2] 形式へ戻す
  const [body, setBody] = useState(bracketToEditor(parsed?.body ?? ''));
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
  const [headerActionsTarget, setHeaderActionsTarget] = useState<HTMLElement | null>(null);
  const [slashMenu, setSlashMenu] = useState<{ segIndex: number; query: string; openUpward: boolean } | null>(null);
  const [slashIndex, setSlashIndex] = useState(0);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

const eyecatchInputRef = useRef<HTMLInputElement>(null);
  const autoFetchedUrlRef = useRef<string>('');
  const slashStartRef = useRef<number>(-1);
  const insertPosRef = useRef<number | null>(null);
  const productSectionRef = useRef<HTMLDivElement>(null);
  const pendingAffiliateFocusRef = useRef<number | null>(null);

  // 本文はブロックごとにtextareaを持つので、キャレットは本文全体での位置で扱う
  const bodySegs = useMemo(() => parseBodySegments(body), [body]);
  const taRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const caretRef = useRef(0);
  const caretEndRef = useRef(0);
  const focusFrameRef = useRef<number | null>(null);
  // 日本語入力（IME）の変換中はキャレット移動を持ち越し、確定後にまとめて適用する
  const composingRef = useRef(false);
  const pendingFocusRef = useRef<{ body: string; caret: number } | null>(null);
  // 変換中は1文字ごとに連続でイベントが飛ぶため、クロージャのbodyでは古い値を掴む。
  // 常に最新の本文をrefで持ち、更新もrefと同時に行う
  const bodyRef = useRef(body);
  useEffect(() => { bodyRef.current = body; }, [body]);
  function updateBody(next: string) { bodyRef.current = next; setBody(next); }

  // ===== 未保存内容の自動退避 =====
  // 初期状態を控えておき、そこから変化したときだけ退避・離脱警告を有効にする
  const initialSignatureRef = useRef<string>('');
  const draftSnapshot = useMemo(() => ({
    title,
    date,
    categoryIds: selectedCats,
    body,
    products: products as unknown[],
    // アップロード済みの画像だけが復元できる（blob URL はリロードで失効するため）
    images: images.filter((img) => img.url && img.id).map((img) => ({ url: img.url!, id: img.id! })),
    eyecatch: eyecatch?.url && eyecatch.id ? { url: eyecatch.url, id: eyecatch.id } : null,
  }), [title, date, selectedCats, body, products, images, eyecatch]);

  const snapshotSignature = JSON.stringify(draftSnapshot);
  if (!initialSignatureRef.current) initialSignatureRef.current = snapshotSignature;
  const isDirty = snapshotSignature !== initialSignatureRef.current;

  const { savedAt, restorable, clearDraft, dismissRestore } = useDraftAutosave({
    postId: initialData?.id,
    snapshot: draftSnapshot,
    dirty: isDirty,
    // サーバーへ保存中／完了後は退避も離脱警告も不要
    enabled: status === 'idle' || status === 'error',
  });

  function restoreDraft() {
    if (!restorable) return;
    setTitle(restorable.title);
    setDate(restorable.date);
    setSelectedCats(restorable.categoryIds);
    updateBody(restorable.body);
    setProducts(restorable.products as ProductData[]);
    setImages(restorable.images.map((img, i) => ({
      uid: Date.now() + i, localUrl: img.url, url: img.url, id: img.id, uploading: false,
    })));
    setEyecatch(restorable.eyecatch
      ? { uid: -1, localUrl: restorable.eyecatch.url, url: restorable.eyecatch.url, id: restorable.eyecatch.id, uploading: false }
      : null);
    dismissRestore();
  }

  // 本文全体でのキャレット位置を指定して、その位置のブロックへフォーカスする
  const focusGlobal = useCallback((nextBody: string, globalPos: number) => {
    if (focusFrameRef.current !== null) cancelAnimationFrame(focusFrameRef.current);
    focusFrameRef.current = requestAnimationFrame(() => {
      focusFrameRef.current = null;
      // フォーカス待ちの間に続きを入力していたら、古い位置へ戻さない
      if (bodyRef.current !== nextBody) return;
      const segs = parseBodySegments(nextBody);
      // ブロック境界では前後のオフセットが重なるので、先頭一致を優先する
      let target = segs.findIndex((sg) => sg.kind === 'text' && !sg.virtual && globalPos === sg.start);
      if (target < 0) target = segs.findIndex((sg) => sg.kind === 'text' && !sg.virtual && globalPos >= sg.start && globalPos <= sg.end);
      if (target < 0) target = segs.findIndex((sg) => sg.kind === 'text' && !!sg.virtual && globalPos === sg.start);
      if (target < 0) for (let i = segs.length - 1; i >= 0; i--) { if (segs[i].kind === 'text') { target = i; break; } }
      const ta = taRefs.current[target];
      const seg = segs[target];
      if (!ta || !seg || seg.kind !== 'text') return;
      const rawValue = seg.virtual ? '' : nextBody.slice(seg.start, seg.end);
      const rawLocal = seg.virtual ? 0 : Math.max(0, Math.min(globalPos - seg.start, rawValue.length));
      const local = projectTextForEditor(rawValue).toDisplay(rawLocal);
      ta.focus();
      ta.selectionStart = ta.selectionEnd = local;
      caretRef.current = caretEndRef.current = globalPos;
    });
  }, []);

  // 幅が変わると折り返し行数が変わるので、入力欄の高さを測り直す
  const surfaceRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const regrow = () => {
      surfaceRef.current?.querySelectorAll('textarea').forEach((el) => autoGrow(el));
    };
    regrow();
    window.addEventListener('resize', regrow);
    return () => window.removeEventListener('resize', regrow);
  }, []);

  useEffect(() => {
    setHeaderActionsTarget(document.getElementById('post-editor-actions'));
  }, []);

  useEffect(() => {
    const index = pendingAffiliateFocusRef.current;
    if (index === null) return;
    pendingAffiliateFocusRef.current = null;

    requestAnimationFrame(() => {
      const card = productSectionRef.current?.querySelector<HTMLElement>(`[data-product-index="${index}"]`);
      const urlInput = card?.querySelector<HTMLInputElement>('input[type="url"]');
      card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      urlInput?.focus({ preventScroll: true });
    });
  }, [products.length]);

  // ブロック内の選択位置を body 全体のオフセットへ反映
  function syncCaret(seg: BodySeg, ta: HTMLTextAreaElement) {
    const currentBody = bodyRef.current;
    const { seg: liveSeg } = findLiveSeg(seg, currentBody);
    if (liveSeg.kind !== 'text') return;
    const base = liveSeg.virtual ? spliceSeg(currentBody, liveSeg, '').caret : liveSeg.start;
    const rawValue = liveSeg.virtual ? '' : currentBody.slice(liveSeg.start, liveSeg.end);
    const projection = projectTextForEditor(rawValue);
    caretRef.current = base + projection.toRaw(ta.selectionStart);
    caretEndRef.current = base + projection.toRaw(ta.selectionEnd);
  }

  const SLASH_COMMANDS = [
    { label: '見出し',      icon: 'H2', insert: '## ',  action: 'insert' },
    { label: '小見出し',    icon: 'H3', insert: '### ', action: 'insert' },
    { label: 'リスト',      icon: 'UL', insert: '- ',   action: 'insert' },
    { label: '引用',        icon: '❝',  insert: '> ',   action: 'insert' },
    { label: 'メディアから挿入', icon: '🖼', insert: '',  action: 'media' },
    { label: 'アフィリを追加', icon: 'AFF', insert: '',  action: 'product' },
  ] as const;

  function applySlashCommand(cmdIndex: number) {
    if (slashStartRef.current < 0) return;
    const cmd = SLASH_COMMANDS[cmdIndex];
    const cur = bodyRef.current;
    // 入力した「/xxx」を取り除く
    const cleaned = cur.slice(0, slashStartRef.current) + cur.slice(caretRef.current);
    const pos = slashStartRef.current;
    setSlashMenu(null);
    slashStartRef.current = -1;

    if (cmd.action === 'media') {
      updateBody(cleaned);
      insertPosRef.current = pos;
      setShowMediaPicker(true);
      return;
    }

    if (cmd.action === 'product') {
      updateBody(cleaned);
      insertPosRef.current = pos;
      pendingAffiliateFocusRef.current = products.length;
      addProduct();
      return;
    }

    // いま居るブロックが空なら、そのブロック自体を見出し等に変える
    const emptyBlock = parseBodySegments(cleaned).find((candidate) => {
      if (candidate.kind !== 'text' || candidate.virtual || pos < candidate.start || pos > candidate.end) return false;
      const raw = cleaned.slice(candidate.start, candidate.end);
      return formattedTextToPlain(raw, getTextBlockFormat(raw)).trim() === '';
    });
    if (emptyBlock && emptyBlock.kind === 'text') {
      const next = cleaned.slice(0, emptyBlock.start) + cmd.insert + cleaned.slice(emptyBlock.end);
      const caret = emptyBlock.start + cmd.insert.length;
      updateBody(next);
      focusGlobal(next, caret);
      return;
    }

    // それ以外は独立したブロックとして差し込む
    const inserted = insertBlockAt(cleaned, pos, cmd.insert);
    updateBody(inserted.body);
    focusGlobal(inserted.body, inserted.end);
  }

  function handleMediaSelect(item: { id: number; source_url: string; alt_text: string; title: { rendered: string } }) {
    const uid = ++uidRef.current;
    const newImg = { uid, localUrl: item.source_url, url: item.source_url, id: item.id, uploading: false };
    // setStateの更新関数は2回呼ばれることがあるので、本文への差し込みは外で1回だけ行う
    const idx = images.length;
    setImages((prev) => [...prev, newImg]);
    insertAtCursor(`[image:${idx}]`);
    setShowMediaPicker(false);
  }

  // テキストブロックの入力。body の該当範囲だけを差し替えるので、保存に渡る文字列は同じ形のまま。
  function handleRunChange(seg: BodySeg, e: React.ChangeEvent<HTMLTextAreaElement>) {
    const ta = e.target;
    const displayValue = ta.value;
    const displayCaret = ta.selectionStart;

    const currentBody = bodyRef.current;
    const { seg: liveSeg, all: parsedNow } = findLiveSeg(seg, currentBody);
    const currentRaw = liveSeg.kind === 'text' && !liveSeg.virtual
      ? currentBody.slice(liveSeg.start, liveSeg.end)
      : '';
    const currentProjection = projectTextForEditor(currentRaw);
    const val = editorTextToRaw(displayValue, currentProjection.format);
    const nextProjection = projectTextForEditor(val);
    const localRawCaret = nextProjection.toRaw(displayCaret);

    const spliced = spliceSeg(currentBody, liveSeg, val);
    updateBody(spliced.body);
    autoGrow(ta);

    // 空行を打つと段落が分かれ、入力欄そのものが別要素になる。その場合だけフォーカスを引き継ぐ
    const splitOccurred = parseBodySegments(spliced.body).length !== parsedNow.length;
    const runStart = spliced.caret - val.length;
    caretRef.current = caretEndRef.current = runStart + localRawCaret;
    if (splitOccurred || (liveSeg.kind === 'text' && !!liveSeg.virtual)) {
      if (composingRef.current) {
        pendingFocusRef.current = { body: spliced.body, caret: caretRef.current };
      } else {
        focusGlobal(spliced.body, caretRef.current);
      }
    }

    if (composingRef.current) return;

    // 「/」メニュー（行頭または空白の直後に打った「/」で開く）
    let slashPos = -1;
    for (let j = displayCaret - 1; j >= 0; j--) {
      const c = displayValue[j];
      if (c === '/') { if (j === 0 || /\s/.test(displayValue[j - 1])) slashPos = j; break; }
      if (/\s/.test(c)) break;
    }
    if (slashPos >= 0) {
      slashStartRef.current = runStart + nextProjection.toRaw(slashPos);
      setSlashIndex(0);
      // メニューは更新後の本文でのブロック位置に紐づける（描画されるのは新しい方）
      const newSegs = parseBodySegments(spliced.body);
      const caret = caretRef.current;
      const segIndex = newSegs.findIndex((sg) => sg.kind === 'text' && !sg.virtual && caret >= sg.start && caret <= sg.end);
      const rect = ta.getBoundingClientRect();
      const articleRect = ta.closest('.journal-article-body')?.getBoundingClientRect();
      const estimatedMenuHeight = Math.min(SLASH_COMMANDS.length, 6) * 42 + 12;
      const lowerBoundary = Math.min(window.innerHeight, articleRect?.bottom ?? window.innerHeight);
      const upperBoundary = Math.max(0, articleRect?.top ?? 0);
      const spaceBelow = lowerBoundary - rect.bottom;
      const spaceAbove = rect.top - upperBoundary;
      const openUpward = spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow;
      setSlashMenu({
        segIndex,
        query: displayValue.slice(slashPos + 1, displayCaret).toLowerCase(),
        openUpward,
      });
    } else if (slashMenu) {
      setSlashMenu(null);
      slashStartRef.current = -1;
    }
  }

  function handleBodyKeyDown(seg: BodySeg, segIndex: number, e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      scrollCaretIntoView(e.currentTarget);
    }

    if (slashMenu) {
      const filtered = SLASH_COMMANDS.filter(c => c.label.toLowerCase().includes(slashMenu.query) || c.icon.toLowerCase().includes(slashMenu.query));
      if (e.key === 'ArrowDown') { e.preventDefault(); setSlashIndex(i => (i + 1) % filtered.length); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSlashIndex(i => (i - 1 + filtered.length) % filtered.length); return; }
      if ((e.key === 'Enter' || e.key === 'Tab') && filtered.length > 0 && !e.nativeEvent.isComposing) {
        e.preventDefault();
        applySlashCommand(SLASH_COMMANDS.indexOf(filtered[slashIndex]));
        return;
      }
      if (e.key === 'Escape') { setSlashMenu(null); slashStartRef.current = -1; return; }
    }

    // ブロックの端では隣の入力欄へ移動する（矢印キー・先頭Backspace）
    const ta = e.currentTarget;
    const atStart = ta.selectionStart === 0 && ta.selectionEnd === 0;
    const atEnd = ta.selectionStart === ta.value.length && ta.selectionEnd === ta.value.length;
    const currentFormat = seg.kind === 'text' && !seg.virtual
      ? getTextBlockFormat(bodyRef.current.slice(seg.start, seg.end))
      : 'plain';

    // 空のリスト項目・引用行を Backspace で取り除き、直前の行末へ戻る。
    if (e.key === 'Backspace' && atEnd && (currentFormat === 'list' || currentFormat === 'quote')) {
      const currentBody = bodyRef.current;
      const { seg: liveSeg } = findLiveSeg(seg, currentBody);
      if (liveSeg.kind === 'text') {
        const raw = currentBody.slice(liveSeg.start, liveSeg.end);
        const marker = currentFormat === 'list' ? '- ' : '> ';
        const lastBreak = raw.lastIndexOf('\n');
        const lastLine = raw.slice(lastBreak + 1);
        if (lastLine === marker) {
          e.preventDefault();
          const cleanedRaw = lastBreak >= 0 ? raw.slice(0, lastBreak) : '';
          const next = currentBody.slice(0, liveSeg.start) + cleanedRaw + currentBody.slice(liveSeg.end);
          const nextCaret = liveSeg.start + cleanedRaw.length;
          updateBody(next);
          focusGlobal(next, nextCaret);
          return;
        }
      }
    }

    // 装飾ブロックの先頭で Backspace を押すと、文字は残したまま
    // 見出し・リスト・引用の装飾だけを解除する。
    if (e.key === 'Backspace' && atStart && currentFormat !== 'plain' && seg.kind === 'text' && !seg.virtual) {
      e.preventDefault();
      const currentBody = bodyRef.current;
      const { seg: liveSeg } = findLiveSeg(seg, currentBody);
      if (liveSeg.kind !== 'text') return;
      const raw = currentBody.slice(liveSeg.start, liveSeg.end);
      const plain = formattedTextToPlain(raw, currentFormat);
      const next = currentBody.slice(0, liveSeg.start) + plain + currentBody.slice(liveSeg.end);
      updateBody(next);
      focusGlobal(next, liveSeg.start);
      return;
    }

    // 見出し末尾の Enter は、見出し内に空行を増やさず次の本文欄へ移る。
    // 見出しは1行のブロックなので、通常の文章作成ソフトと同じ操作感にする。
    if (e.key === 'Enter' && atEnd && (currentFormat === 'h2' || currentFormat === 'h3')) {
      if (focusAdjacentText(segIndex, 1)) e.preventDefault();
      return;
    }

    // リスト・引用では、後続ブロックとの区切り改行に Enter が吸収されないよう
    // 次の行の記号まで明示的に挿入する。空の項目で Enter を押した場合だけ
    // 装飾を終了して通常本文へ移る。
    if (e.key === 'Enter' && atEnd && (currentFormat === 'list' || currentFormat === 'quote')) {
      e.preventDefault();
      const currentBody = bodyRef.current;
      const { seg: liveSeg } = findLiveSeg(seg, currentBody);
      if (liveSeg.kind !== 'text') return;

      const raw = currentBody.slice(liveSeg.start, liveSeg.end);
      const marker = currentFormat === 'list' ? '- ' : '> ';
      const lastLine = raw.slice(raw.lastIndexOf('\n') + 1);

      if (lastLine !== marker) {
        const inserted = `${marker === '- ' ? '\n- ' : '\n> '}`;
        const next = currentBody.slice(0, liveSeg.end) + inserted + currentBody.slice(liveSeg.end);
        const nextCaret = liveSeg.end + inserted.length;
        updateBody(next);
        focusGlobal(next, nextCaret);
        return;
      }

      // 空の最終項目を取り除き、次の通常本文ブロックへカーソルを移す。
      const cleanedRaw = raw.slice(0, raw.lastIndexOf('\n'));
      const before = currentBody.slice(0, liveSeg.start);
      const after = currentBody.slice(liveSeg.end).replace(/^\n+/, '');
      const next = `${before}${cleanedRaw}\n\n${after}`;
      const nextCaret = before.length + cleanedRaw.length + 2;
      updateBody(next);
      focusGlobal(next, nextCaret);
      return;
    }

    if ((e.key === 'ArrowUp' || e.key === 'ArrowLeft') && atStart) {
      if (focusAdjacentText(segIndex, -1)) e.preventDefault();
      return;
    }
    if ((e.key === 'ArrowDown' || e.key === 'ArrowRight') && atEnd) {
      if (focusAdjacentText(segIndex, 1)) e.preventDefault();
      return;
    }
    if (e.key === 'Backspace' && atStart && ta.value.trim() === '' && seg.kind === 'text' && !seg.virtual) {
      // 空のブロックは削除して前の入力欄へ
      e.preventDefault();
      const cur = bodyRef.current;
      const next = removeSegFromBody(cur, seg);
      updateBody(next);
      focusGlobal(next, Math.max(0, Math.min(seg.start - 2, next.length)));
      return;
    }
    if (e.key === 'Backspace' && atStart && ta.value === '' && seg.kind === 'text' && !!seg.virtual) {
      // 実体を持たない挿入欄では、前のブロックへ戻る。
      if (focusAdjacentText(segIndex, -1)) e.preventDefault();
    }
  }

  // 隣のテキストブロックへフォーカスを移す
  function focusAdjacentText(index: number, direction: -1 | 1): boolean {
    for (let i = index + direction; i >= 0 && i < bodySegs.length; i += direction) {
      const targetSeg = bodySegs[i];
      const target = taRefs.current[i];
      if (!target || targetSeg.kind !== 'text') continue;
      const pos = direction < 0 ? target.value.length : 0;
      target.focus();
      target.selectionStart = target.selectionEnd = pos;
      syncCaret(targetSeg, target);
      return true;
    }
    return false;
  }

  // 本文からメディアブロック（画像 / 商品カード）を取り除く
  function removeSeg(seg: BodySeg) {
    if (seg.kind !== 'media') return;
    if (seg.mtype === 'image') { removeImage(seg.idx); return; }
    const next = removeSegFromBody(bodyRef.current, seg);
    updateBody(next);
    focusGlobal(next, Math.max(0, Math.min(seg.start, next.length)));
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

  // カーソル位置に1ブロックとして差し込む（前後の空行を整える）
  function insertAtCursor(text: string) {
    const cur = bodyRef.current;
    const pos = insertPosRef.current ?? Math.min(caretRef.current, cur.length);
    insertPosRef.current = null;
    const inserted = insertBlockAt(cur, pos, text);
    updateBody(inserted.body);
    focusGlobal(inserted.body, inserted.blockEnd);
  }

  function addProduct() {
    setProducts((prev) => [...prev, { amazonUrl: '', rakutenUrl: '', title: '', image: '', price: '', brand: '' }]);
  }

  function openMediaPickerAtCursor() {
    insertPosRef.current = Math.min(caretRef.current, bodyRef.current.length);
    setShowMediaPicker(true);
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

  // 失敗した画像を本文から取り除き、配列インデックスを詰める
  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
    setBody((prev) =>
      prev.replace(/\[image:(\d+)\]/g, (m, n) => {
        const idx = parseInt(n, 10);
        if (idx === index) return '';
        if (idx > index) return `[image:${idx - 1}]`;
        return m;
      })
    );
  }

  // 失敗した画像を同じファイルで再アップロード
  async function retryImageUpload(uid: number) {
    const target = images.find((img) => img.uid === uid);
    if (!target?.file) return;
    const file = target.file;
    setImages((prev) => prev.map((img) => img.uid === uid ? { ...img, uploading: true, error: undefined } : img));
    try {
      const fd = new FormData();
      fd.append('image', file, file.name);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setImages((prev) => prev.map((img) => img.uid === uid ? { ...img, url: data.url, id: data.id, uploading: false } : img));
    } catch {
      setImages((prev) => prev.map((img) => img.uid === uid ? { ...img, uploading: false, error: 'アップロード失敗' } : img));
    }
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
    const insertPos = Math.min(caretRef.current, body.length);

    const compressed = await Promise.all(files.map((f) => compressImage(f)));
    const newItems: UploadedImage[] = compressed.map((file) => ({
      uid: ++uidRef.current, localUrl: URL.createObjectURL(file), uploading: true, file,
    }));

    // 現在の images 長 = これから追加される画像の開始インデックス
    let startIdx = 0;
    setImages((prev) => { startIdx = prev.length; return [...prev, ...newItems]; });

    // プレースホルダーを本文に即時挿入
    const placeholders = newItems.map((_, i) => `[image:${startIdx + i}]`).join('\n\n');
    const inserted = insertBlockAt(bodyRef.current, insertPos, placeholders);
    updateBody(inserted.body);
    focusGlobal(inserted.body, inserted.blockEnd);

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
      // 編集中の記法（## など）を保存形式（[h2]…[/h2]）へ戻す
      formData.append('body', editorToBracket(body));
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
      clearDraft();
      setTimeout(() => router.push('/admin'), 1200);
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : '不明なエラーが発生しました');
    }
  }

  const isSubmitting = status === 'saving';

  // メディア段落（画像 / 商品カード / リンクカード）を実物として描画する
  const renderBlockNode = (para: string, i: number) => {
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
      const imgIdx = parseInt(imgM[1], 10);
      const img = images[imgIdx];
      if (!img) return null;
      return (
        <figure key={i} className="wp-block-image" style={{ position: 'relative' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.localUrl} alt="" style={{ opacity: img.uploading || img.error ? 0.4 : 1 }} />
          {img.uploading && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#ff764d', background: 'rgba(0,0,0,0.4)' }}>アップロード中...</div>}
          {img.error && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'rgba(20,20,20,0.72)' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#ff6b5c', letterSpacing: '0.5px' }}>⚠ アップロード失敗</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {img.file && (
                  <button type="button" onClick={() => retryImageUpload(img.uid)}
                    style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 700, background: '#ff764d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit' }}>
                    再アップロード
                  </button>
                )}
                <button type="button" onClick={() => removeImage(imgIdx)}
                  style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 700, background: 'transparent', color: '#ddd', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  削除
                </button>
              </div>
            </div>
          )}
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
  };

  const eyecatchUrl = eyecatch?.localUrl;

  const articleSurface = (
    <div ref={surfaceRef} className={`journal-article-page ${styles.articleSurface}`} style={{ background: 'transparent', padding: 0, maxWidth: 'none' }}>
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
            {/* 投稿日・タイトルも記事の見た目のまま直接編集する */}
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className={`journal-article-date ${styles.inlineDate}`} />
            <textarea
              value={title}
              onChange={(e) => { autoGrow(e.target); setTitle(e.target.value.replace(/[\r\n]+/g, ' ')); }}
              onCompositionStart={() => { composingRef.current = true; }}
              onCompositionEnd={(e) => { composingRef.current = false; setTitle(e.currentTarget.value.replace(/[\r\n]+/g, ' ')); }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) e.preventDefault(); }}
              ref={(el) => { if (el && el.value !== el.dataset.grown) { autoGrow(el); el.dataset.grown = el.value; } }}
              onInput={(e) => autoGrow(e.currentTarget)}
              rows={1}
              placeholder="タイトルを入力"
              className={`journal-article-title ${styles.inlineTitle}`}
              required
            />
          </div>

          {/* 本文：テキストは入力欄、画像やカードは実物を表示する */}
          <div
            className={`journal-article-content ${styles.blockEditor} ${isDraggingOnBody ? styles.blockEditorDragging : ''}`}
            onDragOver={handleBodyDragOver}
            onDragLeave={handleBodyDragLeave}
            onDrop={handleBodyDrop}
            onMouseDown={(e) => {
              // 余白クリックで末尾のテキストブロックにカーソルを置く
              if (e.target !== e.currentTarget) return;
              e.preventDefault();
              for (let i = taRefs.current.length - 1; i >= 0; i--) {
                const ta = taRefs.current[i];
                if (ta) { ta.focus(); ta.selectionStart = ta.selectionEnd = ta.value.length; break; }
              }
            }}
          >
            {bodySegs.map((seg, i) => {
              if (seg.kind === 'media') {
                return (
                  <div key={`blk-${i}`} className={styles.blockMedia}>
                    {renderBlockNode(body.slice(seg.start, seg.end), i)}
                    <button type="button" className={styles.blockRemove} aria-label="このブロックを削除"
                      onClick={() => removeSeg(seg)}>×</button>
                  </div>
                );
              }

              const raw = seg.virtual ? '' : body.slice(seg.start, seg.end);
              const { format, value } = projectTextForEditor(raw);
              // 見出し・引用・リストは実タグで囲み、サイト側のCSSをそのまま効かせる
              const Wrapper = ({ plain: 'div', h2: 'h2', h3: 'h3', quote: 'blockquote', list: 'ul' } as const)[format];
              const placeholder = seg.virtual
                ? 'ここに本文を追加'
                : format === 'h2' ? '見出し'
                : format === 'h3' ? '小見出し'
                : format === 'quote' ? '引用'
                : format === 'list' ? '項目を改行で並べる'
                : bodySegs.length === 1 ? '本文を入力（「/」で見出し・画像・アフィリを追加できます）'
                : '';
              return (
                <Wrapper key={`blk-${i}`}
                  className={`${styles.blockText} ${styles[`block_${format}`] ?? ''} ${seg.virtual ? styles.blockSlot : ''}`}>
                  <textarea
                    ref={(el) => {
                      taRefs.current[i] = el;
                      if (el && el.value !== el.dataset.grown) autoGrow(el);
                    }}
                    value={value}
                    rows={1}
                    onChange={(e) => handleRunChange(seg, e)}
                    onCompositionStart={() => { composingRef.current = true; }}
                    onCompositionEnd={() => {
                      composingRef.current = false;
                      const pending = pendingFocusRef.current;
                      pendingFocusRef.current = null;
                      if (pending) focusGlobal(pending.body, pending.caret);
                    }}
                    onKeyDown={(e) => handleBodyKeyDown(seg, i, e)}
                    onSelect={(e) => syncCaret(seg, e.currentTarget)}
                    onClick={(e) => syncCaret(seg, e.currentTarget)}
                    onFocus={(e) => syncCaret(seg, e.currentTarget)}
                    onKeyUp={(e) => syncCaret(seg, e.currentTarget)}
                    onBlur={() => {
                      composingRef.current = false;
                      setTimeout(() => {
                        const el = document.activeElement;
                        if (el && surfaceRef.current?.contains(el)) return;
                        setSlashMenu((prev) => (prev ? null : prev));
                      }, 150);
                    }}
                    className={styles.blockTextArea}
                    placeholder={placeholder}
                  />
                  {format !== 'plain' && !seg.virtual && (
                    <span className={styles.blockFormatTag}>{format === 'list' ? 'UL' : format === 'quote' ? '❝' : format.toUpperCase()}</span>
                  )}
                  {format === 'plain' && slashMenu?.segIndex === i && (() => {
                    const q = slashMenu.query;
                    const filtered = SLASH_COMMANDS.filter(c => !q || c.label.toLowerCase().includes(q) || c.icon.toLowerCase().includes(q));
                    if (filtered.length === 0) return null;
                    return (
                      <div className={`${styles.slashMenu} ${slashMenu.openUpward ? styles.slashMenuUp : ''}`}>
                        {filtered.map((cmd, idx) => (
                          <div
                            key={cmd.icon}
                            onMouseDown={(e) => { e.preventDefault(); applySlashCommand(SLASH_COMMANDS.indexOf(cmd)); }}
                            onMouseEnter={() => setSlashIndex(idx)}
                            className={`${styles.slashItem} ${idx === slashIndex ? styles.slashItemActive : ''}`}
                          >
                            <span className={styles.slashIcon}>{cmd.icon}</span>
                            <span>{cmd.label}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </Wrapper>
              );
            })}
            {isDraggingOnBody && <div className={styles.dropHint}>ここにドロップして挿入</div>}
          </div>
        </div>
      </article>
    </div>
  );

  return (
    <>
    <form id="post-editor-form" onSubmit={handleSubmit} className={styles.form}>
      {/* 前回の未保存内容が残っていれば復元を促す */}
      {restorable && (
        <div className={styles.restoreBanner}>
          <span className={styles.restoreText}>
            保存されていない編集内容があります（{formatSavedAt(restorable.savedAt)}）
          </span>
          <div className={styles.restoreActions}>
            <button type="button" onClick={restoreDraft} className={styles.restoreBtn}>復元する</button>
            <button type="button" onClick={clearDraft} className={styles.restoreDismiss}>破棄</button>
          </div>
        </div>
      )}

      {/* 記事そのものを編集する（別枠のプレビューは持たない） */}
      {articleSurface}

      {/* アフィリリンク（記事の下で管理し、「本文に挿入」で記事内に置く） */}
      {products.length > 0 && (
        <div ref={productSectionRef} className={styles.productSection}>
          <p className={styles.label}>アフィリリンク</p>
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
        </div>
      )}

      {errorMsg && <p className={styles.error}>{errorMsg}</p>}
      {status === 'done' && <p className={styles.success}>保存しました！ダッシュボードに戻ります...</p>}
      {status === 'saving' && <p className={styles.info}>保存中...</p>}

    </form>
    {headerActionsTarget && createPortal(
      <div className={styles.headerActions}>
        {savedAt && status === 'idle' && (
          <span className={styles.autosaveNote}>下書き退避 {formatSavedAt(savedAt)}</span>
        )}
        <button type="button" onClick={openMediaPickerAtCursor} className={styles.cancelBtn} disabled={isSubmitting}>
          メディア
        </button>
        <button type="button" onClick={() => router.push('/admin')} className={styles.cancelBtn} disabled={isSubmitting}>
          キャンセル
        </button>
        <button type="button" onClick={(e) => handleSubmit(e, 'draft')} disabled={isSubmitting || status === 'done'} className={styles.cancelBtn}>
          {isSubmitting ? '...' : '下書き保存'}
        </button>
        <button type="submit" form="post-editor-form" disabled={isSubmitting || status === 'done'} className={styles.submitBtn}>
          {isSubmitting ? '送信中...' : initialData ? '更新する' : '投稿する'}
        </button>
      </div>,
      headerActionsTarget
    )}
    {showMediaPicker && (
      <MediaPicker
        onSelect={handleMediaSelect}
        onClose={() => setShowMediaPicker(false)}
      />
    )}
    </>
  );
}
