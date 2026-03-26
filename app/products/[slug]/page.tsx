import { notFound } from "next/navigation";
import Link from "next/link";
import { ImageCarousel } from "@/components/image-carousel";
import { OrderForm } from "@/components/order-form";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { formatDzd } from "@/lib/format";
import { getFeaturedProducts, getProductBySlug } from "@/lib/store";

type ProductPageProps = {
    params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;
    const [product, recommendations] = await Promise.all([getProductBySlug(slug), getFeaturedProducts(4)]);

    if (!product) {
        notFound();
    }

    const suggested = recommendations.filter((item) => item.slug !== product.slug).slice(0, 3);

    return (
        <>
            <SiteHeader />
            <main className="vetdz-shell product-page">
                <section className="product-main-grid reveal">
                    <div>
                        <ImageCarousel images={product.images} priority />
                    </div>

                    <div className="product-summary">
                        <h1>{product.nameAr}</h1>
                        <p>{product.descriptionAr}</p>

                        <div className="price-block">
                            {product.discountActive && product.discountedPrice ? (
                                <>
                                    <span className="price-original">{formatDzd(product.price)} دج</span>
                                    <strong className="price-final">{formatDzd(product.discountedPrice)} دج</strong>
                                    <span className="discount-badge">خصم {product.discountPercent}%</span>
                                </>
                            ) : (
                                <strong className="price-final">{formatDzd(product.price)} دج</strong>
                            )}
                        </div>

                        <div className="meta-row">
                            <span>الفئة: {product.productTypeNameAr}</span>
                            <span>
                                مناسب لـ: {product.gender === "BOTH" ? "للجميع" : product.gender === "MALE" ? "رجالي" : "نسائي"}
                            </span>
                        </div>

                        <OrderForm
                            productSlug={product.slug}
                            productNameAr={product.nameAr}
                            unitPrice={product.finalPrice}
                            variations={product.variations}
                        />
                    </div>
                </section>

                <section className="product-list-section reveal">
                    <div className="section-head">
                        <h2>قد يعجبك أيضًا</h2>
                        <Link href="/" className="line-link">
                            الرجوع للمتجر
                        </Link>
                    </div>
                    <div className="product-grid">
                        {suggested.map((item) => (
                            <ProductCard key={item.id} product={item} />
                        ))}
                    </div>
                </section>
            </main>
        </>
    );
}
