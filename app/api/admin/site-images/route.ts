import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdminAuthed } from '@/lib/adminAuth';
import { getSql, isDbConfigured } from '@/lib/db';
import { SITE_IMAGE_SLOTS, getSiteImages } from '@/lib/siteImages';

/** 画像スロットが表示されるページ。保存・リセット時に再生成する */
const AFFECTED_PATHS = ['/', '/pro', '/pro/visual'];

function revalidateAffected() {
    for (const p of AFFECTED_PATHS) revalidatePath(p);
}

// 一覧（スロット定義 + 現在のURL）
export async function GET() {
    if (!(await isAdminAuthed())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const urls = await getSiteImages();
    const slots = SITE_IMAGE_SLOTS.map((s) => ({
        ...s,
        url: urls[s.slot],
        isDefault: urls[s.slot] === s.defaultUrl,
    }));
    return NextResponse.json({ slots, dbConfigured: isDbConfigured() });
}

// 差し替え保存
export async function PUT(req: NextRequest) {
    if (!(await isAdminAuthed())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!isDbConfigured()) {
        return NextResponse.json({ error: 'DATABASE_URL が未設定です' }, { status: 500 });
    }
    const body = (await req.json()) as { slot?: string; url?: string; alt?: string };
    const def = SITE_IMAGE_SLOTS.find((s) => s.slot === body.slot);
    if (!def || !body.url) {
        return NextResponse.json({ error: 'slot と url は必須です' }, { status: 400 });
    }
    const sql = getSql();
    await sql`
        insert into site_images (slot, url, alt, updated_at)
        values (${def.slot}, ${body.url}, ${body.alt ?? ''}, now())
        on conflict (slot) do update
        set url = excluded.url, alt = excluded.alt, updated_at = now()
    `;
    revalidateAffected();
    return NextResponse.json({ ok: true });
}

// デフォルトに戻す（行を消す）
export async function DELETE(req: NextRequest) {
    if (!(await isAdminAuthed())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!isDbConfigured()) {
        return NextResponse.json({ error: 'DATABASE_URL が未設定です' }, { status: 500 });
    }
    const { searchParams } = new URL(req.url);
    const slot = searchParams.get('slot');
    if (!slot) {
        return NextResponse.json({ error: 'slot は必須です' }, { status: 400 });
    }
    const sql = getSql();
    await sql`delete from site_images where slot = ${slot}`;
    revalidateAffected();
    return NextResponse.json({ ok: true });
}
