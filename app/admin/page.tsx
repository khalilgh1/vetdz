import { redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { AdminPanel } from "@/components/admin/admin-panel";
import { SiteHeader } from "@/components/site-header";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { getDictionary, getDirection } from "@/lib/i18n";
import styles from "./page.module.css";

type AdminPageProps = {
    searchParams?: Promise<{ lang?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
    const authenticatedAdmin = await getAuthenticatedAdmin();

    if (!authenticatedAdmin) {
        redirect("/admin/login");
    }

    const resolvedParams = await searchParams;
    const locale = (resolvedParams?.lang === "en" ? "en" : "ar") as "ar" | "en";
    const dict = getDictionary(locale);

    return (
        <div lang={locale} dir={getDirection(locale)}>
            <SiteHeader locale={locale} dict={dict} />
            <main className={`vetdz-shell ${styles.page}`}>
                <div className={styles.topBar}>
                    <p>{locale === "en" ? `Welcome, ${authenticatedAdmin.username}` : `مرحبًا، ${authenticatedAdmin.username}`}</p>
                    <AdminLogoutButton locale={locale} />
                </div>
                <AdminPanel locale={locale} />
            </main>
        </div>
    );
}
