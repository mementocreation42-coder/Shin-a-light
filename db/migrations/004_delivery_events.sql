-- 段階4: 送信サービスからの通知（webhook）を受けて記録する列
--
-- 開封は自前のピクセルを埋め込まず、送信サービスが送ってくる
-- 「開封」イベントを message_id で突き合わせて記録する。
-- Apple のプライバシー保護などで水増しされるので参考値。

alter table deliveries add column if not exists opened_at timestamptz;

-- 不達・苦情の理由。名簿側の status と合わせて、
-- 「なぜ送れなくなったか」をあとから追えるようにする
alter table subscribers add column if not exists status_reason text;
