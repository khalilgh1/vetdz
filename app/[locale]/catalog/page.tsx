import Link from "next/link";
import { notFound } from "next/navigation";
import { Footprints, Shirt, SquareDashedBottomCode, Columns2 } from "lucide-react";
import { ProductFeed } from "@/components/product-feed";
import { SiteHeader } from "@/components/site-header";
import { getProductTypes, getProductsPage } from "@/lib/store";
import { getDictionary, isValidLocale, type Locale } from "@/lib/i18n";

type CatalogPageProps = {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{
        gender?: string;
        type?: string;
        search?: string;
    }>;
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
    toppings: <Shirt size={24} />,
    leggings: <SquareDashedBottomCode size={24} />,
    shoes: <Footprints size={24} />,
};

export default async function CatalogPage({ params, searchParams }: CatalogPageProps) {
    const { locale: rawLocale } = await params;
    if (!isValidLocale(rawLocale)) {
        notFound();
    }
    const locale = rawLocale as Locale;
    const dict = getDictionary(locale);

    const query = await searchParams;
    const gender = query.gender === "MALE" || query.gender === "FEMALE" || query.gender === "ALL" ? query.gender : "ALL";
    const type = query.type?.trim();
    const search = query.search?.trim();

    const genderOptions = [
        { label: dict.catalog.men, value: "MALE" },
        { label: dict.catalog.women, value: "FEMALE" },
        { label: dict.catalog.all, value: "ALL" },
    ] as const;

    function buildCatalogHref(filterParams: { gender?: string; type?: string; search?: string }) {
        const urlParams = new URLSearchParams();
        if (filterParams.gender) urlParams.set("gender", filterParams.gender);
        if (filterParams.type) urlParams.set("type", filterParams.type);
        if (filterParams.search) urlParams.set("search", filterParams.search);

        const searchString = urlParams.toString();
        return searchString ? `/${locale}/catalog?${searchString}` : `/${locale}/catalog`;
    }

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
            <SiteHeader locale={locale} dict={dict} />

            <main className="vetdz-shell catalog-page">
                <section className="hero-box reveal">
                    <p>{dict.catalog.title}</p>
                    <h1>{dict.catalog.heading}</h1>
                    <span>{dict.catalog.description}</span>
                </section>

                <section className="catalog-filters reveal">
                    <div className="catalog-filter-group">
                        {genderOptions.map((option) => (
                            <Link
                                href={buildCatalogHref({ gender: option.value, type, search })}
                                className={`catalog-filter-chip ${gender === option.value ? "is-active" : ""}`}
                                key={option.value}
                                scroll={false}
                            >
                                {option.label}
                            </Link>
                        ))}
                    </div>

                    <div className="type-grid">
                        {productTypes.map((item) => {
                            const catName = locale === "en" && item.nameEn ? item.nameEn : item.nameAr;

                            return (
                                <Link
                                    href={buildCatalogHref({ gender, type: item.slug, search })}
                                    className={`type-item ${type === item.slug ? "is-active" : ""}`}
                                    key={item.id}
                                    scroll={false}
                                >
                                    <div className="type-icon">{TYPE_ICONS[item.slug] ?? <Columns2 size={24} />}</div>
                                    <span>{catName}</span>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                <section className="product-list-section reveal">
                    <div className="section-head">
                        <h2>{dict.catalog.products}</h2>
                        {gender !== "ALL" || type || search ? (
                            <Link href={`/${locale}/catalog`} className="line-link">
                                {dict.catalog.viewAll}
                            </Link>
                        ) : null}
                    </div>

                    {gender !== "ALL" || type || search ? (
                        <p className="results-hint">
                            {gender !== "ALL" ? `${dict.catalog.filterHints.gender}: ${gender === "MALE" ? dict.catalog.men : dict.catalog.women}` : null}
                            {type ? `${gender !== "ALL" ? " | " : ""}${dict.catalog.filterHints.type}: ${
                                (locale === "en"
                                    ? productTypes.find((t) => t.slug === type)?.nameEn
                                    : productTypes.find((t) => t.slug === type)?.nameAr) ?? type
                            }` : null}
                            {search ? `${gender !== "ALL" || type ? " | " : ""}${dict.catalog.filterHints.search}: ${search}` : null}
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
                        locale={locale}
                    />
                </section>
            </main>
        </>
    );
}
