"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);

    if (images.length === 0) {
        return <div className="product-image-placeholder" />;
    }

    const active = images[activeIndex];

    const handlePrevious = () => {
        setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            handleNext();
        } else if (isRightSwipe) {
            handlePrevious();
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") handlePrevious();
            if (e.key === "ArrowRight") handleNext();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div
            className="carousel-wrap"
            ref={carouselRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className="carousel-image-frame">
                <Image
                    src={active.url}
                    alt={active.altAr}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="carousel-image"
                    priority={priority}
                />

                {images.length > 1 && (
                    <>
                        <button
                            type="button"
                            className="carousel-arrow carousel-arrow-prev"
                            onClick={handlePrevious}
                            aria-label="الصورة السابقة"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <button
                            type="button"
                            className="carousel-arrow carousel-arrow-next"
                            onClick={handleNext}
                            aria-label="الصورة التالية"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}
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
