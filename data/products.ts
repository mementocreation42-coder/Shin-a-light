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
}

export const products: Product[] = [
    {
        id: 'free-photo-preset',
        name: 'Free Photo Preset',
        price: 0,
        description: 'お試し用の無料フォトプリセット（XMP）。',
        details: 'Shine a Lightのレタッチを手軽に体験できる無料のフォトプリセットです。\n\nメールアドレスをご登録いただくと、そのままダウンロードが開始されます。LightroomやCamera Rawでの写真編集にご活用ください。',
        image: 'https://placehold.co/800x800/58d8d8/1e1e1e.png?text=FREE+PHOTO%0APRESET',
        color: 'color-5',
        type: 'digital',
        downloadPath: '/downloads/free-photo-preset.xmp',
        tags: ['フォト'],
        ctaType: 'download',
        specs: [
            { label: 'Format', value: 'XMP (Lightroom / Camera Raw)' },
            { label: 'Contents', value: '1 Free Sample Preset' },
            { label: 'Compatibility', value: 'Lightroom / Mobile / Camera Raw' },
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
        tags: ['フォト', 'AI'],
        ctaType: 'download',
        specs: [
            { label: 'Format', value: 'Markdown (.md)' },
            { label: 'Topic', value: 'Photography Vision / Creative Mindset' },
            { label: 'Category', value: 'Photography Knowledge' },
            { label: 'Delivery', value: 'Direct Download' },
        ],
    },
    {
        id: 'premium-portrait-preset',
        name: 'Premium Portrait Preset Pack',
        price: 2500,
        description: 'ポートレート写真に特化した高品質なXMPプリセット。',
        details: '肌のトーンを自然で美しく保ちながら、背景をシネマティックに仕上げるポートレート専用のLightroomプリセットパック。\n\n屋内・屋外、ストロボ・自然光など様々なシーンに合わせた10種類のプリセットを収録しています。',
        image: 'https://placehold.co/800x800/b38bdd/1e1e1e.png?text=PORTRAIT%0APRESET',
        color: 'color-6',
        type: 'digital',
        tags: ['フォト'],
        ctaType: 'buy',
        specs: [
            { label: 'Format', value: 'XMP (Lightroom / Camera Raw)' },
            { label: 'Contents', value: '10 presets' },
            { label: 'Delivery', value: 'Digital Download' },
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
        tags: ['フォト'],
        ctaType: 'buy',
        specs: [
            { label: 'Color', value: 'Black' },
            { label: 'Material', value: 'Nylon / Leather' },
            { label: 'Delivery Time', value: '3〜5 Days' },
        ],
    },
    {
        id: 'web-production-teaching',
        name: 'オンライン完結型Webサイト制作（教える側）',
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
        specs: [
            { label: 'Service Type', value: 'Web Design Mentoring' },
            { label: 'Duration', value: '1 Month' },
            { label: 'Format', value: 'Online Meeting (4 sessions)' },
        ],
    },
    {
        id: 'lp-production-building',
        name: 'LP制作（作る側）',
        price: 129800,
        description: '商品やサービスの魅力を最大限に伝えるランディングページ（LP）制作プラン。',
        details: 'ヒアリングからデザイン、コーディング、公開までを全てお任せいただける本格的なLP制作プランです。\n\nターゲット層の分析や競合リサーチに基づき、成約率（コンバージョン）を高めるための構成とデザインをご提案します。スマートフォン対応（レスポンシブ）も含みます。',
        image: 'https://placehold.co/800x800/87d37c/1e1e1e.png?text=LP%0APRODUCTION',
        color: 'color-4',
        type: 'service',
        tags: ['AI'],
        ctaType: 'buy',
        specs: [
            { label: 'Service Type', value: 'LP Design & Development' },
            { label: 'Delivery Time', value: '3〜4 Weeks' },
            { label: 'Format', value: 'Online Meeting & Custom Handover' },
        ],
    },
    {
        id: 'video-production-plan',
        name: 'ハイエンド映像制作',
        price: 199800,
        description: '企画から編集まで、映画のようなクオリティで制作するハイエンド映像プラン。',
        details: 'ブランドムービー、プロモーションビデオ、インタビュー動画など、目的やターゲットに合わせて最適なストーリー構築から撮影、カラーグレーディング、編集までを一貫して行います。\n\nプロフェッショナルな機材と映像制作の専門知識を駆使し、視聴者の心を動かす最高峰の映像体験を提供します。',
        image: 'https://placehold.co/800x800/5eb5f7/1e1e1e.png?text=VIDEO%0APRODUCTION',
        color: 'color-2',
        type: 'service',
        tags: ['ビデオ'],
        ctaType: 'buy',
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
        description: '映像制作、スチール撮影、Web構築をすべて一貫して行う、最高級のブランド構築プラン。',
        details: '静止画や動画の素材撮影から、それらを最大限に活かすWebサイトの構築までを一貫してプロデュースします。\n\n「企業の顔」となるコーポレートサイトや、ブランドの世界観を五感で伝えるスペシャルサイトなど、唯一無二のデジタル体験をオーダーメイドで制作。ヒアリングに基づき個別にお見積もりいたします。',
        image: 'https://placehold.co/800x800/1e1e1e/ffffff.png?text=BESPOKE%0AWEBSITE',
        color: 'color-1',
        type: 'service',
        tags: ['フォト', 'AI', 'ビデオ'],
        ctaType: 'contact',
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
