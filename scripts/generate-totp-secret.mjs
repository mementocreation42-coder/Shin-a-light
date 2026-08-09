#!/usr/bin/env node
// 管理画面の2段階認証で使う TOTP シークレットを生成する。
// 出力された値を .env.local の ADMIN_TOTP_SECRET に設定し、
// otpauth:// の URL を認証アプリに登録する。
//
//   node scripts/generate-totp-secret.mjs

import { randomBytes } from 'node:crypto';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(bytes) {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

// 160bit。RFC 6238 が SHA-1 で推奨する長さ
const secret = base32Encode(randomBytes(20));

const issuer = 'Shine a Light';
const account = 'admin';
const url =
  `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}` +
  `?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

console.log(`
TOTP シークレットを生成しました。

1) .env.local に追記（本番環境の環境変数にも同じ値を設定）

   ADMIN_TOTP_SECRET=${secret}

2) 認証アプリ（1Password / Authy / Google Authenticator など）に登録

   手入力する場合のキー: ${secret}

   URL を読み込ませる場合:
   ${url}

3) 開発サーバーを再起動してから /login で動作を確認

注意: このシークレットはパスワードと同等の機密情報です。
      コミットせず、.env.local に置いてください。
`);
