// クライアント専用。管理画面から画像を /api/admin/upload に送る共通の入口。
//
// WordPress 側の WAF（SiteGuard Lite）は、写真のバイト列に「攻撃っぽい並び」が
// たまたま含まれると 403 で弾く。バイト列を変えれば通るので、弾かれたら
// ブラウザの canvas で品質を少し変えて作り直し、最大 3 回送り直す。
// （サーバー側の sharp は本番の実行時に読み込めないことがあるため、作り直しはブラウザで行う）

export interface UploadedMedia {
  id: number;
  url: string;
}

const AUTH_EXPIRED_MSG = 'ログインの有効期限が切れました。ページを再読み込みするか、再ログインしてください。';

/** 送り直すときの JPEG 品質（見た目はほぼ同じ。バイト列が変わる） */
const RETRY_QUALITIES = [0.9, 0.86, 0.82];

function isWafError(message: string): boolean {
  return /WAF|SiteGuard|Forbidden|閲覧できません/i.test(message);
}

/** canvas で JPEG に作り直す。読めない形式なら null */
function reencode(file: File, quality: number, attempt: number): Promise<File | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d')!.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(null);
          // ファイル名も英数字だけにする（名前の文字列が引っかかる可能性も潰す）
          resolve(new File([blob], `photo-${Date.now().toString(36)}-${attempt}.jpg`, { type: 'image/jpeg' }));
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

/** 1 回送る。成功なら media、失敗なら日本語のエラー文を投げる */
async function sendOnce(file: File): Promise<UploadedMedia> {
  const fd = new FormData();
  fd.append('image', file, file.name);
  let res: Response;
  try {
    res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
  } catch {
    throw new Error('通信に失敗しました。ネットワークを確認してもう一度お試しください。');
  }
  if (res.status === 401) throw new Error(AUTH_EXPIRED_MSG);
  if (res.status === 413) throw new Error('画像が大きすぎます（1 枚 4MB まで）。');

  // 本番の関数が落ちたときなどは HTML が返るので、JSON として読めなくても止まらないようにする
  const text = await res.text();
  let data: { id?: number; url?: string; error?: string } = {};
  try {
    data = JSON.parse(text);
  } catch {
    /* JSON 以外 */
  }
  if (!res.ok || !data.id || !data.url) {
    throw new Error(data.error || `アップロードに失敗しました（サーバーエラー ${res.status}）。`);
  }
  return { id: Number(data.id), url: data.url };
}

/**
 * 画像を WordPress のメディアにアップロードする。
 * WAF に弾かれたら、品質を変えて作り直して最大 3 回送り直す。
 */
export async function uploadImage(file: File): Promise<UploadedMedia> {
  try {
    return await sendOnce(file);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!isWafError(message)) throw error;

    let last: unknown = error;
    for (const [i, quality] of RETRY_QUALITIES.entries()) {
      const retried = await reencode(file, quality, i + 1);
      if (!retried) break;
      try {
        return await sendOnce(retried);
      } catch (retryError) {
        last = retryError;
        if (!isWafError(retryError instanceof Error ? retryError.message : String(retryError))) break;
      }
    }
    throw last instanceof Error ? last : new Error(String(last));
  }
}
