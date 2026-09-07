import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { AboutHero } from "@/components/about-hero";
import { StorySection } from "@/components/story-section";
import { ValuesSection } from "@/components/values-section";
import { TeamSection } from "@/components/team-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { getDictionary, isValidLocale, type Locale } from "@/lib/i18n";

type AboutPageProps = {
    params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: AboutPageProps) {
    const { locale: rawLocale } = await params;
    if (!isValidLocale(rawLocale)) {
        notFound();
    }
    const locale = rawLocale as Locale;
    const dict = getDictionary(locale);

    return (
        <>
            <SiteHeader locale={locale} dict={dict} />
            <main className="about-page">
                <AboutHero locale={locale} dict={dict} />
                <StorySection locale={locale} dict={dict} />
                <ValuesSection locale={locale} dict={dict} />
                <TeamSection locale={locale} dict={dict} />
                <Suspense fallback={
                    <section className="testimonials-section-enhanced">
                        <div className="section-header">
                            <div className="skeleton-block" style={{ width: "200px", height: "28px", margin: "0 auto 0.75rem" }} />
                            <div className="skeleton-block" style={{ width: "350px", maxWidth: "90%", height: "16px", margin: "0 auto" }} />
                        </div>
                        <div className="testimonials-grid-enhanced">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="skeleton-card" style={{ padding: "1.5rem" }}>
                                    <div className="skeleton-block" style={{ width: "100px", height: "14px", marginBottom: "1rem" }} />
                                    <div className="skeleton-block" style={{ width: "100%", height: "14px", marginBottom: "0.5rem" }} />
                                    <div className="skeleton-block" style={{ width: "85%", height: "14px", marginBottom: "1.5rem" }} />
                                    <div className="skeleton-block" style={{ width: "120px", height: "16px" }} />
                                </div>
                            ))}
                        </div>
                    </section>
                }>
                    <TestimonialsSection locale={locale} dict={dict} />
                </Suspense>

                {/* CTA Section */}
                <section className="about-cta-section">
                    <div className="cta-content">
                        <h2>{dict.about.ctaTitle}</h2>
                        <p>{dict.about.ctaSubtitle}</p>
                        <Link href={`/${locale}/catalog`} className="cta-button">
                            {dict.about.ctaButton}
                        </Link>
                    </div>
                </section>
            </main>
        </>
    );
}
