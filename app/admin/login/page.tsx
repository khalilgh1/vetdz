import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import styles from "./page.module.css";

export default async function AdminLoginPage() {
    const authenticatedAdmin = await getAuthenticatedAdmin();

    if (authenticatedAdmin) {
        redirect("/admin");
    }

    return (
        <>
            <SiteHeader />

            <main className={`orders-page ${styles.page}`}>
                <section className={styles.hero}>
                    <p>بوابة الإدارة</p>
                    <h1>تسجيل دخول المدراء</h1>
                    <span>
                        لوحة التحكم متاحة للمدراء فقط. لا يوجد إنشاء حساب من هذه الصفحة، ويتم إنشاء حسابات المدراء يدويًا من
                        قاعدة البيانات.
                    </span>
                </section>

                <AdminLoginForm />
            </main>
        </>
    );
}