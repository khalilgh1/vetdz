"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowDown } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries/ar";

type HomeHeroProps = {
    locale?: Locale;
    dict?: Dictionary;
};

export function HomeHero({ locale = "ar", dict }: HomeHeroProps) {
    const isEn = locale === "en";
    const [activeSlide, setActiveSlide] = useState(0);

    const eyebrow = isEn ? "PREMIUM FASHION FOR MODERN MEN" : "أزياء فاخرة للرجل المعاصر";
    const description = dict?.home.hero.description ?? (isEn 
        ? "Discover carefully curated styles designed for everyday confidence and lasting impression." 
        : "اكتشف تصاميم مختارة بعناية صُممت لتعزيز الثقة اليومية وترك أثر دائم لا يُنسى.");
    const cta = dict?.home.hero.cta ?? (isEn ? "Explore Collection" : "استكشف التشكيلة");

    return (
        <section className="luxury-hero-section">
            <div className="luxury-hero-media">
                <Image
                    src="/man-hero.jpg"
                    alt="VetDz Premium Fashion"
                    fill
                    className="luxury-hero-image"
                    priority
                    quality={95}
                    sizes="100vw"
                />
                <div className="luxury-hero-gradient" />
            </div>

            <div className="luxury-hero-inner">
                <div className="luxury-hero-content">
                    {/* Haute-Couture Eyebrow */}
                    <div className="luxury-eyebrow">
                        <span className="eyebrow-line" aria-hidden="true" />
                        <span className="eyebrow-text">{eyebrow}</span>
                    </div>

                    {/* Dual-Tone Editorial Serif Headline */}
                    <h1 className="luxury-title">
                        {isEn ? (
                            <>
                                <span>Wear Pieces That</span>
                                <span className="luxury-gold-text">Elevate Your</span>
                                <span>Presence</span>
                            </>
                        ) : (
                            <>
                                <span>اختَر القطع التي</span>
                                <span className="luxury-gold-text">ترتقي بحضورك</span>
                                <span>وأناقتك</span>
                            </>
                        )}
                    </h1>

                    {/* Editorial Description */}
                    <p className="luxury-description">{description}</p>

                    {/* Champagne Sand CTA Button */}
                    <div className="luxury-cta-row">
                        <Link href={`/${locale}/catalog`} className="luxury-cta-btn">
                            <span>{cta}</span>
                            {isEn ? <ArrowRight size={17} className="cta-arrow" /> : <ArrowLeft size={17} className="cta-arrow" />}
                        </Link>
                    </div>
                </div>

                {/* Bottom Slider Dots
                <div className="luxury-hero-footer">
                    <div className="luxury-carousel-dots" role="tablist" aria-label="Hero Slides">
                        {[0, 1, 2, 3].map((dotIdx) => (
                            <button
                                key={dotIdx}
                                type="button"
                                className={`luxury-dot ${activeSlide === dotIdx ? "is-active" : ""}`}
                                onClick={() => setActiveSlide(dotIdx)}
                                aria-label={`Slide ${dotIdx + 1}`}
                            />
                        ))}
                    </div>
                </div> */}

                {/* Vertical Scroll Indicator on Right Flank */}
                <div className="luxury-scroll-indicator" aria-hidden="true">
                    <span className="scroll-label">{isEn ? "SCROLL" : "تمرير"}</span>
                    <span className="scroll-line" />
                    <ArrowDown size={14} className="scroll-arrow" />
                </div>
            </div>
        </section>
    );
}

