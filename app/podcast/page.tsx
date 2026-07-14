import type { Metadata } from 'next';
import { getPodcast, SPOTIFY_SHOW_ID, SPOTIFY_SHOW_URL } from '@/lib/podcast';
import PodcastPlayer from '@/components/PodcastPlayer';

const SPOTIFY_EMBED_URL = `https://open.spotify.com/embed/show/${SPOTIFY_SHOW_ID}?utm_source=generator`;

// エピソードは RSS から取得し、1時間ごとに再検証（新着を自動反映）
export const revalidate = 3600;

export const metadata: Metadata = {
    title: 'Podcast',
    description:
        '徳島・牟岐町から、映像・写真・Web・AI・釣り・ヘルスケア——その裏側にある思考と対話を声で届けるポッドキャスト「SAL Radio」。Spotifyで配信中。',
    alternates: {
        canonical: '/podcast',
    },
    openGraph: {
        title: 'Podcast - Shine a Light',
        description:
            '徳島・牟岐町から届ける、思考と対話のポッドキャスト「SAL Radio」。Spotifyで配信中。',
        url: '/podcast',
        siteName: 'Shine a Light',
        locale: 'ja_JP',
        type: 'website',
        images: ['/opengraph-image'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Podcast - Shine a Light',
        description:
            '徳島・牟岐町から届ける、思考と対話のポッドキャスト「SAL Radio」。Spotifyで配信中。',
        images: ['/opengraph-image'],
    },
};

export default async function PodcastPage() {
    const show = await getPodcast();

    return (
        <div className="podcast-page">
            <header className="podcast-header">
                <p className="fl-eyebrow">Podcast</p>
                <h1 className="podcast-title">
                    SAL Radio<br />
                    <span className="podcast-title-sub">釣りと身体とものづくりの雑談</span>
                </h1>
                <p className="podcast-lead">
                    映像・写真・Web・AI・釣り・ヘルスケア——その裏側にある思考と対話を、声で届ける。
                </p>
                <a
                    href={SPOTIFY_SHOW_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="podcast-cta"
                >
                    Spotifyで聴く →
                </a>
            </header>

            {show && show.episodes.length > 0 ? (
                <ol className="podcast-list">
                    {show.episodes.map((ep) => (
                        <li key={ep.guid} className="podcast-episode">
                            <div className="podcast-episode-top">
                                {ep.image && (
                                    <a
                                        href={ep.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="podcast-episode-thumb"
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={ep.image} alt={ep.title} loading="lazy" />
                                    </a>
                                )}
                                <div className="podcast-episode-head">
                                    <div className="podcast-episode-meta">
                                        <span>{ep.pubDate}</span>
                                        {ep.duration && (
                                            <>
                                                <span className="podcast-episode-dot">・</span>
                                                <span>{ep.duration}</span>
                                            </>
                                        )}
                                    </div>
                                    <h2 className="podcast-episode-title">{ep.title}</h2>
                                </div>
                            </div>

                            <PodcastPlayer src={ep.audioUrl} title={ep.title} />

                            <a
                                href={ep.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="podcast-episode-link"
                            >
                                Spotifyでこの回を開く →
                            </a>
                        </li>
                    ))}
                </ol>
            ) : (
                // RSS 取得に失敗したときは Spotify 埋め込みへフォールバック
                <div className="podcast-player">
                    <iframe
                        title="SAL Radio on Spotify"
                        src={SPOTIFY_EMBED_URL}
                        width="100%"
                        height="600"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                    />
                </div>
            )}
        </div>
    );
}
