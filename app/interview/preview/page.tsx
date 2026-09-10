import Link from 'next/link';
import { notFound } from 'next/navigation';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import InterviewArticle from '@/components/InterviewArticle';
import { escHtml, stripBlockComments } from '@/lib/gutenberg';
import { buildInterviewDraft, listLibraryFolders, SAL_ECHOS_LIBRARY } from '@/lib/interviewDraft';
import { markDialogue, parseByline, parseInterviewContent, type InterviewPost } from '@/lib/interviews';

/**
 * 手元の interview.md を、公開時と同じ見た目で確かめる（開発サーバーでのみ。本番では 404）。
 *   /interview/preview                        … SAL Echos の library にあるフォルダ一覧
 *   /interview/preview?folder=<フォルダ名>     … library/<フォルダ名>/interview.md
 *   /interview/preview?path=<絶対パス>         … 任意のフォルダ（interview.md を含む）
 * WP には何も作らない。下書きにするのは scripts/interview-to-draft.mts。
 */
export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: Promise<{ folder?: string; path?: string }>;
}

export default async function InterviewPreview({ searchParams }: PageProps) {
    if (process.env.NODE_ENV !== 'development') notFound();

    const { folder, path } = await searchParams;
    const dir = path ? resolve(path) : folder ? join(SAL_ECHOS_LIBRARY, folder) : null;

    if (!dir || !existsSync(join(dir, 'interview.md'))) {
        const folders = listLibraryFolders();
        return (
            <main>
                <div className="iv-index">
                    <header className="iv-index-header">
                        <p className="fl-eyebrow">Interview — Preview</p>
                        <h1 className="iv-index-title">手元の原稿を確かめる</h1>
                        {dir && <p className="iv-preview-note">{dir} に interview.md がありません。</p>}
                        <p className="iv-index-lead">SAL Echos の library（{SAL_ECHOS_LIBRARY}）にあるフォルダ。</p>
                    </header>
                    {folders.length > 0 ? (
                        <ul className="iv-preview-list">
                            {folders.map((f) => (
                                <li key={f}>
                                    <Link href={`/interview/preview?folder=${encodeURIComponent(f)}`}>{f}</Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="iv-empty">
                            まだ interview.md を持つフォルダがありません。?path=&lt;絶対パス&gt; で任意のフォルダも開けます。
                        </p>
                    )}
                </div>
            </main>
        );
    }

    const draft = buildInterviewDraft(dir);
    // WP が返す content.rendered と同じ形にしてから、公開面と同じ読み替えを通す
    const parsed = parseInterviewContent(stripBlockComments(draft.content));
    const now = new Date().toISOString();
    const post: InterviewPost = {
        id: 0,
        title: escHtml(draft.title || '（タイトル未設定）'),
        plainTitle: draft.title,
        date: now,
        modified: now,
        byline: parsed.byline ? parseByline(parsed.byline) : null,
        recordedOn: parsed.recordedOn,
        excerpt: draft.excerpt,
        imageUrl: draft.meta.image?.trim() || null,
        thumbUrl: null,
        bodyHtml: markDialogue(parsed.bodyHtml),
    };

    return (
        <main>
            <div className="journal-article-page iv-article-page">
                <p className="iv-preview-note">
                    プレビュー: {dir}（WP には作成していません）／本文 {draft.stats.chars.toLocaleString()}字・見出し{' '}
                    {draft.stats.headings}・発言 {draft.stats.lines}・要確認 {draft.pending ? 'あり' : 'なし'}
                </p>
                <InterviewArticle post={post} bodyHtml={post.bodyHtml} />
                {draft.pending && (
                    <section className="iv-others">
                        <h2 className="iv-others-title">要確認（下書きには入りません）</h2>
                        <pre className="iv-pending">{draft.pending}</pre>
                    </section>
                )}
                <div className="journal-article-footer">
                    <Link href="/interview/preview" className="journal-back-link">
                        ← フォルダ一覧へ
                    </Link>
                </div>
            </div>
        </main>
    );
}
