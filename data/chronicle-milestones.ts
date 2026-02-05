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
        title: "誕生",
        content: "愛知県一宮市にて次男として誕生。",
        image: "/images/chronicle/milestone_1980.png",
        dashboard: {
            age: 0,
            location: "愛知県",
            energy: 100,
            title: "次男",
            stats: {
                creativity: 50,
                technology: 0,
                lifestyle: 50,
                syncRate: 100,
                realityDistortion: 0
            },
            focus: ["家族", "誕生"]
        }
    },
    {
        id: "childhood-art",
        year: 1984,
        title: "絵画との出会い",
        content: "絵画教室に通い始め、表現の楽しさを知る。鳥山明氏の影響を受け、漫画家に憧れる。",
        image: "/images/chronicle/milestone_1980.png", // Reusing 1980 image as relevant fallback
        dashboard: {
            age: 4,
            location: "愛知県",
            energy: 100,
            title: "画家の卵",
            stats: {
                creativity: 80,
                technology: 5,
                lifestyle: 50,
                syncRate: 95,
                realityDistortion: 20
            },
            focus: ["絵画", "漫画", "ドラゴンボール"]
        }
    },
    {
        id: "blue-hearts",
        year: 1988,
        title: "パンクの目覚め",
        content: "THE BLUE HEARTSのライブに行く。パンクの追求が始まる。",
        image: "/images/chronicle/milestone_1988.png",
        dashboard: {
            age: 8,
            location: "愛知県",
            energy: 95,
            title: "パンク少年",
            stats: {
                creativity: 85,
                technology: 10,
                lifestyle: 50,
                syncRate: 90,
                realityDistortion: 30
            },
            focus: ["音楽", "パンク"]
        }
    },
    {
        id: "game-world",
        year: 1992,
        title: "物語への没入",
        content: "ファイナルファンタジーⅣに没頭。RPGを通じて物語の世界に浸る。",
        image: "/images/chronicle/milestone_1988.png", // Fallback to 80s vibe
        dashboard: {
            age: 12,
            location: "愛知県",
            energy: 90,
            title: "ゲーマー",
            stats: {
                creativity: 90,
                technology: 30,
                lifestyle: 50,
                syncRate: 85,
                realityDistortion: 50
            },
            focus: ["ゲーム", "物語", "RPG"]
        }
    },
    {
        id: "alternative-culture",
        year: 1995,
        title: "カウンターカルチャー",
        content: "Nirvanaなどのオルタナティブ・ミュージック、DIY精神、カウンターカルチャーに深く傾倒。",
        image: "/images/chronicle/milestone_1996.png", // Using punk era image
        dashboard: {
            age: 15,
            location: "愛知県",
            energy: 100,
            title: "反逆者",
            stats: {
                creativity: 95,
                technology: 20,
                lifestyle: 45,
                syncRate: 80,
                realityDistortion: 60
            },
            focus: ["オルタナ", "DIY", "グランジ"]
        }
    },
    {
        id: "punk-hs",
        year: 1996,
        title: "モヒカンの夏",
        content: "名古屋の高校へ進学。イギリス・ヨーロッパのパンク／ハードコアシーンに浸かり、夏休みには緑のモヒカンで過ごすパンクキッズとなった。",
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
                syncRate: 120, // Peak rebellion
                realityDistortion: 70
            },
            focus: ["モヒカン", "ハードコア", "自己表現"]
        }
    },
    {
        id: "drummer-era",
        year: 2001,
        title: "ドラムと音楽探究",
        content: "ドラムを本格的に開始。ジャズ、ブルース、ロック、ファンク、ソウルなどの歴史的な音楽を掘り下げ、音楽への理解を深める。",
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
            focus: ["ドラム", "ルーツ音楽", "深掘り"]
        }
    },
    {
        id: "new-orleans-web",
        year: 2007,
        title: "聖地とWebスキル",
        content: "音楽の聖地ニュー・オリンズへ。本場のファンクやセカンドラインを体験。同年、独学でウェブサイト制作のスキルを習得。",
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
                syncRate: 75,
                realityDistortion: 40
            },
            focus: ["ファンク", "旅", "Web制作"]
        }
    },
    {
        id: "australia-byron",
        year: 2011,
        title: "解放と世界",
        content: "渡豪。バイロンベイでの生活を通じ、ストレスからの解放と世界を知る。",
        image: "/images/chronicle/milestone_2011.png",
        dashboard: {
            age: 31,
            location: "バイロンベイ",
            energy: 80,
            title: "旅人",
            stats: {
                creativity: 70,
                technology: 50,
                lifestyle: 95,
                syncRate: 90,
                realityDistortion: 20
            },
            focus: ["海外生活", "解放", "多様性"]
        }
    },
    {
        id: "father-loss",
        year: 2013,
        title: "決意",
        content: "ALSで闘病した父を看取り、「自分らしく生きる」ことを決意。",
        image: "/images/chronicle/milestone_2013.png",
        dashboard: {
            age: 33,
            location: "愛知県",
            energy: 70,
            title: "決意の人",
            stats: {
                creativity: 80,
                technology: 50,
                lifestyle: 80,
                syncRate: 95, // Deep sync with life
                realityDistortion: 10
            },
            focus: ["看取り", "自分らしさ", "転機"]
        }
    },
    {
        id: "tokushima-move",
        year: 2014,
        title: "徳島移住",
        content: "徳島県に移住。釣りとカメラに没頭する日々を送る。ミラーレスカメラとドローンの登場により、僕の感性とクロスした。",
        image: "/images/chronicle/milestone_2013.png", // Reusing 2013 tokushima related image
        dashboard: {
            age: 34,
            location: "徳島県",
            energy: 90,
            title: "移住者",
            stats: {
                creativity: 90,
                technology: 70,
                lifestyle: 90,
                syncRate: 92,
                realityDistortion: 30
            },
            focus: ["釣り", "カメラ", "ドローン"]
        }
    },
    {
        id: "brand-launch",
        year: 2018,
        title: "クロスオーヴァー",
        content: "『DAISUKE KOBAYASHI』開業。感性とテクノロジーが融合した「クロスオーヴァー期」を迎え、働くことと人生が一致する。",
        image: "/images/chronicle/milestone_2018.png",
        dashboard: {
            age: 38,
            location: "徳島県",
            energy: 95,
            title: "事業主",
            stats: {
                creativity: 95,
                technology: 85,
                lifestyle: 90,
                syncRate: 98,
                realityDistortion: 60
            },
            focus: ["独立", "融合", "ライフワーク"]
        }
    },
    {
        id: "book-publish",
        year: 2021,
        title: "執筆活動",
        content: "Kindle書籍『現代を生き抜くサバイバルアイテム40』を出版。",
        image: "/images/chronicle/milestone_2020.png", // Using remote life era image
        dashboard: {
            age: 41,
            location: "徳島県",
            energy: 85,
            title: "作家",
            stats: {
                creativity: 90,
                technology: 85,
                lifestyle: 85,
                syncRate: 85,
                realityDistortion: 40
            },
            focus: ["Kindle", "執筆", "サバイバル"]
        }
    },
    {
        id: "daughter-emma",
        year: 2022,
        title: "生命の神秘",
        content: "長女・永茉（エマ）誕生。生命の神秘と記録の大切さを再認識する。",
        image: "/images/chronicle/milestone_2023.png", // Using memento image (close enough context)
        dashboard: {
            age: 42,
            location: "徳島県",
            energy: 95,
            title: "父",
            stats: {
                creativity: 90,
                technology: 80,
                lifestyle: 95,
                syncRate: 100,
                realityDistortion: 20
            },
            focus: ["育児", "生命", "記録"]
        }
    },
    {
        id: "concept-rebuild",
        year: 2024,
        title: "再構築",
        content: "全プロジェクトのコンセプトを再構築。映像制作・執筆を通じた「ビジュアルコミュニケーション戦略」を展開。",
        image: "/images/chronicle/milestone_2025.png", // Placeholder/Forward looking
        dashboard: {
            age: 44,
            location: "徳島県",
            energy: 90,
            title: "ストラテジスト",
            stats: {
                creativity: 95,
                technology: 90,
                lifestyle: 90,
                syncRate: 95,
                realityDistortion: 50
            },
            focus: ["戦略", "映像", "ビジュアル"]
        }
    },
    {
        id: "mitoflow-start",
        year: 2025,
        title: "MitoFlow40",
        content: "精密栄養学を学び、ヘルスケアサービス『ミトフロー40』をスタート。",
        image: "/images/chronicle/milestone_2026.png", // Using final vision image
        dashboard: {
            age: 45,
            location: "徳島県",
            energy: 95,
            title: "ファウンダー",
            stats: {
                creativity: 90,
                technology: 95,
                lifestyle: 100,
                syncRate: 99,
                realityDistortion: 80
            },
            focus: ["栄養学", "ヘルスケア", "創業"]
        }
    }
];
