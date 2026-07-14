import ChronicleTimeline from "@/components/ChronicleTimeline";
import type { Metadata } from "next";

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
        <main>
            <ChronicleTimeline />
        </main>
    );
}
