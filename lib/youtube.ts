/**
 * YouTube URL から動画IDを抽出する
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?(?:[^&]*&)*v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * 記事のHTMLコンテンツ内にある YouTube URL を iframe 埋め込みに変換する
 *
 * 対応パターン:
 *   <p>https://www.youtube.com/watch?v=XXXX</p>
 *   <p><a href="https://youtu.be/XXXX">https://youtu.be/XXXX</a></p>
 */
export function processYouTubeEmbeds(html: string): string {
  // <p> 内に YouTube URL だけがある場合（<a> タグの有無を問わず）
  return html.replace(
    /<p>\s*(?:<a[^>]*href="([^"]*)"[^>]*>(?:[^<]*)<\/a>|([^\s<>]+))\s*<\/p>/g,
    (match, hrefUrl: string | undefined, plainUrl: string | undefined) => {
      const url = hrefUrl ?? plainUrl ?? '';
      const videoId = extractYouTubeId(url);
      if (!videoId) return match;

      return `<div class="youtube-embed-wrapper"><iframe src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe></div>`;
    }
  );
}
