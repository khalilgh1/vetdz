import { z } from "zod";
import { parsePositiveIntId, getFirstZodError, resolveApiError } from "@/app/api/admin/_shared";
import { deleteAdminProductType, updateAdminProductType } from "@/lib/admin-store";

const productTypeSchema = z.object({
    slug: z
        .string()
        .trim()
        .min(2, "الـ slug مطلوب")
        .regex(/^[a-z0-9-]+$/, "الـ slug يجب أن يكون بحروف إنجليزية صغيرة وأرقام و-")
        .transform((value) => value.toLowerCase()),
    nameAr: z.string().trim().min(2, "اسم النوع مطلوب"),
});

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
    try {
        const params = await context.params;
        const id = parsePositiveIntId(params.id);
        const json = (await request.json()) as unknown;
        const parsed = productTypeSchema.safeParse(json);

        if (!parsed.success) {
            return Response.json({ error: getFirstZodError(parsed.error) }, { status: 400 });
        }

        const item = await updateAdminProductType(id, parsed.data);
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
        await deleteAdminProductType(id);

        return Response.json({ success: true });
    } catch (error) {
        const resolved = resolveApiError(error);
        return Response.json({ error: resolved.message }, { status: resolved.status });
    }
}
