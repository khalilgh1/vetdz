import { Gender } from "@prisma/client";
import { z } from "zod";
import { parsePositiveIntId, getFirstZodError, resolveApiError } from "@/app/api/admin/_shared";
import { deleteAdminProduct, updateAdminProduct } from "@/lib/admin-store";

const productSchema = z
    .object({
        slug: z
            .string()
            .trim()
            .min(2, "الـ slug مطلوب")
            .regex(/^[a-z0-9-]+$/, "الـ slug يجب أن يكون بحروف إنجليزية صغيرة وأرقام و-")
            .transform((value) => value.toLowerCase()),
        nameAr: z.string().trim().min(2, "اسم المنتج مطلوب"),
        subtitleAr: z.string().trim().min(2, "العنوان الفرعي مطلوب"),
        descriptionAr: z.string().trim().min(10, "وصف المنتج يجب أن يكون أوضح"),
        price: z.coerce.number().positive("السعر يجب أن يكون أكبر من 0"),
        discountActive: z.coerce.boolean().default(false),
        discountedPrice: z.preprocess(
            (value) => {
                if (value === null || value === undefined) {
                    return null;
                }

                if (typeof value === "string" && value.trim() === "") {
                    return null;
                }

                return value;
            },
            z.coerce.number().positive("السعر المخفض يجب أن يكون أكبر من 0").nullable()
        ),
        gender: z.nativeEnum(Gender),
        isFeatured: z.coerce.boolean().default(false),
        productTypeId: z.coerce.number().int().positive("نوع المنتج غير صالح"),
        imageUrls: z.array(z.string().trim().min(1)).min(1, "أضف صورة واحدة على الأقل"),
        variationValueIds: z.array(z.coerce.number().int().positive()).default([]),
    })
    .superRefine((value, ctx) => {
        if (value.discountActive && value.discountedPrice === null) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "عند تفعيل التخفيض يجب إدخال السعر المخفض",
                path: ["discountedPrice"],
            });
        }

        if (value.discountActive && value.discountedPrice !== null && value.discountedPrice >= value.price) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "السعر المخفض يجب أن يكون أقل من السعر الأصلي",
                path: ["discountedPrice"],
            });
        }
    });

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
    try {
        const params = await context.params;
        const id = parsePositiveIntId(params.id);
        const json = (await request.json()) as unknown;
        const parsed = productSchema.safeParse(json);

        if (!parsed.success) {
            return Response.json({ error: getFirstZodError(parsed.error) }, { status: 400 });
        }

        const item = await updateAdminProduct(id, parsed.data);
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
        await deleteAdminProduct(id);

        return Response.json({ success: true });
    } catch (error) {
        const resolved = resolveApiError(error);
        return Response.json({ error: resolved.message }, { status: resolved.status });
    }
}
