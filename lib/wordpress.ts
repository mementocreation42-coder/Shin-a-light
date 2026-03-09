const WP_BASE = 'https://journal.shinealight.jp';
const WP_REST_BASE = `${WP_BASE}/index.php?rest_route=/wp/v2`;

export interface WPPost {
    id: number;
    slug: string;
    date: string;
    modified: string;
    title: {
        rendered: string;
    };
    content: {
        rendered: string;
    };
    excerpt: {
        rendered: string;
    };
    featured_media: number;
    categories: number[];
    link: string;
}

export interface WPMedia {
    id: number;
    source_url: string;
    alt_text: string;
}

export interface WPCategory {
    id: number;
    name: string;
    slug: string;
    count: number;
}

// Fetch all posts with pagination and optional category filter
export async function getPosts(page = 1, perPage = 12, categoryId?: number): Promise<{ posts: WPPost[]; totalPages: number }> {
    try {
        let url = `${WP_REST_BASE}/posts&page=${page}&per_page=${perPage}&_embed`;
        if (categoryId) {
            url += `&categories=${categoryId}`;
        }

        const res = await fetch(
            url,
            { next: { revalidate: 60 } }
        );

        if (!res.ok) {
            console.error('Failed to fetch posts:', res.statusText);
            return { posts: [], totalPages: 0 };
        }

        const posts = await res.json();
        const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10);

        return { posts, totalPages };
    } catch (error) {
        console.error('WordPress API connection error:', error);
        return { posts: [], totalPages: 0 };
    }
}

// Fetch all posts without pagination (useful for client-side filtering)
export async function getAllPosts(): Promise<WPPost[]> {
    try {
        const perPage = 100; // WP Max is 100
        let page = 1;
        let allPosts: WPPost[] = [];
        let totalPages = 1;

        // Fetch first page to get totalPages
        const firstRes = await fetch(
            `${WP_REST_BASE}/posts&page=${page}&per_page=${perPage}&_embed`,
            { next: { revalidate: 60 } }
        );

        if (!firstRes.ok) {
            console.error('Failed to fetch initial posts:', firstRes.statusText);
            return [];
        }

        const firstPosts = await firstRes.json();
        allPosts = [...firstPosts];
        totalPages = parseInt(firstRes.headers.get('X-WP-TotalPages') || '1', 10);

        // Fetch remaining pages in parallel
        if (totalPages > 1) {
            const promises = [];
            for (let i = 2; i <= totalPages; i++) {
                promises.push(
                    fetch(`${WP_REST_BASE}/posts&page=${i}&per_page=${perPage}&_embed`, {
                        next: { revalidate: 60 },
                    }).then((res) => (res.ok ? res.json() : []))
                );
            }

            const remainingPages = await Promise.all(promises);
            for (const pagePosts of remainingPages) {
                if (Array.isArray(pagePosts)) {
                    allPosts = [...allPosts, ...pagePosts];
                }
            }
        }

        return allPosts;
    } catch (error) {
        console.error('WordPress API connection error (getAllPosts):', error);
        return [];
    }
}

// Fetch a single post by slug
export async function getPost(slug: string): Promise<WPPost | null> {
    try {
        const res = await fetch(
            `${WP_REST_BASE}/posts&slug=${slug}&_embed`,
            { next: { revalidate: 60 } }
        );

        if (!res.ok) {
            return null;
        }

        const posts = await res.json();
        return posts.length > 0 ? posts[0] : null;
    } catch (error) {
        console.error('WordPress API connection error (getPost):', error);
        return null;
    }
}

// Fetch a single post by ID
export async function getPostById(id: string): Promise<WPPost | null> {
    try {
        const res = await fetch(
            `${WP_REST_BASE}/posts/${id}&_embed`,
            { next: { revalidate: 60 } }
        );

        if (!res.ok) {
            return null;
        }

        return res.json();
    } catch (error) {
        console.error('WordPress API connection error (getPostById):', error);
        return null;
    }
}

// Fetch media (featured image) by ID
export async function getMedia(mediaId: number): Promise<WPMedia | null> {
    if (!mediaId) return null;

    try {
        const res = await fetch(
            `${WP_REST_BASE}/media/${mediaId}`,
            { next: { revalidate: 3600 } }
        );

        if (!res.ok) {
            return null;
        }

        return res.json();
    } catch (error) {
        console.error('WordPress API connection error (getMedia):', error);
        return null;
    }
}

// Fetch all categories
export async function getCategories(): Promise<WPCategory[]> {
    try {
        const res = await fetch(
            `${WP_REST_BASE}/categories`,
            { next: { revalidate: 3600 } }
        );

        if (!res.ok) {
            return [];
        }

        return res.json();
    } catch (error) {
        console.error('WordPress API connection error (getCategories):', error);
        return [];
    }
}

// Helper to get featured image URL from embedded data
export function getFeaturedImageUrl(post: WPPost & { _embedded?: { 'wp:featuredmedia'?: WPMedia[] } }): string | null {
    if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
        return post._embedded['wp:featuredmedia'][0].source_url;
    }
    return null;
}

// Helper to strip HTML tags from excerpt
export function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
}

// Helper to format date
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}
