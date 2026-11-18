-- GoldRoom（Mac の RAW 現像アプリ）の利用コードを /goldroom から送った最後の時刻。
-- 同じ相手への連続送信を止めるためだけに使う（コード自体は署名で作るので保存しない）。
alter table subscribers add column if not exists goldroom_sent_at timestamptz;
