import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                // 公開サイトからリンクした管理画面の導線はクロールさせない
                disallow: ['/admin', '/login'],
            },
            {
                userAgent: ['GPTBot', 'ClaudeBot', 'Google-Extended', 'PerplexityBot', 'cohere-ai'],
                allow: '/',
                disallow: ['/admin', '/login'],
            },
        ],
        sitemap: 'https://www.shinealight.jp/sitemap.xml',
    }
}
