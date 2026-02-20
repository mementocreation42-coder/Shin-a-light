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
                <div className="section-header max-w-2xl mx-auto">
                    <h2>特定商取引法に基づく表記</h2>
                </div>
                <div className="prose max-w-2xl mx-auto text-gray-300 leading-relaxed tracking-wide">
                    <table className="w-full text-left border-collapse">
                        <tbody>
                            <tr className="border-b border-gray-700">
                                <th className="py-4 font-bold w-1/3 align-top">屋号</th>
                                <td className="py-4 align-top">DAISUKE KOBAYASHI</td>
                            </tr>
                            <tr className="border-b border-gray-700">
                                <th className="py-4 font-bold align-top">代表者</th>
                                <td className="py-4 align-top">小林 大介</td>
                            </tr>
                            <tr className="border-b border-gray-700">
                                <th className="py-4 font-bold align-top">所在地</th>
                                <td className="py-4 align-top">
                                    〒775-0001<br />
                                    徳島県海部郡牟岐町大字河内1465
                                </td>
                            </tr>
                            <tr className="border-b border-gray-700">
                                <th className="py-4 font-bold align-top">事業内容</th>
                                <td className="py-4 align-top">
                                    <ul className="list-none space-y-2">
                                        <li><strong>Creative &amp; Media:</strong> 映像制作、写真撮影、記事執筆、ウェブ制作</li>
                                        <li><strong>AI &amp; Technology:</strong> AI駆動型開発（ソフトウェア・システム）、AI活用ワークフローの構築</li>
                                        <li><strong>Healthcare Services:</strong> パーソナルヘルスケアサービス、バイオデータ分析支援</li>
                                        <li><strong>Digital Assets:</strong> ウェブサービスの提供、デジタルコンテンツおよびストック素材の販売</li>
                                    </ul>
                                </td>
                            </tr>
                            <tr className="border-b border-gray-700">
                                <th className="py-4 font-bold align-top">メールアドレス</th>
                                <td className="py-4 align-top">
                                    <a href="mailto:info@shinealight.jp" className="text-accent-orange hover:underline">info@shinealight.jp</a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
