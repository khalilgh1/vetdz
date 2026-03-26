"use client";

import { useMemo, useState } from "react";
import { LoaderCircle } from "lucide-react";
import type { UiVariationGroup } from "@/lib/store";
import { formatDzd } from "@/lib/format";
import { WILAYAS } from "@/lib/wilayas";

type OrderFormProps = {
    productSlug: string;
    productNameAr: string;
    unitPrice: number;
    variations: UiVariationGroup[];
};

type SubmitState = {
    type: "idle" | "success" | "error";
    message: string;
};

export function OrderForm({ productSlug, productNameAr, unitPrice, variations }: OrderFormProps) {
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
    const [wilaya, setWilaya] = useState("الجزائر");
    const [address, setAddress] = useState("");
    const [deliveryType, setDeliveryType] = useState<"HOME" | "DESK">("HOME");
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitState, setSubmitState] = useState<SubmitState>({ type: "idle", message: "" });

    const selectedValueIds = useMemo(
        () => Object.values(selectedVariationIds),
        [selectedVariationIds]
    );

    const total = unitPrice * quantity;

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmitState({ type: "idle", message: "" });
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productSlug,
                    selectedVariationValueIds: selectedValueIds,
                    quantity,
                    fullName,
                    phone,
                    wilaya,
                    address,
                    deliveryType,
                    notes,
                }),
            });

            const result = (await response.json()) as { message?: string; error?: string };

            if (!response.ok) {
                throw new Error(result.error || result.message || "تعذر إرسال الطلب.");
            }

            setSubmitState({
                type: "success",
                message: result.message || "تم إرسال طلبك بنجاح. سنتواصل معك قريبًا.",
            });
            setAddress("");
            setNotes("");
            setQuantity(1);
        } catch (error) {
            setSubmitState({
                type: "error",
                message: error instanceof Error ? error.message : "حدث خطأ أثناء إرسال الطلب.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="order-form-box" aria-label={`طلب ${productNameAr}`}>
            <h2>إتمام الطلب</h2>

            <form onSubmit={handleSubmit} className="order-form-grid">
                <label className="field">
                    <span>الاسم الكامل</span>
                    <input value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="اكتب الاسم الكامل" />
                </label>

                <label className="field">
                    <span>رقم الهاتف</span>
                    <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        placeholder="05XXXXXXXX"
                        inputMode="tel"
                    />
                </label>

                <label className="field">
                    <span>الولاية</span>
                    <select value={wilaya} onChange={(e) => setWilaya(e.target.value)}>
                        {WILAYAS.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </label>

                <div className="field">
                    <span>نوع التوصيل</span>
                    <div className="toggle-pill">
                        <button
                            className={deliveryType === "HOME" ? "is-active" : ""}
                            onClick={() => setDeliveryType("HOME")}
                            type="button"
                        >
                            منزلي
                        </button>
                        <button
                            className={deliveryType === "DESK" ? "is-active" : ""}
                            onClick={() => setDeliveryType("DESK")}
                            type="button"
                        >
                            مكتب
                        </button>
                    </div>
                </div>

                <label className="field field-full">
                    <span>العنوان التفصيلي</span>
                    <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        placeholder="الحي، الشارع، رقم البناية..."
                        rows={4}
                    />
                </label>

                <label className="field field-full">
                    <span>ملاحظات إضافية (اختياري)</span>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="أي ملاحظة خاصة بالتوصيل أو المقاس"
                        rows={3}
                    />
                </label>

                {variations.map((variation) => (
                    <div key={variation.variationId} className="field field-full">
                        <span>{variation.variationNameAr}</span>
                        <div className="choice-list">
                            {variation.values.map((value) => {
                                const selected = selectedVariationIds[variation.variationId] === value.id;
                                const hasColor = Boolean(value.hexColor);

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
                                        {value.hexColor ? <span className="chip-color" style={{ backgroundColor: value.hexColor }} /> : null}
                                        {value.valueAr}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <div className="field field-full quantity-row">
                    <span>الكمية</span>
                    <div className="quantity-controls">
                        <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            aria-label="تقليل الكمية"
                        >
                            -
                        </button>
                        <strong>{quantity}</strong>
                        <button type="button" onClick={() => setQuantity((q) => q + 1)} aria-label="زيادة الكمية">
                            +
                        </button>
                    </div>
                </div>

                <div className="field field-full total-row">
                    <span>المجموع</span>
                    <strong>{formatDzd(total)} دج</strong>
                </div>

                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? <LoaderCircle size={18} className="spin" /> : null}
                    <span>{isSubmitting ? "جارٍ الإرسال..." : "تأكيد الطلب"}</span>
                </button>

                {submitState.type !== "idle" ? (
                    <p className={`feedback ${submitState.type === "success" ? "ok" : "bad"}`}>{submitState.message}</p>
                ) : null}
            </form>
        </section>
    );
}
