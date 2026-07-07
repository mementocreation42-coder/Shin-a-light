export interface SkillGroup {
    label: string;
    items: string[];
}

export const SKILL_GROUPS: SkillGroup[] = [
    {
        label: 'Produce',
        items: ['企画・プロデュース', 'ブランド戦略', 'メディア運営', 'システム構築', 'AIワークフロー構築'],
    },
    {
        label: 'Visual',
        items: ['映像制作', '写真撮影', 'Web制作', 'フロントエンド実装'],
    },
    {
        label: 'Words',
        items: ['インタビュー・取材', '記事執筆'],
    },
    {
        label: 'Healthcare',
        items: ['精密栄養学', '分子栄養学', '血液検査データ解析', 'ヘルスケアカウンセリング'],
    },
    {
        label: 'Field',
        items: ['フィッシング', 'ハンティング', 'ドラムス'],
    },
];
