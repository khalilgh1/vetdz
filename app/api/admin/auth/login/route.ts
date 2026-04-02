import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { setAdminSession } from "@/lib/admin-auth";
import { verifyAdminPassword } from "@/lib/admin-password";

const loginSchema = z.object({
    identifier: z.string().trim().min(2, "اسم المستخدم أو البريد الإلكتروني مطلوب"),
    password: z.string().min(8, "كلمة المرور يجب أن تحتوي 8 أحرف على الأقل"),
});

export async function POST(request: Request) {
    try {
        const json = (await request.json()) as unknown;
        const parsed = loginSchema.safeParse(json);

        if (!parsed.success) {
            return Response.json({ error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة." }, { status: 400 });
        }

        const identifier = parsed.data.identifier.trim();
        const normalizedEmail = identifier.toLowerCase();

        const admin = await prisma.admin.findFirst({
            where: {
                OR: [{ username: identifier }, { email: normalizedEmail }],
            },
            select: {
                id: true,
                username: true,
                email: true,
                passwordHash: true,
            },
        });

        if (!admin || !verifyAdminPassword(parsed.data.password, admin.passwordHash)) {
            return Response.json({ error: "بيانات الدخول غير صحيحة." }, { status: 401 });
        }

        await setAdminSession(admin.id);

        return Response.json({
            admin: {
                id: admin.id,
                username: admin.username,
                email: admin.email,
            },
        });
    } catch (error) {
        if (error instanceof Error && (error.message === "ADMIN_AUTH_SECRET_MISSING" || error.message === "ADMIN_AUTH_SECRET_WEAK")) {
            return Response.json({ error: "إعدادات أمان المدراء غير مكتملة على الخادم." }, { status: 500 });
        }

        return Response.json({ error: "تعذر تسجيل الدخول الآن. حاول مرة أخرى." }, { status: 500 });
    }
}