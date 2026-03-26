import { Clock3, LocateFixed, Mail, Phone, Share2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

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
                        <strong>hello@vetdz.com</strong>
                    </article>

                    <article className="contact-card">
                        <Phone size={24} />
                        <span>الهاتف</span>
                        <strong>+213 555 928 340</strong>
                    </article>

                    <article className="contact-card">
                        <LocateFixed size={24} />
                        <span>العنوان</span>
                        <strong>128 شارع الإبداع، الجزائر العاصمة</strong>
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
                            <Share2 size={18} />
                        </a>
                        <a href="#" aria-label="facebook" className="social-item">
                            <Share2 size={18} />
                        </a>
                        <a href="#" aria-label="tiktok" className="social-item">
                            <Share2 size={18} />
                        </a>
                        <a href="#" aria-label="youtube" className="social-item">
                            <Share2 size={18} />
                        </a>
                    </div>
                </section>
            </main>
        </>
    );
}
