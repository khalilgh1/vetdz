"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries/ar";

type HomeHeroProps = {
    locale?: Locale;
    dict?: Dictionary;
};

export function HomeHero({ locale = "ar", dict }: HomeHeroProps) {
    const isEn = locale === "en";
    const title = dict?.home.hero.title ?? (isEn ? "Wear Pieces That Elevate Your Presence" : "اختَر القطعة التي تعكس حضورك");
    const description = dict?.home.hero.description ?? (isEn ? "Limited high-grade designs crafted with precision for everyday distinction." : "تصاميم محدودة بجودة عالية وتفاصيل دقيقة لكل يوم");
    const cta = dict?.home.hero.cta ?? (isEn ? "Explore Collection" : "تصفح منتجاتنا");
    const badge = dict?.home.hero.badge ?? (isEn ? "Contemporary Algerian Tailoring" : "خياطة جزائرية معاصرة");

    return (
        <section className="hero-section">
            <div className="hero-image-container">
                <Image
                    src="/fashion1.jpg"
                    alt={badge}
                    fill
                    className="hero-image"
                    priority
                    sizes="100vw"
                />
                <div className="hero-overlay" />
            </div>

            <div className="hero-content">
                <div className="hero-text-wrapper">
                    <h1 className="hero-title">{title}</h1>
                    <p className="hero-description">{description}</p>
                    <Link href={`/${locale}/catalog`} className="hero-cta-button">
                        <span>{cta}</span>
                        {isEn ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
                    </Link>
                </div>
            </div>
        </section>
    );
}
