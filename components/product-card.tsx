import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { formatDzd } from "@/lib/format";
import type { UiProduct } from "@/lib/store";

type ProductCardProps = {
    product: UiProduct;
};

export function ProductCard({ product }: ProductCardProps) {
    const firstImage = product.images[0];

    return (
        <article className="product-card">
            <Link href={`/products/${product.slug}`} className="product-image-link">
                <div className="product-image-holder">
                    {firstImage ? (
                        <Image
                            src={firstImage.url}
                            alt={firstImage.altAr}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            className="product-image"
                        />
                    ) : (
                        <div className="product-image-placeholder" />
                    )}
                </div>
            </Link>

            <button type="button" aria-label="إضافة للمفضلة" className="favorite-btn">
                <Heart size={19} />
            </button>

            <div className="product-copy">
                <h3>{product.nameAr}</h3>
                <p>{product.subtitleAr}</p>

                <div className="price-row">
                    {product.discountActive && product.discountedPrice ? (
                        <>
                            <span className="price-original">{formatDzd(product.price)} دج</span>
                            <strong className="price-final">{formatDzd(product.discountedPrice)} دج</strong>
                            <span className="discount-badge">-{product.discountPercent}%</span>
                        </>
                    ) : (
                        <strong className="price-final">{formatDzd(product.price)} دج</strong>
                    )}
                </div>
            </div>
        </article>
    );
}
