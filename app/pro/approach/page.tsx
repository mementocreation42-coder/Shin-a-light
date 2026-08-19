import type { Metadata } from 'next';
import Link from 'next/link';

const TITLE = '伝わる形は、つくる前に決まっている — 企画の考え方';
const DESCRIPTION =
    'つくったのに伝わらない、はなぜ起きるのか。受け皿から逆算するコミュニケーション設計の考え方と、徳島県牟岐町で2018年から続けている実例。';

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    alternates: {
        canonical: '/pro/approach',
    },
    openGraph: {
        title: TITLE,
        description: DESCRIPTION,
        url: '/pro/approach',
        siteName: 'Shine a Light',
        locale: 'ja_JP',
        type: 'article',
        images: ['/opengraph-image'],
    },
    twitter: {
        card: 'summary_large_image',
        title: TITLE,
        description: DESCRIPTION,
        images: ['/opengraph-image'],
    },
};

const CTA_HREF = '/?c=produce#contact';

export default function ApproachPage() {
    return (
        <article className="approach-page">
            <header className="approach-hero">
                <p className="pro-eyebrow">企画の考え方</p>
                <h1 className="approach-title">
                    伝わる形は、
                    <br />
                    つくる前に決まっている。
                </h1>
                <p className="approach-lead">
                    実際にお渡ししている企画の考え方を、そのまま公開しています。
                    発注を検討する前の、判断材料としてお使いください。
                    社内で共有していただいて構いません。
                </p>
                <p className="approach-meta">
                    Shine a Light / 小林大介 — 徳島県牟岐町
                </p>
            </header>

            <div className="approach-body">
                {/* 01 */}
                <section className="approach-section">
                    <p className="approach-no">01</p>
                    <h2 className="approach-h2">なぜ「つくったのに伝わらない」が起きるのか</h2>
                    <p>
                        映像ができた。パンフレットもできた。サイトも新しくなった。
                        それなのに、何も変わらない。
                    </p>
                    <p>
                        よくある話です。そして、たいていの場合、つくったものの質が低かったわけではありません。
                        起きているのは、もっと単純なことです。
                        <strong>見た人が、次にどこへ行けばいいのか決まっていなかった。</strong>
                    </p>
                    <p>
                        映像は人の心を動かします。ただ、動いた心には行き先が要ります。
                        「いい町だな」と思った次の瞬間に、その人が開けるドアがない。
                        だから、感動はその場で消えます。
                    </p>
                    <p>
                        制作を発注するとき、私たちは「何をつくるか」から話し始めがちです。
                        映像にするか、冊子にするか、サイトを直すか。
                        けれど順番が逆で、<strong>先に決めるべきは「受け皿」のほう</strong>です。
                    </p>
                </section>

                {/* 02 */}
                <section className="approach-section">
                    <p className="approach-no">02</p>
                    <h2 className="approach-h2">受け皿から逆算する</h2>
                    <p>
                        考える順番を、こう入れ替えます。
                    </p>
                    <ol className="approach-reverse">
                        <li>
                            <span className="approach-reverse-label">最後</span>
                            <p>
                                その人に、最終的にどうなってほしいのか。
                                移住の相談に来てほしいのか、商品を一度試してほしいのか、
                                「来年も来よう」と思ってほしいのか。ここを一つに絞ります。
                            </p>
                        </li>
                        <li>
                            <span className="approach-reverse-label">その手前</span>
                            <p>
                                そこへ行く直前、その人は何を見ているのか。
                                窓口の電話番号か、詳しい記事か、他の人の実際の声か。
                                <strong>これが受け皿です。</strong>ここが空のまま入口だけ作っても、人は落ちません。
                            </p>
                        </li>
                        <li>
                            <span className="approach-reverse-label">入口</span>
                            <p>
                                受け皿まで連れてくるのが、映像や写真の役目です。
                                ここでようやく「何をつくるか」が決まります。
                            </p>
                        </li>
                    </ol>
                    <p>
                        この順で考えると、つくるものが変わることがあります。
                        「映像を1本」の相談から始まって、映像は短いものを3本にして、
                        代わりに受け皿となる読み物を用意したほうがいい、という結論になることもある。
                    </p>
                    <p>
                        逆に言えば、<strong>受け皿を持たない制作会社は、この提案ができません。</strong>
                        つくれるものが映像だけなら、答えは映像にしかならないからです。
                    </p>
                </section>

                {/* 03 */}
                <section className="approach-section">
                    <p className="approach-no">03</p>
                    <h2 className="approach-h2">実例：徳島県牟岐町（2018年〜）</h2>
                    <p>
                        徳島県南部の、海と山に囲まれた小さな町です。
                        「町外へ魅力を発信したい」——最初の相談は、よくある一言から始まりました。
                    </p>
                    <p>
                        つくったのは、二つです。
                    </p>
                    <div className="approach-case">
                        <div className="approach-case-item">
                            <p className="approach-case-label">入口</p>
                            <h3>プロモーション映像</h3>
                            <p>
                                観光スポットの紹介ではなく、そこに流れる時間の豊かさを撮りました。
                                夜明け前の静けさ、山に差し込む光、透明度の高い海。
                                「訪れたい場所」から「戻ってきたい場所」へ、意識をつなぐ構成です。
                            </p>
                        </div>
                        <div className="approach-case-item">
                            <p className="approach-case-label">受け皿</p>
                            <h3>町のメディア「MUGIZINE」</h3>
                            <p>
                                映像で心が動いた人が、次に開けるドア。
                                景色ではなく、そこに生きている人にフォーカスしたWeb版ZINEとして企画し、
                                取材・執筆・運営まで担当しています。
                            </p>
                        </div>
                    </div>
                    <p>
                        重要なのは、これが<strong>2018年から現在まで、途切れずに続いている</strong>ことです。
                        映像は公開後、移住相談窓口でも広く拡散されました。
                        MUGIZINEは今では町を代表する広報媒体になり、
                        「更新が楽しみ」という声が町内外から届いています。
                    </p>
                    <p>
                        単発でつくって納品していたら、どちらも起きていません。
                        入口と受け皿を同じ手で、同じ時間軸で持ち続けたから、この形になりました。
                    </p>
                    <p className="approach-links">
                        <Link href="/works/mugi-promotion-video">牟岐町プロモーション映像の詳細 →</Link>
                        <Link href="/works/mugizine-media">MUGIZINE の詳細 →</Link>
                    </p>
                </section>

                {/* 04 */}
                <section className="approach-section">
                    <p className="approach-no">04</p>
                    <h2 className="approach-h2">最初の3ヶ月で、何をするか</h2>
                    <p>
                        実際にご一緒する場合、はじめの3ヶ月はこう進みます。
                        撮影に入るのは、たいてい3ヶ月目です。
                    </p>
                    <dl className="approach-months">
                        <div>
                            <dt>1ヶ月目｜聞く</dt>
                            <dd>
                                担当の方だけでなく、現場の人にも会います。
                                資料に書かれていることより、資料に書かれていないことのほうが大事です。
                                この段階では、まだ何をつくるかは決めません。
                            </dd>
                        </div>
                        <div>
                            <dt>2ヶ月目｜決める</dt>
                            <dd>
                                誰に、最終的にどうなってほしいのかを一つに絞り、受け皿から逆算した設計をお出しします。
                                ここで「つくるもの」が確定します。
                                当初のご相談と違う結論になることもあります。理由も含めてお話しします。
                            </dd>
                        </div>
                        <div>
                            <dt>3ヶ月目｜つくりはじめる</dt>
                            <dd>
                                撮影・執筆・実装に入ります。
                                企画した人間がそのまま現場に立つので、
                                2ヶ月目に決めたことが、途中で薄まりません。
                            </dd>
                        </div>
                    </dl>
                </section>

                {/* 05 */}
                <section className="approach-section">
                    <p className="approach-no">05</p>
                    <h2 className="approach-h2">この考え方が向かない場合</h2>
                    <p>正直に書いておきます。次の場合、私に頼むのは最適ではありません。</p>
                    <ul className="approach-unfit">
                        <li>
                            <strong>納期が1ヶ月を切っている。</strong>
                            設計に時間を使う進め方なので、短納期では持ち味が出ません。
                            撮って編集するだけなら、もっと速い会社があります。
                        </li>
                        <li>
                            <strong>つくるものがすでに完全に決まっている。</strong>
                            仕様が固まった発注は、それを得意とする制作会社のほうが安く、速い。
                        </li>
                        <li>
                            <strong>大規模な同時展開が必要。</strong>
                            分業しないぶん、一度に抱えられる件数は多くありません。
                            全国規模のキャンペーンは代理店の領域です。
                        </li>
                    </ul>
                    <p>
                        逆に、<strong>まだ何をつくるか決まっていない段階</strong>でご相談いただけるほど、
                        できることが増えます。いちばん困っているときが、いちばん相談のしどきです。
                    </p>
                </section>
            </div>

            {/* CTA */}
            <section className="approach-cta">
                <h2 className="approach-cta-title">続きは、お話ししながら。</h2>
                <p className="approach-cta-lead">
                    ここに書いたのは考え方だけです。実際にどうするかは、
                    その土地とその人たちを見ないと決まりません。
                    まずは一度、オンラインで聞かせてください。
                </p>
                <Link href={CTA_HREF} className="pro-cta-button">
                    相談する（無料）
                </Link>
                <p className="approach-cta-back">
                    <Link href="/pro">← ご依頼の形と費用を見る</Link>
                </p>
            </section>
        </article>
    );
}
