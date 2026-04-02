"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin-logout-button.module.css";

export function AdminLogoutButton() {
    const router = useRouter();
    const [busy, setBusy] = useState(false);

    async function handleLogout() {
        if (busy) {
            return;
        }

        setBusy(true);

        try {
            await fetch("/api/admin/auth/logout", {
                method: "POST",
                credentials: "same-origin",
            });
        } finally {
            router.replace("/admin/login");
            router.refresh();
            setBusy(false);
        }
    }

    return (
        <button className={styles.button} onClick={handleLogout} disabled={busy} type="button">
            {busy ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
        </button>
    );
}