export type UniverseCategory = 'web' | 'media' | 'social';

export interface UniverseLink {
    title: string;
    url: string;
    description: string;
    category: UniverseCategory;
    domain: string;
    image?: string;
    gradient: string;
    accent: string;
    glyph: string;
}

export const categoryLabels: Record<UniverseCategory, string> = {
    web: 'WEB',
    media: 'MEDIA',
    social: 'SOCIAL',
};

export const universeLinks: UniverseLink[] = [
    {
        title: 'Shine a Light',
        url: 'https://www.shinealight.jp/',
        description: 'ポートフォリオ / 活動の母艦。',
        category: 'web',
        domain: 'shinealight.jp',
        image: '/universe/shinealight.jpg',
        gradient: 'linear-gradient(135deg, #ff764d 0%, #c8351a 100%)',
        accent: '#ff764d',
        glyph: 'S',
    },
    {
        title: 'HL Fishing',
        url: 'https://www.hlfishing.net/',
        description: 'フィッシングプロジェクト。',
        category: 'web',
        domain: 'hlfishing.net',
        image: '/universe/hlfishing.jpg',
        gradient: 'linear-gradient(135deg, #2f3d2a 0%, #4a5d3a 50%, #6b7a4a 100%)',
        accent: '#6b7a4a',
        glyph: 'HL',
    },
    {
        title: 'Mitoflow40',
        url: 'https://mitoflow40.com/',
        description: '牟岐町の関係人口プロジェクト。',
        category: 'web',
        domain: 'mitoflow40.com',
        image: '/universe/mitoflow40.png',
        gradient: 'linear-gradient(135deg, #6cb6e8 0%, #f5a76b 60%, #f47a3d 100%)',
        accent: '#f47a3d',
        glyph: 'M40',
    },
    {
        title: 'YouTube - @sal-flims',
        url: 'https://www.youtube.com/@sal-flims',
        description: '映像作品 / 記録。',
        category: 'media',
        domain: 'youtube.com',
        image: '/universe/youtube.jpg',
        gradient: 'linear-gradient(135deg, #282828 0%, #ff0033 100%)',
        accent: '#ff0033',
        glyph: '▶',
    },
];
