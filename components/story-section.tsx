"use client";

import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries/ar";

type StorySectionProps = {
    locale?: Locale;
    dict?: Dictionary;
};

export function StorySection({ locale = "ar", dict }: StorySectionProps) {
    const isEn = locale === "en";
    const header = dict?.about.story.header ?? (isEn ? "The Journey" : "الرحلة");
    const subheader = dict?.about.story.subheader ?? (isEn ? "How VetDz Began" : "كيف بدأت VetDz Shop");

    return (
        <section className="story-section">
            <div className="story-header">
                <h2>{header}</h2>
                <p>{subheader}</p>
            </div>

            <div className="story-grid">
                <div className="story-card story-card-1">
                    <span className="story-number">01</span>
                    <h3>{dict?.about.story.card1Title ?? (isEn ? "Vision" : "الرؤية")}</h3>
                    <p>
                        {dict?.about.story.card1Text ?? (isEn
                            ? "VetDz emerged from a deep dedication to style and longevity. We envisioned a modern Algerian label designed to world-class fashion standards."
                            : "بدأت فكرة VetDz من شغف عميق بالموضة والجودة. أردنا إنشاء منصة تجمع أفضل القطع التي تعكس هوية جزائرية عصرية بمعايير عالمية.")}
                    </p>
                </div>

                <div className="story-card story-card-2">
                    <span className="story-number">02</span>
                    <h3>{dict?.about.story.card2Title ?? (isEn ? "Quality" : "الجودة")}</h3>
                    <p>
                        {dict?.about.story.card2Text ?? (isEn
                            ? "We meticulously select fabrics and partners, prioritizing premium hand-feel, structural durability, and refined tailoring in every single stitch."
                            : "نختار كل قطعة بعناية فائقة من الموردين الموثوقين. نركز على الأقمشة الممتازة والتفاصيل الدقيقة في التصنيع لضمان رضاك الكامل.")}
                    </p>
                </div>

                <div className="story-card story-card-3">
                    <span className="story-number">03</span>
                    <h3>{dict?.about.story.card3Title ?? (isEn ? "Responsibility" : "المسؤولية")}</h3>
                    <p>
                        {dict?.about.story.card3Text ?? (isEn
                            ? "We champion conscious production, partnering with responsible workshops to ensure our pieces endure across seasons and years."
                            : "نؤمن بالاختيار المسؤول. نختار الموردين الذين يركزون على الممارسات المستدامة لنحمي بيئتنا للأجيال القادمة.")}
                    </p>
                </div>
            </div>
        </section>
    );
}
