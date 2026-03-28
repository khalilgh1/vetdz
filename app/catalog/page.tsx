import Link from "next/link";
import { Footprints, Shirt, SquareDashedBottomCode } from "lucide-react";
import { ProductFeed } from "@/components/product-feed";
import { SiteHeader } from "@/components/site-header";
import { getProductTypes, getProductsPage } from "@/lib/store";

type CatalogPageProps = {
    searchParams: Promise<{
        gender?: string;
        type?: string;
        search?: string;
    }>;
};

const GENDER_OPTIONS = [
    { label: "رجالي", value: "MALE" },
    { label: "نسائي", value: "FEMALE" },
    { label: "الكل", value: "ALL" },
] as const;

const TYPE_ICONS: Record<string, React.ReactNode> = {
    toppings: <Shirt size={24} />,
    leggings: <SquareDashedBottomCode size={24} />,
    shoes: <Footprints size={24} />,
};

function buildCatalogHref(params: { gender?: string; type?: string; search?: string }) {
    const query = new URLSearchParams();

    if (params.gender) {
        query.set("gender", params.gender);
    }
    if (params.type) {
        query.set("type", params.type);
    }
    if (params.search) {
        query.set("search", params.search);
    }

    const search = query.toString();
    return search ? `/catalog?${search}` : "/catalog";
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
    const query = await searchParams;
    const gender = query.gender === "MALE" || query.gender === "FEMALE" || query.gender === "ALL" ? query.gender : "ALL";
    const type = query.type?.trim();
    const search = query.search?.trim();

    const [productTypes, initialProducts] = await Promise.all([
        getProductTypes(),
        getProductsPage({
            page: 1,
            limit: 8,
            gender,
            productTypeSlug: type,
            search,
        }),
    ]);

    return (
        <>
            <SiteHeader />

            <main className="vetdz-shell catalog-page">
                <section className="hero-box reveal">
                    <p>صفحة التصفية</p>
                    <h1>استعرض كل المنتجات مع الفلاتر</h1>
                    <span>اختر الجنس أو النوع أو استخدم البحث للوصول إلى ما تريد، ثم استمر في التمرير لتحميل المزيد.</span>
                </section>

                <section className="catalog-filters reveal">
                    <div className="catalog-filter-group">
                        {GENDER_OPTIONS.map((option) => (
                            <Link
                                href={buildCatalogHref({ gender: option.value, type, search })}
                                className={`catalog-filter-chip ${gender === option.value ? "is-active" : ""}`}
                                key={option.value}
                            >
                                {option.label}
                            </Link>
                        ))}
                    </div>

                    <div className="type-grid">
                        {productTypes.map((item) => (
                            <Link
                                href={buildCatalogHref({ gender, type: item.slug, search })}
                                className={`type-item ${type === item.slug ? "is-active" : ""}`}
                                key={item.id}
                            >
                                <div className="type-icon">{TYPE_ICONS[item.slug] ?? <Shirt size={24} />}</div>
                                <span>{item.nameAr}</span>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="product-list-section reveal">
                    <div className="section-head">
                        <h2>المنتجات</h2>
                        {gender !== "ALL" || type || search ? (
                            <Link href="/catalog" className="line-link">
                                عرض الكل
                            </Link>
                        ) : null}
                    </div>

                    {gender !== "ALL" || type || search ? (
                        <p className="results-hint">
                            {gender !== "ALL" ? `الجنس: ${gender === "MALE" ? "رجالي" : "نسائي"}` : null}
                            {type ? `${gender !== "ALL" ? " | " : ""}النوع: ${type}` : null}
                            {search ? `${gender !== "ALL" || type ? " | " : ""}البحث: ${search}` : null}
                        </p>
                    ) : null}

                    <ProductFeed
                        initialItems={initialProducts.items}
                        initialHasMore={initialProducts.hasMore}
                        initialNextPage={initialProducts.nextPage}
                        query={{
                            gender: gender === "ALL" ? undefined : gender,
                            type,
                            search,
                        }}
                    />
                </section>
            </main>
        </>
    );
}