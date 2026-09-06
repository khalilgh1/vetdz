import { notFound } from "next/navigation";
import { Clock3, LocateFixed, Mail, Phone, Instagram, Facebook, Music2, Youtube } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ContactMap } from "@/components/contact-map";
import { getDictionary, isValidLocale, type Locale } from "@/lib/i18n";

type ContactPageProps = {
    params: Promise<{ locale: string }>;
};

export default async function ContactPage({ params }: ContactPageProps) {
    const { locale: rawLocale } = await params;
    if (!isValidLocale(rawLocale)) {
        notFound();
    }
    const locale = rawLocale as Locale;
    const dict = getDictionary(locale);

    return (
        <>
            <SiteHeader locale={locale} dict={dict} />
            <main className="vetdz-shell contact-page">
                <section className="contact-hero reveal">
                    <p>{dict.contact.badge}</p>
                    <h1>{dict.contact.title}</h1>
                    <span>{dict.contact.description}</span>
                </section>

                <section className="contact-grid reveal">
                    <article className="contact-card">
                        <Mail size={24} />
                        <span>{dict.contact.emailTitle}</span>
                        <a href="mailto:hello@vetdz.com" className="contact-link" dir="ltr">
                            <strong>hello@vetdz.com</strong>
                        </a>
                    </article>

                    <article className="contact-card">
                        <Phone size={24} />
                        <span>{dict.contact.phoneTitle}</span>
                        <a href="tel:+213555928340" className="contact-link" dir="ltr">
                            <strong>+213 55 592 8340</strong>
                        </a>
                    </article>

                    <article className="contact-card">
                        <LocateFixed size={24} />
                        <span>{dict.contact.addressTitle}</span>
                        <strong>{dict.contact.addressValue}</strong>
                    </article>

                    <article className="contact-card dark">
                        <Clock3 size={24} />
                        <span>{dict.contact.hoursTitle}</span>
                        <strong>{dict.contact.hoursValue}</strong>
                    </article>
                </section>

                <section className="social-box reveal">
                    <h2>{dict.contact.socialTitle}</h2>
                    <div className="social-row">
                        <a href="#" aria-label="instagram" className="social-item">
                            <Instagram size={20} />
                        </a>
                        <a href="#" aria-label="facebook" className="social-item">
                            <Facebook size={20} />
                        </a>
                        <a href="#" aria-label="tiktok" className="social-item">
                            <Music2 size={20} />
                        </a>
                        <a href="#" aria-label="youtube" className="social-item">
                            <Youtube size={20} />
                        </a>
                    </div>
                </section>

                <section className="map-section reveal">
                    <h2>{locale === "en" ? "Our Location" : "موقعنا"}</h2>
                    <ContactMap />
                </section>
            </main>
        </>
    );
}
