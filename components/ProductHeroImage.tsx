'use client';

import { useState, useEffect } from 'react';

interface ProductHeroImageProps {
    src: string;
    alt: string;
    gallery?: string[];
}

export default function ProductHeroImage({ src, alt, gallery }: ProductHeroImageProps) {
    const [activeSrc, setActiveSrc] = useState(src);

    useEffect(() => {
        if (gallery && gallery.length > 0) {
            const random = gallery[Math.floor(Math.random() * gallery.length)];
            setActiveSrc(random);
        }
    }, []);

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
