import { redirect } from 'next/navigation';

/**
 * 名簿はニュースレター管理トップに統合した。
 *
 * このパスはブックマークや古いリンクから来る可能性があるので、
 * 消さずに絞り込みを保ったまま送り出す。
 */
export default async function SubscribersRedirect({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  const { page, q, status } = await searchParams;

  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (status) params.set('status', status);
  if (page) params.set('page', page);

  const qs = params.toString();
  redirect(qs ? `/admin/newsletter?${qs}#subscribers` : '/admin/newsletter#subscribers');
}
