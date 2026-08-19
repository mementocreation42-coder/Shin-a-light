// ニュースレターの一連の流れを、手元の使い捨て DB（PGlite）で通しで確かめる。
//
//   npx tsx scripts/newsletter-selftest.mts
//
// 外部サービスには一切つながない。送信は .mail-outbox/ への書き出しになる。
// 本番の DB や .env.local の設定にも触らない。
//
// 確かめること:
//   登録 → 確認 → 解除 → 再登録 の状態遷移
//   号の作成・更新・配信・配信後の編集ロック
//   配信の再実行で二重に送られないこと
//   不達・苦情の通知で名簿から外れること

import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// 他のモジュールを読み込む前に接続先を決める（getSql が最初に見る）
const dir = mkdtempSync(join(tmpdir(), 'sal-newsletter-'));
process.env.DATABASE_URL = `pglite://${join(dir, 'db')}`;
process.env.MAIL_PROVIDER = 'outbox';
process.env.SITE_URL = 'http://localhost:3000';

execFileSync('node', ['scripts/db-migrate.mjs'], { stdio: 'inherit', env: process.env });

const {
  registerSubscriber, confirmSubscriber, unsubscribeByToken, findByUnsubToken,
  addSubscribers, listSubscribers, countByStatus,
  markBounced, markComplained,
} = await import('../lib/newsletter');
const { createIssue, updateIssue, getIssue, listIssues, deleteIssue } = await import('../lib/issues');
const { sendIssueBatch, getDeliveryStats, markOpened, countOpened } = await import('../lib/delivery');
const { getSql } = await import('../lib/db');

let failed = 0;
function check(name: string, ok: boolean, detail?: unknown) {
  console.log(`${ok ? 'ok  ' : 'NG  '} ${name}${ok ? '' : `   ← ${JSON.stringify(detail)}`}`);
  if (!ok) failed++;
}

console.log('\n--- 登録 → 確認 ---');
const r1 = await registerSubscriber({ email: 'Alice@Example.com', source: '/newsletter', ipAddress: '1.2.3.4' });
check('初回登録で確認トークンが返る', Boolean(r1.confirmToken));
check('大文字は小文字に正規化される', (await listSubscribers({ q: 'alice' })).rows[0]?.email === 'alice@example.com');
check('登録直後は pending', (await countByStatus()).pending === 1);

const r1b = await registerSubscriber({ email: 'alice@example.com' });
check('5分以内の再送信はトークンを返さない（連打・爆撃対策）', r1b.confirmToken === null);

check('でたらめなトークンは invalid', (await confirmSubscriber('nope')) === 'invalid');
check('正しいトークンで confirmed', (await confirmSubscriber(r1.confirmToken!)) === 'confirmed');
check('確認後は active', (await countByStatus()).active === 1);
check('同じリンクを二度踏むと already_active', (await confirmSubscriber(r1.confirmToken!)) === 'already_active');
check('active への再登録は何も送らない', (await registerSubscriber({ email: 'alice@example.com' })).confirmToken === null);

console.log('\n--- 解除 → 再登録 ---');
const sql = getSql();
const [alice] = await sql<{ unsub_token: string }>`select unsub_token from subscribers where email = 'alice@example.com'`;
check('解除トークンで購読者を引ける', (await findByUnsubToken(alice.unsub_token))?.email === 'alice@example.com');
check('解除できる', (await unsubscribeByToken(alice.unsub_token)) === 'unsubscribed');
check('二度目は already_off', (await unsubscribeByToken(alice.unsub_token)) === 'already_off');
check('でたらめな解除トークンは invalid', (await unsubscribeByToken('nope')) === 'invalid');
const r2 = await registerSubscriber({ email: 'alice@example.com' });
check('解除後の再登録は確認メールからやり直し（トークンが返る）', Boolean(r2.confirmToken));
check('再登録直後は pending に戻る', (await countByStatus()).pending === 1);
check('古い確認トークンでは復活しない', (await confirmSubscriber(r1.confirmToken!)) === 'invalid');
await confirmSubscriber(r2.confirmToken!);

console.log('\n--- 手動登録・一覧 ---');
const add = await addSubscribers(['bob@example.com', 'carol@example.com', 'ALICE@example.com', 'bad']);
check('手動登録: 新規2件・既存1件スキップ', add.added === 2 && add.skipped === 1, add);
check('手動登録は最初から active', (await countByStatus()).active === 3);
const q = await listSubscribers({ q: '%' });
check('検索の % はワイルドカードにならない', q.total === 0, q.total);
const byStatus = await listSubscribers({ status: 'active', perPage: 2 });
check('状態で絞り込み＋ページ送り', byStatus.total === 3 && byStatus.rows.length === 2);

console.log('\n--- 号 ---');
const issue = await createIssue();
check('号を作れる', issue.status === 'draft');
await updateIssue(issue.id, { subject: 'テスト号', bodyMd: '## 見出し\n\n本文です。' });
check('更新が反映される', (await getIssue(issue.id))?.subject === 'テスト号');
check('一覧に出る', (await listIssues()).some((i) => i.id === issue.id));

const empty = await createIssue();
const emptySend = await sendIssueBatch(empty.id);
check('件名が空の号は送れない', emptySend.sent === 0 && Boolean(emptySend.error), emptySend);
check('下書きは消せる', await deleteIssue(empty.id));

console.log('\n--- 配信 ---');
const s1 = await sendIssueBatch(issue.id);
check('active 全員（3人）に送られる', s1.sent === 3 && s1.failed === 0 && s1.remaining === 0, s1);
check('配信後は sent', (await getIssue(issue.id))?.status === 'sent');
check('recipient_count が確定する', (await getIssue(issue.id))?.recipient_count === 3);
check('配信済みの号は編集できない', (await updateIssue(issue.id, { subject: '書き換え' })) === null);
check('配信済みの号は消せない', !(await deleteIssue(issue.id)));

const s2 = await sendIssueBatch(issue.id);
check('もう一度押しても誰にも送られない（二重配信なし）', s2.sent === 0 && s2.remaining === 0, s2);

await addSubscribers(['dave@example.com']);
const s3 = await sendIssueBatch(issue.id);
check('あとから増えた人にだけ送られる', s3.sent === 1, s3);
check('recipient_count は 4 に更新される', (await getIssue(issue.id))?.recipient_count === 4);

const stats = await getDeliveryStats(issue.id);
check('配信記録: sent=4', stats.sent === 4 && stats.remaining === 0, stats);

console.log('\n--- 送信サービスからの通知 ---');
const [d] = await sql<{ message_id: string }>`select message_id from deliveries where issue_id = ${issue.id} limit 1`;
check('開封を記録できる', await markOpened(d.message_id));
check('二度目の開封は上書きしない', !(await markOpened(d.message_id)));
check('開封数', (await countOpened(issue.id)) === 1);
check('知らない message_id は無視', !(await markOpened('unknown')));

check('不達で bounced になる', await markBounced('bob@example.com', 'test'));
check('苦情で complained になる', await markComplained('carol@example.com', 'test'));
const c = await countByStatus();
check('名簿: active 2 / bounced 1 / complained 1', c.active === 2 && c.bounced === 1 && c.complained === 1, c);
check('complained は再登録できない', (await registerSubscriber({ email: 'carol@example.com' })).confirmToken === null);
check('bounced は再登録できる（確認メールから）', Boolean((await registerSubscriber({ email: 'bob@example.com' })).confirmToken));

const s4 = await sendIssueBatch(issue.id);
check('bounced / complained / pending には送られない', s4.sent === 0, s4);

console.log('\n--- webhook（署名の検証を含む）---');
const RESEND_SECRET = 'whsec_' + Buffer.from('test-secret-key-0123456789').toString('base64');
process.env.RESEND_WEBHOOK_SECRET = RESEND_SECRET;
process.env.BREVO_WEBHOOK_SECRET = 'brevo-shared-secret';
const { POST: webhook } = await import('../app/api/newsletter/webhook/route');
const { NextRequest } = await import('next/server');
const { createHmac } = await import('node:crypto');

async function callResend(body: object, opts: { badSig?: boolean; oldTs?: boolean } = {}) {
  const raw = JSON.stringify(body);
  const id = 'msg_test';
  const ts = String(Math.floor(Date.now() / 1000) - (opts.oldTs ? 3600 : 0));
  const key = Buffer.from(RESEND_SECRET.replace(/^whsec_/, ''), 'base64');
  const sig = createHmac('sha256', key).update(`${id}.${ts}.${raw}`).digest('base64');
  const req = new NextRequest('http://localhost/api/newsletter/webhook', {
    method: 'POST',
    headers: {
      'svix-id': id, 'svix-timestamp': ts,
      'svix-signature': `v1,${opts.badSig ? 'AAAA' : sig}`,
      'content-type': 'application/json',
    },
    body: raw,
  });
  return (await webhook(req)).status;
}
async function callBrevo(body: object, secret = 'brevo-shared-secret') {
  const req = new NextRequest(`http://localhost/api/newsletter/webhook?secret=${secret}`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  });
  return (await webhook(req)).status;
}

await addSubscribers(['erin@example.com', 'frank@example.com', 'grace@example.com']);
const [dd] = await sql<{ message_id: string; email: string }>`
  select d.message_id, s.email from deliveries d join subscribers s on s.id = d.subscriber_id
   where d.issue_id = ${issue.id} and d.opened_at is null limit 1`;

check('Resend: 署名が違えば 401', (await callResend({ type: 'email.opened' }, { badSig: true })) === 401);
check('Resend: 古いタイムスタンプは 401（再生攻撃）', (await callResend({ type: 'email.opened' }, { oldTs: true })) === 401);
check('Resend: 正しい署名で 200', (await callResend({ type: 'email.opened', data: { email_id: dd.message_id } })) === 200);
check('Resend: 開封が記録される', (await countOpened(issue.id)) === 2);
await callResend({ type: 'email.bounced', data: { email_id: 'x', to: ['erin@example.com'], bounce: { type: 'Permanent', message: 'no such user' } } });
await callResend({ type: 'email.bounced', data: { email_id: 'x', to: ['frank@example.com'], bounce: { type: 'Transient', message: 'mailbox full' } } });
await callResend({ type: 'email.complained', data: { email_id: 'x', to: ['grace@example.com'] } });
const c2 = await countByStatus();
// この時点の名簿: alice/dave/erin/frank/grace が active、bob は pending、carol は complained
check('Resend: Permanent バウンスは bounced、Transient は残る、苦情は complained',
  c2.bounced === 1 && c2.complained === 2 && c2.active === 3, c2);

check('Brevo: secret が違えば 401', (await callBrevo({ event: 'opened' }, 'wrong')) === 401);
await callBrevo({ event: 'hard_bounce', email: 'frank@example.com', 'message-id': 'x', reason: 'unknown user' });
await callBrevo({ event: 'unsubscribed', email: 'dave@example.com' });
const c3 = await countByStatus();
check('Brevo: hard_bounce → bounced、unsubscribed → unsubscribed', c3.bounced === 2 && c3.unsubscribed === 1 && c3.active === 1, c3);
const [reason] = await sql<{ status_reason: string }>`select status_reason from subscribers where email = 'frank@example.com'`;
check('理由が残る', reason.status_reason.startsWith('brevo:hard_bounce'), reason);

delete process.env.RESEND_WEBHOOK_SECRET;
check('秘密が未設定なら受け付けない (503)', (await callResend({ type: 'email.opened' })) === 503);

rmSync(dir, { recursive: true, force: true });
console.log(failed === 0 ? '\nすべて通りました。' : `\n${failed}件 失敗しました。`);
process.exit(failed === 0 ? 0 : 1);
