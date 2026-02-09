export interface Work {
    slug: string;
    title: string;
    category: string;
    color: string;
    image: string;
    year: string;
    client: string;
    role: string;
    tools: string;
    overview: string;
    process: string;
    result: string;
    vimeoId?: string;
    youtubeId?: string;
    gallery?: string[];
}

export const works: Work[] = [
    {
        slug: 'beyond-borders-prayer',
        title: '国境を越えて・祈り',
        category: 'Promotion / Documentary',
        color: 'color-6',
        image: 'https://img.youtube.com/vi/nBt3BryfMa0/maxresdefault.jpg',
        year: '2025',
        client: '株式会社アミューズ',
        role: 'Direction / Filming / Editing',
        tools: 'Sony α7sⅢ / Mavic3 Pro',
        overview: '瀬戸内海に浮かぶ、豊かな自然とアートが共鳴する島・豊島。2025年に新たに設置されたアート作品『国境を越えて・祈り』の魅力を凝縮したプロモーションムービー、およびその誕生の軌跡を克明に記録したドキュメンタリームービーの二編を制作しました。\n単なる作品紹介に留まらず、その土地に作品が根を下ろしていく過程や、作品が内包する「祈り」という静謐なエネルギーを映像へと昇華。鑑賞者に作品の背景にある物語を追体験させるような、情緒的で奥行きのある映像表現を目指しました。',
        process: '撮影は2025年のプロジェクト始動とともに開始されました。作品が完成していくダイナミズムを捉えるため、単発の撮影ではなく、設置スケジュールに合わせて最大一週間ほど島に滞在する「滞在型撮影」を実施。\n島特有の時間軸に身を置き、土地の生活に馴染むことで、刻一刻と変化する瀬戸内の光の移ろいや、制作現場の微細な熱量を丁寧に掬い上げていきました。\n\n現場での対話から生まれる偶発的な瞬間を大切にしながら、編集フェーズでは「記録」と「表現」のバランスを突き詰め、一本の映像作品としての完成度を高めました。',
        result: '制作過程から長期にわたって密着したことで、クライアントであるアミューズ様からは「完成物としての美しさだけでなく、現場の苦労や熱量までが凝縮された、ブランド価値を高めるアーカイブになった」と高い評価をいただきました。\nドキュメンタリー映像は単発の広告映像に留まらない、多角的な活用が可能なコンテンツ資産としての価値を提供しました。',
        youtubeId: 'nBt3BryfMa0',
        gallery: [
            'https://img.youtube.com/vi/nBt3BryfMa0/maxresdefault.jpg',
            'https://picsum.photos/seed/pr1/800/450',
            'https://picsum.photos/seed/pr2/800/450',
            'https://picsum.photos/seed/pr3/800/450'
        ]
    },
    {
        slug: 'documentary-tokushima',
        title: 'Tokushima: River & Mountain',
        category: 'Documentary Film',
        color: 'color-1',
        image: '/images/works/documentary.png',
        year: '2024',
        client: 'Self Project',
        role: 'Director / Cinematographer / Editor',
        tools: 'Sony FX3 / DaVinci Resolve',
        overview: '徳島の原風景を求めて山々と川を巡る短編ドキュメンタリー。自然と人間の共生をテーマに、光と影のコントラストを重視したシネマティックな映像表現を追求しました。',
        process: '3ヶ月にわたるロケハンを経て、最も光が美しい早朝と夕暮れ時を狙って撮影を実施。グレーディングでは、空気感を損なわない自然な色味をベースにしつつ、深い緑と透明感のある水の色を強調しました。',
        result: '地元の観光協会から高い評価を受け、地域の魅力を再発見する資料として活用されることになりました。',
        vimeoId: '8248030', // Sample Vimeo ID (Ableton video for placeholder consistency)
        gallery: [
            '/images/works/documentary.png',
            'https://picsum.photos/seed/doc1/800/450',
            'https://picsum.photos/seed/doc2/800/450',
            'https://picsum.photos/seed/doc3/800/450'
        ]
    },
    {
        slug: 'creative-portfolio-site',
        title: 'Creative Studio Portfolio',
        category: 'Web Design',
        color: 'color-2',
        image: '/images/works/web-design.png',
        year: '2024',
        client: 'Creative Agency A',
        role: 'Lead Designer / Frontend Developer',
        tools: 'Figma / Next.js / Framer Motion',
        overview: '「クリエイティビティの解放」をコンセプトにした、エージェンシーのポートフォリオサイト。タイポグラフィとグリッドシステムを大胆に使い、情報の視認性と遊び心を両立させました。',
        process: 'Abletonのフラットなデザインにインスパイアされ、装飾を最小限に抑えつつ、インタラクションによって洗練された印象を与えるように設計。Framer Motionを用いたスムーズな画面遷移を実装しました。',
        result: 'サイト公開後、問い合わせ件数が前年比で150%増加し、ブランドイメージの向上に大きく寄与しました。',
        gallery: [
            '/images/works/web-design.png',
            'https://picsum.photos/seed/web1/800/450',
            'https://picsum.photos/seed/web2/800/450',
            'https://picsum.photos/seed/web3/800/450'
        ]
    },
    {
        slug: 'street-photography-series',
        title: 'Quiet Moments in Japan',
        category: 'Photography',
        color: 'color-3',
        image: '/images/works/photography.png',
        year: '2023',
        client: 'Personal Exhibition',
        role: 'Photographer',
        tools: 'Leica Q2 / Lightroom',
        overview: '日本の地方都市の何気ない日常の中にある「静寂」を切り取った写真集。夕暮れ時の淡い光が作り出すノスタルジックな雰囲気を捉えています。',
        process: '特定の演出は行わず、街の呼吸を感じながら歩き、心が動いた瞬間をシャッターに収めました。編集ではフィルムのような質感を意識し、粒子感と色転びを微細に調整しました。',
        result: '都内のギャラリーで個展を開催し、多くの来場者から「懐かしさと新しさの共存」という感想をいただきました。',
        gallery: [
            '/images/works/photography.png',
            'https://picsum.photos/seed/photo1/800/450',
            'https://picsum.photos/seed/photo2/800/450',
            'https://picsum.photos/seed/photo3/800/450'
        ]
    },
    {
        slug: 'branding-identity-system',
        title: 'Eco-Friendly Start-up Branding',
        category: 'Branding',
        color: 'color-4',
        image: '/images/works/branding.png',
        year: '2023',
        client: 'Green Solutions Inc.',
        role: 'Art Director',
        tools: 'Illustrator / Photoshop / InDesign',
        overview: '環境負荷を最小限に抑えた製品を展開するスタートアップ企業のトータルブランディング。信頼感と透明性を表現するため、クリーンな配色とミニマルなロゴデザインを採用しました。',
        process: 'クライアントとのワークショップを重ね、コアバリューである「循環」をシンボルマークに落とし込みました。名刺やパッケージは再生紙の使用を前提にデザインされています。',
        result: 'ブランドガイドラインの策定により、社内外でのコミュニケーションが円滑になり、シリーズAの資金調達にも成功しました。',
        gallery: [
            '/images/works/branding.png',
            'https://picsum.photos/seed/brand1/800/450',
            'https://picsum.photos/seed/brand2/800/450',
            'https://picsum.photos/seed/brand3/800/450'
        ]
    },
    {
        slug: 'motion-graphics-showcase',
        title: 'Abstract Motion Studies',
        category: 'Motion Graphics',
        color: 'color-5',
        image: '/images/works/motion.png',
        year: '2024',
        client: 'Self Directed',
        role: 'Motion Designer',
        tools: 'After Effects / Cinema 4D',
        overview: '幾何学的な形状と光の動きが音楽と同期する、視覚的な叙事詩としてのモーショングラフィックス。音の波形を数学的に解析し、それを形状の変化に変換する実験的な試みです。',
        process: 'サウンドトラックを先に制作し、その周波数帯域ごとにアニメーションのパラメータを紐付けました。レンダリングには数日間を費やし、質感のディテールにまでこだわりました。',
        result: 'Vimeo Staff Pick に選出され、世界中のクリエイターから注目を集めるプロジェクトとなりました。',
        youtubeId: 'dQw4w9WgXcQ', // Placeholder
        gallery: [
            '/images/works/motion.png',
            'https://picsum.photos/seed/mot1/800/450',
            'https://picsum.photos/seed/mot2/800/450',
            'https://picsum.photos/seed/mot3/800/450'
        ]
    },
];

export function getWorkBySlug(slug: string): Work | undefined {
    return works.find((work) => work.slug === slug);
}

export function getAdjacentWorks(slug: string): { prev: Work | null; next: Work | null } {
    const index = works.findIndex((work) => work.slug === slug);
    return {
        prev: index > 0 ? works[index - 1] : works[works.length - 1],
        next: index < works.length - 1 ? works[index + 1] : works[0],
    };
}
