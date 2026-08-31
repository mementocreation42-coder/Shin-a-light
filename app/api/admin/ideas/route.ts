import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/adminAuth';
import { getIdeaPosts, createWPPost, updateWPPost, deleteWPPost } from '@/lib/wordpress';

/**
 * 記事ネタの管理。
 * ネタは WordPress の status=pending で持つ（HL Fishing の記事ストック方式）。
 * pending は投稿管理の一覧（publish,future,draft）に出ないので、置き場が混ざらない。
 */

const JOURNAL_CATEGORY_ID = 10;

// 一覧
export async function GET() {
    if (!(await isAdminAuthed())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const ideas = await getIdeaPosts();
    return NextResponse.json({ ideas });
}

// ネタを追加（タイトル＋メモ）
export async function POST(req: NextRequest) {
    if (!(await isAdminAuthed())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = (await req.json()) as { title?: string; memo?: string };
    if (!body.title?.trim()) {
        return NextResponse.json({ error: 'タイトルは必須です' }, { status: 400 });
    }
    const memoHtml = body.memo?.trim()
        ? `<p>${body.memo.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br />')}</p>`
        : '';
    const post = await createWPPost({
        title: body.title.trim(),
        content: `<!-- 記事ネタ -->\n${memoHtml}\n<p>——ここから本文。</p>`,
        status: 'pending',
        categories: [JOURNAL_CATEGORY_ID],
    });
    return NextResponse.json({ ok: true, id: post.id });
}

// 下書きへ移す（投稿管理の一覧に出るようになる）
export async function PUT(req: NextRequest) {
    if (!(await isAdminAuthed())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = (await req.json()) as { id?: number };
    if (!body.id) {
        return NextResponse.json({ error: 'id は必須です' }, { status: 400 });
    }
    await updateWPPost(body.id, { status: 'draft' });
    return NextResponse.json({ ok: true });
}

// 削除
export async function DELETE(req: NextRequest) {
    if (!(await isAdminAuthed())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const id = Number(new URL(req.url).searchParams.get('id'));
    if (!id) {
        return NextResponse.json({ error: 'id は必須です' }, { status: 400 });
    }
    await deleteWPPost(id);
    return NextResponse.json({ ok: true });
}
