import { getTestimonials } from "@/lib/store";

export async function TestimonialsSection() {
    const testimonials = await getTestimonials();

    return (
        <section className="testimonials-section-enhanced">
            <div className="section-header">
                <h2>أصوات من مجتمعنا</h2>
                <p>تجارب حقيقية من عملائنا داخل الجزائر وخارجها</p>
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
