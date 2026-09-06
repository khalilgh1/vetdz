"use client";

import { Sparkles, Palette, Handshake, Leaf } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries/ar";

type ValuesSectionProps = {
    locale?: Locale;
    dict?: Dictionary;
};

export function ValuesSection({ locale = "ar", dict }: ValuesSectionProps) {
    const isEn = locale === "en";
    const header = dict?.about.values.header ?? (isEn ? "Our Values" : "قيمنا");
    const subheader = dict?.about.values.subheader ?? (isEn ? "What drives us every day" : "ما يحرك عملنا كل يوم");

    return (
        <section className="values-section">
            <div className="values-header">
                <h2>{header}</h2>
                <p>{subheader}</p>
            </div>

            <div className="values-grid">
                <div className="value-card">
                    <div className="value-icon">
                        <Sparkles size={40} />
                    </div>
                    <h3>{dict?.about.values.val1Title ?? (isEn ? "Quality" : "الجودة")}</h3>
                    <p>{dict?.about.values.val1Text ?? (isEn ? "Curating supreme textiles and offering elevated customer care" : "نختار أفضل المنتجات ونقدم أعلى معايير الخدمة")}</p>
                </div>

                <div className="value-card">
                    <div className="value-icon">
                        <Palette size={40} />
                    </div>
                    <h3>{dict?.about.values.val2Title ?? (isEn ? "Diversity" : "التنوع")}</h3>
                    <p>{dict?.about.values.val2Text ?? (isEn ? "A versatile range of silhouettes tailored for every aesthetic" : "مجموعة متنوعة من أفضل العلامات والأنماط لكل الأذواق")}</p>
                </div>

                <div className="value-card">
                    <div className="value-icon">
                        <Handshake size={40} />
                    </div>
                    <h3>{dict?.about.values.val3Title ?? (isEn ? "Transparency" : "الشفافية")}</h3>
                    <p>{dict?.about.values.val3Text ?? (isEn ? "An honest relationship with fair, transparent pricing" : "علاقة صادقة مع عملائنا بأسعار عادلة وواضحة")}</p>
                </div>

                <div className="value-card">
                    <div className="value-icon">
                        <Leaf size={40} />
                    </div>
                    <h3>{dict?.about.values.val4Title ?? (isEn ? "Responsibility" : "المسؤولية")}</h3>
                    <p>{dict?.about.values.val4Text ?? (isEn ? "Mindful material choices and enduring craft" : "اختيار ذكي للمنتجات المستدامة والمسؤولة")}</p>
                </div>
            </div>
        </section>
    );
}
