// クライアント専用の画像変換ユーティリティ。
//
// かつてはアップロード前に 800KB / 長辺1920px へ縮小していたが、
// 画質を優先してリミッターは撤廃した。いまここでやるのは2つだけ:
//   1. HEIC → JPEG 変換（ブラウザも WordPress もそのままでは扱えない）
//   2. force 指定時の canvas 焼き直し（バイト列が変わり、WAF の
//      「中身が攻撃パターンに一致」型の誤検知を回避しやすい）
// どちらも解像度は落とさない。
//
// サーバー側(WordPress/PHP)のアップロード上限に当たって 413 が返るように
// なったら、ここに上限を戻すのではなく、まずサーバー側の上限を上げること。

/** 焼き直し時の JPEG 品質。サイズ目標は設けない */
const JPEG_QUALITY = 0.92;

export function isHeic(file: File): boolean {
    return file.type === 'image/heic' || file.type === 'image/heif' || /\.(heic|heif)$/i.test(file.name);
}

// force=true のときはサイズに関わらず必ず canvas で焼き直す（WAF対策）。
// それ以外は HEIC の変換だけ行い、通常の JPEG/PNG は元ファイルのまま返す。
export async function compressImage(file: File, force = false): Promise<File> {
    if (!force && !isHeic(file)) return file;
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.getContext('2d')!.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                if (!blob) { resolve(file); return; }
                resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
            }, 'image/jpeg', JPEG_QUALITY);
        };
        // 読めない形式（Safari 以外での HEIC など）は元のまま返し、サーバー側に委ねる
        img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
        img.src = url;
    });
}
