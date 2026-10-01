// サーバー専用。WordPress へのメディアアップロードを、WAF の誤検知に強くする。
//
// journal.shinealight.jp は SiteGuard Lite（WAF）の内側にある。写真のバイト列に
// たまたま「攻撃っぽい文字の並び」が含まれると、403（閲覧できません）で弾かれる。
// 画像の見た目はほぼ変えずにバイト列だけ変えれば通るので、403 のときだけ
// sharp で少しずつ違う設定に再エンコードして送り直す。
//
// lib/wordpress.ts はクライアント画面からも読まれるため、sharp はここに分けている。

import sharp, { type JpegOptions } from 'sharp';
import { uploadMedia, type WPMedia } from '@/lib/wordpress';

/** 403 のときに試す再エンコード（見た目はほぼ同じ。バイト列が変わる） */
const RETRY_VARIANTS: JpegOptions[] = [
  { quality: 91, mozjpeg: true },
  { quality: 89, mozjpeg: true, chromaSubsampling: '4:4:4' },
  { quality: 87, progressive: true },
];

/** WAF に弾かれたかどうか（WordPress 自体の権限エラーと区別する） */
function isWafBlock(message: string): boolean {
  return /SiteGuard|Forbidden access|閲覧できません/i.test(message);
}

/** WordPress の HTML エラーを、画面に出せる短い文に直す */
export function friendlyUploadError(message: string): string {
  if (isWafBlock(message)) {
    return 'サーバーの防御機能（WAF）に弾かれました。別の写真で試すか、少し時間をおいてもう一度アップロードしてください。';
  }
  // HTML が返ってきたらタグを落として短くする
  const text = message.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > 200 ? `${text.slice(0, 200)}…` : text;
}

/**
 * メディアをアップロードする。WAF に弾かれたら再エンコードして最大 3 回送り直す。
 * JPEG / PNG / WebP 以外（動画など）は送り直さない。
 */
export async function uploadMediaResilient(file: File, filename: string): Promise<WPMedia> {
  try {
    return await uploadMedia(file, filename);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!isWafBlock(message) || !/^image\/(jpeg|png|webp)$/.test(file.type || 'image/jpeg')) {
      throw new Error(friendlyUploadError(message));
    }

    const original = Buffer.from(await file.arrayBuffer());
    // ファイル名も英数字だけにする（名前の文字列が引っかかる可能性も潰す）
    const base = `photo-${Date.now().toString(36)}`;
    let lastMessage = message;
    for (const [i, opts] of RETRY_VARIANTS.entries()) {
      try {
        const bytes = await sharp(original).jpeg(opts).toBuffer();
        const name = `${base}-${i + 1}.jpg`;
        const retried = new File([new Uint8Array(bytes)], name, { type: 'image/jpeg' });
        const media = await uploadMedia(retried, name);
        console.info(`[upload] WAF 回避のため再エンコードして成功（${i + 1} 回目）`);
        return media;
      } catch (retryError) {
        lastMessage = retryError instanceof Error ? retryError.message : String(retryError);
        if (!isWafBlock(lastMessage)) break;
      }
    }
    throw new Error(friendlyUploadError(lastMessage));
  }
}
