import Image from 'next/image';

export default function About() {
    return (
        <section id="about" className="section">
            <div className="section-inner narrow">
                <div className="section-header">
                    <h2>About</h2>
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

                        <p className="profile-bio">
                            近年は個々の制作スキルを束ね、企画から発信までを一貫して設計するプロデュースへと軸足を移している。撮る・書く・つくるを分業に預けず自らの手で通すからこそ、土地やブランドが本来もつ物語を、歪めずに立ち上げられる。まだ光の当たっていない人や営みを見つけ、それが最も映える形に編集して世に手渡す——その一連をまるごと引き受けることが、いまの活動の核になっている。
                        </p>

                    </div>
                </div>
            </div>
        </section >
    );
}
