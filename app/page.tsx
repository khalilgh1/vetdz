import Link from "next/link";
import { Footprints, Shirt, SquareDashedBottomCode } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { getFeaturedProducts, getHomeProducts, getProductTypes } from "@/lib/store";

type HomeProps = {
  searchParams: Promise<{
    gender?: "MALE" | "FEMALE" | "ALL";
    type?: string;
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

function queryHref(gender: string, type?: string) {
  const params = new URLSearchParams();
  params.set("gender", gender);
  if (type) params.set("type", type);
  return `/?${params.toString()}`;
}

export default async function Home({ searchParams }: HomeProps) {
  const query = await searchParams;
  const gender = query.gender ?? "ALL";
  const selectedType = query.type;

  const [productTypes, products, featured] = await Promise.all([
    getProductTypes(),
    getHomeProducts(gender, selectedType),
    getFeaturedProducts(),
  ]);

  return (
    <>
      <SiteHeader />

      <main className="vetdz-shell home-page">
        <section className="hero-box reveal">
          <p>خياطة جزائرية معاصرة</p>
          <h1>اختَر القطعة التي تعكس حضورك</h1>
          <span>تصاميم محدودة بجودة عالية وتفاصيل دقيقة لكل يوم.</span>
        </section>

        <section className="gender-grid reveal">
          {GENDER_OPTIONS.map((option) => (
            <Link
              href={queryHref(option.value, selectedType)}
              className={`gender-card ${gender === option.value ? "is-active" : ""}`}
              key={option.value}
            >
              <strong>{option.label}</strong>
            </Link>
          ))}
        </section>

        <section className="type-grid reveal">
          {productTypes.map((type) => (
            <Link
              href={queryHref(gender, type.slug)}
              key={type.id}
              className={`type-item ${selectedType === type.slug ? "is-active" : ""}`}
            >
              <div className="type-icon">{TYPE_ICONS[type.slug] ?? <Shirt size={24} />}</div>
              <span>{type.nameAr}</span>
            </Link>
          ))}
        </section>

        <section className="product-list-section reveal">
          <div className="section-head">
            <h2>منتجاتنا</h2>
            {selectedType ? (
              <Link href={queryHref(gender)} className="line-link">
                عرض الكل
              </Link>
            ) : null}
          </div>

          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="featured-strip reveal">
          <div className="section-head">
            <h2>مختارات الأتيليه</h2>
          </div>
          <div className="featured-scroll">
            {featured.map((item) => (
              <Link key={item.id} href={`/products/${item.slug}`} className="featured-item">
                <p>{item.nameAr}</p>
                <span>{item.subtitleAr}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
