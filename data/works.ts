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
    link?: string;
    linkLabel?: string;
    linkButtonText?: string;
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
        role: 'ディレクション / 撮影 / 編集',
        tools: 'Sony α7sⅢ / Mavic3 Pro',
        overview: '瀬戸内海に浮かぶ、豊かな自然とアートが共鳴する島・豊島。2025年に新たに設置されたアート作品『国境を越えて・祈り』の魅力を凝縮したプロモーションムービー、およびその誕生の軌跡を克明に記録したドキュメンタリームービーの二編を制作しました。\n単なる作品紹介に留まらず、その土地に作品が根を下ろしていく過程や、作品が内包する「祈り」という静謐なエネルギーを映像へと昇華。鑑賞者に作品の背景にある物語を追体験させるような、情緒的で奥行きのある映像表現を目指しました。',
        process: '撮影は2025年のプロジェクト始動とともに開始されました。作品が完成していくダイナミズムを捉えるため、単発の撮影ではなく、設置スケジュールに合わせて最大一週間ほど島に滞在する「滞在型撮影」を実施。\n島特有の時間軸に身を置き、土地の生活に馴染むことで、刻一刻と変化する瀬戸内の光の移ろいや、制作現場の微細な熱量を丁寧に掬い上げていきました。\n\n現場での対話から生まれる偶発的な瞬間を大切にしながら、編集フェーズでは「記録」と「表現」のバランスを突き詰め、一本の映像作品としての完成度を高めました。',
        result: '制作過程から長期にわたって密着したことで、クライアントであるアミューズ様からは「完成物としての美しさだけでなく、現場の苦労や熱量までが凝縮された、ブランド価値を高めるアーカイブになった」と高い評価をいただきました。\nドキュメンタリー映像は単発の広告映像に留まらない、多角的な活用が可能なコンテンツ資産としての価値を提供しました。',
        youtubeId: 'nBt3BryfMa0',
        link: 'https://youtu.be/r9azbe4FE2M?si=IF-qhSHBf1kZ0zCf',
        linkLabel: 'Other Film Link',
        linkButtonText: 'View Documentary',
        gallery: [
            'https://img.youtube.com/vi/nBt3BryfMa0/maxresdefault.jpg',
            'https://picsum.photos/seed/pr1/800/450',
            'https://picsum.photos/seed/pr2/800/450',
            'https://picsum.photos/seed/pr3/800/450'
        ]
    },
    {
        slug: 'mitoflow40-project',
        title: 'パーソナルヘルスケアサービス Mitoflow40',
        category: 'Personal Healthcare Service',
        color: 'color-2',
        image: 'https://picsum.photos/seed/mito/800/450',
        year: '2025',
        client: 'オウンドプロジェクト',
        role: '企画・開発・デザイン・運営',
        tools: '精密栄養学 / Next.js / Vercel / Wordpress / Gemini / Photoshop',
        overview: '2025年より精密栄養学の探求を開始。自身の体調不良をデータに基づく実践によって劇的に改善させた経験を機に、その知見を社会へ還元すべく「MitoFlow40」を立ち上げました。単なる感覚的なアドバイスではなく、バイオロジカルな数値に基づいたパーソナルヘルスケアの最適解を提供することを目指しています。',
        process: '徹底した「自分事」からの出発：\n自分の身体を実験台に、あらゆる栄養素の相関関係を可視化。映像制作で培った「観察眼」をデータ解析に転換し、徹底的に個人の心身に寄り添う設計を心がけました。\n\nクリエイター×エンジニアのハイブリッド構築：\nサービスの顔となるWebサイトはNext.jsで構築し、バックエンドにはAIによる解析支援を導入。最新テクノロジーと、温かみのあるライティングやビジュアルを融合させ、「心強さ」を感じるサービスデザインを目指しています。\n\n独自解析システムの開発：\n現在は、血液検査データや生活習慣の定量的データを統合し、個別に最適化されたフィードバックを自動生成する「独自のパーソナル解析システム」を開発中です。Gemini APIを活用したAI解析と、統計モデルを組み合わせることで、専門的な知見をより迅速かつ直感的にユーザーへ届ける基盤を構築実験中です。',
        result: '現在はクローズドな環境でサービスを提供しながら、着実に加入者を増やしています。 「長年の不調の理由が初めて腑に落ちた」「数値に裏打ちされたアドバイスなので迷いなく実践できる」といった声をいただいており、開発中のシステムによるデータ推移の可視化も、モチベーション維持に大きく寄与しています。',
        link: 'https://mitoflow40.com/',
        gallery: [
            'https://picsum.photos/seed/mito1/800/450',
            'https://picsum.photos/seed/mito2/800/450',
            'https://picsum.photos/seed/mito3/800/450'
        ]
    },
    {
        slug: 'mugizine-media',
        title: '牟岐町メディア MUGIZINE',
        category: 'Web Media',
        color: 'color-3',
        image: 'https://picsum.photos/seed/mugi/800/450',
        year: '2018〜',
        client: '牟岐町',
        role: '企画・開発・デザイン・運営・記事執筆・編集',
        tools: 'Wordpress',
        overview: '牟岐町の移住・定住促進を目的とした自治体公式ウェブメディア。行政からの「町外へ魅力を発信したい」という要望に対し、単なる情報提供ではなく、街の真の主役である「人」にフォーカスしたWeb版ZINE（マガジン）として企画・制作しました。',
        process: 'メディアの本質は「箱（デザイン）」ではなく、そこに流れる「中身（コンテンツ）」にあると考え、あえて装飾を削ぎ落としたシンプルなUIを構築。牟岐町に生きる人々の飾らない日常や、その土地ならではのリアルな言葉を丁寧に掬い上げるため、深い対話に基づいた取材と執筆を徹底しています。',
        result: '2018年の立ち上げから現在まで欠かすことなく運営を続け、今では町を代表する広報媒体としての地位を確立。町内外に根強いファンを抱え、「更新が楽しみ」という声が多く寄せられるなど、コミュニティの記録（アーカイブ）としても重要な役割を担っています。',
        link: 'https://mugizine.jp/',
        gallery: [
            'https://picsum.photos/seed/mugi1/800/450',
            'https://picsum.photos/seed/mugi2/800/450',
            'https://picsum.photos/seed/mugi3/800/450'
        ]
    },
    {
        slug: 'tsurihack-media',
        title: '釣りメディア TSURIHACK',
        category: 'Outdoor / Fishing / Lifestyle',
        color: 'color-4',
        image: 'https://picsum.photos/seed/tsuri/800/450',
        year: '2018 –',
        client: '株式会社スペースキー',
        role: '企画・構成・記事執筆・撮影',
        tools: 'フィールドワーク（一次情報の収集）',
        overview: '「釣りを仕事にしたい」という純粋な動機からキャリアをスタート。数あるWebメディアの中でも、アングラー（釣り人）による一次情報を極めて重視する姿勢に共感し、国内最大級の釣りメディア『TSURIHACK（ツリハック）』にライターとして参画しました。',
        process: '記事制作において最も大切にしているのは、徹底した体験ベースであることです。\n\n現場での試行錯誤:\n実際にフィールドに立ち、自ら体験した成功と失敗の両面を記述。\n\n読者目線の解像度:\n自分が苦労したポイントを深掘りすることで、読者の「知りたかった」に応える解像度の高いコンテンツ作りを徹底しています。\n\nビジュアルへのこだわり:\n文章だけでなく、現場の空気感が伝わる写真を組み合わせ、多角的な理解を促す構成を意識しました。',
        result: 'メディアの急成長期に深く関わらせていただき、現場感覚を活かした記事群は読者からも高い支持をいただきました。クライアントからは「メディアのアイデンティティ形成と継続的な成長における重要な一翼を担った」との評価をいただいており、現在まで続くクリエイティブ活動の原点となっています。',
        link: 'https://tsurihack.com/author/enigamid',
        gallery: [
            'https://picsum.photos/seed/tsuri1/800/450',
            'https://picsum.photos/seed/tsuri2/800/450',
            'https://picsum.photos/seed/tsuri3/800/450'
        ]
    },
    {
        slug: 'steelband-pandle',
        title: 'スティールバンド パンドル｜Expo 2025 Live Performance',
        category: 'Event Movie / Documentary',
        color: 'color-5',
        image: 'https://img.youtube.com/vi/EILMCYSX3tE/maxresdefault.jpg',
        year: '2025',
        client: 'スティールバンド パンドル',
        role: 'ディレクション / 撮影 / 編集',
        tools: 'α7S III, α7 IV, Premiere Pro',
        overview: '2025年大阪・関西万博への参画を記念し、その雄姿を後世に残すための映像制作をご依頼いただきました。 単独での視聴に適した「ミュージックビデオ・スタイルの2曲」に加え、1時間に及ぶ「2ステージ分のフルライブ記録映像」を制作。万博という特別な舞台の空気感を、余すことなくパッケージングすることを目指しました。',
        process: '本プロジェクトの最大の特徴は、これらすべての工程を**「ワンマンオペレーション」**で完遂した点にあります。 限られたリソースの中でライブの躍動感を最大化するため、自身のメイン機（α7S III / α7 IV）による撮影に加え、数名のスタッフにiPhoneでのサブカメラ撮影を依頼。これまでの現場経験をフルに活かし、複数の視点を巧みにスイッチング・編集することで、ワンマンとは思えない多角的な映像表現を実現しました。',
        result: '納品後、クライアント様からは「あの日の熱狂が鮮明に蘇る」と大変高い評価をいただきました。「記録としてプロに依頼して本当に良かった」というお言葉をいただき、グループにとっての大切な節目に、映像という形で深く寄与することができました。',
        youtubeId: 'EILMCYSX3tE',
        gallery: [
            'https://img.youtube.com/vi/EILMCYSX3tE/maxresdefault.jpg',
            'https://picsum.photos/seed/pandle2/800/450',
            'https://picsum.photos/seed/pandle3/800/450'
        ]
    },
    {
        slug: 'planetary-muffin',
        title: 'プラネタリーマフィン ビジュアル戦略',
        category: 'Branding / Video production / Photography',
        color: 'color-2',
        image: 'https://img.youtube.com/vi/7dMyN_6mbVI/maxresdefault.jpg',
        year: '2025',
        client: 'プラネタリーマフィン（Planetary Muffin）',
        role: 'ディレクション・映像制作・スチール撮影・ビジュアル戦略',
        tools: 'Sony α7sⅢ, α7Ⅳ, Adobe Premiere Pro',
        overview: '徳島で親しまれているマフィンショップ「プラネタリーマフィン」のブランドアイデンティティを再定義するためのビジュアル制作プロジェクト。\n\n単発のプロモーションビデオ制作にとどまらず、映像と静止画を組み合わせた「継続的に使い続けられるビジュアルコミュニケーション戦略」を立案しました。マフィンを特別な日の贅沢ではなく、あくまで「生活の延長線上にある豊かさ」として再構築し、SNSやウェブサイトを通じて一貫した世界観を届けることを目的としています。',
        process: '本プロジェクトの最大の核心は、「店主のプライベートな生活感を抑えつつ、生活の地続きにあるマフィンの存在をどう描くか」というバランスの追求にありました。\n\n「生活感」の取捨選択：\n店主の日常の気配を消しすぎると、ブランドの温かみが失われてしまいます。一方で、生活感が出すぎると、マフィンが持つ「非日常の楽しみ」が損なわれる。この境界線を引くために、光の角度やフレーミング、背景のノイズを徹底的に排除し、マフィンとそれを取り巻く「時間」だけを抽出するシネマティックなトーンを構築しました。\n\n物語の接続への苦悩と解決：\n「生活の断片」をどのように繋げれば、観る人が違和感なくその世界に没入できるか。編集段階では、物語のテンポ（リズム）に最も腐心しました。生活のルーティンを淡々と、しかし美しく切り取ることで、結果として「日常のなかでマフィンが焼かれ、誰かの手に渡る」という流れを、一つの必然性を持った物語へと昇華させることができました。\n\n静止画を含めた多角的な展開：\n映像のトーンと完全に同期させた静止画も併せて撮影。これにより、Webサイト、Instagram、リーフレットなど、あらゆる接点でブランドイメージが揺らぐことなく、長期的な発信を可能にする資産を提供しました。',
        result: 'クライアント様からは「自分たちが大切にしている空気感が、言葉にできないほど美しく可視化された。本当に撮ってもらってよかった」という、クリエイターとしてこの上ない評価をいただきました。\n\n映像公開後、ビジュアルのトーンが統一されたことで、既存ファンとのエンゲージメントが深化。同時に、ブランドの質感を重視する新たな客層への認知も着実に広がっています。\n\n撮影した静止画や映像は、日々のSNS発信といったオンラインの活動に留まらず、マルシェやポップアップイベントなどのリアルな現場でも活用されています。店内のモニターでの上映やパネル・お品書きへの展開など、オフラインにおいても「ブランドの世界観を瞬時に伝えるメディア」として、現在も継続的に運用されています。',
        youtubeId: '7dMyN_6mbVI',
        gallery: [
            'https://img.youtube.com/vi/7dMyN_6mbVI/maxresdefault.jpg',
            'https://picsum.photos/seed/muffin2/800/450',
            'https://picsum.photos/seed/muffin3/800/450'
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
