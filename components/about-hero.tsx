"use client";

import BlurText from "@/components/BlurText";

export function AboutHero() {
    return (
        <section className="about-hero-enhanced">
            <div className="about-hero-content">
                <BlurText
                    text="قصتنا"
                    className="about-hero-label"
                    animateBy="words"
                    delay={100}
                />
                <h1 className="about-hero-title">VetDz Atelier</h1>
                <p className="about-hero-description">
                    في VetDz نؤمن أن اللباس ليس مجرد قماش، بل مساحة للتعبير الشخصي والهوية.
                    نصمم قطعًا فريدة تجمع بين الانضباط الحرفي وروح الشارع الجزائري المعاصر.
                </p>
            </div>
        </section>
    );
}
