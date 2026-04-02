import { z } from "zod";
import { parsePositiveIntId, getFirstZodError, resolveApiError } from "@/app/api/admin/_shared";
import { deleteAdminTestimonial, updateAdminTestimonial } from "@/lib/admin-store";

const testimonialSchema = z.object({
    nameAr: z.string().trim().min(2, "الاسم مطلوب"),
    roleAr: z.string().trim().min(2, "الصفة أو الدور مطلوب"),
    textAr: z.string().trim().min(8, "نص الرأي قصير جدًا"),
    rating: z.coerce.number().int().min(1).max(5),
});

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
    try {
        const params = await context.params;
        const id = parsePositiveIntId(params.id);
        const json = (await request.json()) as unknown;
        const parsed = testimonialSchema.safeParse(json);

        if (!parsed.success) {
            return Response.json({ error: getFirstZodError(parsed.error) }, { status: 400 });
        }

        const item = await updateAdminTestimonial(id, parsed.data);
        return Response.json({ item });
    } catch (error) {
        const resolved = resolveApiError(error);
        return Response.json({ error: resolved.message }, { status: resolved.status });
    }
}

export async function DELETE(_: Request, context: RouteContext) {
    try {
        const params = await context.params;
        const id = parsePositiveIntId(params.id);
        await deleteAdminTestimonial(id);

        return Response.json({ success: true });
    } catch (error) {
        const resolved = resolveApiError(error);
        return Response.json({ error: resolved.message }, { status: resolved.status });
    }
}
