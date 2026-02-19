import Link from 'next/link';
import { notFound } from 'next/navigation';
import { products, getProductById } from '@/data/products';
import BuyButton from '@/components/BuyButton';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
    return products.map((product) => ({
        id: product.id,
    }));
}

export async function generateMetadata({ params }: PageProps) {
    const { id } = await params;
    const product = getProductById(id);
    if (!product) return { title: 'Product Not Found' };
    return {
        title: `${product.name} - Shine a Light Shop`,
        description: product.description,
        alternates: {
            canonical: `/shop/${id}`,
        },
    };
}

export default async function ProductDetailPage({ params }: PageProps) {
    const { id } = await params;
    const product = getProductById(id);

    if (!product) {
        notFound();
    }

    return (
        <div className="product-detail-page">
            <header className="product-detail-header">
                <div className="product-detail-header-inner">
                    <Link href="/shop" className="back-link">
                        ← Back to Shop
                    </Link>
                </div>
            </header>

            <section className="product-detail-content">
                <div className="product-detail-grid">
                    {/* Image */}
                    <div className="product-detail-image">
                        <img src={product.image} alt={product.name} />
                    </div>

                    {/* Info */}
                    <div className="product-detail-info">
                        {product.type === 'digital' && (
                            <span className="product-badge">DIGITAL DOWNLOAD</span>
                        )}
                        <h1 className="product-detail-name">{product.name}</h1>
                        <p className="product-detail-price">¥{product.price.toLocaleString()}</p>

                        <div className="product-detail-description">
                            {product.details.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>

                        {product.specs && product.specs.length > 0 && (
                            <div className="product-specs">
                                <h2 className="specs-title">Specifications</h2>
                                <table className="specs-table">
                                    <tbody>
                                        {product.specs.map((spec, i) => (
                                            <tr key={i}>
                                                <td className="spec-label">{spec.label}</td>
                                                <td className="spec-value">{spec.value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="product-actions">
                            <BuyButton productId={product.id} price={product.price} />
                        </div>
                    </div>
                </div>

                {product.gallery && product.gallery.length > 0 && (
                    <div className="product-gallery">
                        <h2 className="gallery-title">Gallery</h2>
                        <div className="gallery-grid">
                            {product.gallery.map((image, index) => (
                                <div key={index} className="gallery-item">
                                    <img src={image} alt={`${product.name} sample ${index + 1}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
