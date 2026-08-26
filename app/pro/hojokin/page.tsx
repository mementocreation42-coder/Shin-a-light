import type { Metadata } from 'next';
import Link from 'next/link';
import {
    HOJOKIN_PAGE_UPDATED,
    LEVEL_ORDER,
    effectiveStatus,
    formatDate,
    formatYen,
    nextCutoff,
    publishedHojokin,
    type EligibilityFlag,
    type Hojokin,
    type WindowStatus,
} from '@/data/hojokin';

// 締切を過ぎた行を自動で「終了」に落とすため、1日1回再生成する
export const revalidate = 86400;

const TITLE = '徳島で動画・Webに使える補助金 — 徳島県の事業者向け一覧';
const DESCRIPTION =
    '徳島県内の事業者が、動画制作・ホームページ制作・SNS 発信・チラシに使える補助金を、国・県・市町村の一次資料から要約した一覧。締切・補助率・上限・窓口つき。';

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    alternates: {
        canonical: '/pro/hojokin',
    },
    openGraph: {
        title: TITLE,
        description: DESCRIPTION,
        url: '/pro/hojokin',
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

const CTA_HREF = '/pro/contact';

const LEVEL_LABEL: Record<Hojokin['level'], string> = {
    国: '国の補助金',
    県: '徳島県の補助金',
    市町村: '市町村の補助金',
};

const STATUS_CLASS: Record<WindowStatus, string> = {
    公募中: 'is-open',
    予告: 'is-upcoming',
    終了: 'is-closed',
    不明: 'is-unknown',
};

const FLAG_CLASS: Record<EligibilityFlag, string> = {
    '○': 'is-yes',
    '△': 'is-maybe',
    '×': 'is-no',
    未確認: 'is-unknown',
};

export default function HojokinPage() {
    const today = new Date();
    const rows = publishedHojokin(today);
    const openCount = rows.filter((h) => effectiveStatus(h, today) === '公募中').length;
    const upcomingCount = rows.filter((h) => effectiveStatus(h, today) === '予告').length;

    return (
        <div className="pro-page hojokin-page">
            {/* 1. ヒーロー */}
            <header className="pro-hero hojokin-hero">
                <p className="b-side-mark">B-side of Shine a Light</p>
                <p className="pro-eyebrow">For clients — 補助金対応</p>
                <h1 className="pro-hero-title">
                    徳島で、
                    <br />
                    動画・Webに使える補助金。
                </h1>
                <p className="pro-hero-lead">
                    徳島県内の事業者が、動画制作・ホームページ制作・SNS
                    発信・チラシに使える補助金を、国・県・市町村の公募要領から要約しました。
                    「制作費の半分〜2/3 が戻る」制度は、知っているかどうかで結果が変わります。
                </p>
                <dl className="hojokin-summary">
                    <div>
                        <dt>公募中</dt>
                        <dd>{openCount}件</dd>
                    </div>
                    <div>
                        <dt>受付予定</dt>
                        <dd>{upcomingCount}件</dd>
                    </div>
                    <div>
                        <dt>最終確認</dt>
                        <dd>{HOJOKIN_PAGE_UPDATED.replace(/-/g, '.')}</dd>
                    </div>
                </dl>
                <p className="hojokin-hero-note">
                    各制度の公表資料（一次資料）を読んで書いています。二次情報のまとめサイトからは転載していません。
                    要項は年度ごとに変わるため、申請前に必ず出典リンク先を確認してください。
                </p>
            </header>

            {/* 2. 凡例 */}
            <section className="pro-section hojokin-legend-section">
                <div className="pro-inner">
                    <div className="hojokin-legend">
                        <p className="hojokin-legend-title">見方</p>
                        <ul>
                            <li>
                                <span className="hojokin-flag is-yes">○</span>
                                対象経費として要項に明記されている
                            </li>
                            <li>
                                <span className="hojokin-flag is-maybe">△</span>
                                読み方次第。窓口に確認してから使う
                            </li>
                            <li>
                                <span className="hojokin-flag is-no">×</span>
                                対象外
                            </li>
                        </ul>
                        <p className="hojokin-legend-foot">
                            「動画」は映像制作、「Web」はホームページ・EC・LP の制作や改修を指します。
                            持続化補助金と県の補助金は、交付決定（採択の通知）より前に発注したものは対象になりません。
                            市町村の制度は要領の定めに従います（注意点に書いています）。
                        </p>
                    </div>
                </div>
            </section>

            {/* 3. 早見表 — 全制度を1画面で見渡す。行クリックで下の詳細カードへ */}
            <section className="pro-section hojokin-matrix-section">
                <div className="pro-inner">
                    <h2 className="pro-heading">早見表</h2>
                    <p className="pro-sub">全{rows.length}制度をひと目で。行をクリックすると詳細に飛びます。</p>
                    <div className="hojokin-matrix-scroll">
                        <table className="hojokin-matrix">
                            <thead>
                                <tr>
                                    <th>実施</th>
                                    <th>制度</th>
                                    <th>状態</th>
                                    <th>動画</th>
                                    <th>Web</th>
                                    <th>補助率</th>
                                    <th>上限</th>
                                    <th>締切</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((h) => {
                                    const status = effectiveStatus(h, today);
                                    const cutoff = nextCutoff(h);
                                    return (
                                        <tr key={h.id} className={STATUS_CLASS[status]}>
                                            <td className="mx-issuer">{h.issuer.replace('公益財団法人', '').replace(/（.*$/, '')}</td>
                                            <td className="mx-name">
                                                <a href={`#${h.id}`}>{h.name}</a>
                                            </td>
                                            <td>
                                                <span className={`hojokin-status ${STATUS_CLASS[status]}`}>{status}</span>
                                            </td>
                                            <td><span className={`hojokin-flag ${FLAG_CLASS[h.video]}`}>{h.video === '未確認' ? '?' : h.video}</span></td>
                                            <td><span className={`hojokin-flag ${FLAG_CLASS[h.web]}`}>{h.web === '未確認' ? '?' : h.web}</span></td>
                                            <td className="mx-rate">{h.rate.split('（')[0]}</td>
                                            <td className="mx-cap">{h.cap != null ? formatYen(h.cap) : '—'}</td>
                                            <td className="mx-deadline">
                                                {status === '終了' ? '—' : cutoff ? cutoff.date.replace(/^\d{4}-/, '').replace('-', '/') : '随時'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <p className="hojokin-matrix-note">
                        ？は一次資料で未確認。締切の「随時」は予算がなくなり次第終了する制度です。
                    </p>
                </div>
            </section>

            {/* 4. 一覧（国 → 県 → 市町村。市町村は自治体ごとにセクションを分ける） */}
            {LEVEL_ORDER.flatMap((level) => {
                const items = rows.filter((h) => h.level === level);
                if (items.length === 0) return [];
                // 市町村は実施主体（自治体）ごとに分ける。並びは rows の順（公募中が先）を保つ
                let groups: { key: string; heading: string; list: typeof items }[];
                if (level === '市町村') {
                    const byIssuer = new Map<string, typeof items>();
                    for (const h of items) {
                        if (!byIssuer.has(h.issuer)) byIssuer.set(h.issuer, []);
                        byIssuer.get(h.issuer)!.push(h);
                    }
                    groups = [...byIssuer.entries()].map(([issuer, list]) => ({
                        key: `${level}-${issuer}`,
                        heading: `${issuer}の補助金`,
                        list,
                    }));
                } else {
                    groups = [{ key: level, heading: LEVEL_LABEL[level], list: items }];
                }
                return groups.map(({ key, heading, list }) => (
                    <section key={key} className="pro-section hojokin-level">
                        <div className="pro-inner">
                            <h2 className="pro-heading">{heading}</h2>
                            <ul className="hojokin-list">
                                {list.map((h) => (
                                    <HojokinCard key={h.id} h={h} today={today} />
                                ))}
                            </ul>
                        </div>
                    </section>
                ));
            })}

            {/* 4. 使い方 */}
            <section className="pro-section">
                <div className="pro-inner">
                    <h2 className="pro-heading">補助金を使って制作する場合の進め方</h2>
                    <p className="pro-sub">順番を間違えると対象外になります。最初に相談してください。</p>
                    <ol className="pro-steps">
                        <li className="pro-step">
                            <span className="pro-step-no">01</span>
                            <div className="pro-step-body">
                                <h3 className="pro-step-title">制度を決める</h3>
                                <p>
                                    上の一覧から、対象者・締切・目的（販路開拓か採用か創業か）が合うものを選びます。
                                    迷ったら、どれが合うかの整理からお手伝いします。
                                </p>
                            </div>
                        </li>
                        <li className="pro-step">
                            <span className="pro-step-no">02</span>
                            <div className="pro-step-body">
                                <h3 className="pro-step-title">企画と見積をつくる</h3>
                                <p>
                                    申請書には「何をつくり、誰にどう届けるか」と見積書が要ります。
                                    計画の制作部分と見積書、要項に沿った経費の振り分けはこちらで用意します。
                                </p>
                            </div>
                        </li>
                        <li className="pro-step">
                            <span className="pro-step-no">03</span>
                            <div className="pro-step-body">
                                <h3 className="pro-step-title">商工会・役場に申請する</h3>
                                <p>
                                    申請の主体は事業者ご自身です。持続化補助金は商工会の「事業支援計画書（様式4）」が申請締切より先に閉まります。
                                    市町村の創業補助金には先着順のものが多く、枠が埋まり次第終わります。
                                </p>
                            </div>
                        </li>
                        <li className="pro-step">
                            <span className="pro-step-no">04</span>
                            <div className="pro-step-body">
                                <h3 className="pro-step-title">交付決定のあとに着手する</h3>
                                <p>
                                    国・県の制度は、採択の通知が届いてから発注・撮影・制作に入ります。
                                    納品後は実績報告用に、成果物の写しや支払いの証憑をそろえてお渡しします。
                                </p>
                            </div>
                        </li>
                    </ol>
                    <p className="hojokin-scope">
                        できること — 制度の整理、計画書の制作部分と見積の作成、要項に沿った経費の振り分け、実績報告用の資料づくり。
                        <br />
                        しないこと — 申請の代行、採択の保証。申請手続きは事業者ご自身と商工会・役場の窓口で進めていただきます。
                    </p>
                </div>
            </section>

            {/* 5. CTA */}
            <section className="pro-section pro-final hojokin-final">
                <div className="pro-inner">
                    <h2 className="pro-final-title">使えそうな制度があれば、締切の前に。</h2>
                    <p className="pro-final-lead">
                        「この補助金で動画は撮れる？」「うちは対象？」の段階で構いません。
                        制度の整理から、企画・見積・制作まで通して引き受けます。
                    </p>
                    <Link href={CTA_HREF} className="pro-cta-button">
                        相談する（無料）
                    </Link>
                </div>
            </section>

            {/* 6. 免責（印刷時も出す） */}
            <footer className="hojokin-disclaimer">
                <div className="pro-inner">
                    <p>
                        この一覧は各機関が公表している公募要領・申請要領を Shine a Light が要約したものです。
                        正確な要件は出典リンク先の最新資料でご確認ください。
                        内容は予告なく変わることがあります。最終確認日：{formatDate(HOJOKIN_PAGE_UPDATED)}。
                        掲載の誤りや、載っていない制度があればお知らせください。
                    </p>
                </div>
            </footer>
        </div>
    );
}

function HojokinCard({ h, today }: { h: Hojokin; today: Date }) {
    const status = effectiveStatus(h, today);
    const cutoff = nextCutoff(h);
    const isClosed = status === '終了';

    return (
        <li id={h.id} className={`hojokin-card ${STATUS_CLASS[status]}`}>
            <div className="hojokin-card-head">
                <span className={`hojokin-status ${STATUS_CLASS[status]}`}>{status}</span>
                <span className="hojokin-issuer">{h.issuer}</span>
            </div>
            <h3 className="hojokin-name">{h.name}</h3>

            <div className="hojokin-flags">
                <span className="hojokin-flag-item">
                    <span className="hojokin-flag-label">動画</span>
                    <span className={`hojokin-flag ${FLAG_CLASS[h.video]}`}>{h.video}</span>
                </span>
                <span className="hojokin-flag-item">
                    <span className="hojokin-flag-label">Web</span>
                    <span className={`hojokin-flag ${FLAG_CLASS[h.web]}`}>{h.web}</span>
                </span>
            </div>

            <dl className="hojokin-facts">
                <div>
                    <dt>補助率</dt>
                    <dd>{h.rate}</dd>
                </div>
                <div>
                    <dt>上限</dt>
                    <dd>
                        {h.cap !== null ? formatYen(h.cap) : '—'}
                        {h.capNote && <small>{h.capNote}</small>}
                    </dd>
                </div>
                <div>
                    <dt>受付</dt>
                    <dd>
                        {h.windowOpens && h.deadline ? (
                            <>
                                <span className="hojokin-date">{formatDate(h.windowOpens)}</span>
                                {' 〜 '}
                                <span className="hojokin-date">{formatDate(h.deadline)}</span>
                            </>
                        ) : h.deadline ? (
                            <>
                                {'〜 '}
                                <span className="hojokin-date">{formatDate(h.deadline)}</span>
                            </>
                        ) : (
                            '—'
                        )}
                    </dd>
                </div>
                {cutoff && cutoff.date !== h.deadline && (
                    <div className="hojokin-fact-cutoff">
                        <dt>先に閉まる</dt>
                        <dd>
                            {formatDate(cutoff.date)}
                            <small>{cutoff.label}</small>
                        </dd>
                    </div>
                )}
                <div className="hojokin-fact-wide">
                    <dt>対象者</dt>
                    <dd>{h.target}</dd>
                </div>
                <div className="hojokin-fact-wide">
                    <dt>対象経費</dt>
                    <dd>{h.eligibleCosts}</dd>
                </div>
                <div className="hojokin-fact-wide">
                    <dt>窓口</dt>
                    <dd>{h.contact}</dd>
                </div>
            </dl>

            {h.notes.length > 0 && (
                <div className="hojokin-notes">
                    <p className="hojokin-notes-title">注意点</p>
                    <ul>
                        {h.notes.map((n) => (
                            <li key={n}>{n}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="hojokin-card-foot">
                <span className="hojokin-links">
                    <a href={h.sourceUrl} target="_blank" rel="noopener noreferrer">
                        出典を見る
                    </a>
                    {h.rawDocUrl && (
                        <a href={h.rawDocUrl} target="_blank" rel="noopener noreferrer">
                            要領 PDF
                        </a>
                    )}
                </span>
                <span className="hojokin-checked">
                    一次資料 確認日 {h.lastChecked.replace(/-/g, '.')}
                    {isClosed && ' ／ 次回公募の案内が出たら更新'}
                </span>
            </div>
        </li>
    );
}
