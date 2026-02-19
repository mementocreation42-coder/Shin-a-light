import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'プライバシーポリシー | Shine a Light',
    description: 'Shine a Lightのプライバシーポリシーです。',
    alternates: {
        canonical: '/privacy',
    },
};

export default function PrivacyPage() {
    return (
        <div className="section">
            <div className="section-inner">
                <div className="section-header">
                    <h2>プライバシーポリシー</h2>
                </div>
                <div className="prose max-w-none text-gray-300">
                    <p className="mb-8">Shine a Light（以下，「当方」といいます。）は，本ウェブサイト上で提供するサービス（以下，「本サービス」といいます。）における，ユーザーの個人情報の取扱いについて，以下のとおりプライバシーポリシー（以下，「本ポリシー」といいます。）を定めます。</p>

                    <h3 className="text-xl font-bold mb-4 mt-8">第1条（個人情報）</h3>
                    <p className="mb-4">「個人情報」とは，個人情報保護法にいう「個人情報」を指すものとし，生存する個人に関する情報であって，当該情報に含まれる氏名，生年月日，住所，電話番号，連絡先その他の記述等により特定の個人を識別できる情報及び容貌，指紋，声紋にかかるデータ，及び健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報（個人識別情報）を指します。</p>

                    <h3 className="text-xl font-bold mb-4 mt-8">第2条（個人情報の収集方法）</h3>
                    <p className="mb-4">当方は，ユーザーが利用登録をする際に氏名，生年月日，住所，電話番号，メールアドレス，銀行口座番号，クレジットカード番号などの個人情報をお尋ねすることがあります。</p>

                    <h3 className="text-xl font-bold mb-4 mt-8">第3条（お問い合わせ窓口）</h3>
                    <p className="mb-4">本ポリシーに関するお問い合わせは，サイト内のContactフォームよりお願いいたします。</p>
                </div>
            </div>
        </div>
    );
}
