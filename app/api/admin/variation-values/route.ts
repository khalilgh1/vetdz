import { z } from "zod";
import { createAdminVariationValue } from "@/lib/admin-store";
import { getFirstZodError, resolveApiError } from "@/app/api/admin/_shared";

const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const variationValueSchema = z.object({
    variationId: z.coerce.number().int().positive("المتغير غير صالح"),
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

export async function POST(request: Request) {
    try {
        const json = (await request.json()) as unknown;
        const parsed = variationValueSchema.safeParse(json);

        if (!parsed.success) {
            return Response.json({ error: getFirstZodError(parsed.error) }, { status: 400 });
        }

        const item = await createAdminVariationValue(parsed.data);

        return Response.json({ item }, { status: 201 });
    } catch (error) {
        const resolved = resolveApiError(error);
        return Response.json({ error: resolved.message }, { status: resolved.status });
    }
}
