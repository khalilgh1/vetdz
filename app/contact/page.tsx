import { Clock3, LocateFixed, Mail, Phone, Instagram, Facebook, Music2, Youtube } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ContactMap } from "@/components/contact-map";

export default function ContactPage() {
    return (
        <>
            <SiteHeader />
            <main className="vetdz-shell contact-page">
                <section className="contact-hero reveal">
                    <p>تواصل معنا</p>
                    <h1>خدمة العملاء</h1>
                    <span>فريقنا متاح للرد على الاستفسارات الخاصة بالمقاسات، التوصيل، أو حالة الطلب.</span>
                </section>

                <section className="contact-grid reveal">
                    <article className="contact-card">
                        <Mail size={24} />
                        <span>راسلنا</span>
                        <a href="mailto:hello@vetdz.com" className="contact-link" dir="ltr">
                            <strong>hello@vetdz.com</strong>
                        </a>
                    </article>

                    <article className="contact-card">
                        <Phone size={24} />
                        <span>الهاتف</span>
                        <a href="tel:+213555928340" className="contact-link" dir="ltr">
                            <strong>+213 55 592 8340</strong>
                        </a>
                    </article>

                    <article className="contact-card">
                        <LocateFixed size={24} />
                        <span>العنوان</span>
                        <strong>شارع ديدوش مراد، الجزائر العاصمة 16000</strong>
                    </article>

                    <article className="contact-card dark">
                        <Clock3 size={24} />
                        <span>أوقات العمل</span>
                        <strong>الإثنين - الجمعة | 09:00 - 18:00</strong>
                    </article>
                </section>

                <section className="social-box reveal">
                    <h2>تواصل رقميًا</h2>
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
                    <h2>موقعنا</h2>
                    <ContactMap />
                </section>
            </main>
        </>
    );
}
