export type DeliveryTypeOption = "HOME" | "DESK";

export type WilayaDeliveryPricing = {
    wilaya: string;
    home: number | null;
    desk: number | null;
};

export const WILAYA_DELIVERY_PRICING: Record<number, WilayaDeliveryPricing> = {
    1: { wilaya: "أدرار", home: 1400, desk: 970 },
    2: { wilaya: "الشلف", home: 750, desk: 520 },
    3: { wilaya: "الأغواط", home: 950, desk: 670 },
    4: { wilaya: "أم البواقي", home: 700, desk: 520 },
    5: { wilaya: "باتنة", home: 700, desk: 520 },
    6: { wilaya: "بجاية", home: 750, desk: 520 },
    7: { wilaya: "بسكرة", home: 900, desk: 620 },
    8: { wilaya: "بشار", home: 1100, desk: 720 },
    9: { wilaya: "البليدة", home: 750, desk: 520 },
    10: { wilaya: "البويرة", home: 700, desk: 520 },
    11: { wilaya: "تمنراست", home: 1600, desk: 1120 },
    12: { wilaya: "تبسة", home: 800, desk: 520 },
    13: { wilaya: "تلمسان", home: 900, desk: 570 },
    14: { wilaya: "تيارت", home: 800, desk: 520 },
    15: { wilaya: "تيزي وزو", home: 700, desk: 520 },
    16: { wilaya: "الجزائر", home: 600, desk: 470 },
    17: { wilaya: "الجلفة", home: 950, desk: 670 },
    18: { wilaya: "جيجل", home: 750, desk: 520 },
    19: { wilaya: "سطيف", home: 750, desk: 520 },
    20: { wilaya: "سعيدة", home: 800, desk: 570 },
    21: { wilaya: "سكيكدة", home: 700, desk: 520 },
    22: { wilaya: "سيدي بلعباس", home: 800, desk: 520 },
    23: { wilaya: "عنابة", home: 750, desk: 520 },
    24: { wilaya: "قالمة", home: 700, desk: 520 },
    25: { wilaya: "قسنطينة", home: 500, desk: 370 },
    26: { wilaya: "المدية", home: 800, desk: 520 },
    27: { wilaya: "مستغانم", home: 800, desk: 520 },
    28: { wilaya: "المسيلة", home: 800, desk: 570 },
    29: { wilaya: "معسكر", home: 800, desk: 520 },
    30: { wilaya: "ورقلة", home: 900, desk: 670 },
    31: { wilaya: "وهران", home: 750, desk: 720 },
    32: { wilaya: "البيض", home: 1050, desk: 670 },
    33: { wilaya: "إليزي", home: null, desk: null },
    34: { wilaya: "برج بوعريريج", home: 700, desk: 520 },
    35: { wilaya: "بومرداس", home: 750, desk: 520 },
    36: { wilaya: "الطارف", home: 800, desk: 520 },
    37: { wilaya: "تندوف", home: null, desk: null },
    38: { wilaya: "تيسمسيلت", home: 800, desk: null },
    39: { wilaya: "الوادي", home: 950, desk: 670 },
    40: { wilaya: "خنشلة", home: 700, desk: null },
    41: { wilaya: "سوق أهراس", home: 750, desk: 520 },
    42: { wilaya: "تيبازة", home: 800, desk: 520 },
    43: { wilaya: "ميلة", home: 750, desk: 520 },
    44: { wilaya: "عين الدفلى", home: 750, desk: 520 },
    45: { wilaya: "النعامة", home: 1100, desk: 670 },
    46: { wilaya: "عين تموشنت", home: 800, desk: 520 },
    47: { wilaya: "غرداية", home: 950, desk: 670 },
    48: { wilaya: "غليزان", home: 800, desk: 520 },
    49: { wilaya: "تيميمون", home: 1400, desk: null },
    50: { wilaya: "برج باجي مختار", home: null, desk: null },
    51: { wilaya: "أولاد جلال", home: 900, desk: 620 },
    52: { wilaya: "بني عباس", home: 1000, desk: 970 },
    53: { wilaya: "عين صالح", home: 1600, desk: null },
    54: { wilaya: "عين قزام", home: 1600, desk: null },
    55: { wilaya: "تقرت", home: 950, desk: 670 },
    56: { wilaya: "جانت", home: null, desk: null },
    57: { wilaya: "المغير", home: 950, desk: null },
    58: { wilaya: "المنيعة", home: 1000, desk: null },
};

const deliveryPricingByWilaya = new Map(
    Object.values(WILAYA_DELIVERY_PRICING).map((entry) => [entry.wilaya, entry] as const)
);

export const WILAYAS = Object.values(WILAYA_DELIVERY_PRICING).map((entry) => entry.wilaya);

export function getDeliveryFeeForWilaya(wilaya: string, deliveryType: DeliveryTypeOption) {
    const pricing = deliveryPricingByWilaya.get(wilaya);

    if (!pricing) {
        return null;
    }

    return deliveryType === "HOME" ? pricing.home : pricing.desk;
}

export function isDeliveryTypeAvailable(wilaya: string, deliveryType: DeliveryTypeOption) {
    return getDeliveryFeeForWilaya(wilaya, deliveryType) !== null;
}
