// フォトギャラリーのカテゴリ定義。サーバー(WordPress連携)・クライアント(表示/CMS)の
// 両方から参照するため、副作用のない定数だけをここに置く。
//
// カテゴリは WordPress のタグで表現する：
//   - 'MEMENTO' … タグ "memento" が付いた写真
//   - 'Archive' … タグ無し（デフォルト）

export const MEMENTO_TAG_SLUG = 'memento';

export const GALLERY_CATEGORIES = ['Archive', 'MEMENTO'] as const;
export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export const DEFAULT_GALLERY_CATEGORY: GalleryCategory = 'Archive';
