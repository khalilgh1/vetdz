"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin-logout-button.module.css";

type AdminLogoutButtonProps = {
    locale?: "ar" | "en";
};

export function AdminLogoutButton({ locale = "ar" }: AdminLogoutButtonProps) {
    const isEn = locale === "en";
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
            router.replace(isEn ? "/admin/login?lang=en" : "/admin/login");
            router.refresh();
            setBusy(false);
        }
    }

    return (
        <button className={styles.button} onClick={handleLogout} disabled={busy} type="button">
            {busy
                ? (isEn ? "Logging out..." : "جاري تسجيل الخروج...")
                : (isEn ? "Log Out" : "تسجيل الخروج")}
        </button>
    );
}