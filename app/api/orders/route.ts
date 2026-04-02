import { z } from "zod";
import { appendOrderToGoogleSheet, sendOrderEmail } from "@/lib/integrations";
import { createOrder } from "@/lib/store";

const algerianPhoneRegex = /^0\d{9}$/;

const orderSchema = z.object({
    fullName: z.string().trim().min(3, "الاسم الكامل مطلوب"),
    phone: z.preprocess(
        (value) => (typeof value === "string" ? value.replace(/\s+/g, "") : value),
        z
            .string()
            .regex(algerianPhoneRegex, "رقم الهاتف يجب أن يكون 10 أرقام ويبدأ بـ 0")
    ),
    wilaya: z.string().trim().min(2, "الولاية مطلوبة"),
    address: z.string().trim().min(8, "العنوان التفصيلي مطلوب"),
    deliveryType: z.enum(["HOME", "DESK"]),
    notes: z.string().trim().max(500).optional(),
    productSlug: z.string().trim().min(2),
    quantity: z.coerce.number().int().min(1).max(10),
    selectedVariationValueIds: z.array(z.coerce.number().int()).default([]),
});

export async function POST(request: Request) {
    try {
        const json = (await request.json()) as unknown;
        const parsed = orderSchema.safeParse(json);

        if (!parsed.success) {
            const firstIssue = parsed.error.issues[0]?.message;

            return Response.json(
                {
                    error: firstIssue || "بيانات الطلب غير مكتملة. يرجى التحقق من الحقول.",
                    details: parsed.error.flatten(),
                },
                { status: 400 }
            );
        }

        const summary = await createOrder(parsed.data);

        const integrationTasks = [
            { name: "email", promise: sendOrderEmail(summary) },
            { name: "googleSheets", promise: appendOrderToGoogleSheet(summary) },
        ];

        const integrationResults = await Promise.allSettled(integrationTasks.map((task) => task.promise));

        integrationResults.forEach((result, index) => {
            const taskName = integrationTasks[index]?.name || "unknown";

            if (result.status === "rejected") {
                console.error(`[orders] ${taskName} integration failed`, result.reason);
                return;
            }

            if (result.value?.skipped) {
                console.warn(`[orders] ${taskName} integration skipped due to missing configuration`);
            }
        });

        return Response.json({
            success: true,
            orderId: summary.orderId,
            message: "تم إرسال الطلب بنجاح. سنقوم بتأكيده عبر الهاتف قريبًا.",
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";

        if (message === "PRODUCT_NOT_FOUND") {
            return Response.json({ error: "المنتج غير موجود." }, { status: 404 });
        }

        if (message === "INVALID_VARIATION_SELECTION") {
            return Response.json({ error: "اختيارات المنتج غير صالحة." }, { status: 400 });
        }

        if (message === "DELIVERY_NOT_AVAILABLE") {
            return Response.json({ error: "نوع التوصيل غير متاح للولاية المختارة." }, { status: 400 });
        }

        return Response.json({ error: "تعذر إتمام الطلب حاليًا. حاول لاحقًا." }, { status: 500 });
    }
}
