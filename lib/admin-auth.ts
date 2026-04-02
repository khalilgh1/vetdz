import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const ADMIN_SESSION_COOKIE_NAME = "vetdz_admin_session";
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12;

type AdminSessionPayload = {
    sub: number;
    exp: number;
};

export type AuthenticatedAdmin = {
    id: number;
    username: string;
    email: string;
};
// the admin auth secret is a random string used to sign the session tokens
function resolveAdminAuthSecret() {
    const configured =
        process.env.ADMIN_AUTH_SECRET?.trim() ||
        process.env.AUTH_SECRET?.trim() ||
        process.env.NEXTAUTH_SECRET?.trim() ||
        "";

    if (configured.length > 0) {
        if (configured.length < 32 && process.env.NODE_ENV === "production") {
            throw new Error("ADMIN_AUTH_SECRET_WEAK");
        }

        return configured;
    }

    if (process.env.NODE_ENV === "production") {
        throw new Error("ADMIN_AUTH_SECRET_MISSING");
    }

    return "vetdz-dev-admin-auth-secret-change-this-value";
}

const ADMIN_AUTH_SECRET = resolveAdminAuthSecret();

function signPayload(payloadPart: string) {
    return createHmac("sha256", ADMIN_AUTH_SECRET).update(payloadPart).digest();
}

function encodePayload(payload: AdminSessionPayload) {
    return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodePayload(encodedPayload: string) {
    const raw = Buffer.from(encodedPayload, "base64url").toString("utf8");
    return JSON.parse(raw) as AdminSessionPayload;
}

function createSessionToken(adminId: number) {
    const payload: AdminSessionPayload = {
        sub: adminId,
        exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SECONDS,
    };

    const payloadPart = encodePayload(payload);
    const signaturePart = signPayload(payloadPart).toString("base64url");

    return `${payloadPart}.${signaturePart}`;
}

function readAdminIdFromToken(token: string) {
    const [payloadPart, signaturePart] = token.split(".");

    if (!payloadPart || !signaturePart) {
        return null;
    }

    try {
        const expectedSignature = signPayload(payloadPart);
        const actualSignature = Buffer.from(signaturePart, "base64url");

        if (actualSignature.length !== expectedSignature.length) {
            return null;
        }

        if (!timingSafeEqual(actualSignature, expectedSignature)) {
            return null;
        }

        const payload = decodePayload(payloadPart);

        if (!Number.isInteger(payload.sub) || payload.sub <= 0) {
            return null;
        }

        if (!Number.isInteger(payload.exp) || payload.exp <= Math.floor(Date.now() / 1000)) {
            return null;
        }

        return payload.sub;
    } catch {
        return null;
    }
}

export async function setAdminSession(adminId: number) {
    const cookieStore = await cookies();

    cookieStore.set(ADMIN_SESSION_COOKIE_NAME, createSessionToken(adminId), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: ADMIN_SESSION_TTL_SECONDS,
    });
}

export async function clearAdminSession() {
    const cookieStore = await cookies();

    cookieStore.set(ADMIN_SESSION_COOKIE_NAME, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
    });
}

export async function getAuthenticatedAdmin(): Promise<AuthenticatedAdmin | null> {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
        return null;
    }

    const adminId = readAdminIdFromToken(sessionToken);

    if (!adminId) {
        return null;
    }

    const admin = await prisma.admin.findUnique({
        where: {
            id: adminId,
        },
        select: {
            id: true,
            username: true,
            email: true,
        },
    });

    return admin;
}

export async function isAdminAuthenticated() {
    const admin = await getAuthenticatedAdmin();
    return admin !== null;
}