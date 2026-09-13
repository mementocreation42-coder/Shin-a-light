'use server';

import { revalidatePath } from 'next/cache';
import { isAdminAuthed } from '@/lib/adminAuth';
import { setAppSetting } from '@/lib/appSettings';
import { galleryFreeKey, loadGallery } from '@/lib/gallery';

/**
 * ギャラリーを「無料配布」に切り替える / 有料に戻す。
 * 本番はファイルを書き換えられないので、設定は DB（app_settings）に持つ。
 */
export async function setGalleryFree(formData: FormData): Promise<void> {
  if (!(await isAdminAuthed())) return;
  const token = String(formData.get('token') || '');
  const free = formData.get('free') === '1';
  const g = await loadGallery(token);
  if (!g) return;
  await setAppSetting(galleryFreeKey(g.token), free ? '1' : '0');
  revalidatePath('/admin/galleries');
  revalidatePath(`/g/${g.token}`);
}
