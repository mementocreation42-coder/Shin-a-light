import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
            },
            {
                userAgent: ['GPTBot', 'ClaudeBot', 'Google-Extended', 'PerplexityBot', 'cohere-ai'],
                allow: '/',
            },
        ],
        sitemap: 'https://www.shinealight.jp/sitemap.xml',
    }
}
