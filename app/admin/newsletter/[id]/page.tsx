import { notFound } from 'next/navigation';
import { getIssue, usingFileStore } from '@/lib/issues';
import NewsletterShell from '@/components/admin/NewsletterShell';
import NewsletterEditor from '@/components/admin/NewsletterEditor';

export const metadata = {
  title: { absolute: 'Edit Issue | Shine a Light' },
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

export default async function IssueEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const issue = await getIssue(id);
  if (!issue) notFound();

  return (
    <NewsletterShell breadcrumb={issue.subject || '（件名未設定）'}>
      <NewsletterEditor
        issue={{
          id: issue.id,
          subject: issue.subject,
          preheader: issue.preheader,
          bodyMd: issue.body_md,
          status: issue.status,
        }}
        // 毎回打ち直さなくて済むよう既定の宛先を埋めておく
        defaultTestTo={process.env.MAIL_TEST_TO ?? ''}
        // 配信は名簿（DB）が要る。ファイル保存で書いている間は導線を出さない
        canSend={!usingFileStore()}
      />
    </NewsletterShell>
  );
}
