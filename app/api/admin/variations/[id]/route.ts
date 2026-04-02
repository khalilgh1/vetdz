import { z } from "zod";
import { parsePositiveIntId, getFirstZodError, requireAdminApiAuth, resolveApiError } from "@/app/api/admin/_shared";
import { deleteAdminVariation, updateAdminVariation } from "@/lib/admin-store";

const variationSchema = z.object({
    nameAr: z.string().trim().min(2, "اسم المتغير مطلوب"),
});

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
    const unauthorized = await requireAdminApiAuth();
    if (unauthorized) {
        return unauthorized;
    }

    try {
        const params = await context.params;
        const id = parsePositiveIntId(params.id);
        const json = (await request.json()) as unknown;
        const parsed = variationSchema.safeParse(json);

        if (!parsed.success) {
            return Response.json({ error: getFirstZodError(parsed.error) }, { status: 400 });
        }

        const item = await updateAdminVariation(id, parsed.data);

        return Response.json({ item });
    } catch (error) {
        const resolved = resolveApiError(error);
        return Response.json({ error: resolved.message }, { status: resolved.status });
    }
}

export async function DELETE(_: Request, context: RouteContext) {
    const unauthorized = await requireAdminApiAuth();
    if (unauthorized) {
        return unauthorized;
    }

    try {
        const params = await context.params;
        const id = parsePositiveIntId(params.id);
        await deleteAdminVariation(id);

        return Response.json({ success: true });
    } catch (error) {
        const resolved = resolveApiError(error);
        return Response.json({ error: resolved.message }, { status: resolved.status });
    }
}
