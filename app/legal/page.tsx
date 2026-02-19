
export const metadata = {
    title: '特定商取引法に基づく表記 | Shine a Light',
    description: '特定商取引法に基づく表記です。',
};

export default function LegalPage() {
    return (
        <div className="section">
            <div className="section-inner">
                <div className="section-header">
                    <h2>特定商取引法に基づく表記</h2>
                </div>
                <div className="prose max-w-none text-gray-300">
                    <table className="w-full text-left border-collapse">
                        <tbody>
                            <tr className="border-b border-gray-700">
                                <th className="py-4 font-bold w-1/3">販売業者</th>
                                <td className="py-4">Shine a Light / 小林 大介</td>
                            </tr>
                            <tr className="border-b border-gray-700">
                                <th className="py-4 font-bold">運営統括責任者名</th>
                                <td className="py-4">小林 大介</td>
                            </tr>
                            <tr className="border-b border-gray-700">
                                <th className="py-4 font-bold">所在地</th>
                                <td className="py-4">徳島県（詳細は請求があり次第提供いたします）</td>
                            </tr>
                            <tr className="border-b border-gray-700">
                                <th className="py-4 font-bold">連絡先</th>
                                <td className="py-4">Contactフォームよりお問い合わせください</td>
                            </tr>
                            <tr className="border-b border-gray-700">
                                <th className="py-4 font-bold">申し込みの有効期限</th>
                                <td className="py-4">原則、受注確認（受注確認の為の自動送信メール発信）後、5日間とします。</td>
                            </tr>
                            <tr className="border-b border-gray-700">
                                <th className="py-4 font-bold">販売価格</th>
                                <td className="py-4">各商品・サービスページに記載</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
