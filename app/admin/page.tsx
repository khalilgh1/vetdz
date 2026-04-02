import { redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { AdminPanel } from "@/components/admin/admin-panel";
import { SiteHeader } from "@/components/site-header";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import styles from "./page.module.css";

export default async function AdminPage() {
    const authenticatedAdmin = await getAuthenticatedAdmin();

    if (!authenticatedAdmin) {
        redirect("/admin/login");
    }

    return (
        <>
            <SiteHeader />
            <main className={`vetdz-shell ${styles.page}`}>
                <div className={styles.topBar}>
                    <p>مرحبًا، {authenticatedAdmin.username}</p>
                    <AdminLogoutButton />
                </div>
                <AdminPanel />
            </main>
        </>
    );
}
