import type { Metadata } from 'next';
import { getYouTubeVideos, YOUTUBE_HANDLE_URL } from '@/lib/youtube';
import VideoTabs from '@/components/VideoTabs';

// 動画は YouTube の RSS から取得し、1時間ごとに再検証（新着を自動反映）
export const revalidate = 3600;

export const metadata: Metadata = {
    title: 'Videos',
    description:
        '徳島・牟岐町を拠点に活動する映像クリエイター SAL Films（小林大介）のYouTube動画一覧。釣り・地域の暮らし・ドキュメンタリー映像を配信中。',
    alternates: {
        canonical: '/videos',
    },
    openGraph: {
        title: 'Videos - Shine a Light',
        description:
            '映像クリエイター SAL Films のYouTube動画一覧。釣り・地域の暮らし・ドキュメンタリー映像。',
        url: '/videos',
        siteName: 'Shine a Light',
        locale: 'ja_JP',
        type: 'website',
    },
};

export default async function VideosPage() {
    const channel = await getYouTubeVideos();
    const videos = channel?.videos ?? [];

    return (
        <div className="videos-page">
            <header className="videos-header">
                <p className="fl-eyebrow">Videos</p>
                <h1 className="videos-title">
                    SAL Films<br />
                    <span className="videos-title-sub">映像でしか届かないものを</span>
                </h1>
                <a
                    href={YOUTUBE_HANDLE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="videos-cta"
                >
                    YouTubeで見る →
                </a>
            </header>

            {videos.length > 0 ? (
                <VideoTabs videos={videos} />
            ) : (
                <p className="videos-empty">
                    動画を読み込めませんでした。
                    <a href={YOUTUBE_HANDLE_URL} target="_blank" rel="noopener noreferrer">
                        YouTubeチャンネルはこちら →
                    </a>
                </p>
            )}
        </div>
    );
}
