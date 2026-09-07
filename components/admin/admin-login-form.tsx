"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin-login-form.module.css";

type LoginResponse = {
    error?: string;
};

type AdminLoginFormProps = {
    locale?: "ar" | "en";
};

export function AdminLoginForm({ locale = "ar" }: AdminLoginFormProps) {
    const isEn = locale === "en";
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
                setError(
                    data.error ||
                    (isEn
                        ? "Unable to log in. Please check your credentials."
                        : "تعذر تسجيل الدخول. حاول مرة أخرى.")
                );
                return;
            }

            const destination = isEn ? "/admin?lang=en" : "/admin";
            router.replace(destination);
            router.refresh();
        } catch {
            setError(
                isEn
                    ? "Server connection error. Please try again."
                    : "تعذر الاتصال بالخادم. حاول مرة أخرى."
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form className={styles.card} onSubmit={handleSubmit}>
            <div className={styles.head}>
                <h2>{isEn ? "Administrator Login" : "دخول المدير"}</h2>
                <p>
                    {isEn
                        ? "Enter the credentials for your authorized administrator account."
                        : "أدخل بيانات حساب المدير الذي تم إنشاؤه يدويًا."}
                </p>
            </div>

            <label className={styles.label} htmlFor="admin-identifier">
                {isEn ? "Username or Email" : "اسم المستخدم أو البريد الإلكتروني"}
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
                {isEn ? "Password" : "كلمة المرور"}
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
                {submitting
                    ? (isEn ? "Verifying..." : "جاري التحقق...")
                    : (isEn ? "Sign In" : "تسجيل الدخول")}
            </button>

            <p className={styles.footnote}>
                {isEn
                    ? "Admin accounts cannot be registered via UI. They are provisioned securely on the backend."
                    : "لا يمكن إنشاء حساب مدير من الواجهة. يتم إنشاء الحسابات يدويًا فقط."}
            </p>
        </form>
    );
}