import { SiteHeader } from "@/components/site-header";
import { AboutHero } from "@/components/about-hero";
import { StorySection } from "@/components/story-section";
import { ValuesSection } from "@/components/values-section";
import { TeamSection } from "@/components/team-section";
import { TestimonialsSection } from "@/components/testimonials-section";

export default function AboutPage() {
    return (
        <>
            <SiteHeader />
            <main className="about-page">
                <AboutHero />
                <StorySection />
                <ValuesSection />
                <TeamSection />
                <TestimonialsSection />

                {/* CTA Section */}
                <section className="about-cta-section">
                    <div className="cta-content">
                        <h2>انضم إلى عائلة VetDz</h2>
                        <p>اكتشف تصاميمنا الفريدة واكون جزءًا من قصتنا</p>
                        <a href="/catalog" className="cta-button">
                            استكشف الكتالوج الآن
                        </a>
                    </div>
                </section>
            </main>
        </>
    );
}
