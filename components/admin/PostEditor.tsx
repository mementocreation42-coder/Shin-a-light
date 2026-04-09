'use client';

import { useState, useRef, useCallback } from 'react';
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
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const uidRef = useRef(parsed?.images.length ?? 0);

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

  return (
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

      {/* 本文 */}
      <div className={styles.field}>
        <label className={styles.label}>本文</label>
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={14}
          className={styles.textarea}
          placeholder={'本文を入力してください。段落は空行で区切ります。\n\n画像・商品カードを挿入したい位置にカーソルを置いて「本文に挿入」ボタンを押してください。'}
        />
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
        </div>

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
  );
}
