import { mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Issue, IssuePatch, IssueStatus, IssueSummary } from '@/lib/issues';

/**
 * 原稿をローカルのファイルに保存する置き場。
 *
 * DATABASE_URL が無いときの保存先。Postgres を用意する前でも原稿を書き始められる。
 * 本番（Vercel）のファイルシステムは書き込めないので、こちらはあくまで手元用。
 * DB を繋いだ時点で lib/issues.ts が自動的に Postgres 側へ切り替わる。
 *
 * 1号 = 1ファイル。あとで DB に移すときに読み替えやすいよう、
 * 見出し情報は先頭のフロントマターに、本文はそのまま下に置く。
 * 値は JSON 文字列として書く。改行やコロンを含んでも壊れないため。
 */

const DIR = join(process.cwd(), 'content', 'newsletter');

interface Meta {
  id: string;
  subject: string;
  preheader: string;
  status: IssueStatus;
  recipient_count: number | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

const EMPTY_META = (id: string, now: string): Meta => ({
  id,
  subject: '',
  preheader: '',
  status: 'draft',
  recipient_count: null,
  sent_at: null,
  created_at: now,
  updated_at: now,
});

function serialize(meta: Meta, bodyMd: string): string {
  const lines = Object.entries(meta).map(([key, value]) => `${key}: ${JSON.stringify(value)}`);
  return `---\n${lines.join('\n')}\n---\n${bodyMd}`;
}

function parse(text: string, fallbackId: string): Issue {
  const now = new Date().toISOString();
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text);
  if (!match) {
    // フロントマターが壊れていても本文は救う。書いたものを失わせない。
    return { ...EMPTY_META(fallbackId, now), body_md: text };
  }

  const meta = { ...EMPTY_META(fallbackId, now) } as Meta & Record<string, unknown>;
  for (const line of match[1].split('\n')) {
    const sep = line.indexOf(':');
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    if (!(key in meta)) continue;
    try {
      meta[key] = JSON.parse(line.slice(sep + 1).trim());
    } catch {
      // 読めない行は既定値のままにする
    }
  }

  return { ...(meta as Meta), body_md: match[2] };
}

async function readIssue(file: string): Promise<Issue | null> {
  try {
    const text = await readFile(join(DIR, file), 'utf8');
    return parse(text, file.replace(/\.md$/, ''));
  } catch {
    return null;
  }
}

async function write(issue: Issue): Promise<void> {
  await mkdir(DIR, { recursive: true });
  const { body_md, ...meta } = issue;
  await writeFile(join(DIR, `${issue.id}.md`), serialize(meta as Meta, body_md), 'utf8');
}

export async function listIssuesFromFiles(): Promise<IssueSummary[]> {
  let files: string[];
  try {
    files = (await readdir(DIR)).filter((f) => f.endsWith('.md'));
  } catch {
    // まだ1号も作っていない
    return [];
  }

  const issues = (await Promise.all(files.map(readIssue))).filter((i): i is Issue => i !== null);

  // 一覧は新しい順。本文は載せない（DB 側の listIssues と同じ形にそろえる）
  return issues
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((i) => ({
      id: i.id,
      subject: i.subject,
      preheader: i.preheader,
      status: i.status,
      recipient_count: i.recipient_count,
      sent_at: i.sent_at,
      created_at: i.created_at,
      updated_at: i.updated_at,
    }));
}

export async function getIssueFromFile(id: string): Promise<Issue | null> {
  // id はファイル名になる。パスを遡られないよう素性を確かめる
  if (!/^[a-zA-Z0-9-]+$/.test(id)) return null;
  return readIssue(`${id}.md`);
}

export async function createIssueFile(): Promise<Issue> {
  const now = new Date().toISOString();
  const issue: Issue = { ...EMPTY_META(crypto.randomUUID(), now), body_md: '' };
  await write(issue);
  return issue;
}

export async function updateIssueFile(id: string, patch: IssuePatch): Promise<Issue | null> {
  const current = await getIssueFromFile(id);
  if (!current) return null;
  // DB 側と同じく、配信済み・配信中は書き換えない
  if (current.status !== 'draft') return null;

  const updated: Issue = {
    ...current,
    subject: patch.subject ?? current.subject,
    preheader: patch.preheader ?? current.preheader,
    body_md: patch.bodyMd ?? current.body_md,
    updated_at: new Date().toISOString(),
  };
  await write(updated);
  return updated;
}

export async function deleteIssueFile(id: string): Promise<boolean> {
  const current = await getIssueFromFile(id);
  if (!current || current.status !== 'draft') return false;
  await unlink(join(DIR, `${id}.md`));
  return true;
}
