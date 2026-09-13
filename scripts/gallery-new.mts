/**
 * 撮ってあげた人に渡す限定ギャラリーを作る（タダで撮る → 気に入ったら買う）。
 *
 *   npm run gallery:new -- <ファイル or フォルダ…> --title "Ikumi, morning session" --place "Ikumi Beach, Tokushima" [--date 2026-09-13] [--single 20] [--all 60] [--free]
 *   --free … 原本も無料で配る（購入ボタンを出さない）。あとから管理画面の「メメント」でも切り替えられる
 *
 * 出力: public/g/<token>/p/  … 無料プレビュー（1200px、クレジット入り、AVIF ＋ JPEG）
 *       public/g/<token>/o/  … 原本（3000px 10bit Display P3 AVIF ＋ 原寸 sRGB JPEG）。ファイル名は推測できない乱数
 *       data/galleries/<token>.json
 * URL:  https://www.shinealight.jp/g/<token>   （解放キー付き: ?unlock=<unlockKey>）
 */
import { randomBytes } from 'node:crypto';
import { mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import sharp from 'sharp';

const args = process.argv.slice(2);
const flag = (n: string, d?: string) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const title = flag('--title', 'Your photos')!;
const place = flag('--place', 'Tokushima, Japan')!;
const date = flag('--date', new Date().toISOString().slice(0, 10))!;
const single = Number(flag('--single', '20')), all = Number(flag('--all', '60'));
const free = args.includes('--free');
const CREDIT = 'Photo: Daisuke Kobayashi / Shine a Light';
const EXT = new Set(['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.heic', '.heif']);
const skip = new Set(['--title', '--place', '--date', '--single', '--all']);
// --free は値を取らないフラグなので、写真の一覧からは startsWith('--') で除外される
const files = args.filter((a, i) => !a.startsWith('--') && !skip.has(args[i - 1])).map((p) => resolve(p))
  .flatMap((p) => (statSync(p).isDirectory() ? readdirSync(p).map((f) => join(p, f)) : [p]))
  .filter((p) => EXT.has(extname(p).toLowerCase())).sort();
if (!files.length) { console.error('写真を指定してください'); process.exit(1); }

const token = randomBytes(8).toString('hex');           // 16 桁
const unlockKey = randomBytes(6).toString('hex');
const root = join(process.cwd(), 'public', 'g', token);
mkdirSync(join(root, 'p'), { recursive: true }); mkdirSync(join(root, 'o'), { recursive: true });

function creditSvg(w: number, h: number): Buffer {
  const fs = Math.max(14, Math.round(w / 70));
  return Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <text x="${w - fs}" y="${h - fs}" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="${fs}" fill="rgba(255,255,255,0.55)">${CREDIT}</text></svg>`);
}
const fit = (W: number, H: number, w: number) => { const s = Math.min(1, w / W); return { w: Math.round(W * s), h: Math.round(H * s) }; };

const photos = [];
for (const [i, abs] of files.entries()) {
  const id = `${String(i + 1).padStart(2, '0')}`;
  const rnd = randomBytes(5).toString('hex');
  const meta = await sharp(abs).rotate().metadata();
  const W = meta.width ?? 0, H = meta.height ?? 0;
  const pv = fit(W, H, 1200), ov = fit(W, H, 3000);
  const base = sharp(abs).rotate();
  // プレビュー（無料）: クレジット入り
  await base.clone().resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
    .composite([{ input: creditSvg(pv.w, pv.h) }]).withMetadata({ icc: 'srgb' }).jpeg({ quality: 82, mozjpeg: true }).toFile(join(root, 'p', `${id}.jpg`));
  await base.clone().resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
    .composite([{ input: creditSvg(pv.w, pv.h) }]).toColourspace('rgb16').withMetadata({ icc: 'p3' })
    .avif({ quality: 68, bitdepth: 10, effort: 5, chromaSubsampling: '4:4:4' }).toFile(join(root, 'p', `${id}.avif`));
  // 原本（購入）: 10bit P3 AVIF 3000px ＋ 原寸 sRGB JPEG
  await base.clone().resize({ width: 3000, height: 3000, fit: 'inside', withoutEnlargement: true })
    .toColourspace('rgb16').withMetadata({ icc: 'p3' }).avif({ quality: 66, bitdepth: 10, effort: 5, chromaSubsampling: '4:4:4' }).toFile(join(root, 'o', `${id}-${rnd}.avif`));
  await base.clone().withMetadata({ icc: 'srgb' }).jpeg({ quality: 92, mozjpeg: true }).toFile(join(root, 'o', `${id}-${rnd}.jpg`));
  photos.push({ id, w: W, h: H,
    preview: { avif: `/g/${token}/p/${id}.avif`, jpg: `/g/${token}/p/${id}.jpg`, ...pv },
    orig: { avif: `/g/${token}/o/${id}-${rnd}.avif`, jpg: `/g/${token}/o/${id}-${rnd}.jpg`, w: W, h: H } });
  console.log(`${id}: ${W}x${H} → preview ${pv.w}px, orig avif ${ov.w}px + jpg 原寸`);
}
const gallery = { token, title, place, date, credit: CREDIT, price: { currency: 'usd', single, all }, unlockKey, free, photos, created: new Date().toISOString() };
writeFileSync(join(process.cwd(), 'data', 'galleries', `${token}.json`), JSON.stringify(gallery, null, 2) + '\n');
console.log(`\nギャラリー: https://www.shinealight.jp/g/${token}`);
console.log(`解放キー付き（購入後・現金のときに渡す）: https://www.shinealight.jp/g/${token}?unlock=${unlockKey}`);
console.log(`手元で見る: http://localhost:3000/g/${token}`);
