"use client";

import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries/ar";

type AboutHeroProps = {
    locale?: Locale;
    dict?: Dictionary;
};

export function AboutHero({ locale = "ar", dict }: AboutHeroProps) {
    const isEn = locale === "en";
    const title = dict?.about.heroTitle ?? (isEn ? "Fashion Combining Algerian Authenticity with Modern Precision" : "أزياء تجمع بين الأصالة الجزائرية والتصميم العصري");
    const description = dict?.about.heroSubtitle ?? (isEn
        ? "At VetDz, we believe clothing is more than fabric—it is an authentic canvas for personal distinction and cultural pride, made to world-class standards."
        : "في VetDz نؤمن أن اللباس ليس مجرد قماش، بل مساحة للتعبير الشخصي والهوية. نختار قطعًا فريدة عالية الجودة تجمع بين الحرفية والراحة لتلبية ذوقك المعاصر.");

    return (
        <section className="about-hero-enhanced">
            <div className="about-hero-content">
                <h1 className="about-hero-title">VetDz Shop</h1>
                <p className="about-hero-description">{description}</p>
            </div>
        </section>
    );
}
