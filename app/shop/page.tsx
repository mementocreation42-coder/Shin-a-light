import Link from 'next/link';
import { products } from '@/data/products';

export default function ShopPage() {
    return (
        <div className="shop-page">
            <header className="shop-hero">
                <div className="shop-hero-inner">
                    <Link href="/" className="back-link">
                        ← Back to Home
                    </Link>
                    <h1 className="shop-title">Online Store</h1>
                    <p className="shop-subtitle">Official Merch & Digital Goods</p>
                </div>
            </header>

            <section className="shop-content">
                <div className="products-grid">
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            href={`/shop/${product.id}`}
                            className={`product-card ${product.color}`}
                        >
                            <div className="product-image">
                                <img src={product.image} alt={product.name} />
                            </div>
                            <div className="product-info">
                                <div className="product-header">
                                    <h2 className="product-name">{product.name}</h2>
                                    <p className="product-price">¥{product.price.toLocaleString()}</p>
                                </div>
                                <p className="product-desc">{product.description}</p>
                                <span className="view-detail-btn">
                                    View Details →
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
