import { z } from "zod";
import { createAdminProductType, listAdminProductTypes } from "@/lib/admin-store";
import { getFirstZodError, resolveApiError } from "@/app/api/admin/_shared";

const productTypeSchema = z.object({
    slug: z
        .string()
        .trim()
        .min(2, "الـ slug مطلوب")
        .regex(/^[a-z0-9-]+$/, "الـ slug يجب أن يكون بحروف إنجليزية صغيرة وأرقام و-")
        .transform((value) => value.toLowerCase()),
    nameAr: z.string().trim().min(2, "اسم النوع مطلوب"),
});

export async function GET() {
    const items = await listAdminProductTypes();
    return Response.json({ items });
}

export async function POST(request: Request) {
    try {
        const json = (await request.json()) as unknown;
        const parsed = productTypeSchema.safeParse(json);

        if (!parsed.success) {
            return Response.json({ error: getFirstZodError(parsed.error) }, { status: 400 });
        }

        const item = await createAdminProductType(parsed.data);

        return Response.json({ item }, { status: 201 });
    } catch (error) {
        const resolved = resolveApiError(error);
        return Response.json({ error: resolved.message }, { status: resolved.status });
    }
}
