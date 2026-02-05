import ChronicleTimeline from "@/components/ChronicleTimeline";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Chronicle - DAISUKE KOBAYASHI",
    description: "A visual timeline of my life and creative journey.",
};

export default function ChroniclePage() {
    return (
        <main>
            <ChronicleTimeline />
        </main>
    );
}
