import { z } from "zod";
import { createAdminTestimonial, listAdminTestimonials } from "@/lib/admin-store";
import { getFirstZodError, requireAdminApiAuth, resolveApiError } from "@/app/api/admin/_shared";

const testimonialSchema = z.object({
    nameAr: z.string().trim().min(2, "الاسم مطلوب"),
    roleAr: z.string().trim().min(2, "الصفة أو الدور مطلوب"),
    textAr: z.string().trim().min(8, "نص الرأي قصير جدًا"),
    rating: z.coerce.number().int().min(1).max(5),
});

export async function GET() {
    const unauthorized = await requireAdminApiAuth();
    if (unauthorized) {
        return unauthorized;
    }

    const items = await listAdminTestimonials();
    return Response.json({ items });
}

export async function POST(request: Request) {
    const unauthorized = await requireAdminApiAuth();
    if (unauthorized) {
        return unauthorized;
    }

    try {
        const json = (await request.json()) as unknown;
        const parsed = testimonialSchema.safeParse(json);

        if (!parsed.success) {
            return Response.json({ error: getFirstZodError(parsed.error) }, { status: 400 });
        }

        const item = await createAdminTestimonial(parsed.data);
        return Response.json({ item }, { status: 201 });
    } catch (error) {
        const resolved = resolveApiError(error);
        return Response.json({ error: resolved.message }, { status: resolved.status });
    }
}
