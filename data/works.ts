export interface VideoItem {
    id: string;
    title: string;
}

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
    videos?: VideoItem[];
    link?: string;
    linkLabel?: string;
    linkButtonText?: string;
    toolsLabel?: string;
}

export const works: Work[] = [
    {
        slug: 'mugi-promotion-video',
        title: '牟岐町プロモーション映像',
        category: 'Promotion',
        color: 'color-4',
        image: 'https://img.youtube.com/vi/dTK1UmPL8Rw/maxresdefault.jpg',
        year: '2018-',
        client: '牟岐町（徳島県）',
        role: 'ディレクション / 撮影 / 編集',
        tools: 'Sony α7SⅡ / Sony α7SⅢ / Mavic Air2 / Premiere Pro',
        youtubeId: 'dTK1UmPL8Rw',
        overview: '徳島県南部、豊かな海と山に囲まれた牟岐町の魅力を内外に発信するプロモーション映像制作。\n単なる観光スポットの紹介映像ではなく、そこに流れる「時間の豊かさ」や「人々の暮らしの温度感」を可視化することを目的としています。\n移住検討者や観光客に向けて、牟岐町特有の空気感をシネマティックに切り取り、「訪れたい場所」から「戻ってきたい場所」へと意識を繋げるストーリー構成を意識しています。',
        process: '光と空気感の追求: α7SⅢのダイナミックレンジを最大限に活かし、夜明け前の静寂や、山間に差し込む柔らかな光、透明度の高い牟岐の海をS-Log3で収録。カラーグレーディングでは、過度な装飾を避け、記憶に残るような「実直で美しい色彩」を追求しました。\n現場での対話: 台本に縛られすぎず、撮影現場で出会った住民の方々の自然な表情や、ふとした瞬間の環境音を大切にしています。ビデオグラファーとして「その場に溶け込むこと」で、作為的でない牟岐の日常を切り取っています。\nリズムと音設計: 映像のテンポを牟岐町の時間軸に合わせ、Premiere Proでの編集では「間」を意識。波の音や木々のざわめきを効果的に配置し、視聴者がその場にいるような没入感を設計しました。',
        result: '公開後、町内外の方々から「見慣れた景色がこれほどまでに美しいとは再発見だった」「牟岐の静かな力強さが伝わる」といった多くの反響をいただきました。 自治体の公式プロモーションとしての活用だけでなく、移住相談窓口でも広く拡散され、町のブランドイメージ向上に寄与。映像を通じて、牟岐町という土地が持つ「本質的な価値」を言語化・視覚化する一助となりました。',
        videos: [
            { id: 'paU7-HBI7Ng', title: '『「牟岐」と「若者たち」』 2024 牟岐町プロモーション動画' },
            { id: 'EVK8c50jFCU', title: '牟岐町プロモーション VOL.01' }
        ]
    },
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
            '/images/works/beyond-borders-prayer/1.jpg',
            '/images/works/beyond-borders-prayer/2.jpg',
            '/images/works/beyond-borders-prayer/3.jpg',
            '/images/works/beyond-borders-prayer/4.jpg',
            '/images/works/beyond-borders-prayer/5.jpg',
            '/images/works/beyond-borders-prayer/6.jpg',
            '/images/works/beyond-borders-prayer/7.jpg',
            '/images/works/beyond-borders-prayer/8.jpg',
            '/images/works/beyond-borders-prayer/9.jpg',
            '/images/works/beyond-borders-prayer/10.jpg'
        ]
    },
    {
        slug: 'mitoflow40-project',
        title: 'パーソナルヘルスケアサービス Mitoflow40',
        category: 'Personal Healthcare Service',
        color: 'color-2',
        image: '/images/works/mitoflow40/main.jpg',
        year: '2025',
        client: 'オウンドプロジェクト',
        role: '企画・開発・デザイン・運営',
        tools: '精密栄養学 / Next.js / Vercel / Wordpress / Gemini / Photoshop',
        overview: '2025年より精密栄養学の探求を開始。自身の体調不良をデータに基づく実践によって劇的に改善させた経験を機に、その知見を社会へ還元すべく「MitoFlow40」を立ち上げました。単なる感覚的なアドバイスではなく、バイオロジカルな数値に基づいたパーソナルヘルスケアの最適解を提供することを目指しています。',
        process: '徹底した「自分事」からの出発：\n自分の身体を実験台に、あらゆる栄養素の相関関係を可視化。映像制作で培った「観察眼」をデータ解析に転換し、徹底的に個人の心身に寄り添う設計を心がけました。\n\nクリエイター×エンジニアのハイブリッド構築：\nサービスの顔となるWebサイトはNext.jsで構築し、バックエンドにはAIによる解析支援を導入。最新テクノロジーと、温かみのあるライティングやビジュアルを融合させ、「心強さ」を感じるサービスデザインを目指しています。\n\n独自解析システムの開発：\n現在は、血液検査データや生活習慣の定量的データを統合し、個別に最適化されたフィードバックを自動生成する「独自のパーソナル解析システム」を開発中です。Gemini APIを活用したAI解析と、統計モデルを組み合わせることで、専門的な知見をより迅速かつ直感的にユーザーへ届ける基盤を構築実験中です。',
        result: '現在はクローズドな環境でサービスを提供しながら、着実に加入者を増やしています。 「長年の不調の理由が初めて腑に落ちた」「数値に裏打ちされたアドバイスなので迷いなく実践できる」といった声をいただいており、開発中のシステムによるデータ推移の可視化も、モチベーション維持に大きく寄与しています。',
        link: 'https://mitoflow40.com/'
    },
    {
        slug: 'mugizine-media',
        title: '牟岐町メディア MUGIZINE',
        category: 'Web Media',
        color: 'color-3',
        image: '/images/works/mugizine/main.jpg',
        year: '2018〜',
        client: '牟岐町',
        role: '企画・開発・デザイン・運営・記事執筆・編集',
        tools: 'Wordpress',
        overview: '牟岐町の移住・定住促進を目的とした自治体公式ウェブメディア。行政からの「町外へ魅力を発信したい」という要望に対し、単なる情報提供ではなく、街の真の主役である「人」にフォーカスしたWeb版ZINE（マガジン）として企画・制作しました。',
        process: 'メディアの本質は「箱（デザイン）」ではなく、そこに流れる「中身（コンテンツ）」にあると考え、あえて装飾を削ぎ落としたシンプルなUIを構築。牟岐町に生きる人々の飾らない日常や、その土地ならではのリアルな言葉を丁寧に掬い上げるため、深い対話に基づいた取材と執筆を徹底しています。',
        result: '2018年の立ち上げから現在まで欠かすことなく運営を続け、今では町を代表する広報媒体としての地位を確立。町内外に根強いファンを抱え、「更新が楽しみ」という声が多く寄せられるなど、コミュニティの記録（アーカイブ）としても重要な役割を担っています。',
        link: 'https://mugizine.jp/',
        gallery: [
            '/images/works/mugizine/1.jpg',
            '/images/works/mugizine/2.jpg',
            '/images/works/mugizine/3.jpg',
            '/images/works/mugizine/4.jpg',
            '/images/works/mugizine/5.jpg',
            '/images/works/mugizine/6.jpg'
        ]
    },
    {
        slug: 'tsurihack-media',
        title: '釣りメディア TSURIHACK',
        category: 'Outdoor / Fishing / Lifestyle',
        color: 'color-4',
        image: '/images/works/tsurihack/main.jpg',
        year: '2018 –',
        client: '株式会社スペースキー',
        role: '企画・構成・記事執筆・撮影',
        tools: 'フィールドワーク（一次情報の収集）',
        overview: '「釣りを仕事にしたい」という純粋な動機からキャリアをスタート。数あるWebメディアの中でも、アングラー（釣り人）による一次情報を極めて重視する姿勢に共感し、国内最大級の釣りメディア『TSURIHACK（ツリハック）』にライターとして参画しました。',
        process: '記事制作において最も大切にしているのは、徹底した体験ベースであることです。\n\n現場での試行錯誤:\n実際にフィールドに立ち、自ら体験した成功と失敗の両面を記述。\n\n読者目線の解像度:\n自分が苦労したポイントを深掘りすることで、読者の「知りたかった」に応える解像度の高いコンテンツ作りを徹底しています。\n\nビジュアルへのこだわり:\n文章だけでなく、現場の空気感が伝わる写真を組み合わせ、多角的な理解を促す構成を意識しました。',
        result: 'メディアの急成長期に深く関わらせていただき、現場感覚を活かした記事群は読者からも高い支持をいただきました。クライアントからは「メディアのアイデンティティ形成と継続的な成長における重要な一翼を担った」との評価をいただいており、現在まで続くクリエイティブ活動の原点となっています。',
        link: 'https://tsurihack.com/author/enigamid',
        gallery: [
            '/images/works/tsurihack/1.jpg',
            '/images/works/tsurihack/2.jpg',
            '/images/works/tsurihack/3.jpg',
            '/images/works/tsurihack/4.jpg',
            '/images/works/tsurihack/5.jpg',
            '/images/works/tsurihack/6.jpg',
            '/images/works/tsurihack/7.jpg',
            '/images/works/tsurihack/8.jpg'
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
            '/images/works/steelband-pandle/1.jpg',
            '/images/works/steelband-pandle/2.jpg',
            '/images/works/steelband-pandle/3.jpg',
            '/images/works/steelband-pandle/4.jpg',
            '/images/works/steelband-pandle/5.jpg',
            '/images/works/steelband-pandle/6.jpg',
            '/images/works/steelband-pandle/7.jpg',
            '/images/works/steelband-pandle/8.jpg'
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
            '/images/works/planetary-muffin/1.jpg',
            '/images/works/planetary-muffin/2.jpg',
            '/images/works/planetary-muffin/3.jpg',
            '/images/works/planetary-muffin/4.jpg',
            '/images/works/planetary-muffin/5.jpg',
            '/images/works/planetary-muffin/6.jpg',
            '/images/works/planetary-muffin/7.jpg',
            '/images/works/planetary-muffin/8.jpg',
            '/images/works/planetary-muffin/9.jpg',
            '/images/works/planetary-muffin/10.jpg'
        ]
    },
    {
        slug: 'family-documentary-memento',
        title: 'ムービー&フォトサービス MEMENTO',
        category: 'Family Documentary / MEMENTO',
        color: 'color-7',
        image: 'https://img.youtube.com/vi/jWOBKzFobHk/maxresdefault.jpg',
        year: '2023- ',
        client: 'オウンドサービス',
        role: 'プロデュース / 撮影 / 編集',
        tools: 'ANYWHERE',
        toolsLabel: 'Field',
        overview: 'かつて、私は子どもという存在が苦手でした。自分の娘ですら、最初は恐る恐る抱っこするような父親だったのです。しかし、おむつを替え、共に過ごす日々の中で、カメラを手に娘を追う自分に気づきました。それはまるで、かつてのアニメで見た「たまちゃんの父さん」そのものでした。\n無我夢中でシャッターを切るうちに気づいたのは、成長の喜びは私だけのものではなく、すべての親が抱く普遍的な願いだということです。\nMEMENTO（メメント）は、単なる「記録データ」を残すためのプロジェクトではありません。 過去は、その時に帰るためにあるのではなく、未来を創るための糧であると私は信じています。20年、30年後、その映像を見返した時に流れる涙が、その人の未来を支える力になる。そんな「時を越えて愛される資産」を、ご家族と共に残していきます。',
        process: '自然体の追求：日常の機微を掬い取るドキュメンタリー手法\n作り込まれたセットや不自然なポーズは必要ありません。その場所にある生活の音、刻々と移ろう光、反映と言葉にならない空気感。それらをありのままに掬い取るドキュメンタリー手法を採用しています。作為を排することで、数十年後、当時のありのままの光景を鮮明に呼び起こす記録を目指しています。\n\n視点の設計：親の愛情と、プロの構図の融合\n父親としての「主観的な愛情」と、クリエイターとしての「客観的な構図」。この二つの視点を融合させることで、撮影者としての温もりを保ちつつ、普遍的な美しさを持つ映像を追求しています。何十年後に見返したとき、当時の空気の「温度」が肌に蘇るような質感にこだわっています。\n\n非言語の物語：エディトリアルな編集\nライターとしての執筆経験を映像編集にも反映させています。テロップやナレーションといった言葉による説明に頼りすぎるのではなく、映像の繋ぎ、光のバランス、そして「間（ま）」によって感情を伝えます。余白を大切にしたエディトリアル（編集的）な表現によって、見る人がそれぞれの想いを重ねられる物語を構成します。',
        result: 'MEMENTOを通じて制作した映像は、ご家族にとってかけがえのない宝物となることはもちろん、それを目にした親世代の皆様からも「自分たちもこういう形で残しておきたかった」という深い共感をいただき続けています。\nその声に触れるたび、私たちが残しているのは単なる映像データではなく、その時、その場所に確かに存在した「愛されているという事実」なのだと確信しています。',
        youtubeId: 'jWOBKzFobHk',
        gallery: [
            '/images/works/memento/1.jpg',
            '/images/works/memento/2.jpg',
            '/images/works/memento/3.jpg',
            '/images/works/memento/4.jpg',
            '/images/works/memento/5.jpg',
            '/images/works/memento/6.jpg',
            '/images/works/memento/7.jpg',
            '/images/works/memento/8.jpg',
            '/images/works/memento/9.jpg',
            '/images/works/memento/10.jpg',
            '/images/works/memento/11.jpg'
        ]
    },
    {
        slug: 'todoroki-shrine-video',
        title: '轟神社 コンセプトムービー',
        category: 'Promotion / Archive',
        color: 'color-8',
        image: 'https://img.youtube.com/vi/wVZ6kqpEKL4/maxresdefault.jpg',
        year: '2021',
        client: '合同会社ミツグルマ',
        role: '撮影 / 編集',
        tools: 'Sony α7SⅢ / Premiere Pro',
        overview: '徳島県海陽町に位置し、四国最大の落差を誇る「轟九十九滝」を御神体とする轟神社のプロモーション・アーカイブ映像。合同会社ミツグルマからの依頼により、神社の持つ荘厳な雰囲気と、周囲を包む圧倒的な自然のエネルギーを視覚化することを目的として制作しました。単なる紹介映像に留まらず、視聴者がその場に立ち、マイナスイオンと静寂を感じられるような没入感のある表現を目指しました。',
        process: '撮影では、高ダイナミックレンジを誇るα7SⅢの特性を最大限に活かし、深い森のシャドウ部と水飛沫に反射するハイライトの階調を丁寧に捉えました。\n自然光の活用: 鬱蒼とした杉林に差し込む僅かな光を逃さず、神域の持つ神秘性を強調。\n水の描写: 滝の激しさと、対照的な水面の静けさを描き分けるため、フレームレートを使い分け、水の質感をシネマティックに表現。\n音のデザイン: 視覚情報だけでなく、現地の水音や風の音を効果的に配置。視聴者の五感に訴えかける編集を心がけました。',
        result: '完成した映像は、クライアントであるミツグルマのプラットフォームを通じて公開。地域の人間でも見落としがちな「日常の中の神聖さ」を再発見するきっかけとなり、地元の方々からも「見慣れた風景が、これほどまでに美しいとは思わなかった」との反響をいただきました。また、県外の方へ向けては、徳島の自然の深さを伝える強力なビジュアルコンテンツとして機能しています。',
        youtubeId: 'wVZ6kqpEKL4',
        link: 'https://todorokijinja.jp/',
        linkLabel: '轟神社 サイト'
    },
    {
        slug: 'tokushima-seikyo-40th-anniversary',
        title: 'とくしま生協40周年記念映像',
        category: 'Promotion / Anniversary',
        color: 'color-1',
        image: 'https://img.youtube.com/vi/tOaGVPfhhow/maxresdefault.jpg',
        year: '2024',
        client: 'とくしま生協',
        role: '撮影 / 編集',
        tools: 'Sony α7SⅢ / Premiere Pro',
        overview: '徳島県内で地域に根ざした活動を続ける「とくしま生協」様の創立40周年を記念するプロモーション映像です。 これまでの40年の歩みを振り返り、支えてくれた組合員や地域社会への感謝を伝えること、そして「次の40年」に向けたビジョンを共有することを目的として制作されました。式典での上映に加え、WebサイトやSNSでのアーカイブ発信も視野に入れた構成としています。',
        process: '自然な表情を捉えるライティングと撮影: 「人の温かさ」が伝わるよう、α7SⅢのダイナミックレンジを活かし、自然光をベースにした柔らかな質感で撮影。組合員の皆様やスタッフの方々のインタビューでは、カメラを意識させない対話形式をとり、日常の延長線上にあるリアルな笑顔を引き出すことに注力しました。\n「過去」と「未来」を繋ぐ編集: Premiere Proを使用し、膨大なアーカイブ写真と現代の撮り下ろし映像をシームレスに統合。時間軸を整理するだけでなく、徳島の美しい風景をインサートすることで、地域に密着してきた時間の積み重ねを視覚的に表現しました。\n情緒的なストーリーテリング: 単なる記録映像に留まらず、一つの「物語」として視聴者の心に残るよう、BGMの選定やカットのタイミングに細心の注意を払い、40年という歳月の重みをエモーショナルに演出しました。',
        result: '記念式典での上映時、長年活動に携わってきた組合員の方々から「当時の想いが蘇った」「これからも一緒に歩んでいきたいと感じた」といった感動の声を多くいただきました。 また、周年行事以降も「生協の理念を体現する映像」として、新規加入者向けの説明会や採用活動など、多方面でご活用いただいています。',
        youtubeId: 'tOaGVPfhhow'
    },
    {
        slug: 'matsushigate-art-project',
        title: 'マツシゲート アートプロジェクト映像',
        category: 'Archive / Promotion',
        color: 'color-3',
        image: 'https://img.youtube.com/vi/beRHCqfwqYk/maxresdefault.jpg',
        year: '2021-',
        client: '徳島県松茂町',
        role: '撮影 / 編集',
        tools: 'Sony α7SⅢ / Premiere Pro',
        overview: '徳島県松茂町の交流拠点施設「マツシゲート」を舞台に展開される、アートプロジェクトの記録・プロモーション映像です。このプロジェクトは、単なる壁画制作や展示に留まらず、アートを通じて**「町の内外の人が交差する場」**を創出することを目的としています。\n映像の役割は、完成した作品を綺麗に映すことだけではありません。アーティストの思考プロセスや、制作現場に漂う緊張感と高揚感を可視化し、地域住民がアートを「自分たちの町の出来事」として自分事化するための架け橋となることを目指しました。',
        process: 'α7SⅢの機動力を活かし、アーティストの細かな筆致や、真剣な眼差し、そこで現場を包む自然光の移ろいをドキュメンタリータッチで克明に記録しました。\n「質感」の再現： 塗料の混ざり具合やキャンバスの凹凸など、静止画では伝わりきらない「物質としてののアート」の質感をシネマティックな質感で表現しています。\nリズムとテンポ： 制作が進むにつれて加速していく現場の熱量を、編集のリズムで調整。BGMとカット割りを同期させ、視聴者がアーティストの追体験をできるような構成にこだわりました。対話の記録： 制作の合間に見せるアーティストの表情や、地域の方々との何気ない交流を差し込むことで、プロジェクトが持つ「温度感」を大切にしています。',
        result: '公開された映像は、SNSや施設内サイネージを通じて広く発信され、プロジェクトの認知度向上に大きく貢献しました。視聴者からは「制作の裏側を見ることで、作品への愛着が湧いた」「松茂町にこんなにクールな場所があるのかと驚いた」といった声が寄せられています。\n記録映像としての枠を超え、次なるアートイベントへの期待感を醸成する「動くポートフォリオ」として、町のブランディングの一翼を担う成果となりました。',
        youtubeId: 'beRHCqfwqYk',
        videos: [
            { id: 'TT_gfRCcrQQ', title: 'まつしげ竹灯りプロジェクト' },
            { id: 'Ca69BLgvWMs', title: 'まつしげSDGs トークセッションvol.1' },
            { id: '4oI752vRWNc', title: 'まつしげSDGs 藍の壁画アートセッション Vol.01' },
            { id: 'KiiaMxwiBMI', title: 'マツシゲート壁画アート' }
        ]
    },
    {
        slug: 'hl-fishing',
        title: 'HL FISHING',
        category: 'Lifestyle / Outdoor',
        color: 'color-5',
        image: 'https://img.youtube.com/vi/Iij57aSVKHs/maxresdefault.jpg',
        year: '2025-',
        client: 'オウンドプロジェクト',
        role: 'プロデュース',
        tools: 'ANYWHERE',
        toolsLabel: 'Field',
        youtubeId: 'Iij57aSVKHs',
        link: 'https://hlfishing.studio.site/',
        videos: [
            { id: 'nYmtN_0h_JQ', title: 'Lines & Lives' }
        ],
        overview: '「HL（ハイパーライト）」な装備と、それに基づいた「思考」によって、釣りの行動範囲と精神性を拡張するライフスタイル・プロジェクトです。\n単なる道具の軽量化を目指すのではなく、私たちが無意識に受け入れている「大量生産・大量消費」という現代のサイクルに対するカウンター的アプローチを本質としています。必要最小限の装備でフィールドへ向かうことで、自然との距離を縮め、ビデオグラファーとしての機動力と表現の密度を両立させることを目的としています。',
        process: '思考の軽量化： 物理的な重さを削ぎ落とすプロセスを、そのまま「情報をどう切り取るか」というクリエイティブな思考に反映。過剰な演出を排除し、その場の空気感や光の移ろいを素直に定着させることに注力しています。\nワンマンスタイルの機動力： 釣り竿とカメラ機材を同等に扱い、フィールドの奥深くへ潜り込む「ビデオグラファー・スタイル」を徹底。最小限の装備だからこそ可能になる、パーソナルで温度感のあるドキュメンタリー表現を追求しています。\nメディアの構築： 映像、写真、執筆、そしてWebサイト構築までを一貫して手がけることで、プロジェクトの世界観を純度高く発信。自身のライフスタイルとクリエイティブが地続きであることの証明として運営しています。',
        result: '表現の深化： 装備を絞ることでフィールドでの観察眼が研ぎ澄まされ、映像表現における「本質の抽出」というプロセスがより明確化されました。\n価値観の提示： 消費社会へのカウンターとしての「HL」という考え方が、同じ志を持つアングラーやクリエイター、ミニマリストから共感を得るフックとなっています。\nライフワークの確立： 趣味としての釣りと、仕事としての映像制作を「HL」という共通言語で統合。個人のパッションを起点とした持続可能な表現活動のモデルケースとなっています。',
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
