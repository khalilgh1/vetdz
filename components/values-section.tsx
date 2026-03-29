"use client";

import { Sparkles, Palette, Handshake, Leaf } from "lucide-react";

export function ValuesSection() {
    return (
        <section className="values-section">
            <div className="values-header">
                <h2>قيمنا</h2>
                <p>ما يحرك عملنا كل يوم</p>
            </div>

            <div className="values-grid">
                <div className="value-card">
                    <div className="value-icon">
                        <Sparkles size={40} />
                    </div>
                    <h3>الجودة</h3>
                    <p>نختار أفضل المنتجات ونقدم أعلى معايير الخدمة</p>
                </div>

                <div className="value-card">
                    <div className="value-icon">
                        <Palette size={40} />
                    </div>
                    <h3>التنوع</h3>
                    <p>مجموعة متنوعة من أفضل العلامات والأنماط لكل الأذواق</p>
                </div>

                <div className="value-card">
                    <div className="value-icon">
                        <Handshake size={40} />
                    </div>
                    <h3>الشفافية</h3>
                    <p>علاقة صادقة مع عملائنا بأسعار عادلة وواضحة</p>
                </div>

                <div className="value-card">
                    <div className="value-icon">
                        <Leaf size={40} />
                    </div>
                    <h3>المسؤولية</h3>
                    <p>اختيار ذكي للمنتجات المستدامة والمسؤولة</p>
                </div>
            </div>
        </section>
    );
}
