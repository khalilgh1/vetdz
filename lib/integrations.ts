import { google } from "googleapis";
import nodemailer from "nodemailer";
import { formatDzd, toNumber } from "@/lib/format";

type OrderSummary = {
    orderId: number;
    fullName: string;
    phone: string;
    wilaya: string;
    address: string;
    deliveryType: "HOME" | "DESK";
    notes?: string | null;
    totalAmount: unknown;
    itemNameAr: string;
    selections: { variationNameAr: string; valueAr: string }[];
};

type SmtpConfig = {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
};

function getSmtpConfig(): SmtpConfig | null {
    const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || "smtp.gmail.com";
    const user = process.env.SMTP_USER || process.env.EMAIL_HOST_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_HOST_PASSWORD;

    if (!user || !pass) {
        return null;
    }

    return {
        host,
        port: Number(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        user,
        pass,
    };
}

function getSelectionsText(summary: OrderSummary) {
    return summary.selections.length > 0
        ? summary.selections.map((s) => `${s.variationNameAr}: ${s.valueAr}`).join(" | ")
        : "بدون خيارات";
}

function buildAdminMessage(summary: OrderSummary) {
    const selectionsText = getSelectionsText(summary);

    return [
        `طلب جديد رقم #${summary.orderId}`,
        `المنتج: ${summary.itemNameAr}`,
        `الخيارات: ${selectionsText}`,
        `السعر الإجمالي: ${formatDzd(toNumber(summary.totalAmount))} دج`,
        `الاسم الكامل: ${summary.fullName}`,
        `الهاتف: ${summary.phone}`,
        `الولاية: ${summary.wilaya}`,
        `العنوان: ${summary.address}`,
        `نوع التوصيل: ${summary.deliveryType === "HOME" ? "منزلي" : "مكتب"}`,
        `ملاحظات: ${summary.notes || "-"}`,
    ].join("\n");
}

export async function sendOrderEmail(summary: OrderSummary) {
    const smtp = getSmtpConfig();

    if (!smtp) {
        return { skipped: true as const };
    }

    const selfEmail = smtp.user;

    const transporter = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure,
        auth: { user: smtp.user, pass: smtp.pass },
    });

    await transporter.sendMail({
        from: selfEmail,
        to: selfEmail,
        subject: `VetDz | طلب جديد #${summary.orderId}`,
        text: buildAdminMessage(summary),
    });

    return { skipped: false as const };
}

export async function appendOrderToGoogleSheet(summary: OrderSummary) {
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!clientEmail || !privateKey || !sheetId) {
        return { skipped: true as const };
    }

    const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey.replace(/\\n/g, "\n"),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const selectionsText = getSelectionsText(summary);

    await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: process.env.GOOGLE_SHEET_RANGE || "Orders!A1",
        valueInputOption: "RAW",
        requestBody: {
            values: [
                [
                    new Date().toISOString(),
                    summary.orderId,
                    summary.itemNameAr,
                    selectionsText,
                    formatDzd(toNumber(summary.totalAmount)),
                    summary.fullName,
                    summary.phone,
                    summary.wilaya,
                    summary.address,
                    summary.deliveryType,
                    summary.notes || "",
                ],
            ],
        },
    });

    return { skipped: false as const };
}
