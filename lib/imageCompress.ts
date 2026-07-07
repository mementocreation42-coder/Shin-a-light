// クライアント専用の画像圧縮ユーティリティ（アップロード前に縮小してサイズ超過を防ぐ）

const TARGET_SIZE_BYTES = 800 * 1024;
const MAX_DIMENSION = 1920;

export function isHeic(file: File): boolean {
    return file.type === 'image/heic' || file.type === 'image/heif' || /\.(heic|heif)$/i.test(file.name);
}

export async function compressImage(file: File): Promise<File> {
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
