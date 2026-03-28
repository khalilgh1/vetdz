"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import BlurText from "@/components/BlurText";

export function HomeHero() {
    return (
        <section className="hero-section">
            <div className="hero-image-container">
                <Image
                    src="/fashion1.jpg"
                    alt="خياطة جزائرية معاصرة"
                    fill
                    className="hero-image"
                    priority
                    sizes="100vw"
                />
                <div className="hero-overlay" />
            </div>

            <div className="hero-content">
                <div className="hero-text-wrapper">
                    <h1 className="hero-title">اختَر القطعة التي تعكس حضورك</h1>
                    <p className="hero-description">
                        تصاميم محدودة بجودة عالية وتفاصيل دقيقة لكل يوم
                    </p>
                    <Link href="/catalog" className="hero-cta-button">
                        تصفح الكتالوج
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
