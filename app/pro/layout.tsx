/**
 * /pro 配下（事業向けページ）は「B面」。
 * A面（ポートフォリオ＝黒）に対して白地で組む。光と影の関係。
 * テーマ変数の反転は globals.css の `body:has(.b-side)` で行う（Nav・Footer も変数経由で白になる）。
 */
export default function ProLayout({ children }: { children: React.ReactNode }) {
    return <div className="b-side">{children}</div>;
}
