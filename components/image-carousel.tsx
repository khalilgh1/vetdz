"use client";

import { useState } from "react";
import Image from "next/image";

type ImageItem = {
    id: number;
    url: string;
    altAr: string;
};

type ImageCarouselProps = {
    images: ImageItem[];
    priority?: boolean;
};

export function ImageCarousel({ images, priority = false }: ImageCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    if (images.length === 0) {
        return <div className="product-image-placeholder" />;
    }

    const active = images[activeIndex];

    return (
        <div className="carousel-wrap">
            <div className="carousel-image-frame">
                <Image
                    src={active.url}
                    alt={active.altAr}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="carousel-image"
                    priority={priority}
                />
            </div>

            <div className="carousel-dots" role="tablist" aria-label="صور المنتج">
                {images.map((image, idx) => (
                    <button
                        key={image.id}
                        type="button"
                        className={`carousel-dot ${idx === activeIndex ? "is-active" : ""}`}
                        onClick={() => setActiveIndex(idx)}
                        aria-label={`الصورة ${idx + 1}`}
                        aria-selected={idx === activeIndex}
                        role="tab"
                    />
                ))}
            </div>
        </div>
    );
}
