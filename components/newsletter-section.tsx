"use client";

export function NewsletterSection() {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Handle newsletter signup
        console.log("Newsletter signup submitted");
    };

    return (
        <section className="newsletter-section">
            <div className="newsletter-content">
                <h2>اشترك في نشرتنا</h2>
                <p>احصل على عروض حصرية وآخر التصاميم مباشرة في بريدك</p>
                <form className="newsletter-form" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="أدخل بريدك الإلكتروني"
                        required
                        className="newsletter-input"
                    />
                    <button type="submit" className="newsletter-button">
                        اشترك الآن
                    </button>
                </form>
            </div>
        </section>
    );
}
