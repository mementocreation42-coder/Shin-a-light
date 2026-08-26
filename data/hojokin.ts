/**
 * /pro/hojokin — 徳島県内の事業者が
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

export type HojokinLevel = '国' | '県' | '市町村';

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

export const HOJOKIN_PAGE_UPDATED = '2026-08-26';

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
        id: 'tokushima-sogyo-sokushin-r8',
        name: 'とくしま創業促進費補助金（令和8年度）',
        level: '県',
        issuer: '公益財団法人とくしま産業振興機構',
        target: '新たに創業する者（交付決定日以降に開業届の提出または法人設立を行い、県内に居住または居住予定）、および Society5.0 関連など付加価値の高い分野で事業承継・第二創業を行う者',
        eligibleCosts: '広報費、マーケティング調査費、外注費、委託費、人件費、店舗等借料、設備費、原材料費、知的財産権等関連経費、謝金、旅費',
        rate: '1/2 以内',
        cap: 2_000_000,
        capNote: 'スタートアップ枠200万円／一般枠100万円（審査で特に優秀な評価の場合。その他は50万円）',
        windowOpens: '2026-04-06',
        deadline: '2026-05-20',
        windowStatus: '終了',
        contact: '公益財団法人とくしま産業振興機構 経営支援部 TEL 088-654-0103',
        video: '△',
        web: '△',
        notes: [
            '令和8年度の受付は 2026-05-20 で終了。例年4〜5月ごろの募集のため、次年度は春先に要確認',
            '「広報費」「外注費」「委託費」が対象経費に明記。動画・Web 制作の扱いは機構に要確認',
        ],
        sourceUrl: 'https://www.our-think.or.jp/328532/',
        lastChecked: '2026-08-26',
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
    // 市町村
    // ------------------------------------------------------------------
    {
        id: 'mugi-sogyo-r8',
        name: '牟岐町創業促進補助金（令和8年度）',
        level: '市町村',
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
        id: 'naruto-sogyo-r8',
        name: '鳴門市創業促進事業補助金（令和8年度）',
        level: '市町村',
        issuer: '鳴門市',
        target: '市内に事業所を設け市内に住所を有する個人、または本社を市内に有する法人。特定創業支援等事業による支援を受け、補助申請年度末までに開業届（法人設立届）を提出する者',
        eligibleCosts: '広告宣伝費、事業用の土地・建物の購入費または賃借料、事業所の増改築費、設備・備品購入費、法人設立登記費用',
        rate: '1/2 以内',
        cap: 500_000,
        deadline: '2026-06-30',
        windowStatus: '終了',
        contact: '鳴門市 産業振興部 商工政策課 TEL 088-684-1276',
        video: '△',
        web: '△',
        notes: [
            '令和8年度の受付は 2026-06-30 で終了。次年度の募集は商工政策課に要確認',
            '広告宣伝費が対象経費に明記されている。動画・ホームページ制作が「広告宣伝費」に含まれるかは窓口に要確認',
            '産業競争力強化法に基づく特定創業支援等事業の支援を受けていることが要件',
        ],
        sourceUrl: 'https://www.city.naruto.lg.jp/jigyosha/chushoshien/shienseido/sogyo.html',
        lastChecked: '2026-08-26',
        published: true,
    },
    {
        id: 'tokushima-city-sogyo-r8',
        name: '徳島市創業促進事業補助金（令和8年度）',
        level: '市町村',
        issuer: '徳島市',
        target: '創業後3年未満の個人事業主・法人。徳島市に住民登録（個人）または本店所在地（法人）があり、市税の滞納がなく、認定連携創業支援事業者に相談していること',
        eligibleCosts: '広報活動費、官公庁への申請書類作成費、店舗等借入費（創業後1年未満）、設備費（設備費のみの申請は不可）',
        rate: '2/3 以内',
        cap: 300_000,
        windowOpens: '2026-04-14',
        deadline: '2026-06-12',
        windowStatus: '終了',
        contact: '徳島市 経済政策課 TEL 088-621-5225',
        video: '△',
        web: '△',
        notes: [
            '令和8年度の受付は 2026-06-12 で終了。例年4〜6月ごろの募集のため、次年度は春先に要確認',
            '「広報活動費」が対象経費に明記。動画・ホームページ制作が含まれるかは経済政策課に要確認',
            '補助事業完了後1年以上、市内で事業を継続する意思があること',
        ],
        sourceUrl: 'https://www.city.tokushima.tokushima.jp/shisei/keizai/jigyosha/sogyokigyo_shien/sougyouhojokinn.html',
        lastChecked: '2026-08-26',
        published: true,
    },
    {
        id: 'komatsushima-sogyo-r8-2',
        name: '小松島市創業促進事業補助金（令和8年度・第2回）',
        level: '市町村',
        issuer: '小松島市',
        target: '新規創業者・第二創業者・創業3年以内の者。個人は市内に住民登録があり市内で事業を営むこと、法人は市内に本店または主たる事業所があること。市税の滞納がないこと',
        eligibleCosts: '広報費（販路開拓に係る広報宣伝費、パンフレット印刷費、WEBサイト制作・改良の委託費、インターネット広告、看板、ロゴマーク作成費）、官公庁への申請費用、事業所工事費・賃借料（創業後1年未満）、設備費（リース・レンタルのみ）、原材料費（試供品・サンプル）',
        rate: '1/2〜10/10（枠により異なる）',
        cap: 200_000,
        preDeadline: { label: '事前相談の期限', date: '2026-09-30' },
        deadline: '2026-10-09',
        windowStatus: '公募中',
        contact: '小松島市 商工観光課 TEL 0885-32-3809',
        video: '△',
        web: '○',
        notes: [
            'WEBサイト制作・改良の委託費、パンフレット印刷費、インターネット広告が「広報費」として明記されている',
            '動画制作が広報宣伝費に含まれるかは商工観光課に要確認',
            '申請前に事前相談が必要（2026-09-30 まで）。過去にこの補助金を受けた事業者は対象外',
        ],
        sourceUrl: 'https://www.city.komatsushima.lg.jp/docs/sogyohojo.html',
        lastChecked: '2026-08-26',
        published: true,
    },
    {
        id: 'awa-ganbaru-r8',
        name: '阿波市がんばる企業応援補助金（令和8年度）',
        level: '市町村',
        issuer: '阿波市',
        target: '市内の中小企業者等・組合等・創業者（特定創業支援等事業による支援を受けた者）・事業承継者。農業分野の事業は対象外',
        eligibleCosts: '広告宣伝（チラシ・パンフレット・カタログ作成、パッケージデザイン刷新、インターネット広告）、ウェブサイト開設（委託料・独自ドメイン取得費など）、工事費、修繕費、設備・備品購入費 ほか（区分制）',
        rate: '区分により 1/2〜2/3',
        cap: 400_000,
        capNote: '1事業者・同一年度内の合計40万円まで。区分ごとの上限あり（創業40万／広告宣伝5万 など）',
        windowOpens: '2026-04-01',
        deadline: null,
        windowStatus: '公募中',
        contact: '阿波市 商工観光課 TEL 0883-36-8722',
        video: '△',
        web: '○',
        notes: [
            '「ウェブサイト開設」「広告宣伝（チラシ・ネット広告）」が区分として明記されている',
            '随時受付。申請額が予算の範囲を超えた時点で受付終了（先着）',
            '動画制作が広告宣伝に含まれるかは商工観光課に要確認',
        ],
        sourceUrl: 'https://www.city.awa.lg.jp/docs/2021121700042/',
        lastChecked: '2026-08-26',
        published: true,
    },
    {
        id: 'higashimiyoshi-kigyo',
        name: '東みよし町 起業創業支援事業補助金',
        level: '市町村',
        issuer: '東みよし町',
        target: '創業の日または新事業開始の日に町内に住所を有する者（対象外の業種あり）',
        eligibleCosts: '広告宣伝費、事業所等の増改築費、設備・備品購入費、試作費、事業用車両の購入費、その他起業・新分野進出に要する経費',
        rate: '1/2',
        cap: 500_000,
        deadline: null,
        windowStatus: '公募中',
        contact: '東みよし町商工会 TEL 0883-82-2177／東みよし町 産業課 TEL 0883-79-5339',
        video: '△',
        web: '△',
        notes: [
            '「広告宣伝費」が対象経費に明記。チラシ・ホームページ・動画が含まれるかは窓口に要確認',
            'プレゼンテーション審査が四半期ごと（7月・10月・1月・4月）。事前相談は随時',
            '現在の受付状況は商工会・産業課に要確認',
        ],
        sourceUrl: 'https://www.town.higashimiyoshi.lg.jp/docs/944.html',
        lastChecked: '2026-08-26',
        published: true,
    },
    {
        id: 'ishii-sogyo',
        name: '石井町創業促進事業補助金',
        level: '市町村',
        issuer: '石井町',
        target: '町内に事業所を設けて創業し、町内に住所を有する個人または本社が町内の法人。認定セミナー等の支援を受け、申請年度末までに税務署へ届出を提出し、町税の滞納がないこと',
        eligibleCosts: '広告宣伝費、土地・建物の購入費または賃借料、事業所の増改築・改修費、設備・備品購入費 ほか',
        rate: '要確認',
        cap: 100_000,
        deadline: null,
        windowStatus: '不明',
        contact: '石井町 産業経済課 TEL 088-674-1118',
        video: '未確認',
        web: '未確認',
        notes: [
            '「広告宣伝費」が対象経費に明記されているが、ページの最終更新が古く（2020年）、現行年度の実施状況・補助率は産業経済課に要確認',
        ],
        sourceUrl: 'https://www.town.ishii.lg.jp/docs/2017072700019/',
        lastChecked: '2026-08-26',
        published: true,
    },
    {
        id: 'aizumi-challenge-r8',
        name: '藍住町商工業者チャレンジ支援事業補助金（令和8年度）',
        level: '市町村',
        issuer: '藍住町',
        target: '経営革新事業者（県の経営革新計画の承認を受けた者）、創業者（創業塾の受講修了者または県の創業計画の認定を受けた者）',
        eligibleCosts: '販路拡大に係る経費、借入利子、機器等のリース料、店舗等の家賃',
        rate: '要確認',
        cap: 300_000,
        capNote: '経営革新10万円／創業者10万円または30万円（条件による）・事業年度あたり',
        deadline: null,
        windowStatus: '終了',
        contact: '藍住町 産業商工課 TEL 088-637-3120',
        video: '未確認',
        web: '未確認',
        notes: [
            '令和8年度は予算上限到達のため受付終了。例年は年度末まで受付（先着）のため、次年度は年度初めに要確認',
            '「販路拡大に係る経費」に動画・Web 制作が含まれるかは産業商工課に要確認',
        ],
        sourceUrl: 'https://www.town.aizumi.lg.jp/docs/2014050800013/',
        lastChecked: '2026-08-26',
        published: true,
    },
    {
        id: 'anan-kagayake-draft',
        name: '輝け阿南！新規創業促進補助金',
        level: '市町村',
        issuer: '阿南市（要確認）',
        target: '要確認（県の起業・創業ポータルに掲載されているが、市の個別ページがリンク切れ）',
        eligibleCosts: '要確認',
        rate: '要確認',
        cap: null,
        deadline: null,
        windowStatus: '不明',
        contact: '阿南市 商工戦略課（要確認）',
        video: '未確認',
        web: '未確認',
        notes: ['市サイトの該当ページが 404。現行年度の実施有無を市サイトで要確認'],
        sourceUrl: 'https://www.city.anan.tokushima.jp/',
        lastChecked: '2026-08-26',
        published: false,
    },
    {
        id: 'mima-shoreikin-r8',
        name: '美馬市創業等促進事業奨励金（令和8年度）',
        level: '市町村',
        issuer: '美馬市',
        target: '美馬市の認定創業支援事業計画における特定創業支援事業の支援を受け、市内で創業または第二創業を行う者',
        eligibleCosts: '定額の奨励金のため経費区分の定めなし（一次資料に対象経費の記載なし）',
        rate: '定額',
        cap: 100_000,
        deadline: null,
        windowStatus: '公募中',
        contact: '美馬市 経済部 企業応援課 TEL 0883-52-1263',
        video: '未確認',
        web: '未確認',
        notes: [
            '補助金ではなく定額10万円の奨励金。随時受付',
            '特定創業支援事業（認定セミナー等）の支援を受けていることが要件',
            '別に「美馬市創業促進事業補助金」がある可能性あり。個別ページ未確認のため企業応援課に要確認',
        ],
        sourceUrl: 'https://www.city.mima.lg.jp/gyosei/docs/1923129.html',
        lastChecked: '2026-08-26',
        published: true,
    },
    {
        id: 'kitajima-sogyo-draft',
        name: '北島町創業支援補助金',
        level: '市町村',
        issuer: '北島町（要確認）',
        target: '要確認（県ポータル掲載のリンクが 404）',
        eligibleCosts: '要確認',
        rate: '要確認',
        cap: null,
        deadline: null,
        windowStatus: '不明',
        contact: '要確認',
        video: '未確認',
        web: '未確認',
        notes: ['町サイトの該当ページが 404。現行年度の実施有無を要確認'],
        sourceUrl: 'https://www.town.kitajima.lg.jp/',
        lastChecked: '2026-08-26',
        published: false,
    },
    {
        id: 'miyoshi-sogo-r8',
        name: '三好市中小企業者等総合支援事業補助金（令和8年度）',
        level: '市町村',
        issuer: '三好市',
        target: '市内の中小企業者・小規模企業者・団体・組合等（個人は市内在住、法人等は市内に事業所があること）。市税の滞納がないこと',
        eligibleCosts: 'メニュー制（10種類・1事業者3種類まで）：新製品・新規事業等広告宣伝事業、創業後広告宣伝事業、IT等活用販売推進事業、デザイン企画制作事業、DX等活用推進事業、販路開拓事業、加工特産品開発事業 ほか',
        rate: '1/2',
        cap: 400_000,
        capNote: 'メニューにより上限15万〜40万円',
        deadline: null,
        windowStatus: '公募中',
        contact: '三好市 産業観光部 商工政策課 TEL 0883-72-7645',
        video: '△',
        web: '△',
        notes: [
            '「広告宣伝事業」（新規・創業後）「IT等活用販売推進」「デザイン企画制作」がメニューとして明記。動画・HP 制作費の具体的な扱いは商工政策課に要確認',
            '受付は年度内随時。予算状況は窓口に要確認',
        ],
        sourceUrl: 'https://www.miyoshi.i-tokushima.jp/docs/2291080.html',
        lastChecked: '2026-08-26',
        published: true,
    },
    {
        id: 'katsuura-mirai-r7',
        name: '阿波かつうら未来応援事業（ふるさと起業家支援）',
        level: '市町村',
        issuer: '勝浦町',
        target: '町内で起業、または既存事業で新たな事業展開を始める個人・法人。町内に住所または事業所を有し、町税の滞納がないこと',
        eligibleCosts: 'ふるさと納税型クラウドファンディングと連動した起業支援（対象経費の明細は記載なし）',
        rate: '要確認',
        cap: 1_000_000,
        capNote: '集まった寄附額または100万円のいずれか高い方が上限',
        windowOpens: '2025-05-01',
        deadline: '2025-12-26',
        windowStatus: '終了',
        contact: '勝浦町役場 企画交流課 TEL 0885-42-2552',
        video: '未確認',
        web: '未確認',
        notes: [
            '令和7年度の募集は 2025-12-26 で終了。令和8年度の実施有無は企画交流課に要確認',
            'ふるさと納税型 CF と連動する仕組み。対象経費に動画・Web 制作が含まれるかは要確認',
        ],
        sourceUrl: 'https://www.town.katsuura.lg.jp/docs/2023071400010/',
        lastChecked: '2026-08-26',
        published: true,
    },
    {
        id: 'tsurugi-akitenpo-draft',
        name: 'つるぎ町空き店舗等活用支援事業補助金',
        level: '市町村',
        issuer: 'つるぎ町',
        target: '新規出店者および空き店舗等の所有者（商工会加入・経営指導受講などの要件あり）',
        eligibleCosts: '要確認（交付要綱 PDF 未確認。店舗改装中心の可能性が高い）',
        rate: '1/2',
        cap: 500_000,
        deadline: null,
        windowStatus: '不明',
        contact: 'つるぎ町 産業経済課 TEL 0883-62-3114',
        video: '未確認',
        web: '未確認',
        notes: ['対象経費が要綱 PDF 未確認のため非公開。動画・Web に使えるか確認でき次第切り替える'],
        sourceUrl: 'https://www.town.tokushima-tsurugi.lg.jp/iju/work/tenpo.html',
        lastChecked: '2026-08-26',
        published: false,
    },
    {
        id: 'matsushige-draft',
        name: '松茂町 創業・販路開拓系補助金',
        level: '市町村',
        issuer: '松茂町（要確認）',
        target: '要確認',
        eligibleCosts: '要確認',
        rate: '要確認',
        cap: null,
        deadline: null,
        windowStatus: '不明',
        contact: '要確認',
        video: '未確認',
        web: '未確認',
        notes: ['該当制度が見つかっていない。町サイトを巡回対象に入れる'],
        sourceUrl: 'https://www.town.matsushige.tokushima.jp/category/bunya/kurashi_kyoiku/hojo/',
        lastChecked: '2026-08-26',
        published: false,
    },
    {
        id: 'kamiyama-draft',
        name: '神山町 創業・販路開拓系補助金',
        level: '市町村',
        issuer: '神山町（要確認）',
        target: '要確認',
        eligibleCosts: '要確認',
        rate: '要確認',
        cap: null,
        deadline: null,
        windowStatus: '不明',
        contact: '要確認',
        video: '未確認',
        web: '未確認',
        notes: ['該当制度が見つかっていない。町サイトを巡回対象に入れる'],
        sourceUrl: 'https://www.town.kamiyama.lg.jp/',
        lastChecked: '2026-08-26',
        published: false,
    },
    {
        id: 'naka-draft',
        name: '那賀町 創業・販路開拓系補助金',
        level: '市町村',
        issuer: '那賀町（要確認）',
        target: '要確認',
        eligibleCosts: '要確認',
        rate: '要確認',
        cap: null,
        deadline: null,
        windowStatus: '不明',
        contact: '要確認',
        video: '未確認',
        web: '未確認',
        notes: ['該当制度が見つかっていない。町サイトを巡回対象に入れる'],
        sourceUrl: 'https://www.town.tokushima-naka.lg.jp/',
        lastChecked: '2026-08-26',
        published: false,
    },
    {
        id: 'minami-kigyo-draft',
        name: '美波町小規模事業起業等支援補助金',
        level: '市町村',
        issuer: '美波町',
        target: '要確認（令和8年改正の要綱あり）',
        eligibleCosts: '要確認（要綱 PDF 未確認のため非公開）',
        rate: '要確認',
        cap: null,
        deadline: null,
        windowStatus: '不明',
        contact: '美波町 産業振興課 TEL 0884-77-3617',
        video: '未確認',
        web: '未確認',
        notes: ['受付は随時（予算の範囲内）。対象経費の詳細が要綱 PDF で確認でき次第 published に切り替える'],
        sourceUrl: 'https://www.town.minami.lg.jp/docs/360.html',
        lastChecked: '2026-08-26',
        published: false,
    },
    {
        id: 'kaiyo-kigyo-r8',
        name: '海陽町ふるさと創造戦略補助金（起業支援事業・令和8年度）',
        level: '市町村',
        issuer: '海陽町',
        target: '町内で起業する者。海陽町の特定創業支援事業の証明を受けていることが必須',
        eligibleCosts: '開業準備に関する経費（詳細は要綱で定義。広告宣伝・Web 制作が含まれるかは要綱 PDF で要確認）',
        rate: '1/2 以内',
        cap: 1_000_000,
        windowOpens: '2026-05-11',
        deadline: '2026-10-30',
        windowStatus: '公募中',
        contact: '海陽町役場（海南庁舎）産業振興課 TEL 0884-73-4161',
        video: '未確認',
        web: '未確認',
        notes: [
            '先着順。予算がなくなり次第終了',
            '対象経費に動画・Web 制作が含まれるかは要綱で未確認。申請前に産業振興課に確認する',
            '特定創業支援事業の証明（町の認定）が必要',
        ],
        sourceUrl: 'https://www.town.kaiyo.lg.jp/docs/2023040700035/',
        lastChecked: '2026-08-26',
        published: true,
    },
];

// ----------------------------------------------------------------------
// helpers
// ----------------------------------------------------------------------

export const LEVEL_ORDER: HojokinLevel[] = ['国', '県', '市町村'];

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
