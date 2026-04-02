import { AdminPanel } from "@/components/admin/admin-panel";
import { SiteHeader } from "@/components/site-header";

export default function AdminPage() {
    return (
        <>
            <SiteHeader />
            <main className="vetdz-shell">
                <AdminPanel />
            </main>
        </>
    );
}
