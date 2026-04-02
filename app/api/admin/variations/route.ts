import { z } from "zod";
import { createAdminVariation, listAdminVariations } from "@/lib/admin-store";
import { getFirstZodError, resolveApiError } from "@/app/api/admin/_shared";

const variationSchema = z.object({
    productTypeId: z.coerce.number().int().positive("نوع المنتج غير صالح"),
    nameAr: z.string().trim().min(2, "اسم المتغير مطلوب"),
});

export async function GET(request: Request) {
    const url = new URL(request.url);
    const rawProductTypeId = url.searchParams.get("productTypeId");
    const productTypeId = rawProductTypeId ? Number(rawProductTypeId) : undefined;

    const items = await listAdminVariations(
        Number.isInteger(productTypeId) && (productTypeId as number) > 0 ? (productTypeId as number) : undefined
    );

    return Response.json({ items });
}

export async function POST(request: Request) {
    try {
        const json = (await request.json()) as unknown;
        const parsed = variationSchema.safeParse(json);

        if (!parsed.success) {
            return Response.json({ error: getFirstZodError(parsed.error) }, { status: 400 });
        }

        const item = await createAdminVariation(parsed.data);
        return Response.json({ item }, { status: 201 });
    } catch (error) {
        const resolved = resolveApiError(error);
        return Response.json({ error: resolved.message }, { status: resolved.status });
    }
}
