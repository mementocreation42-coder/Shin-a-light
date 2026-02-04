export interface DashboardState {
    age: number;
    location: string;
    energy: number;
    title: string;
    stats: {
        creativity: number;
        technology: number;
        lifestyle: number;
        syncRate: number; // シンクロ率
        realityDistortion: number; // 現実歪曲フィールド
    };
    focus: string[];
}

export interface Milestone {
    id: string;
    year: number;
    month?: string;
    title: string;
    content: string;
    image: string;
    dashboard: DashboardState;
}

export const milestones: Milestone[] = [
    {
        id: "birth",
        year: 1980,
        month: "10月",
        title: "はじまり",
        content: "愛知県一宮市に生まれる。幼少期から絵を描くことに夢中になり、鳥山明のドラゴンボールに強い影響を受ける。",
        image: "/images/chronicle/milestone_1980.png",
        dashboard: {
            age: 0,
            location: "愛知県",
            energy: 100,
            title: "誕生",
            stats: {
                creativity: 80,
                technology: 10,
                lifestyle: 50,
                syncRate: 98,
                realityDistortion: 10
            },
            focus: ["絵画", "漫画", "好奇心"]
        }
    },
    {
        id: "blue-hearts",
        year: 1988,
        title: "音楽との出会い",
        content: "初めてのライブ体験。THE BLUE HEARTSの衝撃が、POPからパンク・ロックへと音楽の嗜好を一変させる。この日から音楽は人生の中心となる。",
        image: "/images/chronicle/milestone_1988.png",
        dashboard: {
            age: 8,
            location: "愛知県",
            energy: 95,
            title: "少年",
            stats: {
                creativity: 90,
                technology: 20,
                lifestyle: 50,
                syncRate: 85,
                realityDistortion: 30
            },
            focus: ["パンク", "ロック", "反骨精神"]
        }
    },
    {
        id: "punk-era",
        year: 1996,
        title: "パンクに染まる",
        content: "高校進学で名古屋へ。UK/ヨーロッパのパンク・ハードコアシーンに没頭し、緑のモヒカンで街を歩く。反骨精神と自己表現の原点がここにある。",
        image: "/images/chronicle/milestone_1996.png",
        dashboard: {
            age: 16,
            location: "名古屋",
            energy: 100,
            title: "パンクス",
            stats: {
                creativity: 95,
                technology: 20,
                lifestyle: 40,
                syncRate: 120, // High rebellion
                realityDistortion: 60
            },
            focus: ["ファッション", "ライブ", "自己表現"]
        }
    },
    {
        id: "band-era",
        year: 2001,
        title: "バンド活動",
        content: "ギターからドラムへ転向。Blankey Jet Cityに影響を受け、名古屋で本格的なバンド活動を開始。音楽、ジャズ、ブルース、映画に浸る日々。",
        image: "/images/chronicle/milestone_2001.png",
        dashboard: {
            age: 21,
            location: "名古屋",
            energy: 90,
            title: "ドラマー",
            stats: {
                creativity: 95,
                technology: 30,
                lifestyle: 45,
                syncRate: 90,
                realityDistortion: 50
            },
            focus: ["ドラム", "ジャズ/ブルース", "映画"]
        }
    },
    {
        id: "new-orleans",
        year: 2007,
        title: "ニューオーリンズへ",
        content: "音楽のルーツを求めてニューオーリンズへ。この旅の中でWeb開発・コーディングを学び始める。創造の幅が音楽からデジタルへと広がる。",
        image: "/images/chronicle/milestone_2007.png",
        dashboard: {
            age: 27,
            location: "ニューオーリンズ",
            energy: 85,
            title: "探求者",
            stats: {
                creativity: 85,
                technology: 60,
                lifestyle: 40,
                syncRate: 75, // Searching
                realityDistortion: 40
            },
            focus: ["旅行", "Web開発", "コーディング"]
        }
    },
    {
        id: "australia",
        year: 2011,
        title: "オーストラリアへ",
        content: "バイロンベイへ移住。寿司職人として働きながら、心身ともに大きな転換点を迎える。自然の中での生活が新たな価値観を育む。",
        image: "/images/chronicle/milestone_2011.png",
        dashboard: {
            age: 31,
            location: "バイロンベイ",
            energy: 80,
            title: "職人",
            stats: {
                creativity: 70,
                technology: 50,
                lifestyle: 90,
                syncRate: 88,
                realityDistortion: 20 // Grounded
            },
            focus: ["寿司", "サーフィン", "スローライフ"]
        }
    },
    {
        id: "tokushima",
        year: 2013,
        title: "徳島へ",
        content: "海の近くで暮らすため徳島へ移住。釣りを楽しみながら、プロフォトグラファーとしてのキャリアをスタート。7年計画の始まり。",
        image: "/images/chronicle/milestone_2013.png",
        dashboard: {
            age: 33,
            location: "徳島県",
            energy: 85,
            title: "フォトグラファー",
            stats: {
                creativity: 90,
                technology: 60,
                lifestyle: 85,
                syncRate: 92,
                realityDistortion: 40
            },
            focus: ["写真", "釣り", "移住"]
        }
    },
    {
        id: "creative-brand",
        year: 2018,
        title: "DAISUKE KOBAYASHI",
        content: "クリエイティブブランド「DAISUKE KOBAYASHI」を正式に立ち上げ。映像制作、ドローン撮影、ミラーレスカメラを軸に活動を本格化。",
        image: "/images/chronicle/milestone_2018.png",
        dashboard: {
            age: 38,
            location: "徳島県",
            energy: 90,
            title: "クリエイター",
            stats: {
                creativity: 95,
                technology: 85,
                lifestyle: 75,
                syncRate: 96,
                realityDistortion: 70
            },
            focus: ["映像制作", "ドローン", "ブランディング"]
        }
    },
    {
        id: "remote-life",
        year: 2020,
        title: "場所に縛られない働き方",
        content: "2013年から始めた7年計画が結実。どこにいても働けるライフスタイルを確立。しかし40歳を迎え、体の変化を感じ始める。",
        image: "/images/chronicle/milestone_2020.png",
        dashboard: {
            age: 40,
            location: "徳島県",
            energy: 65,
            title: "リモートワーカー",
            stats: {
                creativity: 85,
                technology: 90,
                lifestyle: 70,
                syncRate: 60, // Crisis
                realityDistortion: 50
            },
            focus: ["リモートワーク", "7年ルール", "健康"]
        }
    },
    {
        id: "daughter-memento",
        year: 2023,
        title: "娘の誕生とMEMENTO",
        content: "娘が誕生し、人生に新たな意味が加わる。メモリアルフォト・ムービーサービス「MEMENTO」を立ち上げ、7年ルールについてのKindle本を出版。",
        image: "/images/chronicle/milestone_2023.png",
        dashboard: {
            age: 43,
            location: "徳島県",
            energy: 90,
            title: "父・起業家",
            stats: {
                creativity: 90,
                technology: 80,
                lifestyle: 95,
                syncRate: 98,
                realityDistortion: 40
            },
            focus: ["育児", "MEMENTO", "執筆"]
        }
    },
    {
        id: "nutrition-discovery",
        year: 2025,
        month: "2月",
        title: "精密栄養学との出会い",
        content: "細胞レベルの栄養学に深く潜る。分子レベルで体の必要を理解することで、劇的な変容を始め、エネルギーと明晰さを取り戻す。",
        image: "/images/chronicle/milestone_2025.png",
        dashboard: {
            age: 45,
            location: "徳島県",
            energy: 95,
            title: "バイオハッカー",
            stats: {
                creativity: 85,
                technology: 95,
                lifestyle: 100,
                syncRate: 99,
                realityDistortion: 80
            },
            focus: ["栄養学", "分子生物学", "バイオハッキング"]
        }
    },
    {
        id: "mitoflow-launch",
        year: 2026,
        title: "MitoFlow40",
        content: "クリエイターの感性と健康科学の精密さを融合。40代以上の人々が生物学を最適化し、活力に満ちたクリエイティブな人生を送るためのMitoFlow40を立ち上げる。",
        image: "/images/chronicle/milestone_2026.png",
        dashboard: {
            age: 46,
            location: "徳島県",
            energy: 100,
            title: "創業者",
            stats: {
                creativity: 100,
                technology: 100,
                lifestyle: 100,
                syncRate: 400, // Breakthrough
                realityDistortion: 100
            },
            focus: ["MitoFlow40", "最適化", "活力"]
        }
    }
];
