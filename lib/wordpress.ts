const WP_API_URL = 'http://journal.shinealight.jp/wp-json/wp/v2';

export interface WPPost {
    id: number;
    slug: string;
    date: string;
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
}

// Fetch all posts with pagination
export async function getPosts(page = 1, perPage = 12): Promise<{ posts: WPPost[]; totalPages: number }> {
    const res = await fetch(
        `${WP_API_URL}/posts?page=${page}&per_page=${perPage}&_embed`,
        { next: { revalidate: 60 } }
    );

    if (!res.ok) {
        throw new Error('Failed to fetch posts');
    }

    const posts = await res.json();
    const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10);

    return { posts, totalPages };
}

// Fetch a single post by slug
export async function getPost(slug: string): Promise<WPPost | null> {
    const res = await fetch(
        `${WP_API_URL}/posts?slug=${slug}&_embed`,
        { next: { revalidate: 60 } }
    );

    if (!res.ok) {
        return null;
    }

    const posts = await res.json();
    return posts.length > 0 ? posts[0] : null;
}

// Fetch media (featured image) by ID
export async function getMedia(mediaId: number): Promise<WPMedia | null> {
    if (!mediaId) return null;

    const res = await fetch(
        `${WP_API_URL}/media/${mediaId}`,
        { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
        return null;
    }

    return res.json();
}

// Fetch all categories
export async function getCategories(): Promise<WPCategory[]> {
    const res = await fetch(
        `${WP_API_URL}/categories`,
        { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
        return [];
    }

    return res.json();
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
