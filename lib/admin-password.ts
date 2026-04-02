import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const HASH_PREFIX = "scrypt";
const KEY_LENGTH = 64;

function toBase64Url(value: Buffer) {
    return value.toString("base64url");
}

function fromBase64Url(value: string) {
    return Buffer.from(value, "base64url");
}

function safeBufferEqual(left: Buffer, right: Buffer) {
    if (left.length !== right.length) {
        return false;
    }

    return timingSafeEqual(left, right);
}

export function hashAdminPassword(password: string) {
    if (password.length < 8) {
        throw new Error("ADMIN_PASSWORD_TOO_SHORT");
    }

    const salt = randomBytes(16);
    const derivedKey = scryptSync(password, salt, KEY_LENGTH);

    return `${HASH_PREFIX}$${toBase64Url(salt)}$${toBase64Url(derivedKey)}`;
}

export function verifyAdminPassword(password: string, passwordHash: string) {
    const parts = passwordHash.split("$");

    if (parts.length !== 3 || parts[0] !== HASH_PREFIX) {
        return false;
    }

    try {
        const salt = fromBase64Url(parts[1]);
        const expected = fromBase64Url(parts[2]);
        const actual = scryptSync(password, salt, expected.length);

        return safeBufferEqual(actual, expected);
    } catch {
        return false;
    }
}