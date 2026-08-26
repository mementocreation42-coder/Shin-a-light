import { neon } from '@neondatabase/serverless';

/**
 * DB クライアント。
 *
 * DATABASE_URL の形で接続先を切り替える。
 *   postgresql://…  Neon（本番）。HTTP ドライバなので 1クエリ = 1リクエスト。
 *   pglite://<dir>  手元だけで動く Postgres（PGlite）。アカウント不要で、
 *                   <dir> にファイルとして保存される。開発と動作確認用。
 *
 * どちらも同じタグ付きテンプレートで呼べるので、呼び出し側は接続先を意識しない。
 */

/**
 * タグ付きテンプレートとして呼ぶ SQL クライアント。
 *
 * neon() の戻り値の型は「設定次第で行の配列にも FullQueryResults にもなる」
 * ユニオンになっていて、そのままだと呼び出し側で毎回絞り込みが要る。
 * 既定の設定（fullResults なし）では常に行の配列が返るので、ここで型を確定させる。
 */
export type SqlClient = <T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<T[]>;

let cached: SqlClient | null = null;

/** DATABASE_URL が入っているか。移行期間中の分岐に使う */
export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** 手元の PGlite を使っているか（本番では常に false） */
export function isLocalDb(): boolean {
  return Boolean(process.env.DATABASE_URL?.startsWith('pglite://'));
}

/**
 * DB クライアントを返す。
 * import 時ではなく呼び出し時に初期化する。DATABASE_URL 未設定でビルドや
 * 他ページの表示まで巻き添えで落とさないため。
 */
export function getSql(): SqlClient {
  if (cached) return cached;

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');

  cached = url.startsWith('pglite://') ? pgliteClient(url) : (neon(url) as unknown as SqlClient);
  return cached;
}

// ===== PGlite =====

type PgliteDb = {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;
};

/**
 * 同じプロセス内で1つだけ開く。PGlite は同じディレクトリを二重に開けない。
 * Next の開発サーバーはページと Route Handler でモジュールグラフが分かれ、
 * モジュール変数のキャッシュでは共有されない（2個目が Aborted() で落ちる）ため、
 * globalThis に持って本当にプロセスで1つにする。
 */
const g = globalThis as typeof globalThis & { __salPglitePromise?: Promise<PgliteDb> };

export function getPglite(url: string): Promise<PgliteDb> {
  if (g.__salPglitePromise) return g.__salPglitePromise;

  g.__salPglitePromise = (async () => {
    // 動的 import にして、Neon で動く本番バンドルに WASM を含めない
    const { PGlite } = await import('@electric-sql/pglite');
    const { mkdir } = await import('node:fs/promises');
    const dir = url.slice('pglite://'.length) || '.data/pglite';
    // PGlite は親ディレクトリまでは作ってくれない
    await mkdir(dir, { recursive: true });
    return new PGlite(dir) as unknown as PgliteDb;
  })();

  return g.__salPglitePromise;
}

/**
 * タグ付きテンプレートを $1, $2… 形式に直して PGlite に投げる。
 * 配列は Postgres の配列リテラル文字列に変換する（unnest(${arr}::text[]) 用）。
 */
function pgliteClient(url: string): SqlClient {
  return async function sql<T>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T[]> {
    const text = strings.reduce((acc, s, i) => acc + s + (i < values.length ? `$${i + 1}` : ''), '');
    const params = values.map(toPgParam);
    const db = await getPglite(url);
    const { rows } = await db.query(text, params);
    return rows as T[];
  };
}

function toPgParam(value: unknown): unknown {
  if (Array.isArray(value)) return toArrayLiteral(value);
  return value;
}

/** JS 配列 → '{"a","b",NULL}' 形式 */
function toArrayLiteral(values: unknown[]): string {
  const items = values.map((v) => {
    if (v === null || v === undefined) return 'NULL';
    const s = String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `"${s}"`;
  });
  return `{${items.join(',')}}`;
}
