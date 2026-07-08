'use client';

import { useEffect, useRef, useState } from 'react';

interface PodcastPlayerProps {
    src: string;
    title: string;
}

function formatTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const total = Math.floor(seconds);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PodcastPlayer({ src, title }: PodcastPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [current, setCurrent] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onTime = () => setCurrent(audio.currentTime);
        const onMeta = () => setDuration(audio.duration);
        const onEnd = () => setIsPlaying(false);
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', onTime);
        audio.addEventListener('loadedmetadata', onMeta);
        audio.addEventListener('ended', onEnd);
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);

        return () => {
            audio.removeEventListener('timeupdate', onTime);
            audio.removeEventListener('loadedmetadata', onMeta);
            audio.removeEventListener('ended', onEnd);
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
        };
    }, []);

    const toggle = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.paused) {
            void audio.play();
        } else {
            audio.pause();
        }
    };

    const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;
        const time = Number(e.target.value);
        audio.currentTime = time;
        setCurrent(time);
    };

    const progress = duration > 0 ? (current / duration) * 100 : 0;

    return (
        <div className="podcast-player-custom">
            <audio ref={audioRef} preload="none" src={src}>
                お使いのブラウザは音声再生に対応していません。
            </audio>

            <button
                type="button"
                className="podcast-play-btn"
                onClick={toggle}
                aria-label={isPlaying ? `${title} を一時停止` : `${title} を再生`}
                aria-pressed={isPlaying}
            >
                {isPlaying ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <rect x="6" y="5" width="4" height="14" rx="1" />
                        <rect x="14" y="5" width="4" height="14" rx="1" />
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.29-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14z" />
                    </svg>
                )}
            </button>

            <div className="podcast-player-bar">
                <input
                    type="range"
                    className="podcast-seek"
                    min={0}
                    max={duration || 0}
                    step={0.1}
                    value={current}
                    onChange={seek}
                    aria-label="再生位置"
                    style={{ ['--progress' as string]: `${progress}%` }}
                />
                <div className="podcast-player-time">
                    <span>{formatTime(current)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    );
}
