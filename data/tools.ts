// =====================================================================
//  Tools — お先に"ちょっと未来"をサバイブする装備と知恵
//  スロット数 = 年齢。誕生日（10/20）ごとに 1 枠増える。枠の中身は入れ替わる。
//  リポジトリの data/ に置く。Chronicle（chronicle-milestones.ts）と同じ静的データ方式。
// =====================================================================

export type ToolCategory = "L" | "T" | "F" | "H" | "M";
export type ToolStatus = "draft" | "live" | "retired";

export interface ToolSpec {
    weightG?: number;   // L と F は必ず入れる（合計が出せる）
    material?: string;
    years?: number;     // 使用年数
    source?: string;    // 入手先（アフィリエイトを入れるならここだけ）
}

export interface ToolLinks {
    buy?: string;
    podcast?: string;
    note?: string;
    instagram?: string;
}

export interface ToolSlot {
    slot: string;            // 固定 ID。URL になる。中身が入れ替わっても変えない（例: "L09"）
    category: ToolCategory;
    name: string;
    oneLine: string;         // 一覧カードに出る一言。15 字前後
    why: string;             // なぜこれか。300〜600 字
    future: string;          // どこが"ちょっと未来"か。1〜3 文
    spec: ToolSpec;
    photo: string;           // 現場写真 1 枚。白背景の物撮りはしない。例: "/images/tools/L09.jpg"
    links: ToolLinks;
    addedAtAge: number;      // その枠が開いた年齢。初版の 45 枠は全部 45
    status: ToolStatus;
}

export interface ToolCategoryMeta {
    key: ToolCategory;
    slug: string;            // /tools/life など
    label: string;           // LIFE
    labelJa: string;         // 暮らし
    tagline: string;
}

// ---------------------------------------------------------------------
//  年齢
// ---------------------------------------------------------------------
export const BIRTHDAY = { year: 1980, month: 10, day: 20 } as const;

/** その日時点の年齢 */
export function getAge(now: Date = new Date()): number {
    let age = now.getFullYear() - BIRTHDAY.year;
    const hadBirthday =
        now.getMonth() + 1 > BIRTHDAY.month ||
        (now.getMonth() + 1 === BIRTHDAY.month && now.getDate() >= BIRTHDAY.day);
    if (!hadBirthday) age -= 1;
    return age;
}

/** 次に枠が開く日 */
export function getNextSlotDate(now: Date = new Date()): Date {
    const thisYear = new Date(now.getFullYear(), BIRTHDAY.month - 1, BIRTHDAY.day);
    return now < thisYear ? thisYear : new Date(now.getFullYear() + 1, BIRTHDAY.month - 1, BIRTHDAY.day);
}

/** 次に枠が開く日までの日数 */
export function getDaysToNextSlot(now: Date = new Date()): number {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.ceil((getNextSlotDate(now).getTime() - today.getTime()) / 86400000);
}

// ---------------------------------------------------------------------
//  カテゴリ
// ---------------------------------------------------------------------
export const toolCategories: ToolCategoryMeta[] = [
    { key: "L", slug: "life",    label: "LIFE",    labelJa: "暮らし",     tagline: "未来は暮らしの中からはじまる" },
    { key: "T", slug: "tool",    label: "TOOL",    labelJa: "テクノロジー", tagline: "テクノロジーは、" }, // TODO: タグライン未定
    { key: "F", slug: "fishing", label: "FISHING", labelJa: "釣り",       tagline: "釣りは未来を生きるための贈り物" },
    { key: "H", slug: "health",  label: "HEALTH",  labelJa: "健康",       tagline: "健康は自身で管理していくもの" },
    { key: "M", slug: "mind",    label: "MIND",    labelJa: "思考",       tagline: "思考を軽くすることで、未来は近づいてくる" },
];

// ---------------------------------------------------------------------
//  45 スロット（45 歳・初版）
//  oneLine は仮コピー。why / future は空。photo はパスだけ決めてある。
// ---------------------------------------------------------------------
const A = 45; // addedAtAge
const blank = (slot: string, category: ToolCategory, name: string, oneLine = ""): ToolSlot => ({
    slot, category, name, oneLine,
    why: "", future: "",
    spec: {},
    photo: `/images/tools/${slot}.jpg`,
    links: {},
    addedAtAge: A,
    status: "draft",
});

export const tools: ToolSlot[] = [
    // ---- L  LIFE（14）
    blank("L01", "L", "山暮らし", "町から少し離れると、考えが軽くなる"),
    blank("L02", "L", "ライトな食べ物", "胃に残さない食事が、午後を長くする"),
    blank("L03", "L", "LPガス", "止まらない熱源を、自分で持つ"),
    blank("L04", "L", "Patagonia 1"),                       // TODO: 品名
    blank("L05", "L", "Patagonia 2"),                       // TODO: 品名
    blank("L06", "L", "Patagonia 3"),                       // TODO: 品名
    blank("L07", "L", "Patagonia 4"),                       // TODO: 品名
    blank("L08", "L", "サロモン", "靴は足のOS"),
    blank("L09", "L", "ダイニーマ バックパック", "軽さは自由の単位"),
    blank("L10", "L", "ダイニーマ グッズ", "小物こそ素材で選ぶ"),
    blank("L11", "L", "α7S III + 40mm", "暗さを恐れないカメラ"),
    blank("L12", "L", "α7S", "未来のヴィンテージ"),
    blank("L13", "L", "20mm レンズ", "山の広さをそのまま持ち帰る"),
    blank("L14", "L", "MYOG ストラップ", "作れるものは、作る"),

    // ---- T  TOOL（6）
    blank("T01", "T", "ChatGPT", "考える速度が変わった"),
    blank("T02", "T", "Suno / Gamma / Airtable / n8n", "一人でチームを組む"),
    blank("T03", "T", "ノーコード システムエンジニアリング", "作る人と使う人の境界が消えた"),
    blank("T04", "T", "Apple エコシステム", "道具同士が会話する"),
    blank("T05", "T", "音声入力", "書くより速く、考えるより遅く"),
    blank("T06", "T", "MacBook Air / Mac Studio", "持ち出す脳と、据え置く脳"),

    // ---- F  FISHING（9）
    blank("F01", "F", "中山トラスコ"),
    blank("F02", "F", "アジロッドたち", "軽い竿は、長く立てる"),
    blank("F03", "F", "Patagonia Terravia Hip Pack 4L", "手ぶらで水辺に立つ"),
    blank("F04", "F", "長靴"),
    blank("F05", "F", "ルアー 1"),                           // TODO: 品名
    blank("F06", "F", "ルアー 2"),                           // TODO: 品名
    blank("F07", "F", "ルアー 3"),                           // TODO: 品名
    blank("F08", "F", "PE ライン / リーダー", "細いほど、遠くまで届く"),
    blank("F09", "F", "カスタム ストリンガー", "MYOG の釣り版"),

    // ---- H  HEALTH（11）
    blank("H01", "H", "水", "いちばん安い装備"),
    blank("H02", "H", "Apple Watch Series 11", "数字で身体を見る"),
    blank("H03", "H", "MCT オイル"),
    blank("H04", "H", "MitoAcid", "クエン酸 ＋ Mg ＋ 重曹"),
    blank("H05", "H", "ビタミン D3"),
    blank("H06", "H", "オメガ3 / アスタキサンチン"),
    blank("H07", "H", "ビタミン C"),
    blank("H08", "H", "ぬちまーす"),
    blank("H09", "H", "八重山クロレラ"),
    blank("H10", "H", "時期で摂れるもの", "季節がサプリ"),
    blank("H11", "H", "ジョギング", "装備ゼロの装備"),

    // ---- M  MIND（5）
    blank("M01", "M", "Hyperpast Journal", "過去を軽くする"),
    blank("M02", "M", "HyperFuture Journal", "未来を近づける"),
    { ...blank("M03", "M", "MitoFlow40", "→ mitoflow40.com"), links: { buy: "https://mitoflow40.com" } },
    blank("M04", "M", "Shine a Light", "影ある所に必ず光がある"),
    { ...blank("M05", "M", "すべては HL に", "→ hlfishing.net"), links: { buy: "https://hlfishing.net" } },
];

// ---------------------------------------------------------------------
//  更新ログ（入れ替え・枠の追加）
// ---------------------------------------------------------------------
export interface ToolLogEntry {
    date: string;        // "2026-08-23"
    slot?: string;       // 対象スロット。枠追加なら新 ID
    kind: "publish" | "swap" | "add" | "freeze";
    text: string;
}

export const toolLog: ToolLogEntry[] = [
    { date: "2026-08-23", kind: "publish", text: "初版。45 スロットを公開" },
    // { date: "2026-10-20", kind: "freeze", text: "45 歳版を凍結（/tools/45）" },
    // { date: "2026-10-20", slot: "T07", kind: "add", text: "46 歳。46 枠目を開く" },
];

// ---------------------------------------------------------------------
//  helpers
// ---------------------------------------------------------------------
export const getTool = (slot: string) => tools.find((t) => t.slot.toLowerCase() === slot.toLowerCase());
export const getToolsByCategory = (c: ToolCategory) => tools.filter((t) => t.category === c);
export const getNeighbors = (slot: string) => {
    const i = tools.findIndex((t) => t.slot === slot);
    return { prev: i > 0 ? tools[i - 1] : undefined, next: i >= 0 && i < tools.length - 1 ? tools[i + 1] : undefined };
};
