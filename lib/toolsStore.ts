/**
 * /tools の枠の本文・写真を DB（tool_slots）で上書きする。
 *
 * 骨格（枠の ID・カテゴリ・開いた年齢）と初期値は data/tools.ts。
 * 管理画面 /admin/tools で保存すると tool_slots に1行入り、その枠はその行の値で表示される。
 * 「元に戻す」で行を消せばコード側の値に戻る（/pro の site_images と同じ考え方）。
 * DB 未設定・接続失敗のときはコード側の値で表示を成立させる。
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getSql, isDbConfigured } from '@/lib/db';
import { tools, type ToolSlot, type ToolStatus } from '@/data/tools';

/** tool_slots の1行（DB のカラム名） */
export interface ToolSlotRow {
    slot: string;
    name: string;
    one_line: string;
    why: string;
    future: string;
    weight_g: number | null;
    material: string;
    years: number | null;
    source: string;
    photo: string;
    photo2: string;
    link_buy: string;
    link_podcast: string;
    link_note: string;
    link_instagram: string;
    status: string;
    updated_at: string;
}

/** 管理画面で編集できる項目（フォーム ⇄ API の形） */
export interface ToolSlotInput {
    name: string;
    oneLine: string;
    why: string;
    future: string;
    weightG: number | null;
    material: string;
    years: number | null;
    source: string;
    photo: string;
    photo2: string;
    links: { buy: string; podcast: string; note: string; instagram: string };
    status: ToolStatus;
}

export const TOOL_STATUSES: ToolStatus[] = ['draft', 'live', 'retired'];

function asStatus(s: string): ToolStatus {
    return (TOOL_STATUSES as string[]).includes(s) ? (s as ToolStatus) : 'draft';
}

/** コード側の枠 → フォームの初期値 */
export function toolToInput(t: ToolSlot): ToolSlotInput {
    return {
        name: t.name,
        oneLine: t.oneLine,
        why: t.why,
        future: t.future,
        weightG: t.spec.weightG ?? null,
        material: t.spec.material ?? '',
        years: t.spec.years ?? null,
        source: t.spec.source ?? '',
        photo: t.photo,
        photo2: t.photo2,
        links: {
            buy: t.links.buy ?? '',
            podcast: t.links.podcast ?? '',
            note: t.links.note ?? '',
            instagram: t.links.instagram ?? '',
        },
        status: t.status,
    };
}

/** DB の行 → フォームの値 */
export function rowToInput(r: ToolSlotRow): ToolSlotInput {
    return {
        name: r.name,
        oneLine: r.one_line,
        why: r.why,
        future: r.future,
        weightG: r.weight_g,
        material: r.material,
        years: r.years,
        source: r.source,
        photo: r.photo,
        photo2: r.photo2,
        links: { buy: r.link_buy, podcast: r.link_podcast, note: r.link_note, instagram: r.link_instagram },
        status: asStatus(r.status),
    };
}

/** コード側の枠に DB の行を被せる。空文字の項目は「空」として扱う（コード側には戻さない） */
export function applyRow(base: ToolSlot, r: ToolSlotRow): ToolSlot {
    return {
        ...base,
        name: r.name || base.name,
        oneLine: r.one_line,
        why: r.why,
        future: r.future,
        spec: {
            weightG: r.weight_g ?? undefined,
            material: r.material || undefined,
            years: r.years ?? undefined,
            source: r.source || undefined,
        },
        photo: r.photo || base.photo,
        photo2: r.photo2 || base.photo2,
        links: {
            buy: r.link_buy || undefined,
            podcast: r.link_podcast || undefined,
            note: r.link_note || undefined,
            instagram: r.link_instagram || undefined,
        },
        status: asStatus(r.status),
    };
}

/** tool_slots を全部読む。DB 未設定・失敗時は空（コード側の値で表示を成立させる） */
export async function getToolRows(): Promise<Map<string, ToolSlotRow>> {
    const map = new Map<string, ToolSlotRow>();
    if (!isDbConfigured()) return map;
    try {
        const sql = getSql();
        const rows = await sql<ToolSlotRow>`select * from tool_slots`;
        for (const r of rows) map.set(r.slot, r);
    } catch (err) {
        console.error('[toolsStore] read failed:', err);
    }
    return map;
}

export async function getToolRow(slot: string): Promise<ToolSlotRow | null> {
    if (!isDbConfigured()) return null;
    try {
        const sql = getSql();
        const rows = await sql<ToolSlotRow>`select * from tool_slots where slot = ${slot}`;
        return rows[0] ?? null;
    } catch (err) {
        console.error('[toolsStore] read failed:', err);
        return null;
    }
}

/** 全枠（コード側の順番のまま、DB の上書きを反映） */
export async function getToolsMerged(): Promise<ToolSlot[]> {
    const rows = await getToolRows();
    return tools.map((t) => {
        const r = rows.get(t.slot);
        return r ? applyRow(t, r) : t;
    });
}

export async function getToolMerged(slot: string): Promise<ToolSlot | undefined> {
    const base = tools.find((t) => t.slot.toLowerCase() === slot.toLowerCase());
    if (!base) return undefined;
    const r = await getToolRow(base.slot);
    return r ? applyRow(base, r) : base;
}

/** 前後の枠（上書き反映済みの一覧の中で） */
export function neighborsIn(list: ToolSlot[], slot: string): { prev?: ToolSlot; next?: ToolSlot } {
    const i = list.findIndex((t) => t.slot === slot);
    return {
        prev: i > 0 ? list[i - 1] : undefined,
        next: i >= 0 && i < list.length - 1 ? list[i + 1] : undefined,
    };
}

export async function saveToolSlot(slot: string, input: ToolSlotInput): Promise<void> {
    const sql = getSql();
    await sql`
        insert into tool_slots (
            slot, name, one_line, why, future, weight_g, material, years, source,
            photo, photo2, link_buy, link_podcast, link_note, link_instagram, status, updated_at
        ) values (
            ${slot}, ${input.name}, ${input.oneLine}, ${input.why}, ${input.future},
            ${input.weightG}, ${input.material}, ${input.years}, ${input.source},
            ${input.photo}, ${input.photo2},
            ${input.links.buy}, ${input.links.podcast}, ${input.links.note}, ${input.links.instagram},
            ${input.status}, now()
        )
        on conflict (slot) do update set
            name = excluded.name, one_line = excluded.one_line, why = excluded.why, future = excluded.future,
            weight_g = excluded.weight_g, material = excluded.material, years = excluded.years, source = excluded.source,
            photo = excluded.photo, photo2 = excluded.photo2,
            link_buy = excluded.link_buy, link_podcast = excluded.link_podcast,
            link_note = excluded.link_note, link_instagram = excluded.link_instagram,
            status = excluded.status, updated_at = now()
    `;
}

export async function resetToolSlot(slot: string): Promise<void> {
    const sql = getSql();
    await sql`delete from tool_slots where slot = ${slot}`;
}

/**
 * 写真として出せる URL を返す。
 * 外部 URL（メディアライブラリ）はそのまま。サイト内パスは public にファイルがあるときだけ。
 * 出せないときは null（ページ側はカテゴリ色のプレースホルダーを出す）。
 */
export function resolveToolPhoto(p: string | undefined): string | null {
    if (!p) return null;
    if (/^https?:\/\//.test(p)) return p;
    return existsSync(join(process.cwd(), 'public', p)) ? p : null;
}
