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
        id: 'free-photo-preset',
        name: 'selpico3',
        price: 0,
        description: 'SAL謹製の写真現像プリセット「selpico3」。ニュースレター登録で無料ダウンロード。',
        details: '仕事からプライベートまで、実際の撮影現場で使い続けてきたLightroomプリセット「selpico3」です。\n\nアル・パチーノ主演の映画『セルピコ』のような質感を目指して制作したため、「selpico（セルピコ）」と名付けました。フィルムライクな粒感と落ち着いた色調が特徴で、風景・自然・日常スナップなど幅広いシーンで活躍します。\n\nメールアドレスをご登録いただくと、そのままダウンロードが開始されます。',
        image: 'https://placehold.co/800x800/58d8d8/1e1e1e.png?text=PHOTOGRAPHER%0APRESET',
        color: 'color-5',
        type: 'digital',
        downloadPath: '/presets/selpico3.xmp',
        tags: ['Photo'],
        ctaType: 'download',
        category: 'Photo Preset',
        gallery: [
            '/store/selpico3/DSC04664.jpg',
            '/store/selpico3/DSC04701.jpg',
            '/store/selpico3/DSC04788.jpg',
            '/store/selpico3/DSC04827.jpg',
            '/store/selpico3/DSC04860.jpg',
            '/store/selpico3/DSC05029.jpg',
            '/store/selpico3/DSC05070.jpg',
            '/store/selpico3/DSC05146.jpg',
            '/store/selpico3/DSC05319.jpg',
            '/store/selpico3/DSC05709.jpg',
            '/store/selpico3/DSC06844.jpg',
            '/store/selpico3/DSC07340.jpg',
            '/store/selpico3/DSC08027.jpg',
            '/store/selpico3/DSCF6443.jpg',
            '/store/selpico3/DSCF7079.jpg',
            '/store/selpico3/DSCF7275.jpg',
            '/store/selpico3/DSCF7943.jpg',
        ],
        specs: [
            { label: 'Format', value: 'XMP (Lightroom / Camera Raw)' },
            { label: 'Contents', value: '1 Preset' },
            { label: 'Compatibility', value: 'Lightroom Classic / CC / Camera Raw' },
            { label: 'Delivery', value: 'Direct Download' },
        ],
    },
    {
        id: 'photographer-skill-md',
        name: 'Photographer Skill',
        price: 0,
        description: '写真撮影と言語化の思考プロセスを凝縮したナレッジベース。',
        details: 'Shine a Lightのフォトグラフィーにおける視点、切り取り方、思考法を言語化したSKILL.mdファイルです。\n\nプロフェッショナルなフォトグラファーとしてのマインドセットや、現場での判断基準をまとめています。メールアドレス登録で今すぐ活用いただけます。',
        image: 'https://placehold.co/800x800/b38bdd/1e1e1e.png?text=PHOTOGRAPHER%0ASKILL+MD',
        color: 'color-3',
        type: 'digital',
        downloadPath: '/downloads/photographer-skill.md',
        tags: ['Photo', 'AI'],
        ctaType: 'download',
        category: 'Digital Download',
        specs: [
            { label: 'Format', value: 'Markdown (.md)' },
            { label: 'Topic', value: 'Photography Vision / Creative Mindset' },
            { label: 'Category', value: 'Photography Knowledge' },
            { label: 'Delivery', value: 'Direct Download' },
        ],
    },
    {
        id: 'original-camera-strap',
        name: 'オリジナルカメラストラップ',
        price: 3900,
        description: 'Shine a Lightのロゴが入ったオリジナルカメラストラップ。',
        details: 'しなやかで丈夫な素材を使用した、長時間の撮影でも疲れにくいカメラストラップ。\n\nシンプルなデザインでどんなカメラにもマッチします。',
        image: 'https://placehold.co/800x800/ff764d/1e1e1e.png?text=CAMERA%0ASTRAP',
        color: 'color-1',
        type: 'physical',
        stock: 10,
        tags: ['Photo', 'Video'],
        ctaType: 'buy',
        category: 'Camera Gear',
        comingSoon: true,
        specs: [
            { label: 'Color', value: 'Black' },
            { label: 'Material', value: 'Nylon / Leather' },
            { label: 'Delivery Time', value: '3〜5 Days' },
        ],
    },
    {
        id: 'web-production-teaching',
        name: 'オンライン完結型Webサイト制作',
        price: 59800,
        originalPrice: 69800,
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
        id: 'video-production-plan',
        name: 'ハイエンド映像制作',
        price: 299800,
        description: '企画から編集まで、映画のようなクオリティで制作するハイエンド映像プラン。',
        details: 'ブランドムービー、プロモーションビデオ、インタビュー動画など、目的やターゲットに合わせて最適なストーリー構築から撮影、カラーグレーディング、編集までを一貫して行います。\n\nプロフェッショナルな機材と映像制作の専門知識を駆使し、視聴者の心を動かす最高峰の映像体験を提供します。',
        image: 'https://placehold.co/800x800/5eb5f7/1e1e1e.png?text=VIDEO%0APRODUCTION',
        color: 'color-2',
        type: 'service',
        tags: ['Video'],
        ctaType: 'buy',
        category: 'Video Production',
        comingSoon: true,
        specs: [
            { label: 'Service Type', value: 'Professional Video Production' },
            { label: 'Delivery Time', value: '4〜6 Weeks' },
            { label: 'Format', value: '4K High Quality Delivery' },
        ],
    },
    {
        id: 'custom-bespoke-website',
        name: '映像・写真を合わせたオーダーメイドウェブサイト',
        price: 500000,
        priceLabel: '¥-',
        description: '映像制作、スチール撮影、Web構築をすべて一貫して行う、最高級のブランド構築プラン。',
        details: '静止画や動画の素材撮影から、それらを最大限に活かすWebサイトの構築までを一貫してプロデュースします。\n\n「企業の顔」となるコーポレートサイトや、ブランドの世界観を五感で伝えるスペシャルサイトなど、唯一無二のデジタル体験をオーダーメイドで制作。ヒアリングに基づき個別にお見積もりいたします。',
        image: 'https://placehold.co/800x800/1e1e1e/ffffff.png?text=BESPOKE%0AWEBSITE',
        color: 'color-1',
        type: 'service',
        tags: ['Photo', 'AI', 'Video'],
        ctaType: 'contact',
        category: 'Bespoke Service',
        comingSoon: true,
        specs: [
            { label: 'Service Type', value: 'Full Brand Production' },
            { label: 'Deliverables', value: 'Photo / Video / Website' },
            { label: 'Price', value: '¥500,000〜 (見積り反映)' },
            { label: 'Inquiry', value: 'Required' },
        ],
    },
];

export function getProductById(id: string): Product | undefined {
    return products.find((p) => p.id === id);
}
