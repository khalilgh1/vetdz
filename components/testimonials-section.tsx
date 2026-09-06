import { getTestimonials } from "@/lib/store";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries/ar";

type TestimonialsSectionProps = {
    locale?: Locale;
    dict?: Dictionary;
};

export async function TestimonialsSection({ locale = "ar", dict }: TestimonialsSectionProps) {
    const testimonials = await getTestimonials();
    const isEn = locale === "en";

    return (
        <section className="testimonials-section-enhanced">
            <div className="section-header">
                <h2>{dict?.about.testimonials.header ?? (isEn ? "Community Voices" : "أصوات من مجتمعنا")}</h2>
                <p>{dict?.about.testimonials.subheader ?? (isEn ? "Genuine reviews from our clients across Algeria and beyond" : "تجارب حقيقية من عملائنا داخل الجزائر وخارجها")}</p>
            </div>

            <div className="testimonials-grid-enhanced">
                {testimonials.map((testimonial) => (
                    <article key={testimonial.id} className="testimonial-card-enhanced">
                        <div className="testimonial-stars">
                            {"⭐".repeat(testimonial.rating)}
                        </div>
                        <p className="testimonial-text">
                            &quot;{testimonial.textAr}&quot;
                        </p>
                        <div className="testimonial-author">
                            <strong>{testimonial.nameAr}</strong>
                            <span>{testimonial.roleAr}</span>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
