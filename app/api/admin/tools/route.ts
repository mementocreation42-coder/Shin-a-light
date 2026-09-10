import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdminAuthed } from '@/lib/adminAuth';
import { isDbConfigured } from '@/lib/db';
import { tools } from '@/data/tools';
import {
    TOOL_STATUSES,
    getToolRows,
    getToolsMerged,
    resetToolSlot,
    saveToolSlot,
    type ToolSlotInput,
} from '@/lib/toolsStore';

/** 保存・リセット後に作り直すページ */
function revalidateTools(slot: string) {
    revalidatePath('/tools');
    revalidatePath(`/tools/${slot}`);
    revalidatePath('/tools/[slot]', 'page');
}

const str = (v: unknown, max = 4000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const num = (v: unknown): number | null => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
};
const url = (v: unknown) => {
    const s = str(v, 1000);
    return s === '' || /^(https?:\/\/|\/)/.test(s) ? s : '';
};

/** リクエスト本文をフォームの形に整える。おかしな値は落とす */
function parseInput(body: Record<string, unknown>): ToolSlotInput | { error: string } {
    const name = str(body.name, 200);
    if (!name) return { error: '名前は必須です' };
    const status = str(body.status, 20);
    if (!(TOOL_STATUSES as string[]).includes(status)) return { error: 'status が不正です' };
    const links = (body.links ?? {}) as Record<string, unknown>;
    return {
        name,
        oneLine: str(body.oneLine, 200),
        why: str(body.why, 8000),
        future: str(body.future, 4000),
        weightG: num(body.weightG),
        material: str(body.material, 200),
        years: num(body.years),
        source: str(body.source, 500),
        photo: url(body.photo),
        photo2: url(body.photo2),
        links: {
            buy: url(links.buy),
            podcast: url(links.podcast),
            note: url(links.note),
            instagram: url(links.instagram),
        },
        status: status as ToolSlotInput['status'],
    };
}

// 一覧（コード側の骨格 + DB の上書き + 上書き済みかどうか）
export async function GET() {
    if (!(await isAdminAuthed())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const [merged, rows] = await Promise.all([getToolsMerged(), getToolRows()]);
    return NextResponse.json({
        tools: merged.map((t) => ({ ...t, overridden: rows.has(t.slot) })),
        dbConfigured: isDbConfigured(),
    });
}

// 保存
export async function PUT(req: NextRequest) {
    if (!(await isAdminAuthed())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!isDbConfigured()) {
        return NextResponse.json({ error: 'DATABASE_URL が未設定です' }, { status: 500 });
    }
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const slot = str(body.slot, 10);
    if (!tools.some((t) => t.slot === slot)) {
        return NextResponse.json({ error: '存在しない枠です' }, { status: 400 });
    }
    const input = parseInput(body);
    if ('error' in input) return NextResponse.json(input, { status: 400 });
    await saveToolSlot(slot, input);
    revalidateTools(slot);
    return NextResponse.json({ ok: true });
}

// コード側の値に戻す（行を消す）
export async function DELETE(req: NextRequest) {
    if (!(await isAdminAuthed())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!isDbConfigured()) {
        return NextResponse.json({ error: 'DATABASE_URL が未設定です' }, { status: 500 });
    }
    const slot = new URL(req.url).searchParams.get('slot') ?? '';
    if (!tools.some((t) => t.slot === slot)) {
        return NextResponse.json({ error: '存在しない枠です' }, { status: 400 });
    }
    await resetToolSlot(slot);
    revalidateTools(slot);
    return NextResponse.json({ ok: true });
}
