import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProductFeed } from "@/components/product-feed";
import { SiteHeader } from "@/components/site-header";
import { HomeHero } from "@/components/home-hero";
import { getFeaturedProducts, getProductTypes, getProductsPage } from "@/lib/store";
import { getDictionary, isValidLocale, type Locale } from "@/lib/i18n";

type HomePageProps = {
    params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
    const { locale: rawLocale } = await params;
    if (!isValidLocale(rawLocale)) {
        notFound();
    }
    const locale = rawLocale as Locale;
    const dict = getDictionary(locale);
    const isEn = locale === "en";

    const genderOptions = [
        { label: dict.home.genderSection.men, value: "MALE", image: "/men.jpg" },
        { label: dict.home.genderSection.women, value: "FEMALE", image: "/women.png" },
    ] as const;

    const categoryOptions = [
        { label: dict.categories.toppings, value: "toppings", image: "/shirt.jpg" },
        { label: dict.categories.leggings, value: "leggings", image: "/pant.jpg" },
        { label: dict.categories.shoes, value: "shoes", image: "/shoes.jpg" },
    ] as const;

    function catalogHref(filterParams: { gender?: string; type?: string; search?: string }) {
        const query = new URLSearchParams();
        if (filterParams.gender) query.set("gender", filterParams.gender);
        if (filterParams.type) query.set("type", filterParams.type);
        if (filterParams.search) query.set("search", filterParams.search);
        const search = query.toString();
        return search ? `/${locale}/catalog?${search}` : `/${locale}/catalog`;
    }

    const [productTypes, featured, initialProducts] = await Promise.all([
        getProductTypes(),
        getFeaturedProducts(),
        getProductsPage({ page: 1, limit: 8 }),
    ]);

    return (
        <>
            <SiteHeader locale={locale} dict={dict} />

            {/* Full-bleed Luxury Hero Section */}
            <HomeHero locale={locale} dict={dict} />

            <main className="home-page">
                {/* Gender Categories with Images */}
                <section className="categories-section">
                    <div className="section-header">
                        <h2>{dict.home.genderSection.title}</h2>
                        <p>{dict.home.genderSection.subtitle}</p>
                    </div>

                    <div className="gender-grid-enhanced">
                        {genderOptions.map((option) => (
                            <Link
                                href={catalogHref({ gender: option.value })}
                                className="gender-card-enhanced"
                                key={option.value}
                            >
                                <div className="gender-card-image-container">
                                    <Image
                                        src={option.image}
                                        alt={option.label}
                                        fill
                                        className="gender-card-image"
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                    />
                                    <div className="gender-card-overlay" />
                                </div>
                                <div className="gender-card-content">
                                    <h3>{option.label}</h3>
                                    <span className="card-arrow">{isEn ? "→" : "←"}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Product Categories Grid */}
                <section className="product-categories-section">
                    <div className="section-header">
                        <h2>{dict.home.categoriesSection.title}</h2>
                        <p>{dict.home.categoriesSection.subtitle}</p>
                    </div>

                    <div className="product-categories-grid">
                        {categoryOptions.map((category) => (
                            <Link
                                href={catalogHref({ type: category.value })}
                                className="product-category-card"
                                key={category.value}
                            >
                                <div className="category-image-wrapper">
                                    <Image
                                        src={category.image}
                                        alt={category.label}
                                        fill
                                        className="category-image"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                    <div className="category-overlay" />
                                </div>
                                <div className="category-content">
                                    <h3>{category.label}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Featured Products Section */}
                <section className="featured-section">
                    <div className="featured-header">
                        <div>
                            <h2>{dict.home.featuredSection.title}</h2>
                        </div>
                        <Link href={`/${locale}/catalog`} className="view-all-link">
                            <span>{dict.home.featuredSection.viewAll}</span>
                            {isEn ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
                        </Link>
                    </div>

                    <ProductFeed
                        initialItems={featured}
                        initialHasMore={false}
                        initialNextPage={null}
                        query={{}}
                        locale={locale}
                    />
                </section>

                {/* Secondary Hero */}
                <section className="secondary-hero">
                    <div className="secondary-hero-content">
                        <h2>{isEn ? "Exceptional Quality & Timeless Precision" : "جودة عالية بتصاميم فريدة"}</h2>
                        <p>{isEn ? "Every garment is curated to offer enduring value and supreme hand-feel." : "كل قطعة مختارة بعناية فائقة لضمان القيمة والجودة"}</p>
                        <Link href={`/${locale}/about`} className="learn-more-btn">
                            {dict.nav.about}
                        </Link>
                    </div>
                    <div className="secondary-hero-image">
                        <Image
                            src="/fashion2.jpg"
                            alt="VetDz Editorial"
                            fill
                            className="secondary-image"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>
                </section>
            </main>
        </>
    );
}
