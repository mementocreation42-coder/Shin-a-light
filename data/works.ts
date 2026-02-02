export interface Work {
    slug: string;
    title: string;
    category: string;
    color: string;
    image: string;
    year: string;
    client: string;
    role: string;
    tools: string;
    overview: string;
    process: string;
    result: string;
}

export const works: Work[] = [
    {
        slug: 'work-01',
        title: 'Work Title 01',
        category: 'Category',
        color: 'color-1',
        image: 'https://picsum.photos/seed/work1/400/300',
        year: '2024',
        client: 'Client Name',
        role: 'Director / Cinematographer',
        tools: 'DaVinci Resolve / After Effects',
        overview: 'ここにプロジェクトの概要を記載します。どのような経緯でこのプロジェクトが始まり、どのような目的で制作されたかを説明します。',
        process: '制作プロセスについて説明します。企画段階から撮影、編集、納品までの流れや、工夫したポイントなどを記載します。',
        result: 'プロジェクトの成果や反響について記載します。クライアントからのフィードバックや、視聴者の反応なども含めることができます。',
    },
    {
        slug: 'work-02',
        title: 'Work Title 02',
        category: 'Category',
        color: 'color-2',
        image: 'https://picsum.photos/seed/work2/400/300',
        year: '2024',
        client: 'Client Name',
        role: 'Director / Cinematographer',
        tools: 'DaVinci Resolve / After Effects',
        overview: 'ここにプロジェクトの概要を記載します。',
        process: '制作プロセスについて説明します。',
        result: 'プロジェクトの成果や反響について記載します。',
    },
    {
        slug: 'work-03',
        title: 'Work Title 03',
        category: 'Category',
        color: 'color-3',
        image: 'https://picsum.photos/seed/work3/400/300',
        year: '2024',
        client: 'Client Name',
        role: 'Director / Cinematographer',
        tools: 'DaVinci Resolve / After Effects',
        overview: 'ここにプロジェクトの概要を記載します。',
        process: '制作プロセスについて説明します。',
        result: 'プロジェクトの成果や反響について記載します。',
    },
    {
        slug: 'work-04',
        title: 'Work Title 04',
        category: 'Category',
        color: 'color-4',
        image: 'https://picsum.photos/seed/work4/400/300',
        year: '2024',
        client: 'Client Name',
        role: 'Director / Cinematographer',
        tools: 'DaVinci Resolve / After Effects',
        overview: 'ここにプロジェクトの概要を記載します。',
        process: '制作プロセスについて説明します。',
        result: 'プロジェクトの成果や反響について記載します。',
    },
    {
        slug: 'work-05',
        title: 'Work Title 05',
        category: 'Category',
        color: 'color-5',
        image: 'https://picsum.photos/seed/work5/400/300',
        year: '2024',
        client: 'Client Name',
        role: 'Director / Cinematographer',
        tools: 'DaVinci Resolve / After Effects',
        overview: 'ここにプロジェクトの概要を記載します。',
        process: '制作プロセスについて説明します。',
        result: 'プロジェクトの成果や反響について記載します。',
    },
    {
        slug: 'work-06',
        title: 'Work Title 06',
        category: 'Category',
        color: 'color-6',
        image: 'https://picsum.photos/seed/work6/400/300',
        year: '2024',
        client: 'Client Name',
        role: 'Director / Cinematographer',
        tools: 'DaVinci Resolve / After Effects',
        overview: 'ここにプロジェクトの概要を記載します。',
        process: '制作プロセスについて説明します。',
        result: 'プロジェクトの成果や反響について記載します。',
    },
    {
        slug: 'work-07',
        title: 'Work Title 07',
        category: 'Category',
        color: 'color-7',
        image: 'https://picsum.photos/seed/work7/400/300',
        year: '2024',
        client: 'Client Name',
        role: 'Director / Cinematographer',
        tools: 'DaVinci Resolve / After Effects',
        overview: 'ここにプロジェクトの概要を記載します。',
        process: '制作プロセスについて説明します。',
        result: 'プロジェクトの成果や反響について記載します。',
    },
    {
        slug: 'work-08',
        title: 'Work Title 08',
        category: 'Category',
        color: 'color-8',
        image: 'https://picsum.photos/seed/work8/400/300',
        year: '2024',
        client: 'Client Name',
        role: 'Director / Cinematographer',
        tools: 'DaVinci Resolve / After Effects',
        overview: 'ここにプロジェクトの概要を記載します。',
        process: '制作プロセスについて説明します。',
        result: 'プロジェクトの成果や反響について記載します。',
    },
    {
        slug: 'work-09',
        title: 'Work Title 09',
        category: 'Category',
        color: 'color-9',
        image: 'https://picsum.photos/seed/work9/400/300',
        year: '2024',
        client: 'Client Name',
        role: 'Director / Cinematographer',
        tools: 'DaVinci Resolve / After Effects',
        overview: 'ここにプロジェクトの概要を記載します。',
        process: '制作プロセスについて説明します。',
        result: 'プロジェクトの成果や反響について記載します。',
    },
];

export function getWorkBySlug(slug: string): Work | undefined {
    return works.find((work) => work.slug === slug);
}

export function getAdjacentWorks(slug: string): { prev: Work | null; next: Work | null } {
    const index = works.findIndex((work) => work.slug === slug);
    return {
        prev: index > 0 ? works[index - 1] : works[works.length - 1],
        next: index < works.length - 1 ? works[index + 1] : works[0],
    };
}
