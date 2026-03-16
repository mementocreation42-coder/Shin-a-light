import Link from 'next/link';
import { notFound } from 'next/navigation';
import { products, getProductById } from '@/data/products';
import BuyButton from '@/components/BuyButton';
import EmailCaptureForm from '@/components/EmailCaptureForm';

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
        title: `${product.name} - Shine a Light Store`,
        description: product.description,
        alternates: {
            canonical: `/store/${id}`,
        },
        openGraph: {
            title: `${product.name} - Shine a Light Store`,
            description: product.description,
            url: `/store/${id}`,
            siteName: 'Shine a Light',
            locale: 'ja_JP',
            type: 'website',
            images: [
                {
                    url: product.image,
                    width: 1200,
                    height: 1200,
                    alt: product.name,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${product.name} - Shine a Light Store`,
            description: product.description,
            images: [product.image],
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
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org/",
                        "@type": "Product",
                        "name": product.name,
                        "image": [product.image],
                        "description": product.description,
                        "sku": product.id,
                        "brand": {
                            "@type": "Brand",
                            "name": "Shine a Light"
                        },
                        "offers": {
                            "@type": "Offer",
                            "url": `https://www.shinealight.jp/store/${product.id}`,
                            "priceCurrency": "JPY",
                            "price": product.price,
                            "availability": "https://schema.org/InStock",
                            "itemCondition": "https://schema.org/NewCondition"
                        }
                    })
                }}
            />
            <header className="product-detail-header">
                <div className="product-detail-header-inner">
                    <Link href="/store" className="back-link">
                        ← Back to Store
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
                        <div className="product-detail-price-container">
                            {product.originalPrice && (
                                <span className="product-detail-price-original">
                                    ¥{product.originalPrice.toLocaleString()}
                                </span>
                            )}
                            <p className="product-detail-price">¥{product.price.toLocaleString()}</p>
                        </div>

                        {product.stock && (
                            <span className="product-detail-stock">限定残り {product.stock} セット / 個</span>
                        )}

                        {product.tags && product.tags.length > 0 && (
                            <div className="product-tags" style={{ marginBottom: '24px' }}>
                                {product.tags.map((tag) => (
                                    <span key={tag} className="tag">{tag}</span>
                                ))}
                            </div>
                        )}

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
                            {product.ctaType === 'contact' ? (
                                <Link href="/#contact" className="contact-cta-btn">
                                    Inquiry / お問い合わせ
                                </Link>
                            ) : product.ctaType === 'download' ? (
                                <EmailCaptureForm
                                    productId={product.id}
                                    downloadPath={product.downloadPath}
                                />
                            ) : (
                                <BuyButton productId={product.id} price={product.price} />
                            )}
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
