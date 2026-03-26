import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderForm } from "@/components/order-form";
import { SiteHeader } from "@/components/site-header";
import { getHomeProducts, getProductBySlug } from "@/lib/store";

type OrdersPageProps = {
    searchParams: Promise<{ product?: string }>;
};

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
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
            <SiteHeader />
            <main className="vetdz-shell orders-page">
                <section className="orders-hero reveal">
                    <p>طلبات بدون دفع إلكتروني</p>
                    <h1>أرسل طلبك الآن</h1>
                    <span>اختر المنتج ثم املأ بيانات التوصيل، وسنتصل بك لتأكيد الطلب.</span>
                </section>

                <section className="product-selector reveal">
                    {products.map((product) => (
                        <Link
                            href={`/orders?product=${product.slug}`}
                            key={product.id}
                            className={`selector-item ${product.slug === activeSlug ? "is-active" : ""}`}
                        >
                            {product.nameAr}
                        </Link>
                    ))}
                </section>

                <OrderForm
                    productSlug={activeProduct.slug}
                    productNameAr={activeProduct.nameAr}
                    unitPrice={activeProduct.finalPrice}
                    variations={activeProduct.variations}
                />
            </main>
        </>
    );
}
