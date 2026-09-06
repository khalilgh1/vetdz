import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/lib/i18n";

type ProductRedirectProps = {
    params: Promise<{ slug: string }>;
};

export default async function ProductRedirect({ params }: ProductRedirectProps) {
    const { slug } = await params;
    redirect(`/${DEFAULT_LOCALE}/products/${slug}`);
}
