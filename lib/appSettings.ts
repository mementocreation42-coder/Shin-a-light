import { getSql, isDbConfigured } from '@/lib/db';

/**
 * アプリ設定（app_settings テーブル）の読み取り。
 * 環境変数を触れない環境（Vercel の権限が無い等）でも、DB 側で設定できる逃げ道。
 */
export async function getAppSetting(key: string): Promise<string | null> {
    if (!isDbConfigured()) return null;
    try {
        const sql = getSql();
        const rows = await sql<{ value: string }>`
            select value from app_settings where key = ${key} limit 1
        `;
        return rows[0]?.value ?? null;
    } catch {
        // テーブル未作成などは「設定なし」として扱う
        return null;
    }
}
