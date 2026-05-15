import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Shine a Light — DAISUKE KOBAYASHI',
        short_name: 'Shine a Light',
        description: 'ビデオグラファー・Webエンジニア｜小林大介。映像、写真、Web、AIを横断するクリエイティブ。',
        start_url: '/',
        display: 'standalone',
        background_color: '#0a0a0a',
        theme_color: '#0a0a0a',
        lang: 'ja-JP',
        icons: [
            {
                src: '/icon.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    };
}
