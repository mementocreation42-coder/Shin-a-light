// GoldRoom の利用コードの流れを、手元の使い捨て DB（PGlite）で確かめる。外部には一切つながない。
//
//   GOLDROOM_SIGNING_KEY=... npx tsx scripts/goldroom-selftest.mts
//
// 確かめること: コードの署名が公開鍵で通る・改ざんで落ちる / 購読中の人にだけコードを送る /
// 5 分以内の再送はしない / ウェルカムメールに GoldRoom が載る

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { createPrivateKey, createPublicKey, verify } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

if (!process.env.GOLDROOM_SIGNING_KEY) { console.error('GOLDROOM_SIGNING_KEY を入れて実行してください'); process.exit(2); }
const dir = mkdtempSync(join(tmpdir(), 'sal-goldroom-'));
process.env.DATABASE_URL = `pglite://${join(dir, 'db')}`;
process.env.MAIL_PROVIDER = 'outbox';
process.env.SITE_URL = 'http://localhost:3000';
process.env.GOLDROOM_DOWNLOAD_URL = 'https://example.com/GoldRoom.dmg';
process.chdir(dir); // .mail-outbox/ をここに作らせる
execFileSync('node', [join(import.meta.dirname, 'db-migrate.mjs')], { stdio: 'inherit', env: process.env });

const { registerSubscriber, confirmSubscriber } = await import('../lib/newsletter');
const { issueGoldroomCode, sendGoldroomCodeIfActive, goldroomLinks } = await import('../lib/goldroom');
const { renderWelcomeEmail } = await import('../lib/email/templates');

let failed = 0;
const check = (name: string, ok: boolean) => { console.log(`${ok ? 'ok  ' : 'NG  '} ${name}`); if (!ok) failed++; };
const outbox = () => { try { return readdirSync(join(dir, '.mail-outbox')).length; } catch { return 0; } };

// 署名
const pub = createPublicKey(createPrivateKey({ key: Buffer.from(process.env.GOLDROOM_SIGNING_KEY, 'base64'), format: 'der', type: 'pkcs8' }));
const code = issueGoldroomCode(' Reader@Example.com ');
const [, p64, s64] = code.split('.');
const payload = Buffer.from(p64, 'base64url'), sig = Buffer.from(s64, 'base64url');
check('コードは GR1. で始まる', code.startsWith('GR1.'));
check('メールは正規化して入る', JSON.parse(payload.toString()).e === 'reader@example.com');
check('署名が公開鍵で通る', verify(null, payload, pub, sig));
const forged = Buffer.from(JSON.stringify({ ...JSON.parse(payload.toString()), e: 'other@example.com' }));
check('中身を変えると通らない', !verify(null, forged, pub, sig));
console.log('公開鍵(raw):', pub.export({ type: 'spki', format: 'der' }).subarray(-32).toString('base64'));
console.log('試しのコード:', code);

// 購読中の人にだけ送る
const { confirmToken } = await registerSubscriber({ email: 'reader@example.com' });
check('確認待ちには送らない', (await sendGoldroomCodeIfActive('reader@example.com', 'http://localhost:3000')) === false);
await confirmSubscriber(confirmToken!);
const before = outbox();
check('購読中には送る', (await sendGoldroomCodeIfActive('reader@example.com', 'http://localhost:3000')) === true);
check('メールができる', outbox() > before);
check('5 分以内の再送はしない', (await sendGoldroomCodeIfActive('reader@example.com', 'http://localhost:3000')) === false);
check('名簿にない人には送らない', (await sendGoldroomCodeIfActive('nobody@example.com', 'http://localhost:3000')) === false);

// ウェルカムメール
const w = renderWelcomeEmail({ presetUrl: 'p', unsubUrl: 'u', goldroom: goldroomLinks('reader@example.com', 'http://localhost:3000') });
check('ウェルカムメールに GoldRoom とコードが載る', w.html.includes('GoldRoom をダウンロード') && w.text.includes('GR1.'));
const w0 = renderWelcomeEmail({ presetUrl: 'p', unsubUrl: 'u' });
check('未設定なら載らない', !w0.html.includes('GoldRoom'));
const sent = readFileSync(join(dir, '.mail-outbox', readdirSync(join(dir, '.mail-outbox')).filter((f) => f.endsWith('.html')).sort().pop()!), 'utf8');
check('再送メールにダウンロードとコード', sent.includes('https://example.com/GoldRoom.dmg') && sent.includes('GR1.'));

rmSync(dir, { recursive: true, force: true });
console.log(failed ? `\n${failed} 件 NG` : '\nすべて ok');
process.exit(failed ? 1 : 0);
