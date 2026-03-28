import Link from "next/link";
import Image from "next/image";
import { Footprints, Shirt, SquareDashedBottomCode, ArrowRight } from "lucide-react";
import { ProductFeed } from "@/components/product-feed";
import { SiteHeader } from "@/components/site-header";
import { HomeHero } from "@/components/home-hero";
import { getFeaturedProducts, getProductTypes, getProductsPage } from "@/lib/store";

const GENDER_OPTIONS = [
  { label: "رجالي", value: "MALE", image: "/men.jfif" },
  { label: "نسائي", value: "FEMALE", image: "/women.jfif" },
] as const;

const CATEGORY_OPTIONS = [
  { label: "الأقمصة", value: "toppings", image: "/shirt.jfif" },
  { label: "السراويل", value: "leggings", image: "/pant.jfif" },
  { label: "الأحذية", value: "shoes", image: "/shoes.jpg" },
] as const;

const TYPE_ICONS: Record<string, React.ReactNode> = {
  toppings: <Shirt size={24} />,
  leggings: <SquareDashedBottomCode size={24} />,
  shoes: <Footprints size={24} />,
};

function catalogHref(params: { gender?: string; type?: string; search?: string }) {
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

export default async function Home() {
  const [productTypes, featured, initialProducts] = await Promise.all([
    getProductTypes(),
    getFeaturedProducts(),
    getProductsPage({ page: 1, limit: 8 }),
  ]);

  return (
    <>
      <SiteHeader />

      <main className="home-page">
        {/* Hero Section with Fashion Image */}
        <HomeHero />

        {/* Gender Categories with Images */}
        <section className="categories-section">
          <div className="section-header">
            <h2>اختر حسب الفئة</h2>
            <p>استكشف مجموعتنا المتنوعة للرجال والنساء</p>
          </div>

          <div className="gender-grid-enhanced">
            {GENDER_OPTIONS.map((option) => (
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
                  <span className="card-arrow">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Product Categories Grid */}
        <section className="product-categories-section">
          <div className="section-header">
            <h2>تصفح حسب نوع المنتج</h2>
            <p>اكتشف أحدث قطعنا في كل فئة</p>
          </div>

          <div className="product-categories-grid">
            {CATEGORY_OPTIONS.map((category) => (
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
              <h2>المنتجات المميزة</h2>
            </div>
            <Link href="/catalog" className="view-all-link">
              عرض الكل
              <ArrowRight size={20} />
            </Link>
          </div>

          <ProductFeed
            initialItems={initialProducts.items}
            initialHasMore={initialProducts.hasMore}
            initialNextPage={initialProducts.nextPage}
            query={{}}
          />
        </section>

        {/* Secondary Hero with Fashion Image */}
        <section className="secondary-hero">
          <div className="secondary-hero-content">
            <h2>جودة حرفية بتصاميم فريدة</h2>
            <p>كل قطعة مصنوعة بعناية فائقة من خيوط عالية الجودة</p>
            <Link href="/about" className="learn-more-btn">
              تعرف على قصتنا
            </Link>
          </div>
          <div className="secondary-hero-image">
            <Image
              src="/fashion2.jpg"
              alt="تصاميم فريدة"
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
