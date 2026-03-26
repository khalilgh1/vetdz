import { type DeliveryType, type Gender, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { discountPercent, toNumber } from "@/lib/format";

const productInclude = {
    productType: true,
    images: {
        orderBy: {
            sortOrder: "asc",
        },
    },
    variations: {
        include: {
            variationValue: {
                include: {
                    variation: true,
                },
            },
        },
    },
} satisfies Prisma.ProductInclude;

type RawProduct = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

export type UiVariationGroup = {
    variationId: number;
    variationNameAr: string;
    values: {
        id: number;
        valueAr: string;
        hexColor: string | null;
    }[];
};

export type UiProduct = {
    id: number;
    slug: string;
    nameAr: string;
    subtitleAr: string;
    descriptionAr: string;
    gender: Gender;
    productTypeSlug: string;
    productTypeNameAr: string;
    images: { id: number; url: string; altAr: string }[];
    price: number;
    discountActive: boolean;
    discountedPrice: number | null;
    finalPrice: number;
    discountPercent: number;
    variations: UiVariationGroup[];
};

function toUiProduct(product: RawProduct): UiProduct {
    const price = toNumber(product.price);
    const discountedPrice = product.discountedPrice ? toNumber(product.discountedPrice) : null;
    const finalPrice = product.discountActive && discountedPrice ? discountedPrice : price;
    const grouped = new Map<number, UiVariationGroup>();

    for (const relation of product.variations) {
        const value = relation.variationValue;
        const variation = value.variation;

        if (!grouped.has(variation.id)) {
            grouped.set(variation.id, {
                variationId: variation.id,
                variationNameAr: variation.nameAr,
                values: [],
            });
        }

        grouped.get(variation.id)?.values.push({
            id: value.id,
            valueAr: value.valueAr,
            hexColor: value.hexColor,
        });
    }

    return {
        id: product.id,
        slug: product.slug,
        nameAr: product.nameAr,
        subtitleAr: product.subtitleAr,
        descriptionAr: product.descriptionAr,
        gender: product.gender,
        productTypeSlug: product.productType.slug,
        productTypeNameAr: product.productType.nameAr,
        images: product.images.map((image) => ({
            id: image.id,
            url: image.url,
            altAr: image.altAr,
        })),
        price,
        discountActive: product.discountActive,
        discountedPrice,
        finalPrice,
        discountPercent: discountedPrice ? discountPercent(price, discountedPrice) : 0,
        variations: Array.from(grouped.values()),
    };
}

export async function getProductTypes() {
    return prisma.productType.findMany({
        orderBy: {
            id: "asc",
        },
    });
}

export async function getHomeProducts(gender: Gender | "ALL", productTypeSlug?: string) {
    const products = await prisma.product.findMany({
        include: productInclude,
        where: {
            ...(productTypeSlug ? { productType: { slug: productTypeSlug } } : {}),
            ...(gender === "ALL"
                ? {}
                : {
                    OR: [{ gender }, { gender: "BOTH" }],
                }),
        },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });

    return products.map(toUiProduct);
}

export async function getFeaturedProducts(limit = 6) {
    const featured = await prisma.product.findMany({
        include: productInclude,
        where: {
            isFeatured: true,
        },
        take: limit,
        orderBy: {
            createdAt: "desc",
        },
    });

    return featured.map(toUiProduct);
}

export async function getProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
        where: { slug },
        include: productInclude,
    });

    if (!product) return null;
    return toUiProduct(product);
}

export type CreateOrderInput = {
    fullName: string;
    phone: string;
    wilaya: string;
    address: string;
    deliveryType: DeliveryType;
    notes?: string;
    productSlug: string;
    selectedVariationValueIds: number[];
    quantity: number;
};

export async function createOrder(input: CreateOrderInput) {
    const product = await prisma.product.findUnique({
        where: { slug: input.productSlug },
        include: {
            variations: true,
        },
    });

    if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
    }

    const allowedVariationValueIds = new Set(product.variations.map((item) => item.variationValueId));

    for (const id of input.selectedVariationValueIds) {
        if (!allowedVariationValueIds.has(id)) {
            throw new Error("INVALID_VARIATION_SELECTION");
        }
    }

    const basePrice = toNumber(product.price);
    const discountedPrice = product.discountedPrice ? toNumber(product.discountedPrice) : null;
    const unitPrice = product.discountActive && discountedPrice ? discountedPrice : basePrice;
    const lineTotal = unitPrice * input.quantity;

    return prisma.order.create({
        data: {
            fullName: input.fullName,
            phone: input.phone,
            wilaya: input.wilaya,
            address: input.address,
            deliveryType: input.deliveryType,
            notes: input.notes,
            totalAmount: lineTotal,
            items: {
                create: {
                    quantity: input.quantity,
                    productId: product.id,
                    unitPrice,
                    lineTotal,
                    selections: {
                        createMany: {
                            data: input.selectedVariationValueIds.map((variationValueId) => ({
                                variationValueId,
                            })),
                        },
                    },
                },
            },
        },
        include: {
            items: {
                include: {
                    product: true,
                    selections: {
                        include: {
                            variationValue: {
                                include: {
                                    variation: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
}
