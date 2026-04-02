"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin-login-form.module.css";

type LoginResponse = {
    error?: string;
};

export function AdminLoginForm() {
    const router = useRouter();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (submitting) {
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const response = await fetch("/api/admin/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    identifier,
                    password,
                }),
            });

            const data = (await response.json().catch(() => ({}))) as LoginResponse;

            if (!response.ok) {
                setError(data.error || "تعذر تسجيل الدخول. حاول مرة أخرى.");
                return;
            }

            router.replace("/admin");
            router.refresh();
        } catch {
            setError("تعذر الاتصال بالخادم. حاول مرة أخرى.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form className={styles.card} onSubmit={handleSubmit}>
            <div className={styles.head}>
                <h2>دخول المدير</h2>
                <p>أدخل بيانات حساب المدير الذي تم إنشاؤه يدويًا.</p>
            </div>

            <label className={styles.label} htmlFor="admin-identifier">
                اسم المستخدم أو البريد الإلكتروني
            </label>
            <input
                id="admin-identifier"
                className={styles.input}
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                autoComplete="username"
                required
            />

            <label className={styles.label} htmlFor="admin-password">
                كلمة المرور
            </label>
            <input
                id="admin-password"
                className={styles.input}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
            />

            {error ? <p className={styles.error}>{error}</p> : null}

            <button className={styles.submit} disabled={submitting} type="submit">
                {submitting ? "جاري التحقق..." : "تسجيل الدخول"}
            </button>

            <p className={styles.footnote}>لا يمكن إنشاء حساب مدير من الواجهة. يتم إنشاء الحسابات يدويًا فقط.</p>
        </form>
    );
}