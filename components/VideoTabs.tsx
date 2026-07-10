'use client';

import { useMemo, useState } from 'react';
import type { YouTubeVideo } from '@/lib/youtube';
import VideoCard from './VideoCard';

type Tab = 'video' | 'short';

export default function VideoTabs({ videos }: { videos: YouTubeVideo[] }) {
    const [tab, setTab] = useState<Tab>('video');

    const regular = useMemo(() => videos.filter((v) => !v.isShort), [videos]);
    const shorts = useMemo(() => videos.filter((v) => v.isShort), [videos]);

    const list = tab === 'video' ? regular : shorts;
    const hasShorts = shorts.length > 0;

    return (
        <>
            {hasShorts && (
                <div className="videos-tabs" role="tablist" aria-label="動画の種類">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={tab === 'video'}
                        className={`videos-tab ${tab === 'video' ? 'is-active' : ''}`}
                        onClick={() => setTab('video')}
                    >
                        動画 <span className="videos-tab-count">{regular.length}</span>
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={tab === 'short'}
                        className={`videos-tab ${tab === 'short' ? 'is-active' : ''}`}
                        onClick={() => setTab('short')}
                    >
                        ショート <span className="videos-tab-count">{shorts.length}</span>
                    </button>
                </div>
            )}

            <ul className={`videos-grid ${tab === 'short' ? 'is-shorts' : ''}`}>
                {list.map((video) => (
                    <VideoCard key={video.id} video={video} />
                ))}
            </ul>
        </>
    );
}
