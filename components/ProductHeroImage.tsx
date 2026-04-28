'use client';

import { useState, useMemo } from 'react';

interface ProductHeroImageProps {
    src: string;
    alt: string;
    gallery?: string[];
}

export default function ProductHeroImage({ src, alt, gallery }: ProductHeroImageProps) {
    const initialSrc = useMemo(() => {
        if (gallery && gallery.length > 0) {
            return gallery[Math.floor(Math.random() * gallery.length)];
        }
        return src;
    }, []);

    const [activeSrc, setActiveSrc] = useState(initialSrc);

    if (!gallery || gallery.length === 0) {
        return <img src={src} alt={alt} />;
    }

    return (
        <div className="product-image-viewer">
            <div className="product-image-viewer-main">
                <img src={activeSrc} alt={alt} />
            </div>
            <div className="product-image-viewer-thumbs">
                {gallery.map((image, index) => (
                    <button
                        key={index}
                        className={`product-image-viewer-thumb ${activeSrc === image ? 'is-active' : ''}`}
                        onClick={() => setActiveSrc(image)}
                    >
                        <img src={image} alt={`${alt} ${index + 1}`} />
                    </button>
                ))}
            </div>
        </div>
    );
}
