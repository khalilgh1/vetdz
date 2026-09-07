import Image from "next/image";
import Link from "next/link";
import { formatDzd } from "@/lib/format";
import type { UiProduct } from "@/lib/store";
import type { Locale } from "@/lib/i18n";

type ProductCardProps = {
    product: UiProduct;
    locale?: Locale;
};

export function ProductCard({ product, locale = "ar" }: ProductCardProps) {
    const firstImage = product.images[0];
    const isEn = locale === "en";
    const name = isEn ? (product.nameEn || product.nameAr) : product.nameAr;
    const subtitle = isEn ? (product.subtitleEn || product.subtitleAr) : product.subtitleAr;
    const alt = isEn ? (firstImage?.altEn || name) : (firstImage?.altAr || name);
    const currency = isEn ? "DZD" : "دج";

    // Generate a tiny blurred placeholder URL from Cloudinary for blur-up effect
    const blurUrl = firstImage?.url?.includes("/upload/")
        ? firstImage.url.replace("/upload/", "/upload/e_blur:800,q_10,w_30/")
        : undefined;

    return (
        <article className="product-card">
            <Link href={`/${locale}/products/${product.slug}`} className="product-image-link">
                <div className="product-image-holder">
                    {firstImage ? (
                        <Image
                            src={firstImage.url}
                            alt={alt}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            className="product-image"
                            {...(blurUrl ? { placeholder: "blur" as const, blurDataURL: blurUrl } : {})}
                        />
                    ) : (
                        <div className="product-image-placeholder" />
                    )}
                </div>
            </Link>

            <div className="product-copy">
                <h3>{name}</h3>
                <p>{subtitle}</p>

                <div className="price-row">
                    {product.discountActive && product.discountedPrice ? (
                        <>
                            <span className="price-original">{formatDzd(product.price)} {currency}</span>
                            <strong className="price-final">{formatDzd(product.discountedPrice)} {currency}</strong>
                            <span className="discount-badge">
                                {isEn ? `-${product.discountPercent}%` : `${product.discountPercent}%-`}
                            </span>
                        </>
                    ) : (
                        <strong className="price-final">{formatDzd(product.price)} {currency}</strong>
                    )}
                </div>
            </div>
        </article>
    );
}
