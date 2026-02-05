import Image from 'next/image';

export default function About() {
    const roles = [
        '精密栄養学',
        '血液検査データ解析',
        'ヘルスケアカウンセリング',
        'システム構築',
        'AIワークフロー構築',
        'Web制作',
        'フロントエンド実装',
        '映像制作',
        '写真撮影',
        'インタビュー・取材',
        '記事執筆',
        'フィッシング',
        'ハンティング',
    ];

    return (
        <section id="about" className="section">
            <div className="section-inner">
                <div className="section-header">
                    <span className="section-number">01</span>
                    <h2>About</h2>
                </div>

                {/* Philosophy */}
                <div className="about-philosophy">
                    <p className="philosophy-lead">影ある所に必ず光がある。</p>

                    <div className="philosophy-text">
                        <p>
                            &quot;Shine a Light&quot;とはThe Rolling
                            Stonesのアルバム『メイン・ストリートのならず者』に収録されている楽曲のタイトル。僕はこの曲や言葉の響きがとても好きで、自分のクリエティブ活動を&quot;Shine
                            a Light&quot;と名付けることにしました。
                        </p>

                        <p>
                            なぜならカメラを使い、映像や写真を撮る際に必ず必要になってくるのが光です。光がないと何も撮れません。そして&quot;人生の真理&quot;としても非常に重要なファクターとも言えますが、それと同時に無視できないのが影の存在です。
                        </p>

                        <p>
                            光と影は表裏一体であり、東から太陽が昇れば西に沈むことと同じで自然の摂理です。僕は光があたっている部分だけを見ようとするのではなく、影を見たい。そしてその影を撮ることで照らしていきたい。そう考えているのです。
                        </p>

                        <p>僕のクリエティブ活動では常にそうありたいと考えているのです。</p>
                    </div>
                </div>

                {/* Profile */}
                <div className="about-profile">
                    <div className="profile-visual">
                        <div className="visual-block-image">
                            <Image
                                src="/images/profile.jpg"
                                alt="DAISUKE KOBAYASHI"
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                        <div className="profile-actions">
                            <a href="/journal" className="profile-btn journal">
                                Journal
                            </a>
                            <a href="/chronicle" className="profile-btn chronicle">
                                Chronicle
                            </a>
                        </div>
                    </div>
                    <div className="profile-info">
                        <p className="profile-name-en">DAISUKE KOBAYASHI</p>
                        <p className="profile-name-ja">小林 大介</p>

                        <p className="profile-titles">
                            1980年生まれ 愛知県一宮市出身 徳島県在住
                        </p>

                        <p className="profile-bio">
                            愛知県からオーストラリア生活を経て「釣りがしたいから」を理由に四国徳島県に定住。映像制作を中心に写真撮影、執筆、ウェブ製作などマルチに活動。映画、音楽、漫画などのサブカルチャーを幼少の頃から好み、多大な影響を受けたことがクリエイティブな表現への原動力となっている。
                        </p>

                        <div className="profile-roles-grid">
                            {roles.map((role) => (
                                <span key={role} className="role-tag">
                                    {role}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section >
    );
}
