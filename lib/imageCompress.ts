// クライアント専用の画像変換ユーティリティ。
//
// 画質を優先し、基本は解像度を落とさない。ここでやるのは3つ:
//   1. HEIC → JPEG 変換（ブラウザも WordPress もそのままでは扱えない）
//   2. force 指定時の canvas 焼き直し（バイト列が変わり、WAF の
//      「中身が攻撃パターンに一致」型の誤検知を回避しやすい）
//   3. 送信上限を超えるときだけ段階的に軽くする（下記）
//
// 本番は Vercel の関数を経由して WordPress に送るため、1 回の送信は 4.5MB が上限
// （Vercel 側の固定値で、設定では上げられない）。超えると 413「画像が大きすぎます」になる。
// そこで上限に収まる写真は無劣化のまま、超える写真だけ
//   品質を少し下げる → それでも超えれば長辺を縮める
// の順で、上限に収まる最も高画質な版を選ぶ。

/** 焼き直し時の JPEG 品質（上限内に収まるならこれで出す） */
const JPEG_QUALITY = 0.92;

/** 送信できるファイルの上限。4.5MB の関数上限から、フォームの区切りなどの余白を引いた値 */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** 上限を超えたときに試す組み合わせ（上から順に、収まった時点で決定） */
const FALLBACK_STEPS: { maxEdge: number; quality: number }[] = [
    { maxEdge: Infinity, quality: 0.88 },
    { maxEdge: Infinity, quality: 0.84 },
    { maxEdge: 5000, quality: 0.88 },
    { maxEdge: 4096, quality: 0.88 },
    { maxEdge: 3600, quality: 0.86 },
    { maxEdge: 3000, quality: 0.85 },
    { maxEdge: 2400, quality: 0.82 },
    { maxEdge: 2000, quality: 0.8 },
];

export function isHeic(file: File): boolean {
    return file.type === 'image/heic' || file.type === 'image/heif' || /\.(heic|heif)$/i.test(file.name);
}

function loadImage(file: File): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
        // 読めない形式（Safari 以外での HEIC など）
        img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
        img.src = url;
    });
}

function encode(img: HTMLImageElement, maxEdge: number, quality: number): Promise<Blob | null> {
    const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
}

/**
 * アップロード用に整える。
 * - force=false: HEIC か、上限を超える画像だけ変換。それ以外は元ファイルのまま
 * - force=true : 必ず焼き直す（WAF 対策）。上限を超えるなら軽くする
 */
export async function compressImage(file: File, force = false): Promise<File> {
    const tooBig = file.size > MAX_UPLOAD_BYTES;
    if (!force && !isHeic(file) && !tooBig) return file;

    const img = await loadImage(file);
    // 読めない形式は元のまま返し、サーバー側に委ねる
    if (!img) return file;

    const name = file.name.replace(/\.[^.]+$/, '.jpg');
    const toFile = (blob: Blob) => new File([blob], name, { type: 'image/jpeg' });

    // まずは無劣化（原寸・品質 0.92）で試す
    const first = await encode(img, Infinity, JPEG_QUALITY);
    if (first && first.size <= MAX_UPLOAD_BYTES) return toFile(first);

    // 上限超え: 収まるまで段階的に軽くする
    let last = first;
    for (const step of FALLBACK_STEPS) {
        if (step.maxEdge < Math.max(img.width, img.height) || step.maxEdge === Infinity) {
            const blob = await encode(img, step.maxEdge, step.quality);
            if (!blob) continue;
            last = blob;
            if (blob.size <= MAX_UPLOAD_BYTES) return toFile(blob);
        }
    }
    // ここまで来るのは極端な画像だけ。一番軽い版を返す（サーバーが 413 を返せば画面にエラーが出る）
    return last ? toFile(last) : file;
}
