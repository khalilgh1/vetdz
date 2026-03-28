"use client";

export function StorySection() {
    return (
        <section className="story-section">
            <div className="story-header">
                <h2>الرحلة</h2>
                <p>كيف بدأت VetDz Atelier</p>
            </div>

            <div className="story-grid">
                <div className="story-card story-card-1">
                    <span className="story-number">01</span>
                    <h3>الإبداع</h3>
                    <p>
                        بدأت فكرة VetDz من شغف عميق بالتصميم والجودة. أردنا إنشاء قطع ملابس
                        تعكس هوية جزائرية عصرية بمعايير عالمية.
                    </p>
                </div>

                <div className="story-card story-card-2">
                    <span className="story-number">02</span>
                    <h3>الحرفية</h3>
                    <p>
                        كل قطعة تصنع بعناية فائقة من قبل خياطين محترفين. نستخدم أفضل الأقمشة
                        ونتابع كل التفاصيل الدقيقة في الإنتاج.
                    </p>
                </div>

                <div className="story-card story-card-3">
                    <span className="story-number">03</span>
                    <h3>الاستدامة</h3>
                    <p>
                        نؤمن بالإنتاج المسؤول. نختار المواد بعناية ونقلل النفايات لنحمي بيئتنا
                        للأجيال القادمة.
                    </p>
                </div>
            </div>
        </section>
    );
}
