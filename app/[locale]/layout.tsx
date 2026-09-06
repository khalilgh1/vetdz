import { notFound } from "next/navigation";
import { isValidLocale, getDirection, type Locale } from "@/lib/i18n";

type LocaleLayoutProps = {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
    const { locale } = await params;

    if (!isValidLocale(locale)) {
        notFound();
    }

    const dir = getDirection(locale as Locale);

    return (
        <div lang={locale} dir={dir} className="w-full min-h-full flex flex-col flex-1">
            {children}
        </div>
    );
}
