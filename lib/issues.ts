import { getSql, isDbConfigured } from '@/lib/db';
import {
  createIssueFile,
  deleteIssueFile,
  getIssueFromFile,
  listIssuesFromFiles,
  updateIssueFile,
} from '@/lib/issuesFile';

export type IssueStatus = 'draft' | 'sending' | 'sent';

export interface Issue {
  id: string;
  subject: string;
  preheader: string;
  body_md: string;
  status: IssueStatus;
  recipient_count: number | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

/** 一覧用。本文は重いので載せない */
export type IssueSummary = Omit<Issue, 'body_md'>;

/** 配信済み・配信中の号は編集させない。誤って送信内容を書き換えないため */
export function isEditable(status: IssueStatus): boolean {
  return status === 'draft';
}

/**
 * 原稿の保存先。
 *
 * DATABASE_URL があれば Postgres、無ければ content/newsletter/ のファイル。
 * DB を用意する前でも原稿だけは書き始められるようにするための切り替えで、
 * 呼び出し側はどちらに保存されているかを気にしなくてよい。
 * （名簿と配信は DB でしか動かない。そちらは接続後に使えるようになる）
 */
export function usingFileStore(): boolean {
  return !isDbConfigured();
}

export async function listIssues(): Promise<IssueSummary[]> {
  if (usingFileStore()) return listIssuesFromFiles();
  const sql = getSql();
  return sql<IssueSummary>`
    select id, subject, preheader, status, recipient_count, sent_at, created_at, updated_at
      from issues
     order by created_at desc
  `;
}

export async function getIssue(id: string): Promise<Issue | null> {
  if (usingFileStore()) return getIssueFromFile(id);
  const sql = getSql();
  const rows = await sql<Issue>`select * from issues where id = ${id}`;
  return rows[0] ?? null;
}

export async function createIssue(): Promise<Issue> {
  if (usingFileStore()) return createIssueFile();
  const sql = getSql();
  const rows = await sql<Issue>`
    insert into issues (subject) values ('') returning *
  `;
  return rows[0];
}

export interface IssuePatch {
  subject?: string;
  preheader?: string;
  bodyMd?: string;
}

/**
 * 下書きの更新。
 * where 句で status を縛っているので、配信中／配信済みの号は
 * 画面をすり抜けて PATCH が飛んできても書き換わらない。
 */
export async function updateIssue(id: string, patch: IssuePatch): Promise<Issue | null> {
  if (usingFileStore()) return updateIssueFile(id, patch);
  const sql = getSql();
  const rows = await sql<Issue>`
    update issues
       set subject   = coalesce(${patch.subject ?? null}, subject),
           preheader = coalesce(${patch.preheader ?? null}, preheader),
           body_md   = coalesce(${patch.bodyMd ?? null}, body_md),
           updated_at = now()
     where id = ${id} and status = 'draft'
     returning *
  `;
  return rows[0] ?? null;
}

export async function deleteIssue(id: string): Promise<boolean> {
  if (usingFileStore()) return deleteIssueFile(id);
  const sql = getSql();
  const rows = await sql<{ id: string }>`
    delete from issues where id = ${id} and status = 'draft' returning id
  `;
  return rows.length > 0;
}
