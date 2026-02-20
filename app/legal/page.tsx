import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '特定商取引法に基づく表記 | Shine a Light',
    description: '特定商取引法に基づく表記です。',
    alternates: {
        canonical: '/legal',
    },
};

export default function LegalPage() {
    return (
        <div className="section">
            <div className="section-inner">
                <div className="section-header document-header">
                    <h2>特定商取引法に基づく表記</h2>
                </div>
                <div className="document-container document-prose">
                    <table className="document-table">
                        <tbody>
                            <tr>
                                <th>屋号</th>
                                <td>DAISUKE KOBAYASHI</td>
                            </tr>
                            <tr>
                                <th>代表者</th>
                                <td>小林 大介</td>
                            </tr>
                            <tr>
                                <th>所在地</th>
                                <td>
                                    〒775-0001<br />
                                    徳島県海部郡牟岐町大字河内1465
                                </td>
                            </tr>
                            <tr>
                                <th>事業内容</th>
                                <td>
                                    <ul>
                                        <li><strong>Creative &amp; Media:</strong> 映像制作、写真撮影、記事執筆、ウェブ制作</li>
                                        <li><strong>AI &amp; Technology:</strong> AI駆動型開発（ソフトウェア・システム）、AI活用ワークフローの構築</li>
                                        <li><strong>Healthcare Services:</strong> パーソナルヘルスケアサービス、バイオデータ分析支援</li>
                                        <li><strong>Digital Assets:</strong> ウェブサービスの提供、デジタルコンテンツおよびストック素材の販売</li>
                                    </ul>
                                </td>
                            </tr>
                            <tr>
                                <th>メールアドレス</th>
                                <td>
                                    <a href="mailto:info@shinealight.jp" style={{ color: 'var(--accent-orange)' }}>info@shinealight.jp</a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
