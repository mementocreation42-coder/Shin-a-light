import type { Metadata } from 'next';
import Link from 'next/link';
import { products } from '@/data/products';

export const metadata: Metadata = {
    title: 'SAL STORE | Shine a Light',
    description: 'Creative Assets & Tools - For those who make their own.',
    alternates: {
        canonical: '/store',
    },
};

export default function ShopPage() {
    return (
        <div className="shop-page">
            <header className="shop-hero">
                <div className="shop-hero-inner">
                    <h1 className="shop-title">SAL<br />STORE</h1>
                    <p className="shop-subtitle">Creative Assets & Tools - For those who make their own.</p>
                </div>
            </header>

            <section className="shop-content">
                <div className="products-grid">
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            href={`/store/${product.id}`}
                            className={`product-card ${product.color}`}
                        >
                            <div className="product-image">
                                <img src={product.image} alt={product.name} />
                                {product.badge && (
                                    <span className="product-card-badge">{product.badge}</span>
                                )}
                                {product.category && (
                                    <div className="product-image-overlay">
                                        <span className="product-image-overlay-category">{product.category}</span>
                                        <span className="product-image-overlay-name">{product.name}</span>
                                    </div>
                                )}
                            </div>
                            <div className="product-info">
                                <div className="product-header">
                                    {!product.category && <h2 className="product-name">{product.name}</h2>}
                                    <div className="product-price-container">
                                        {product.originalPrice && (
                                            <span className="product-price-original">
                                                ¥{product.originalPrice.toLocaleString()}
                                            </span>
                                        )}
                                        <p className="product-price">{product.priceLabel ?? (product.price === 0 ? 'FREE' : `¥${product.price.toLocaleString()}`)}</p>
                                        {product.stock && (
                                            <span className="product-stock">限定 {product.stock} 個</span>
                                        )}
                                    </div>
                                </div>
                                {product.tags && product.tags.length > 0 && (
                                    <div className="product-tags">
                                        {product.tags.map((tag) => (
                                            <span key={tag} className="tag" data-tag={tag.toLowerCase()}>{tag}</span>
                                        ))}
                                    </div>
                                )}
                                <p className="product-desc">{product.description}</p>
                                <span className={`view-detail-btn ${product.comingSoon ? 'coming-soon-btn' : ''}`}>
                                    {product.comingSoon ? 'Coming Soon' : 'View Details →'}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section >
        </div >
    );
}
