import { z } from "zod";
import { parsePositiveIntId, getFirstZodError, resolveApiError } from "@/app/api/admin/_shared";
import { deleteAdminVariationValue, updateAdminVariationValue } from "@/lib/admin-store";

const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const variationValueSchema = z.object({
    valueAr: z.string().trim().min(1, "قيمة المتغير مطلوبة"),
    hexColor: z.preprocess(
        (value) => {
            if (value === null || value === undefined) {
                return null;
            }

            if (typeof value === "string" && value.trim() === "") {
                return null;
            }

            return value;
        },
        z
            .string()
            .regex(HEX_COLOR_REGEX, "لون HEX غير صالح")
            .nullable()
            .optional()
    ),
});

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
    try {
        const params = await context.params;
        const id = parsePositiveIntId(params.id);
        const json = (await request.json()) as unknown;
        const parsed = variationValueSchema.safeParse(json);

        if (!parsed.success) {
            return Response.json({ error: getFirstZodError(parsed.error) }, { status: 400 });
        }

        const item = await updateAdminVariationValue(id, parsed.data);

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
        await deleteAdminVariationValue(id);

        return Response.json({ success: true });
    } catch (error) {
        const resolved = resolveApiError(error);
        return Response.json({ error: resolved.message }, { status: resolved.status });
    }
}
