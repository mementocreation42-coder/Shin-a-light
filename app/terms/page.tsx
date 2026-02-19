import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '利用規約 | Shine a Light',
    description: 'Shine a Lightの利用規約です。',
    alternates: {
        canonical: '/terms',
    },
};

export default function TermsPage() {
    return (
        <div className="section">
            <div className="section-inner">
                <div className="section-header">
                    <h2>利用規約</h2>
                </div>
                <div className="prose max-w-none text-gray-300">
                    <p className="mb-8">この利用規約（以下，「本規約」といいます。）は，Shine a Light（以下，「当方」といいます。）がこのウェブサイト上で提供するサービス（以下，「本サービス」といいます。）の利用条件を定めるものです。登録ユーザーの皆さま（以下，「ユーザー」といいます。）には，本規約に従って，本サービスをご利用いただきます。</p>

                    <h3 className="text-xl font-bold mb-4 mt-8">第1条（適用）</h3>
                    <p className="mb-4">本規約は，ユーザーと当方との間の本サービスの利用に関わる一切の関係に適用されるものとします。</p>

                    <h3 className="text-xl font-bold mb-4 mt-8">第2条（禁止事項）</h3>
                    <p className="mb-4">ユーザーは，本サービスの利用にあたり，以下の行為をしてはなりません。</p>
                    <ul className="list-disc ml-6 mb-4">
                        <li>法令または公序良俗に違反する行為</li>
                        <li>犯罪行為に関連する行為</li>
                        <li>当方のサーバーまたはネットワークの機能を破壊したり，妨害したりする行為</li>
                        <li>当方のサービスの運営を妨害するおそれのある行為</li>
                        <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
                    </ul>

                    <h3 className="text-xl font-bold mb-4 mt-8">第3条（免責事項）</h3>
                    <p className="mb-4">当方の債務不履行責任は，当方の故意または重過失によらない場合には免責されるものとします。</p>

                    <p className="mt-12 text-sm text-gray-500">以上</p>
                </div>
            </div>
        </div>
    );
}
