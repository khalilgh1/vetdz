import { DeliveryType } from "@prisma/client";
import { z } from "zod";
import { appendOrderToGoogleSheet, sendOrderEmail } from "@/lib/integrations";
import { createOrder } from "@/lib/store";

const orderSchema = z.object({
    fullName: z.string().min(3, "الاسم الكامل مطلوب"),
    phone: z.string().min(8, "رقم الهاتف غير صالح"),
    wilaya: z.string().min(2, "الولاية مطلوبة"),
    address: z.string().min(8, "العنوان التفصيلي مطلوب"),
    deliveryType: z.nativeEnum(DeliveryType),
    notes: z.string().max(500).optional(),
    productSlug: z.string().min(2),
    quantity: z.number().int().min(1).max(10),
    selectedVariationValueIds: z.array(z.number().int()).default([]),
});

export async function POST(request: Request) {
    try {
        const json = (await request.json()) as unknown;
        const parsed = orderSchema.safeParse(json);

        if (!parsed.success) {
            return Response.json(
                {
                    error: "بيانات الطلب غير مكتملة. يرجى التحقق من الحقول.",
                    details: parsed.error.flatten(),
                },
                { status: 400 }
            );
        }

        const order = await createOrder(parsed.data);
        const firstItem = order.items[0];

        if (!firstItem) {
            return Response.json({ error: "تعذر إنشاء عناصر الطلب." }, { status: 500 });
        }

        const summary = {
            orderId: order.id,
            fullName: order.fullName,
            phone: order.phone,
            wilaya: order.wilaya,
            address: order.address,
            deliveryType: order.deliveryType,
            notes: order.notes,
            totalAmount: order.totalAmount,
            itemNameAr: firstItem.product.nameAr,
            selections: firstItem.selections.map((selection) => ({
                variationNameAr: selection.variationValue.variation.nameAr,
                valueAr: selection.variationValue.valueAr,
            })),
        };

        await Promise.allSettled([sendOrderEmail(summary), appendOrderToGoogleSheet(summary)]);

        return Response.json({
            success: true,
            orderId: order.id,
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

        return Response.json({ error: "تعذر إتمام الطلب حاليًا. حاول لاحقًا." }, { status: 500 });
    }
}
