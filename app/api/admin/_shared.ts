import { z } from "zod";

export function getFirstZodError(error: z.ZodError) {
    return error.issues[0]?.message ?? "البيانات غير صالحة.";
}

export function parsePositiveIntId(raw: string) {
    const id = Number(raw);

    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("INVALID_ID");
    }

    return id;
}

type ErrorWithCode = {
    code?: string;
};

export function resolveApiError(error: unknown) {
    const maybeCode = typeof error === "object" && error !== null ? (error as ErrorWithCode).code : undefined;
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";

    if (message === "INVALID_ID") {
        return { status: 400, message: "المعرف غير صالح." };
    }

    if (message === "INVALID_VARIATION_VALUE_IDS") {
        return { status: 400, message: "بعض قيم المتغيرات المختارة غير موجودة." };
    }

    if (message === "MISMATCHED_PRODUCT_TYPE_VARIATIONS") {
        return { status: 400, message: "المتغيرات المختارة لا تنتمي إلى نوع المنتج المحدد." };
    }

    if (message === "PRODUCT_IMAGES_REQUIRED") {
        return { status: 400, message: "يجب إضافة صورة واحدة على الأقل للمنتج." };
    }

    if (message === "PRODUCT_NOT_FOUND") {
        return { status: 404, message: "المنتج غير موجود." };
    }

    if (message === "UPLOAD_FILES_REQUIRED") {
        return { status: 400, message: "يرجى اختيار صورة واحدة على الأقل." };
    }

    if (message === "INVALID_UPLOAD_FILE") {
        return { status: 400, message: "الملف المحدد غير صالح. يرجى اختيار صور فقط." };
    }

    if (message === "TOO_MANY_UPLOAD_FILES") {
        return { status: 400, message: "عدد الصور كبير جدًا. الحد الأقصى هو 8 صور بكل عملية رفع." };
    }

    if (message === "UPLOAD_FILE_TOO_LARGE") {
        return { status: 400, message: "حجم الصورة كبير جدًا. الحد الأقصى 8MB لكل صورة." };
    }

    if (message === "CLOUDINARY_NOT_CONFIGURED") {
        return { status: 500, message: "إعدادات Cloudinary غير مكتملة على الخادم." };
    }

    if (message === "CLOUDINARY_UPLOAD_FAILED") {
        return { status: 502, message: "تعذر رفع الصورة إلى Cloudinary. حاول مرة أخرى." };
    }

    if (message === "CLOUDINARY_DELETE_FAILED") {
        return { status: 502, message: "تم إيقاف الحذف لأن إزالة الصور من Cloudinary فشلت." };
    }

    if (maybeCode === "P2002") {
        return { status: 409, message: "القيمة يجب أن تكون فريدة، يوجد سجل بنفس القيمة." };
    }

    if (maybeCode === "P2003") {
        return { status: 400, message: "لا يمكن تنفيذ العملية بسبب ارتباطات مع سجلات أخرى." };
    }

    if (maybeCode === "P2025") {
        return { status: 404, message: "السجل المطلوب غير موجود." };
    }

    return { status: 500, message: "حدث خطأ داخلي، حاول مرة أخرى." };
}
