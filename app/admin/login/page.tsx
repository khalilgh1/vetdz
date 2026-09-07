import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { getDictionary, getDirection } from "@/lib/i18n";
import styles from "./page.module.css";

type AdminLoginPageProps = {
    searchParams?: Promise<{ lang?: string }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
    const authenticatedAdmin = await getAuthenticatedAdmin();

    if (authenticatedAdmin) {
        redirect("/admin");
    }

    const resolvedParams = await searchParams;
    const locale = (resolvedParams?.lang === "en" ? "en" : "ar") as "ar" | "en";
    const dict = getDictionary(locale);
    const isEn = locale === "en";

    return (
        <div lang={locale} dir={getDirection(locale)}>
            <SiteHeader locale={locale} dict={dict} />

            <main className={`orders-page ${styles.page}`}>
                <section className={styles.hero}>
                    <p>{isEn ? "ADMIN PORTAL" : "بوابة الإدارة"}</p>
                    <h1>{isEn ? "Admin Sign In" : "تسجيل دخول المدراء"}</h1>
                    <span>
                        {isEn
                            ? "The dashboard is exclusively reserved for authorized administrators. Accounts cannot be created from this page and must be provisioned directly in the system."
                            : "لوحة التحكم متاحة للمدراء فقط. لا يوجد إنشاء حساب من هذه الصفحة، ويتم إنشاء حسابات المدراء يدويًا من قاعدة البيانات."}
                    </span>
                </section>

                <AdminLoginForm locale={locale} />
            </main>
        </div>
    );
}