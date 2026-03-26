export function toNumber(value: unknown) {
    if (typeof value === "number") return value;
    if (typeof value === "string") return Number(value);
    if (typeof value === "object" && value !== null && "toString" in value) {
        return Number(String(value));
    }
    return 0;
}

export function formatDzd(value: number) {
    return new Intl.NumberFormat("ar-DZ", {
        maximumFractionDigits: 0,
    }).format(value);
}

export function discountPercent(basePrice: number, discountedPrice: number) {
    if (!basePrice || discountedPrice >= basePrice) return 0;
    return Math.round(((basePrice - discountedPrice) / basePrice) * 100);
}
