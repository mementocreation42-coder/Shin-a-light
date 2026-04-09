import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { products } from '@/data/products';

export const metadata: Metadata = {
    title: 'Store | Shine a Light',
    description: 'Official Merch & Digital Goods',
    alternates: {
        canonical: '/store',
    },
};

export default function ShopPage() {
    return (
        <div className="shop-page">
            <header className="shop-hero">
                <div className="shop-hero-inner">
                    <Link href="/" className="back-link">
                        ← Back to Home
                    </Link>
                    <h1 className="shop-title">STORE</h1>
                    <p className="shop-subtitle">Official Merch & Digital Goods</p>
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
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    width={800}
                                    height={800}
                                    style={{ width: '100%', height: 'auto' }}
                                />
                                {product.badge && (
                                    <span className="product-card-badge">{product.badge}</span>
                                )}
                            </div>
                            <div className="product-info">
                                <div className="product-header">
                                    <h2 className="product-name">{product.name}</h2>
                                    <div className="product-price-container">
                                        {product.originalPrice && (
                                            <span className="product-price-original">
                                                ¥{product.originalPrice.toLocaleString()}
                                            </span>
                                        )}
                                        <p className="product-price">¥{product.price.toLocaleString()}</p>
                                    </div>
                                    {product.stock && (
                                        <span className="product-stock">限定 {product.stock} 個</span>
                                    )}
                                </div>
                                {product.tags && product.tags.length > 0 && (
                                    <div className="product-tags">
                                        {product.tags.map((tag) => (
                                            <span key={tag} className="tag">{tag}</span>
                                        ))}
                                    </div>
                                )}
                                <p className="product-desc">{product.description}</p>
                                <span className="view-detail-btn">
                                    View Details →
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section >
        </div >
    );
}
