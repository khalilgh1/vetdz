"use client";

import Image from "next/image";

export function TeamSection() {
    return (
        <section className="team-section">
            <div className="team-header">
                <h2>الفريق خلف VetDz</h2>
                <p>متخصصون مكرسون لرضاك وخدمتك</p>
            </div>

            <div className="team-grid">
                <div className="team-card">
                    <div className="team-card-image">
                        <Image
                            src="/fashion1.jpg"
                            alt="المنتقي"
                            fill
                            className="team-image"
                            sizes="(max-width: 768px) 100vw, 300px"
                        />
                    </div>
                    <h3>الاختيار</h3>
                    <p>فريق متخصص في انتقاء أفضل القطع</p>
                </div>

                <div className="team-card">
                    <div className="team-card-image">
                        <Image
                            src="/fashion2.jpg"
                            alt="الخدمة"
                            fill
                            className="team-image"
                            sizes="(max-width: 768px) 100vw, 300px"
                        />
                    </div>
                    <h3>الخدمة</h3>
                    <p>فريق عمل احترافي جاهز لمساعدتك</p>
                </div>

                <div className="team-card">
                    <div className="team-card-image">
                        <Image
                            src="/shirt.jpg"
                            alt="الجودة"
                            fill
                            className="team-image"
                            sizes="(max-width: 768px) 100vw, 300px"
                        />
                    </div>
                    <h3>الجودة</h3>
                    <p>فحص صارم لكل قطعة قبل التسليم</p>
                </div>
            </div>
        </section>
    );
}
