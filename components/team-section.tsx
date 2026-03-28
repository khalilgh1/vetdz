"use client";

import Image from "next/image";

export function TeamSection() {
    return (
        <section className="team-section">
            <div className="team-header">
                <h2>الفريق خلف VetDz</h2>
                <p>متخصصون مكرسون لجودة العمل</p>
            </div>

            <div className="team-grid">
                <div className="team-card">
                    <div className="team-card-image">
                        <Image
                            src="/fashion1.jpg"
                            alt="المصمم"
                            fill
                            className="team-image"
                            sizes="(max-width: 768px) 100vw, 300px"
                        />
                    </div>
                    <h3>التصميم</h3>
                    <p>فريق متخصص في الموضة المعاصرة</p>
                </div>

                <div className="team-card">
                    <div className="team-card-image">
                        <Image
                            src="/fashion2.jpg"
                            alt="الخياطة"
                            fill
                            className="team-image"
                            sizes="(max-width: 768px) 100vw, 300px"
                        />
                    </div>
                    <h3>الخياطة</h3>
                    <p>حرفيون محترفون بخبرة عالية</p>
                </div>

                <div className="team-card">
                    <div className="team-card-image">
                        <Image
                            src="/shirt.jfif"
                            alt="الجودة"
                            fill
                            className="team-image"
                            sizes="(max-width: 768px) 100vw, 300px"
                        />
                    </div>
                    <h3>الجودة</h3>
                    <p>متابعة دقيقة في كل مرحلة إنتاج</p>
                </div>
            </div>
        </section>
    );
}
