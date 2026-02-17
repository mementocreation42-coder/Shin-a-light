import { MetadataRoute } from 'next';
import { getPosts } from '@/lib/wordpress';
import { works } from '@/data/works';
import { products } from '@/data/products';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://shinealight.jp';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 1. Static Routes
    const staticRoutes = [
        '',
        '/chronicle',
        '/journal',
        '/shop',
    ];

    const routes = staticRoutes.map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // 2. Journal Posts (Dynamic)
    let journalRoutes: MetadataRoute.Sitemap = [];
    try {
        // Fetch up to 100 recent posts
        const { posts } = await getPosts(1, 100);
        journalRoutes = posts.map((post) => ({
            url: `${BASE_URL}/journal/${post.id}`,
            lastModified: new Date(post.date),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));
    } catch (error) {
        console.error('Sitemap: Failed to fetch posts from WordPress', error);
    }

    // 3. Works (Dynamic from local data)
    const workRoutes = works.map((work) => ({
        url: `${BASE_URL}/works/${work.slug}`,
        lastModified: new Date(), // Local data doesn't have update time, default to now
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }));

    // 4. Shop Products (Dynamic from local data)
    const shopRoutes = products.map((product) => ({
        url: `${BASE_URL}/shop/${product.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }));

    return [...routes, ...journalRoutes, ...workRoutes, ...shopRoutes];
}
