import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import {
    getAdminGalleryPhotos,
    getOrCreateGalleryCategoryId,
    getOrCreateMementoTagId,
    createWPPost,
    updateWPPost,
    deleteWPPost,
} from '@/lib/wordpress';

// キャプション無しの写真投稿でも本文を空にしないための非表示マーカー（表示には出ない）
const GALLERY_CONTENT_MARKER = '<!-- gallery photo -->';

async function requireAuth(): Promise<boolean> {
    const cookieStore = await cookies();
    return cookieStore.get('sal_admin_auth')?.value === 'true';
}

// 一覧
export async function GET() {
    if (!(await requireAuth())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const photos = await getAdminGalleryPhotos();
        return NextResponse.json({ photos });
    } catch (err: unknown) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// 追加（アップロード済みメディアIDからギャラリー写真を作成）
export async function POST(req: NextRequest) {
    if (!(await requireAuth())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const { mediaId, caption, date, category } = await req.json();
        if (!mediaId) {
            return NextResponse.json({ error: 'mediaId is required' }, { status: 400 });
        }
        const categoryId = await getOrCreateGalleryCategoryId();
        // MEMENTO 指定時のみ memento タグを付与
        const tags = category === 'MEMENTO' ? [await getOrCreateMementoTagId()] : undefined;
        // EXIF撮影日('YYYY-MM-DDTHH:MM:SS')が渡された場合のみ投稿日に反映
        const shotDate = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(date) ? date : undefined;
        const post = await createWPPost({
            title: (caption as string)?.trim() || '',
            // キャプション無しだとタイトル・本文・抜粋が全て空になりWPが投稿を拒否するため、
            // 表示に出ない非表示マーカーを本文に入れておく。
            content: GALLERY_CONTENT_MARKER,
            status: 'publish',
            categories: [categoryId],
            featured_media: Number(mediaId),
            ...(tags ? { tags } : {}),
            ...(shotDate ? { date: shotDate } : {}),
        });
        revalidatePath('/photos');
        return NextResponse.json({ id: post.id });
    } catch (err: unknown) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// キャプション更新
export async function PATCH(req: NextRequest) {
    if (!(await requireAuth())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const { id, caption, category } = await req.json();
        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 });
        }
        const payload: { title?: string; tags?: number[] } = {};
        if (typeof caption === 'string') payload.title = caption;
        // カテゴリ指定時：MEMENTO→タグ付与 / Archive→タグを外す（空配列で置換）
        if (category === 'MEMENTO') payload.tags = [await getOrCreateMementoTagId()];
        else if (category === 'Archive') payload.tags = [];
        if (Object.keys(payload).length === 0) {
            return NextResponse.json({ error: 'nothing to update' }, { status: 400 });
        }
        await updateWPPost(Number(id), payload);
        revalidatePath('/photos');
        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// 削除
export async function DELETE(req: NextRequest) {
    if (!(await requireAuth())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const id = req.nextUrl.searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 });
        }
        await deleteWPPost(Number(id));
        revalidatePath('/photos');
        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
