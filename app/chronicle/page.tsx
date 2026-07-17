import ChronicleTimeline from "@/components/ChronicleTimeline";
import type { Metadata } from "next";
import { Noto_Serif_JP } from "next/font/google";

const notoSerifJP = Noto_Serif_JP({
    variable: "--font-serif-jp",
    weight: "400",
    subsets: ["latin"],
    display: "swap",
    preload: false,
});

export const metadata: Metadata = {
    title: "Chronicle — 小林大介の年譜",
    description: "ビデオグラファー・Webエンジニア小林大介の歩み。映像・写真・Web・AIを横断するクリエイティブの軌跡をタイムラインで辿る。",
    alternates: {
        canonical: "/chronicle",
    },
    openGraph: {
        title: "Chronicle — 小林大介の年譜",
        description: "ビデオグラファー・Webエンジニア小林大介の歩み。映像・写真・Web・AIを横断するクリエイティブの軌跡。",
        url: "/chronicle",
        siteName: "Shine a Light",
        locale: "ja_JP",
        type: "profile",
        images: ["/opengraph-image"],
    },
    twitter: {
        card: "summary_large_image",
        title: "Chronicle — 小林大介の年譜",
        description: "ビデオグラファー・Webエンジニア小林大介の歩み。",
        images: ["/opengraph-image"],
    },
};

export default function ChroniclePage() {
    return (
        <main className={notoSerifJP.variable}>
            <ChronicleTimeline />
        </main>
    );
}
