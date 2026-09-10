/**
 * SAL Echos（インタビュー書き起こしの作業フォルダ）の interview.md + meta.json を、
 * WP の下書きに入れる形（タイトル・肩書き行・抜粋・Gutenberg 本文）にする。
 * scripts/interview-to-draft.mts と /interview/preview（手元プレビュー）で共用。
 *
 * interview.md の形（skills/interview の knowledge/style.md）:
 *   # タイトル
 *   肩書き・所属 - 氏名
 *
 *   リード文…
 *
 *   ## 見出し
 *   小林：質問
 *   相手：答え
 *   ![写真の説明](URL)     ← 単独行の画像は画像ブロックになる
 *
 *   ## 要確認
 *   - 表記が曖昧な固有名詞…（内部メモ。下書きには入れない）
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { markdownToGutenberg, paragraphBlock } from '@/lib/gutenberg';

/** 作業フォルダ。別のマシンでは SAL_ECHOS_ROOT で差し替える */
export const SAL_ECHOS_ROOT =
    process.env.SAL_ECHOS_ROOT || '/Users/enigamid/Desktop/ScondBrain/SAL Studio/SAL Echos';
export const SAL_ECHOS_LIBRARY = join(SAL_ECHOS_ROOT, 'library');

export interface InterviewMeta {
    title?: string;
    interviewee?: string;
    recorded_on?: string;
    topics?: string[];
    summary?: string;
    duration?: string;
    source?: string;
    /** 手元プレビューでヒーローに出す写真（URL かサイト内パス）。WP では投稿のアイキャッチを使う */
    image?: string;
}

export interface ParsedInterviewMarkdown {
    title: string;
    byline: string | null;
    /** 本文（タイトル・肩書き行・要確認を除いた Markdown） */
    bodyMd: string;
    /** 「## 要確認」の中身。無ければ null */
    pending: string | null;
}

export interface InterviewDraft extends ParsedInterviewMarkdown {
    recordedOn: string | null;
    excerpt: string;
    /** Gutenberg ブロック HTML（肩書き行・収録日の印つき段落 → 本文） */
    content: string;
    meta: InterviewMeta;
    stats: { chars: number; headings: number; lines: number };
}

function looksLikeByline(text: string): boolean {
    return text.length > 0 && text.length <= 60 && !/[。！？!?]/.test(text) && /\s[-–—―]\s|[｜|]/.test(text);
}

export function parseInterviewMarkdown(md: string): ParsedInterviewMarkdown {
    const lines = md.replace(/\r\n/g, '\n').trim().split('\n');
    let i = 0;
    let title = '';

    // タイトル: 最初の「# 」行
    const h1 = lines.findIndex((l) => /^#\s+/.test(l));
    if (h1 !== -1) {
        title = lines[h1].replace(/^#\s+/, '').trim();
        i = h1 + 1;
    }

    // 肩書き行: タイトル直後の、短くて区切りのある一行
    while (i < lines.length && !lines[i].trim()) i++;
    let byline: string | null = null;
    if (i < lines.length) {
        const l = lines[i].trim();
        if (!/^[#>*-]/.test(l) && looksLikeByline(l)) {
            byline = l;
            i++;
        }
    }

    let bodyMd = lines.slice(i).join('\n').trim();

    // 要確認: 末尾の「## 要確認」以降
    let pending: string | null = null;
    const m = bodyMd.match(/(?:^|\n)##\s*要確認\s*\n?([\s\S]*)$/);
    if (m && m.index !== undefined) {
        pending = m[1].trim() || null;
        bodyMd = bodyMd.slice(0, m.index).trim();
    }

    return { title, byline, bodyMd, pending };
}

function firstParagraph(md: string): string {
    return (
        md
            .split(/\n\s*\n/)
            .map((p) => p.trim())
            .find((p) => p && !/^#/.test(p)) ?? ''
    );
}

/** library/<フォルダ> を読んで、下書きの材料にする */
export function buildInterviewDraft(dir: string): InterviewDraft {
    const md = readFileSync(join(dir, 'interview.md'), 'utf8');
    const metaPath = join(dir, 'meta.json');
    const meta: InterviewMeta = existsSync(metaPath) ? JSON.parse(readFileSync(metaPath, 'utf8')) : {};
    const parsed = parseInterviewMarkdown(md);

    const title = parsed.title || meta.title || '';
    const byline = parsed.byline || meta.interviewee || null;
    // 収録日: meta.json → フォルダ名の先頭（YYYY-MM-DD_相手名）
    const recordedOn = meta.recorded_on || basename(dir).match(/^(\d{4}-\d{2}-\d{2})/)?.[1] || null;
    const excerpt = (meta.summary || firstParagraph(parsed.bodyMd)).replace(/\s+/g, ' ').trim().slice(0, 200);

    const content = [
        byline ? paragraphBlock(byline, 'iv-byline') : '',
        recordedOn ? paragraphBlock(recordedOn, 'iv-recorded') : '',
        markdownToGutenberg(parsed.bodyMd),
    ]
        .filter(Boolean)
        .join('\n\n');

    return {
        ...parsed,
        title,
        byline,
        recordedOn,
        excerpt,
        content,
        meta,
        stats: {
            chars: parsed.bodyMd.length,
            headings: (parsed.bodyMd.match(/^##\s/gm) ?? []).length,
            lines: (parsed.bodyMd.match(/^[^\s#>-][^\n]{0,11}[：:]/gm) ?? []).length,
        },
    };
}

/** library 直下で interview.md を持つフォルダ（新しい順） */
export function listLibraryFolders(library = SAL_ECHOS_LIBRARY): string[] {
    if (!existsSync(library)) return [];
    return readdirSync(library, { withFileTypes: true })
        .filter((d) => d.isDirectory() && existsSync(join(library, d.name, 'interview.md')))
        .map((d) => d.name)
        .sort()
        .reverse();
}
