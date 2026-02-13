export interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    details: string;
    image: string;
    color: string;
    type: 'digital' | 'physical';
    downloadPath?: string;
    specs?: { label: string; value: string }[];
    gallery?: string[];
}

export const products: Product[] = [
    {
        id: 'xmp-preset-cinematic',
        name: 'Cinematic LUT / XMP Preset Pack',
        price: 1500,
        description: 'シネマティックな色味を再現するLightroom用XMPプリセット。',
        details: '映像制作の現場で培ったカラーグレーディングのノウハウを凝縮した、Lightroom / Camera Raw 用 XMPプリセットパック。\n\nティール＆オレンジ、フェードブラック、ソフトシネマなど、映像的な空気感を写真にも適用できる6種類のプリセットを収録。S-Log風のフラットな素材にも、JPEGにも幅広く対応します。',
        image: 'https://placehold.co/800x800/1e1e1e/ff764d.png?text=CINEMATIC%0AXMP+PRESET',
        color: 'color-1',
        type: 'digital',
        downloadPath: '/downloads/cinematic-preset-pack.zip',
        specs: [
            { label: 'Format', value: 'XMP (Lightroom / Camera Raw)' },
            { label: 'Contents', value: '6 presets' },
            { label: 'Compatibility', value: 'Lightroom Classic / CC / Camera Raw' },
            { label: 'Delivery', value: 'Email (Download Link)' },
        ],
        gallery: [
            'https://placehold.co/1200x800/1e1e1e/333.png?text=Sample+1',
            'https://placehold.co/1200x800/1e1e1e/444.png?text=Sample+2',
            'https://placehold.co/1200x800/1e1e1e/555.png?text=Sample+3',
            'https://placehold.co/1200x800/1e1e1e/666.png?text=Sample+4',
            'https://placehold.co/1200x800/1e1e1e/777.png?text=Sample+5',
            'https://placehold.co/1200x800/1e1e1e/888.png?text=Sample+6',
            'https://placehold.co/1200x800/1e1e1e/999.png?text=Sample+7',
            'https://placehold.co/1200x800/1e1e1e/aaa.png?text=Sample+8',
        ],
    },
    {
        id: 'xmp-preset-film',
        name: 'Film Emulation XMP Preset Pack',
        price: 1500,
        description: 'フィルムライクな質感を再現するXMPプリセット。',
        details: 'Kodak Portra、Fuji Pro 400H、Ilford HP5 など、名作フィルムの色味と粒状感をデジタルで再現するプリセットパック。\n\nハイライトの飛び方、シャドウの締まり具合、彩度のバランスなど、フィルム特有の「空気感」を徹底的に研究・再現しました。ポートレートからスナップまで幅広く活用いただけます。',
        image: 'https://placehold.co/800x800/87d37c/1e1e1e.png?text=FILM%0AXMP+PRESET',
        color: 'color-4',
        type: 'digital',
        downloadPath: '/downloads/film-preset-pack.zip',
        specs: [
            { label: 'Format', value: 'XMP (Lightroom / Camera Raw)' },
            { label: 'Contents', value: '8 presets' },
            { label: 'Compatibility', value: 'Lightroom Classic / CC / Camera Raw' },
            { label: 'Delivery', value: 'Email (Download Link)' },
        ],
        gallery: [
            'https://placehold.co/1200x800/2c3e50/ecf0f1.png?text=Film+Sample+1',
            'https://placehold.co/1200x800/2c3e50/bdc3c7.png?text=Film+Sample+2',
            'https://placehold.co/1200x800/2c3e50/95a5a6.png?text=Film+Sample+3',
            'https://placehold.co/1200x800/2c3e50/7f8c8d.png?text=Film+Sample+4',
            'https://placehold.co/1200x800/2c3e50/34495e.png?text=Film+Sample+5',
            'https://placehold.co/1200x800/2c3e50/2c3e50.png?text=Film+Sample+6',
            'https://placehold.co/1200x800/2c3e50/1abc9c.png?text=Film+Sample+7',
            'https://placehold.co/1200x800/2c3e50/16a085.png?text=Film+Sample+8',
        ],
    },
    {
        id: 'xmp-preset-landscape',
        name: 'Landscape & Nature XMP Preset Pack',
        price: 1200,
        description: '風景・自然写真に特化したXMPプリセット。',
        details: '徳島の山・海・空を撮り続けてきた経験から生まれた、風景写真専用プリセットパック。\n\n朝焼け、夕暮れ、深緑、水のブルーなど、自然のシーンごとに最適化された5種類のプリセットを収録。ダイナミックレンジを最大限に引き出しながら、自然な仕上がりを実現します。',
        image: 'https://placehold.co/800x800/5eb5f7/1e1e1e.png?text=LANDSCAPE%0AXMP+PRESET',
        color: 'color-2',
        type: 'digital',
        downloadPath: '/downloads/landscape-preset-pack.zip',
        specs: [
            { label: 'Format', value: 'XMP (Lightroom / Camera Raw)' },
            { label: 'Contents', value: '5 presets' },
            { label: 'Compatibility', value: 'Lightroom Classic / CC / Camera Raw' },
            { label: 'Delivery', value: 'Email (Download Link)' },
        ],
        gallery: [
            'https://placehold.co/1200x800/2980b9/ecf0f1.png?text=Landscape+1',
            'https://placehold.co/1200x800/27ae60/ecf0f1.png?text=Landscape+2',
            'https://placehold.co/1200x800/8e44ad/ecf0f1.png?text=Landscape+3',
            'https://placehold.co/1200x800/f39c12/ecf0f1.png?text=Landscape+4',
            'https://placehold.co/1200x800/d35400/ecf0f1.png?text=Landscape+5',
            'https://placehold.co/1200x800/c0392b/ecf0f1.png?text=Landscape+6',
            'https://placehold.co/1200x800/bdc3c7/ecf0f1.png?text=Landscape+7',
            'https://placehold.co/1200x800/7f8c8d/ecf0f1.png?text=Landscape+8',
        ],
    },
    {
        id: 'xmp-preset-bundle',
        name: 'ALL PRESET BUNDLE',
        price: 3500,
        description: '全プリセットパックをまとめたお得なバンドル。',
        details: 'Cinematic、Film Emulation、Landscape & Nature の全3パックをまとめたバンドルセット。\n\n単品購入より¥700お得。合計19種類のプリセットで、あらゆるシーンに対応できるカラーパレットが手に入ります。',
        image: 'https://placehold.co/800x800/ff764d/1e1e1e.png?text=ALL+PRESET%0ABUNDLE',
        color: 'color-3',
        type: 'digital',
        downloadPath: '/downloads/all-preset-bundle.zip',
        specs: [
            { label: 'Format', value: 'XMP (Lightroom / Camera Raw)' },
            { label: 'Contents', value: '19 presets (3 packs)' },
            { label: 'Compatibility', value: 'Lightroom Classic / CC / Camera Raw' },
            { label: 'Delivery', value: 'Email (Download Link)' },
        ],
    },
];

export function getProductById(id: string): Product | undefined {
    return products.find((p) => p.id === id);
}
