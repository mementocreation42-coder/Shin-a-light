export type UniverseTag = 'ai' | 'video' | 'photo' | 'web' | 'tools' | 'health';

export interface UniverseLink {
    title: string;
    url: string;
    description: string;
    tags: UniverseTag[];
    domain: string;
    image?: string;
    gradient: string;
    accent: string;
    glyph: string;
    sameTab?: boolean;
    section?: 'main' | 'sns';
}

export const tagMeta: Record<UniverseTag, { label: string; color: string }> = {
    ai:     { label: 'AI',     color: '#9b6fd4' },
    video:  { label: 'VIDEO',  color: '#e8c840' },
    photo:  { label: 'PHOTO',  color: '#e85050' },
    web:    { label: 'WEB',    color: '#30c8c0' },
    tools:  { label: 'TOOLS',  color: '#e040b0' },
    health: { label: 'HEALTH', color: '#50c870' },
};

export const universeLinks: UniverseLink[] = [
    {
        title: 'Shine a Light',
        url: 'https://www.shinealight.jp/',
        description: '映像・写真・Web・AIクリエイティブを軸に活動するDaisuke Kobayashiのポートフォリオサイト',
        tags: ['web', 'video', 'photo', 'ai'],
        domain: 'shinealight.jp',
        image: '/universe/shinealight.jpg',
        gradient: 'linear-gradient(135deg, #ff764d 0%, #c8351a 100%)',
        accent: '#ff764d',
        glyph: 'S',
        sameTab: true,
    },
    {
        title: 'HL Fishing',
        url: 'https://www.hlfishing.net/',
        description: '徳島を舞台にしたフィッシングメディア。Less is Moreで釣りを追求する',
        tags: ['web', 'video'],
        domain: 'hlfishing.net',
        image: '/universe/hlfishing.jpg',
        gradient: 'linear-gradient(135deg, #2f3d2a 0%, #4a5d3a 50%, #6b7a4a 100%)',
        accent: '#6b7a4a',
        glyph: 'HL',
    },
    {
        title: 'Mitoflow40',
        url: 'https://mitoflow40.com/',
        description: '精密栄養学をベースに、40代の身体のステータス異常を見つけて解除するヘルスケアサービス',
        tags: ['web', 'health'],
        domain: 'mitoflow40.com',
        image: '/universe/mitoflow40.png',
        gradient: 'linear-gradient(135deg, #6cb6e8 0%, #f5a76b 60%, #f47a3d 100%)',
        accent: '#6cb6e8',
        glyph: 'M40',
    },
    {
        title: 'SAL Films',
        url: 'https://www.youtube.com/@sal-flims',
        description: '釣り、自然、日常、生活圏そのものを映像でアーカイブするSAL Films',
        tags: ['video'],
        domain: 'youtube.com',
        image: '/universe/youtube.jpg',
        gradient: 'linear-gradient(135deg, #282828 0%, #ff0033 100%)',
        accent: '#ff0033',
        glyph: '▶',
        section: 'sns',
    },
    {
        title: 'SAL note',
        url: 'https://note.com/elvin',
        description: '映像・写真・健康・AI・自然——日々の思考と発見を言葉でアーカイブするSALのnote',
        tags: ['web', 'ai', 'health'],
        domain: 'note.com',
        image: '/universe/note.webp',
        gradient: 'linear-gradient(135deg, #41c9b4 0%, #1a9e8a 100%)',
        accent: '#41c9b4',
        glyph: 'n',
        section: 'sns',
    },
];
