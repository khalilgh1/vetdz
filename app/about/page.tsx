import Image from "next/image";
import { SiteHeader } from "@/components/site-header";

export default function AboutPage() {
    return (
        <>
            <SiteHeader />
            <main className="vetdz-shell about-page">
                <section className="about-hero reveal">
                    <p>قصتنا</p>
                    <h1>عن VetDz Atelier</h1>
                    <span>
                        في VetDz نؤمن أن اللباس ليس مجرد قماش، بل مساحة للتعبير الشخصي. نصمم قطعًا راقية تجمع بين
                        الانضباط المعماري وروح الشارع الجزائري المعاصر.
                    </span>
                </section>

                <section className="about-image reveal">
                    <Image src="/products/nomad-3.svg" alt="هوية العلامة" fill sizes="(max-width: 1024px) 100vw, 60vw" />
                </section>

                <section className="testimonial-section reveal">
                    <div className="section-head">
                        <h2>أصوات من مجتمعنا</h2>
                        <p>تجارب حقيقية من عملائنا داخل الجزائر وخارجها.</p>
                    </div>

                    <div className="testimonial-grid">
                        <article className="testimonial-card">
                            <strong>سارة. ب</strong>
                            <span>مهندسة معمارية</span>
                            <p>&quot;جودة الخياطة ممتازة، والمقاسات دقيقة جدًا. أول طلب ولن يكون الأخير.&quot;</p>
                        </article>
                        <article className="testimonial-card">
                            <strong>ياسين. د</strong>
                            <span>مصور أزياء</span>
                            <p>&quot;كل قطعة تبدو مدروسة بالتفاصيل، من القماش إلى الثبات في الشكل بعد الغسيل.&quot;</p>
                        </article>
                        <article className="testimonial-card">
                            <strong>مريم. ع</strong>
                            <span>صانعة محتوى</span>
                            <p>&quot;التوصيل سريع والتغليف أنيق جدًا. والألوان مطابقة تمامًا للصور.&quot;</p>
                        </article>
                    </div>
                </section>
            </main>
        </>
    );
}
