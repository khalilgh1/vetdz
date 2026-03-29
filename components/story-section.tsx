"use client";

export function StorySection() {
    return (
        <section className="story-section">
            <div className="story-header">
                <h2>الرحلة</h2>
                <p>كيف بدأت VetDz Shop</p>
            </div>

            <div className="story-grid">
                <div className="story-card story-card-1">
                    <span className="story-number">01</span>
                    <h3>الرؤية</h3>
                    <p>
                        بدأت فكرة VetDz من شغف عميق بالموضة والجودة. أردنا إنشاء منصة تجميع
                        أفضل القطع التي تعكس هوية جزائرية عصرية بمعايير عالمية.
                    </p>
                </div>

                <div className="story-card story-card-2">
                    <span className="story-number">02</span>
                    <h3>الجودة</h3>
                    <p>
                        نختار كل قطعة بعناية فائقة من الموردين الموثوقين. نركز على الأقمشة
                        الممتازة والتفاصيل الدقيقة في التصنيع لضمان رضاك الكامل.
                    </p>
                </div>

                <div className="story-card story-card-3">
                    <span className="story-number">03</span>
                    <h3>المسؤولية</h3>
                    <p>
                        نؤمن بالاختيار المسؤول. نختار الموردين الذين يركزون على الممارسات
                        المستدامة لنحمي بيئتنا للأجيال القادمة.
                    </p>
                </div>
            </div>
        </section>
    );
}
