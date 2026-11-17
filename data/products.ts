export interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    details: string;
    image: string;
    color: string;
    type: 'digital' | 'physical' | 'service';
    downloadPath?: string;
    specs?: { label: string; value: string }[];
    gallery?: string[];
    badge?: string;
    originalPrice?: number;
    stock?: number;
    tags?: string[];
    ctaType?: 'buy' | 'download' | 'contact';
    category?: string;
    comingSoon?: boolean;
    priceLabel?: string;
    thumbnailLabel?: string;
}

export const products: Product[] = [
    {
        // GoldRoom（SAL Develop）の Shine。selpico3 をもとに作り直したプリセット。
        // 色づくりの一部を購入 LUT（KDX - LOG32）に頼っていて再配布できないため、
        // 配る形（Lightroom 用に変換するか等）と価格が決まるまで Coming Soon。
        id: 'shine-preset',
        name: 'Shine',
        price: 0,
        priceLabel: '¥-',
        description: '光と影は表裏一体——Shine a Light の考え方をそのまま色にした写真現像プリセット「Shine」。近日公開。',
        details: '“There is strong shadow where there is much light.”\n強い光のあるところには、濃い影がある。Shine a Light の根っこにある言葉です。\n\n「Shine」は、この考え方をそのまま色にしたプリセットです。光の当たっているところだけをきれいに見せるのではなく、影をつぶさずに残し、影の中にあるものまで見えるように仕上げています。コントラストは控えめに、暗部はやわらかく持ち上げ、フィルムのような粒感を少しだけ。\n\nベースは、仕事でもプライベートでも使い続けてきた selpico3。そこから色と階調を一から見直しました。\n\n現在、公開の準備中です。公開のお知らせはニュースレター「SAL LETTER」でお届けします。',
        image: 'https://placehold.co/800x800/e8b25a/1e1e1e.png?text=SHINE%0APRESET',
        color: 'color-7',
        type: 'digital',
        tags: ['Photo', 'Tool'],
        ctaType: 'buy',
        category: 'Photo Preset',
        comingSoon: true,
        specs: [
            { label: 'Base', value: 'selpico3' },
            { label: 'Concept', value: 'Light & Shadow — 影をつぶさない' },
            { label: 'Look', value: 'Low contrast / Lifted shadows / Soft film grain' },
            { label: 'Status', value: 'Coming Soon' },
        ],
    },
    {
        // selpico / selpico2 / selpico3 のセット。Lightroom 用（XMP）があるのは selpico3 だけで、
        // 1 と 2 は SAL Develop のプリセットしか無い。温度・色かぶりの値が Lightroom と 1:1 ではないので、
        // Lightroom で見え方を合わせて書き出し直すまで Coming Soon。
        id: 'selpico-set',
        name: 'selpico 1–3 セット',
        price: 0,
        priceLabel: '¥-',
        description: '映画『セルピコ』の質感を目指して作り続けてきた現像プリセット selpico の 1・2・3 をまとめたセット。近日公開。',
        details: 'アル・パチーノ主演の映画『セルピコ』のような質感を目指して作り、仕事でもプライベートでも使い続けてきた現像プリセット「selpico」。その 1・2・3 をひとつにまとめたセットです。\n\n同じ「selpico」でも、作った時期ごとに光の受け止め方が少しずつ違います。写真に合わせて 3 つを使い分けたり、くらべて自分の好みを見つけたりしてください。\n\n現在、公開の準備中です。公開のお知らせはニュースレター「SAL LETTER」でお届けします。',
        image: 'https://placehold.co/800x800/58d8d8/1e1e1e.png?text=SELPICO%0A1%E2%80%933+SET',
        color: 'color-5',
        type: 'digital',
        tags: ['Photo', 'Tool'],
        ctaType: 'buy',
        category: 'Photo Preset',
        comingSoon: true,
        specs: [
            { label: 'Contents', value: 'selpico / selpico2 / selpico3（3 Presets）' },
            { label: 'Format', value: 'XMP (Lightroom / Camera Raw)' },
            { label: 'Status', value: 'Coming Soon' },
        ],
    },
    {
        id: 'original-camera-strap',
        name: 'マルチカメラストラップ',
        price: 3900,
        description: 'Shine a Light のオリジナルカメラストラップ。しなやかで丈夫、長時間の撮影でも疲れにくい一本。',
        details: 'しなやかで丈夫な素材を使用した、長時間の撮影でも疲れにくいカメラストラップ。\n\nシンプルなデザインでどんなカメラにもマッチします。',
        image: 'https://placehold.co/800x800/ff764d/1e1e1e.png?text=CAMERA%0ASTRAP',
        color: 'color-1',
        type: 'physical',
        stock: 10,
        tags: ['Photo', 'Video', 'Tool'],
        ctaType: 'buy',
        category: 'Camera Gear',
        gallery: [
            '/store/camera-strap/DSC09665_1.jpg',
            '/store/camera-strap/DSC09666_1.jpg',
            '/store/camera-strap/DSC09671_1.jpg',
            '/store/camera-strap/DSC09675_1.jpg',
            '/store/camera-strap/DSC09678_1.jpg',
        ],
        comingSoon: true,
        specs: [
            { label: 'Color', value: 'Black' },
            { label: 'Material', value: 'Nylon / Leather' },
            { label: 'Delivery Time', value: '3〜5 Days' },
        ],
    },
    {
        id: 'web-production-teaching',
        name: 'オンライン完結型Webサイト制作サポート',
        price: 59800,
        description: 'ご自身でWebサイトを制作・運用できるようになるためのオンラインサポートプラン。',
        details: 'テンプレートを活用し、ご自身でWebサイト（LP・ポートフォリオ・コーポレートサイト等）を構築できるよう、オンラインでマンツーマンサポートを行うプランです。\n\nツールの使い方からドメイン設定、公開後の運用方法まで丁寧にレクチャーします。自分でサイトを管理・更新していきたい方におすすめです。',
        image: 'https://placehold.co/800x800/f9e654/1e1e1e.png?text=WEB%0ATEACHING',
        color: 'color-7',
        type: 'service',
        badge: 'RECOMMENDED',
        stock: 5,
        tags: ['AI'],
        ctaType: 'buy',
        category: 'Web Service',
        comingSoon: true,
        specs: [
            { label: 'Service Type', value: 'Web Design Mentoring' },
            { label: 'Duration', value: '1 Month' },
            { label: 'Format', value: 'Online Meeting (4 sessions)' },
        ],
    },
    {
        id: 'lp-production-building',
        name: 'LP制作',
        price: 129800,
        description: '商品やサービスの魅力を最大限に伝えるランディングページ（LP）制作プラン。',
        details: 'ヒアリングからデザイン、コーディング、公開までを全てお任せいただける本格的なLP制作プランです。\n\nターゲット層の分析や競合リサーチに基づき、成約率（コンバージョン）を高めるための構成とデザインをご提案します。スマートフォン対応（レスポンシブ）も含みます。',
        image: 'https://placehold.co/800x800/87d37c/1e1e1e.png?text=LP%0APRODUCTION',
        color: 'color-4',
        type: 'service',
        tags: ['AI'],
        ctaType: 'buy',
        category: 'Web Service',
        comingSoon: true,
        specs: [
            { label: 'Service Type', value: 'LP Design & Development' },
            { label: 'Delivery Time', value: '3〜4 Weeks' },
            { label: 'Format', value: 'Online Meeting & Custom Handover' },
        ],
    },
    {
        id: 'custom-bespoke-website',
        name: '映像・写真を合わせたオーダーメイドウェブメディア',
        price: 500000,
        priceLabel: '¥-',
        description: '映像制作・写真撮影・記事づくりからメディアの構築・運営までを一貫して行う、オーダーメイドのウェブメディア制作プラン。',
        details: '写真や映像の撮影、取材・記事づくりから、それらを発信し続けるウェブメディアの構築までを一貫してプロデュースします。\n\n地域や企業、ブランドの「いま」を伝え続けるオウンドメディアを、企画・デザイン・編集の仕組みごとオーダーメイドで制作。公開後の運営や更新の体制づくりまで伴走します。ヒアリングに基づき個別にお見積もりいたします。',
        image: 'https://placehold.co/800x800/1e1e1e/ffffff.png?text=BESPOKE%0AWEB+MEDIA',
        color: 'color-1',
        type: 'service',
        tags: ['Photo', 'AI', 'Video'],
        ctaType: 'contact',
        category: 'Bespoke Service',
        comingSoon: true,
        specs: [
            { label: 'Service Type', value: 'Full Brand Production' },
            { label: 'Deliverables', value: 'Photo / Video / Articles / Web Media' },
            { label: 'Price', value: '¥500,000〜 (見積り反映)' },
            { label: 'Inquiry', value: 'Required' },
        ],
    },
];

export function getProductById(id: string): Product | undefined {
    return products.find((p) => p.id === id);
}
