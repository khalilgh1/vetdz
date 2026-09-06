"use client";

import { useEffect, useMemo, useState } from "react";
import { LoaderCircle } from "lucide-react";
import type { UiVariationGroup } from "@/lib/store";
import { formatDzd } from "@/lib/format";
import { getDeliveryFeeForWilaya, isDeliveryTypeAvailable, WILAYAS } from "@/lib/wilayas";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries/ar";

type OrderFormProps = {
    productSlug: string;
    productNameAr: string;
    productNameEn?: string;
    unitPrice: number;
    variations: UiVariationGroup[];
    locale?: Locale;
    dict?: Dictionary;
};

type SubmitState = {
    type: "idle" | "success" | "error";
    message: string;
};

function normalizePhoneInput(value: string) {
    return value
        .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
        .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
        .replace(/\D/g, "")
        .slice(0, 10);
}

export function OrderForm({
    productSlug,
    productNameAr,
    productNameEn,
    unitPrice,
    variations,
    locale = "ar",
    dict,
}: OrderFormProps) {
    const isEn = locale === "en";
    const productName = isEn && productNameEn ? productNameEn : productNameAr;
    const currency = isEn ? "DZD" : "دج";

    const [selectedVariationIds, setSelectedVariationIds] = useState<Record<number, number>>(() => {
        const initial: Record<number, number> = {};
        for (const variation of variations) {
            if (variation.values[0]) {
                initial[variation.variationId] = variation.values[0].id;
            }
        }
        return initial;
    });

    const [quantity, setQuantity] = useState(1);
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [wilaya, setWilaya] = useState(() => (WILAYAS.includes("الجزائر") ? "الجزائر" : (WILAYAS[0] ?? "")));
    const [address, setAddress] = useState("");
    const [deliveryType, setDeliveryType] = useState<"HOME" | "DESK">("HOME");
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitState, setSubmitState] = useState<SubmitState>({ type: "idle", message: "" });

    const selectedValueIds = useMemo(
        () => Object.values(selectedVariationIds),
        [selectedVariationIds]
    );

    const isHomeAvailable = isDeliveryTypeAvailable(wilaya, "HOME");
    const isDeskAvailable = isDeliveryTypeAvailable(wilaya, "DESK");

    useEffect(() => {
        if (isDeliveryTypeAvailable(wilaya, deliveryType)) {
            return;
        }

        if (isHomeAvailable) {
            setDeliveryType("HOME");
            return;
        }

        if (isDeskAvailable) {
            setDeliveryType("DESK");
        }
    }, [deliveryType, isDeskAvailable, isHomeAvailable, wilaya]);

    const itemsTotal = unitPrice * quantity;
    const shippingFee = useMemo(() => getDeliveryFeeForWilaya(wilaya, deliveryType), [deliveryType, wilaya]);
    const total = shippingFee === null ? itemsTotal : itemsTotal + shippingFee;

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmitState({ type: "idle", message: "" });

        if (!productSlug) {
            setSubmitState({
                type: "error",
                message: isEn ? "Please select a product first." : "يرجى اختيار منتج أولاً.",
            });
            return;
        }

        if (shippingFee === null) {
            setSubmitState({
                type: "error",
                message: isEn ? "Delivery is not available for this wilaya." : "التوصيل غير متاح لهذه الولاية بهذا النوع.",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fullName,
                    phone,
                    wilaya,
                    address,
                    deliveryType,
                    notes: notes || undefined,
                    productSlug,
                    quantity,
                    selectedVariationValueIds: selectedValueIds,
                }),
            });

            const payload = (await response.json()) as { error?: string; orderReference?: string };

            if (!response.ok) {
                setSubmitState({
                    type: "error",
                    message: payload.error || (isEn ? "An error occurred while submitting." : "حدث خطأ أثناء إرسال الطلب."),
                });
                return;
            }

            setSubmitState({
                type: "success",
                message: dict?.order.successAlert ?? (isEn
                    ? "Your order has been placed! We will call you shortly to confirm delivery."
                    : "تم تسجيل طلبك بنجاح! سنتصل بك هاتفيًا قريبًا لتأكيد التوصيل."),
            });

            setNotes("");
        } catch {
            setSubmitState({
                type: "error",
                message: isEn ? "Failed to connect to server. Please try again." : "تعذر الاتصال بالخادم، يرجى المحاولة مرة أخرى.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="order-box reveal">
            <div className="order-box-header">
                <h2>{dict?.order.heroHeading ?? (isEn ? "Place Your Order" : "أرسل طلبك الآن")}</h2>
                <p>
                    {isEn
                        ? `Selected Product: ${productName}`
                        : `المنتج المختار: ${productName}`}
                </p>
            </div>

            <form className="order-form" onSubmit={handleSubmit}>
                <label className="field">
                    <span>{dict?.order.fullName ?? (isEn ? "Full Name" : "الاسم الكامل")}</span>
                    <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        placeholder={dict?.order.fullNamePlaceholder ?? (isEn ? "e.g. Amine Belkacem" : "مثال: أمين بلقاسم")}
                    />
                </label>

                <label className="field">
                    <span>{dict?.order.phone ?? (isEn ? "Phone Number" : "رقم الهاتف")}</span>
                    <input
                        value={phone}
                        onChange={(e) => setPhone(normalizePhoneInput(e.target.value))}
                        required
                        placeholder="05XXXXXXXX"
                        dir="ltr"
                        inputMode="tel"
                        maxLength={10}
                        minLength={10}
                        pattern="0[0-9]{9}"
                        title={isEn ? "Phone must be 10 digits starting with 0" : "رقم الهاتف يجب أن يكون 10 أرقام ويبدأ بـ 0"}
                    />
                </label>

                <label className="field">
                    <span>{dict?.order.wilaya ?? (isEn ? "Wilaya" : "الولاية")}</span>
                    <select value={wilaya} onChange={(e) => setWilaya(e.target.value)}>
                        {WILAYAS.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </label>

                <div className="field">
                    <span>{dict?.order.deliveryType ?? (isEn ? "Delivery Method" : "نوع التوصيل")}</span>
                    <div className="toggle-pill">
                        <button
                            className={deliveryType === "HOME" ? "is-active" : ""}
                            onClick={() => setDeliveryType("HOME")}
                            type="button"
                            disabled={!isHomeAvailable}
                        >
                            {dict?.order.homeDelivery ?? (isEn ? "Home Delivery" : "منزلي")}
                        </button>
                        <button
                            className={deliveryType === "DESK" ? "is-active" : ""}
                            onClick={() => setDeliveryType("DESK")}
                            type="button"
                            disabled={!isDeskAvailable}
                        >
                            {dict?.order.deskDelivery ?? (isEn ? "Stop Desk" : "مكتب")}
                        </button>
                    </div>
                </div>

                <label className="field field-full">
                    <span>{dict?.order.address ?? (isEn ? "Full Address" : "العنوان التفصيلي")}</span>
                    <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        placeholder={dict?.order.addressPlaceholder ?? (isEn ? "Street, neighborhood, building..." : "الحي، الشارع، رقم البناية...")}
                        rows={4}
                    />
                </label>

                <label className="field field-full">
                    <span>{dict?.order.notes ?? (isEn ? "Notes (Optional)" : "ملاحظات إضافية (اختياري)")}</span>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={dict?.order.notesPlaceholder ?? (isEn ? "Special delivery instructions..." : "أي ملاحظة خاصة بالتوصيل أو المقاس")}
                        rows={3}
                    />
                </label>

                {variations.map((variation) => {
                    const varLabel = isEn && variation.variationNameEn ? variation.variationNameEn : variation.variationNameAr;

                    return (
                        <div key={variation.variationId} className="field field-full">
                            <span>{varLabel}</span>
                            <div className="choice-list">
                                {variation.values.map((value) => {
                                    const selected = selectedVariationIds[variation.variationId] === value.id;
                                    const hasColor = Boolean(value.hexColor);
                                    const valLabel = isEn && value.valueEn ? value.valueEn : value.valueAr;

                                    return (
                                        <button
                                            key={value.id}
                                            type="button"
                                            className={`chip ${selected ? "is-selected" : ""} ${hasColor ? "has-color" : ""}`}
                                            onClick={() =>
                                                setSelectedVariationIds((prev) => ({
                                                    ...prev,
                                                    [variation.variationId]: value.id,
                                                }))
                                            }
                                        >
                                            {value.hexColor ? (
                                                <svg className="chip-color" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
                                                    <circle cx="6" cy="6" r="6" fill={value.hexColor} />
                                                </svg>
                                            ) : null}
                                            {valLabel}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                <div className="field field-full quantity-row">
                    <span>{dict?.order.quantity ?? (isEn ? "Quantity" : "الكمية")}</span>
                    <div className="quantity-controls">
                        <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            aria-label={isEn ? "Decrease quantity" : "تقليل الكمية"}
                            disabled={quantity <= 1}
                        >
                            -
                        </button>
                        <strong>{quantity}</strong>
                        <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                            aria-label={isEn ? "Increase quantity" : "زيادة الكمية"}
                            disabled={quantity >= 10}
                        >
                            +
                        </button>
                    </div>
                </div>

                <div className="field field-full total-row">
                    <span>{dict?.order.productPrice ?? (isEn ? "Item Price" : "سعر المنتج")}</span>
                    <strong>{formatDzd(itemsTotal)} {currency}</strong>
                </div>

                <div className="field field-full total-row">
                    <span>{dict?.order.shippingFee ?? (isEn ? "Delivery Fee" : "رسوم التوصيل")}</span>
                    <strong>{shippingFee === null ? (isEn ? "Unavailable" : "غير متاح") : `${formatDzd(shippingFee)} ${currency}`}</strong>
                </div>

                <div className="field field-full total-row">
                    <span>{dict?.order.total ?? (isEn ? "Total" : "المجموع")}</span>
                    <strong>{shippingFee === null ? (isEn ? "Unavailable" : "غير متاح") : `${formatDzd(total)} ${currency}`}</strong>
                </div>

                {shippingFee === null ? (
                    <p className="feedback bad">
                        {dict?.order.deliveryUnavailable ?? (isEn ? "Delivery not available for this wilaya." : "التوصيل غير متاح للولاية المختارة بهذا النوع.")}
                    </p>
                ) : null}

                <button type="submit" className="submit-btn" disabled={isSubmitting || shippingFee === null}>
                    {isSubmitting ? <LoaderCircle size={18} className="spin" /> : null}
                    <span>
                        {isSubmitting
                            ? (dict?.order.submitting ?? (isEn ? "Submitting..." : "جارٍ الإرسال..."))
                            : shippingFee === null
                                ? (isEn ? "Delivery Unavailable" : "التوصيل غير متاح")
                                : (dict?.order.submitButton ?? (isEn ? "Confirm Order Now" : "تأكيد الطلب"))}
                    </span>
                </button>

                {submitState.type !== "idle" ? (
                    <p className={`feedback ${submitState.type === "success" ? "ok" : "bad"}`}>{submitState.message}</p>
                ) : null}
            </form>
        </section>
    );
}
