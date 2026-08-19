-- 段階4: 配信記録（誰にいつ送ったか）
--
-- 1通ごとに1行残す。この表があるおかげで、
--   * 途中で失敗しても「まだ届いていない人」だけに送り直せる
--   * 二重配信を防げる（sent_at が入っている相手は次から対象外）
--   * バウンス通知を message_id で突き合わせられる
-- 主キーを (issue_id, subscriber_id) にしているので、同じ相手に2行は入らない。

create table if not exists deliveries (
  issue_id      uuid not null references issues(id) on delete cascade,
  subscriber_id uuid not null references subscribers(id) on delete cascade,

  -- 送信できた時刻。失敗のあいだは null のまま＝再送の対象
  sent_at       timestamptz,
  -- 失敗した理由。成功したら null に戻す
  error         text,

  -- 送信サービスと、そこで採番されたID
  provider      text,
  message_id    text,

  attempted_at  timestamptz not null default now(),

  primary key (issue_id, subscriber_id)
);

-- 「この号でまだ送れていない人」の抽出に効く
create index if not exists deliveries_issue_sent_idx on deliveries (issue_id, sent_at);
