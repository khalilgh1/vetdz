"use client";

import Image from "next/image";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries/ar";

type TeamSectionProps = {
    locale?: Locale;
    dict?: Dictionary;
};

export function TeamSection({ locale = "ar", dict }: TeamSectionProps) {
    const isEn = locale === "en";
    const header = dict?.about.team.header ?? (isEn ? "The Team Behind VetDz" : "الفريق خلف VetDz");
    const subheader = dict?.about.team.subheader ?? (isEn ? "Dedicated specialists committed to your satisfaction" : "متخصصون مكرسون لرضاك وخدمتك");

    return (
        <section className="team-section">
            <div className="team-header">
                <h2>{header}</h2>
                <p>{subheader}</p>
            </div>

            <div className="team-grid">
                <div className="team-card">
                    <div className="team-card-image">
                        <Image
                            src="/fashion1.jpg"
                            alt="Curation"
                            fill
                            className="team-image"
                            sizes="(max-width: 768px) 100vw, 300px"
                        />
                    </div>
                    <h3>{dict?.about.team.member1Title ?? (isEn ? "Curation" : "الاختيار")}</h3>
                    <p>{dict?.about.team.member1Text ?? (isEn ? "Specialized stylists handpicking standout pieces" : "فريق متخصص في انتقاء أفضل القطع")}</p>
                </div>

                <div className="team-card">
                    <div className="team-card-image">
                        <Image
                            src="/fashion2.jpg"
                            alt="Service"
                            fill
                            className="team-image"
                            sizes="(max-width: 768px) 100vw, 300px"
                        />
                    </div>
                    <h3>{dict?.about.team.member2Title ?? (isEn ? "Service" : "الخدمة")}</h3>
                    <p>{dict?.about.team.member2Text ?? (isEn ? "Attentive customer support ready to assist you" : "فريق عمل احترافي جاهز لمساعدتك")}</p>
                </div>

                <div className="team-card">
                    <div className="team-card-image">
                        <Image
                            src="/shirt.jpg"
                            alt="Quality"
                            fill
                            className="team-image"
                            sizes="(max-width: 768px) 100vw, 300px"
                        />
                    </div>
                    <h3>{dict?.about.team.member3Title ?? (isEn ? "Quality Control" : "الجودة")}</h3>
                    <p>{dict?.about.team.member3Text ?? (isEn ? "Rigorous garment inspection before dispatch" : "فحص صارم لكل قطعة قبل التسليم")}</p>
                </div>
            </div>
        </section>
    );
}
