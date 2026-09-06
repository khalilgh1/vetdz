import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/lib/i18n";

type OrdersRedirectProps = {
    searchParams: Promise<Record<string, string | undefined>>;
};

export default async function OrdersRedirect({ searchParams }: OrdersRedirectProps) {
    const query = await searchParams;
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
        if (value) params.set(key, value);
    }
    const search = params.toString();
    redirect(`/${DEFAULT_LOCALE}/orders${search ? `?${search}` : ""}`);
}
