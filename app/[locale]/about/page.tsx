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
                <TestimonialsSection locale={locale} dict={dict} />

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
