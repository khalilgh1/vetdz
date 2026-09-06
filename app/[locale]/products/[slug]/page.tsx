import { notFound } from "next/navigation";
import Link from "next/link";
import { ImageCarousel } from "@/components/image-carousel";
import { OrderForm } from "@/components/order-form";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { formatDzd } from "@/lib/format";
import { getFeaturedProducts, getProductBySlug } from "@/lib/store";
import { getDictionary, isValidLocale, type Locale } from "@/lib/i18n";

type ProductPageProps = {
    params: Promise<{ locale: string; slug: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
    const { locale: rawLocale, slug } = await params;
    if (!isValidLocale(rawLocale)) {
        notFound();
    }
    const locale = rawLocale as Locale;
    const dict = getDictionary(locale);
    const isEn = locale === "en";

    const [product, recommendations] = await Promise.all([getProductBySlug(slug), getFeaturedProducts(4)]);

    if (!product) {
        notFound();
    }

    const suggested = recommendations.filter((item) => item.slug !== product.slug).slice(0, 3);

    const productName = isEn ? (product.nameEn || product.nameAr) : product.nameAr;
    const productSubtitle = isEn ? (product.subtitleEn || product.subtitleAr) : product.subtitleAr;
    const productDescription = isEn ? (product.descriptionEn || product.descriptionAr) : product.descriptionAr;
    const categoryName = isEn ? (product.productTypeNameEn || product.productTypeNameAr) : product.productTypeNameAr;
    const currency = isEn ? "DZD" : "دج";

    const genderLabel = product.gender === "BOTH"
        ? dict.product.genderBoth
        : product.gender === "MALE"
            ? dict.product.genderMale
            : dict.product.genderFemale;

    return (
        <>
            <SiteHeader locale={locale} dict={dict} />
            <main className="vetdz-shell product-page">
                <section className="product-main-grid reveal">
                    <div>
                        <ImageCarousel images={product.images} priority />
                    </div>

                    <div className="product-summary">
                        <h1>{productName}</h1>
                        <p>{productDescription}</p>

                        <div className="price-block">
                            {product.discountActive && product.discountedPrice ? (
                                <>
                                    <span className="price-original">{formatDzd(product.price)} {currency}</span>
                                    <strong className="price-final">{formatDzd(product.discountedPrice)} {currency}</strong>
                                    <span className="discount-badge">
                                        {isEn ? `${product.discountPercent}% OFF` : `خصم ${product.discountPercent}%`}
                                    </span>
                                </>
                            ) : (
                                <strong className="price-final">{formatDzd(product.price)} {currency}</strong>
                            )}
                        </div>

                        <div className="meta-row">
                            <span>{dict.product.category}: {categoryName}</span>
                            <span>
                                {dict.product.suitableFor}: {genderLabel}
                            </span>
                        </div>

                        <OrderForm
                            productSlug={product.slug}
                            productNameAr={product.nameAr}
                            productNameEn={product.nameEn}
                            unitPrice={product.finalPrice}
                            variations={product.variations}
                            locale={locale}
                            dict={dict}
                        />
                    </div>
                </section>

                <section className="product-list-section reveal">
                    <div className="section-head">
                        <h2>{dict.product.recommendationsTitle}</h2>
                        <Link href={`/${locale}/catalog`} className="line-link">
                            {dict.product.backToShop}
                        </Link>
                    </div>
                    <div className="product-grid">
                        {suggested.map((item) => (
                            <ProductCard key={item.id} product={item} locale={locale} />
                        ))}
                    </div>
                </section>
            </main>
        </>
    );
}
