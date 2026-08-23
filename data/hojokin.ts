/**
 * /pro/hojokin — 海部郡（牟岐町・美波町・海陽町）の事業者が
 * 動画・Web・SNS・チラシ制作に使える補助金の一覧。
 *
 * 1行 = 1補助金。hojokin-watch（巡回システム）の Notion DB と同じ列構成。
 * 将来 Notion から自動生成する際も、この型をそのまま使う。
 *
 * ルール（hojokin-watch 仕様より）
 * - 出典（sourceUrl）が無い行は作らない。要約は一次資料で確認したものだけ
 * - video / web の ○× は人が確定する。機械（巡回）は △ までしか付けない
 * - 二次ポータルの情報はそのまま載せない
 * - deadline を過ぎた行は自動で「終了」扱いになり、一覧の下に落ちる（effectiveStatus）
 * - published: false の行はページに出ない（一次資料が未確定の下書き用）
 * - 「斡旋」とは書かない。「補助金対応」「申請サポート」まで
 */

export type HojokinLevel = '国' | '県' | '町';

export type WindowStatus = '公募中' | '予告' | '終了' | '不明';

/** ○: 一次資料に明記 / △: 読み方次第・要確認 / ×: 対象外 / 未確認: まだ見ていない */
export type EligibilityFlag = '○' | '△' | '×' | '未確認';

export interface Hojokin {
    /** 安定ID。Notion upsert のキー（name+issuer の代わり） */
    id: string;
    name: string;
    level: HojokinLevel;
    /** 実施主体 */
    issuer: string;
    /** 対象者 */
    target: string;
    /** 対象経費の要約（動画・Web に関係する部分を中心に） */
    eligibleCosts: string;
    /** 補助率 */
    rate: string;
    /** 上限額（円）。条件で変わる場合は基本額を入れ capNote に補足 */
    cap: number | null;
    capNote?: string;
    /** 受付開始日 YYYY-MM-DD */
    windowOpens?: string;
    /** 申請締切 YYYY-MM-DD。複数回公募は次回分 */
    deadline: string | null;
    /** 締切とは別に先に閉まる期限（商工会の様式4 発行締切など） */
    preDeadline?: { label: string; date: string };
    /** 手で付ける状態。deadline による自動判定より弱い（終了は自動で上書き） */
    windowStatus: WindowStatus;
    /** 窓口 */
    contact: string;
    /** 動画制作が対象経費に入るか */
    video: EligibilityFlag;
    /** Web（ホームページ・EC・LP）制作が対象経費に入るか */
    web: EligibilityFlag;
    /** 注意点。交付決定前着手不可、上限、登録要件など */
    notes: string[];
    /** 出典（必須）。一次資料のページ */
    sourceUrl: string;
    /** 公募要領・申請要領 PDF */
    rawDocUrl?: string;
    /** 一次資料を最後に確認した日 YYYY-MM-DD */
    lastChecked: string;
    /** 前回確認から差分あり（巡回システムが立てる） */
    changed?: boolean;
    /** false の行はページに出さない */
    published: boolean;
}

export const HOJOKIN_PAGE_UPDATED = '2026-08-23';

export const hojokin: Hojokin[] = [
    // ------------------------------------------------------------------
    // 国
    // ------------------------------------------------------------------
    {
        id: 'jizokuka-ippan-20',
        name: '小規模事業者持続化補助金〈一般型・通常枠〉第20回',
        level: '国',
        issuer: '中小企業庁（事務局：全国商工会連合会 ほか）',
        target: '小規模事業者（商業・サービス業は従業員5人以下、製造業その他・宿泊業・娯楽業は20人以下）および一定要件の NPO 法人',
        eligibleCosts:
            '広報費（チラシ・カタログ・看板・宣伝用の画像や動画・SNS 広告）、ウェブサイト関連費（HP・EC サイトの制作や更新、HP に載せる動画や写真の制作）、機械装置等費、展示会等出展費、旅費、新商品開発費、借料、委託・外注費',
        rate: '2/3（賃金引上げ特例のうち赤字事業者は 3/4）',
        cap: 500_000,
        capNote: 'インボイス特例 +50万円／賃金引上げ特例 +150万円／両方 +200万円',
        windowOpens: '2026-11-05',
        deadline: '2026-12-15',
        preDeadline: { label: '商工会の事業支援計画書（様式4）発行締切', date: '2026-12-04' },
        windowStatus: '予告',
        contact: '牟岐町商工会（様式4 の発行元）／補助金事務局',
        video: '○',
        web: '○',
        notes: [
            '商工会の事業支援計画書（様式4）が必須。申請締切より先に閉まる（12/4）。締切後の発行依頼は一切不可',
            '広報費・ウェブサイト関連費は、それぞれ補助金交付申請額の上限 30万円（税込）。どちらも単独では申請できず、ほかの経費と組み合わせる',
            'HP・EC サイトで使う動画や写真の制作費は「ウェブサイト関連費」、宣伝用の動画・画像は「広報費」に計上する',
            '有料配信する動画、有料講座用の動画・教材、会社案内パンフレット、求人広告は対象外',
            '交付決定日より前の発注・契約・支出は対象外。事業実施期限は 2028年3月31日',
            '申請は電子申請のみ（GビズID が必要）',
        ],
        sourceUrl: 'https://r6.jizokukahojokin.info/jizokukahojokin.php',
        rawDocUrl: 'https://r6.jizokukahojokin.info/doc/r6_koubover8_ip20.pdf',
        lastChecked: '2026-08-23',
        published: true,
    },
    {
        id: 'jizokuka-sogyo-4',
        name: '小規模事業者持続化補助金〈創業型〉第4回',
        level: '国',
        issuer: '中小企業庁（事務局：全国商工会連合会 ほか）',
        target: '「特定創業支援等事業」の支援を受けた日と開業日（設立日）が、公募締切から起算して過去1年以内の小規模事業者',
        eligibleCosts: '一般型と同じ（広報費、ウェブサイト関連費、機械装置等費、展示会等出展費、旅費、新商品開発費、借料、委託・外注費）',
        rate: '2/3',
        cap: 2_000_000,
        capNote: 'インボイス特例 +50万円',
        windowOpens: '2026-11-05',
        deadline: '2026-12-15',
        preDeadline: { label: '商工会の事業支援計画書（様式4）発行締切', date: '2026-12-04' },
        windowStatus: '予告',
        contact: '牟岐町商工会（様式4）／牟岐町産業課（特定創業支援の証明）',
        video: '○',
        web: '○',
        notes: [
            '牟岐町は「特定創業支援事業」の認定市町村。町の証明書（写し）が申請に必要',
            '広報費・ウェブサイト関連費はそれぞれ上限 30万円（税込）、単独申請不可（一般型と同じ）',
            '商工会の様式4 は 12/4 まで。交付決定前の発注は対象外',
            '相見積が必要になる金額は 50万円超（税込）',
        ],
        sourceUrl: 'https://r6.jizokukahojokin.info/sogyo/',
        rawDocUrl: 'https://r6.jizokukahojokin.info/sogyo/doc/r6_koubover8_sogyo4.pdf',
        lastChecked: '2026-08-23',
        published: true,
    },

    // ------------------------------------------------------------------
    // 県（徳島）
    // ------------------------------------------------------------------
    {
        id: 'tokushima-saiyo-r8',
        name: '徳島県 企業等採用活動支援事業補助金（令和8年度）',
        level: '県',
        issuer: '徳島県（事務局：徳島県魅力ある職場づくり事務局）',
        target: '県内に本社または主たる事業所があり、県内で常時使用する従業員を1人以上雇用している中小企業者等（個人事業主を含む）',
        eligibleCosts:
            '区分(1) 専門家による採用コンサルティング／区分(2) 採用情報発信媒体の制作・改修 — 採用用ホームページの構築・改修、SNS 発信企画、動画等のコンテンツ制作、パンフレット等のデザイン・製作',
        rate: '1/2 以内',
        cap: 500_000,
        capNote: '区分ごとに 50万円（両区分で最大 100万円）',
        windowOpens: '2026-07-01',
        deadline: '2026-11-30',
        windowStatus: '公募中',
        contact: '徳島県魅力ある職場づくり事務局（株式会社テレコメディア内）TEL 088-602-1431',
        video: '○',
        web: '○',
        notes: [
            '採用目的に限る。営業・販促目的の HP や EC サイトは対象外',
            '制作する媒体に「理念・未来像」「仕事・成長の魅力」「人・組織の魅力」の3要素をすべて含める必要がある',
            '「ジョブナビとくしま」への企業登録・情報掲載が要件',
            '今後2年間に正規職員1人以上の採用計画があること。創業から1年以上経過していること',
            '就職ナビサイトの掲載料、広告掲載費、採用実務のアウトソーシング費は対象外',
            '事業完了期限は 2027年3月1日。他の補助金を受けている経費は対象外',
        ],
        sourceUrl: 'https://www.pref.tokushima.lg.jp/jigyoshanokata/sangyo/rodokankei/7314516',
        rawDocUrl: 'https://www.pref.tokushima.lg.jp/file/attachment/1070501.pdf',
        lastChecked: '2026-08-23',
        published: true,
    },
    {
        // 仕様メモの「県 販路開拓系（非対面販路 上限10万 等）」。
        // 一次資料を特定できていないため下書き。見つかり次第 published: true に。
        id: 'tokushima-hanro-draft',
        name: '徳島県 販路開拓系補助金（非対面販路 ほか）',
        level: '県',
        issuer: '徳島県（要確認）',
        target: '要確認',
        eligibleCosts: '要確認（非対面販路の開拓費 上限10万円 と聞いているが一次資料未確認）',
        rate: '要確認',
        cap: null,
        deadline: null,
        windowStatus: '不明',
        contact: '要確認',
        video: '未確認',
        web: '未確認',
        notes: ['一次資料が特定できるまで非公開'],
        sourceUrl: 'https://www.pref.tokushima.lg.jp/jigyoshanokata/sangyo/shokogyo/zyoseiyushi/',
        lastChecked: '2026-08-23',
        published: false,
    },

    // ------------------------------------------------------------------
    // 町
    // ------------------------------------------------------------------
    {
        id: 'mugi-sogyo-r8',
        name: '牟岐町創業促進補助金（令和8年度）',
        level: '町',
        issuer: '牟岐町',
        target: '2024年4月1日〜2026年12月31日に牟岐町内で創業した（する）個人事業主・法人。牟岐町特定創業支援事業の証明を受けている（または実績報告までに受ける）こと',
        eligibleCosts:
            '広報費（情報発信に係る広告宣伝費、チラシのデザイン・印刷、ホームページ制作の委託費、展示会出展費）、店舗等借入費、工事費、設備・備品費、官公庁への申請書類作成費 ほか',
        rate: '1/2 以内',
        cap: 300_000,
        windowOpens: '2026-07-01',
        deadline: '2026-11-02',
        windowStatus: '公募中',
        contact: '牟岐町役場 産業課 創業支援担当 TEL 0884-72-3419',
        video: '△',
        web: '○',
        notes: [
            '募集は「4事業程度」で先着順。枠が埋まれば締切前に終わる',
            'ホームページ制作の委託費・チラシ・広告宣伝費は「広報費」として明記。動画は「広告宣伝費」に含まれるかを産業課に要確認',
            'HP のサーバー代・ドメイン代、DM の郵送料、求人広告は対象外',
            '対象経費は年度の2月末日までに支払いが完了したもの。すでに終わった事業でも申請書と実績報告書を同時に出せる',
            '1事業者1回限り。同趣旨の他の補助金との併用は不可。交付決定後3年間は町内で事業を続け、実施状況を報告する',
        ],
        sourceUrl: 'https://www.town.tokushima-mugi.lg.jp/doc/2026063000014/',
        rawDocUrl: 'https://www.town.tokushima-mugi.lg.jp/doc/2026063000014/file_contents/R8_youryou.pdf',
        lastChecked: '2026-08-23',
        published: true,
    },
    {
        id: 'minami-draft',
        name: '美波町 創業・ふるさと創造戦略系補助金',
        level: '町',
        issuer: '美波町（要確認）',
        target: '要確認',
        eligibleCosts: '要確認',
        rate: '要確認',
        cap: null,
        deadline: null,
        windowStatus: '不明',
        contact: '要確認',
        video: '未確認',
        web: '未確認',
        notes: ['未調査。役場サイトを巡回対象に入れる'],
        sourceUrl: 'https://www.town.minami.lg.jp/',
        lastChecked: '2026-08-23',
        published: false,
    },
    {
        id: 'kaiyo-draft',
        name: '海陽町 創業支援系補助金',
        level: '町',
        issuer: '海陽町（要確認）',
        target: '要確認',
        eligibleCosts: '要確認',
        rate: '要確認',
        cap: null,
        deadline: null,
        windowStatus: '不明',
        contact: '要確認',
        video: '未確認',
        web: '未確認',
        notes: ['未調査。役場サイトを巡回対象に入れる'],
        sourceUrl: 'https://www.town.kaiyo.lg.jp/',
        lastChecked: '2026-08-23',
        published: false,
    },
];

// ----------------------------------------------------------------------
// helpers
// ----------------------------------------------------------------------

export const LEVEL_ORDER: HojokinLevel[] = ['国', '県', '町'];

const STATUS_ORDER: Record<WindowStatus, number> = { 公募中: 0, 予告: 1, 不明: 2, 終了: 3 };

/** 今日の日付から状態を決める。締切を過ぎたら必ず「終了」。受付開始前は「予告」 */
export function effectiveStatus(h: Hojokin, today: Date = new Date()): WindowStatus {
    const t = toDay(today);
    if (h.deadline && h.deadline < t) return '終了';
    if (h.windowOpens && h.windowOpens > t) return '予告';
    if (h.deadline && h.windowStatus === '予告') return '公募中';
    return h.windowStatus;
}

/** 公開対象（published）を 国→県→町、同じ階層では 公募中→予告→不明→終了 の順に */
export function publishedHojokin(today: Date = new Date()): Hojokin[] {
    return hojokin
        .filter((h) => h.published)
        .slice()
        .sort((a, b) => {
            const l = LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level);
            if (l !== 0) return l;
            const s = STATUS_ORDER[effectiveStatus(a, today)] - STATUS_ORDER[effectiveStatus(b, today)];
            if (s !== 0) return s;
            return (a.deadline ?? '9999').localeCompare(b.deadline ?? '9999');
        });
}

/** 直近で閉まる期限（様式4 などの前倒し期限があればそちら） */
export function nextCutoff(h: Hojokin): { label: string; date: string } | null {
    if (!h.deadline) return null;
    if (h.preDeadline) return h.preDeadline;
    return { label: '申請締切', date: h.deadline };
}

export function formatYen(n: number): string {
    if (n >= 10_000 && n % 10_000 === 0) return `${(n / 10_000).toLocaleString('ja-JP')}万円`;
    return `${n.toLocaleString('ja-JP')}円`;
}

export function formatDate(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number);
    const dow = ['日', '月', '火', '水', '木', '金', '土'][new Date(y, m - 1, d).getDay()];
    return `${y}年${m}月${d}日（${dow}）`;
}

function toDay(d: Date): string {
    // JST で日付を切る（Vercel は UTC）
    const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
    return jst.toISOString().slice(0, 10);
}
