import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderForm } from "@/components/order-form";
import { SiteHeader } from "@/components/site-header";
import { getHomeProducts, getProductBySlug } from "@/lib/store";
import { getDictionary, isValidLocale, type Locale } from "@/lib/i18n";

type OrdersPageProps = {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ product?: string }>;
};

export default async function OrdersPage({ params, searchParams }: OrdersPageProps) {
    const { locale: rawLocale } = await params;
    if (!isValidLocale(rawLocale)) {
        notFound();
    }
    const locale = rawLocale as Locale;
    const dict = getDictionary(locale);
    const isEn = locale === "en";

    const query = await searchParams;
    const products = await getHomeProducts("ALL");
    const activeSlug = query.product ?? products[0]?.slug;

    if (!activeSlug) {
        notFound();
    }

    const activeProduct = await getProductBySlug(activeSlug);
    if (!activeProduct) {
        notFound();
    }

    return (
        <>
            <SiteHeader locale={locale} dict={dict} />
            <main className="vetdz-shell orders-page">
                <section className="orders-hero reveal">
                    <p>{dict.order.heroTitle}</p>
                    <h1>{dict.order.heroHeading}</h1>
                    <span>{dict.order.heroDescription}</span>
                </section>

                <section className="product-selector reveal">
                    {products.map((product) => {
                        const title = isEn ? (product.nameEn || product.nameAr) : product.nameAr;
                        return (
                            <Link
                                href={`/${locale}/orders?product=${product.slug}`}
                                key={product.id}
                                className={`selector-item ${product.slug === activeSlug ? "is-active" : ""}`}
                            >
                                {title}
                            </Link>
                        );
                    })}
                </section>

                <OrderForm
                    productSlug={activeProduct.slug}
                    productNameAr={activeProduct.nameAr}
                    productNameEn={activeProduct.nameEn}
                    unitPrice={activeProduct.finalPrice}
                    variations={activeProduct.variations}
                    locale={locale}
                    dict={dict}
                />
            </main>
        </>
    );
}
