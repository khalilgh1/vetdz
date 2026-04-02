import { Gender, type Prisma } from "@prisma/client";
import { toNumber } from "@/lib/format";
import { prisma } from "@/lib/prisma";

const adminProductInclude = {
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
        orderBy: {
            variationValueId: "asc",
        },
    },
} satisfies Prisma.ProductInclude;

type AdminRawProduct = Prisma.ProductGetPayload<{ include: typeof adminProductInclude }>;

export type AdminProductRecord = {
    id: number;
    slug: string;
    nameAr: string;
    subtitleAr: string;
    descriptionAr: string;
    gender: Gender;
    productTypeId: number;
    productTypeNameAr: string;
    price: number;
    discountActive: boolean;
    discountedPrice: number | null;
    isFeatured: boolean;
    imageUrls: string[];
    variationValueIds: number[];
    selectedVariations: {
        valueId: number;
        valueAr: string;
        hexColor: string | null;
        variationId: number;
        variationNameAr: string;
    }[];
};

export type AdminProductInput = {
    slug: string;
    nameAr: string;
    subtitleAr: string;
    descriptionAr: string;
    price: number;
    discountActive: boolean;
    discountedPrice: number | null;
    gender: Gender;
    isFeatured: boolean;
    productTypeId: number;
    imageUrls: string[];
    variationValueIds: number[];
};

export type AdminVariationInput = {
    productTypeId: number;
    nameAr: string;
};

export type AdminVariationValueInput = {
    variationId: number;
    valueAr: string;
    hexColor?: string | null;
};

function normalizeImageUrls(imageUrls: string[]) {
    const normalized = imageUrls
        .map((entry) => entry.trim())
        .filter(Boolean);

    return Array.from(new Set(normalized));
}

function normalizeHexColor(hexColor?: string | null) {
    const value = hexColor?.trim();
    return value ? value : null;
}

function toAdminProduct(product: AdminRawProduct): AdminProductRecord {
    return {
        id: product.id,
        slug: product.slug,
        nameAr: product.nameAr,
        subtitleAr: product.subtitleAr,
        descriptionAr: product.descriptionAr,
        gender: product.gender,
        productTypeId: product.productTypeId,
        productTypeNameAr: product.productType.nameAr,
        price: toNumber(product.price),
        discountActive: product.discountActive,
        discountedPrice: product.discountedPrice ? toNumber(product.discountedPrice) : null,
        isFeatured: product.isFeatured,
        imageUrls: product.images.map((image) => image.url),
        variationValueIds: product.variations.map((relation) => relation.variationValueId),
        selectedVariations: product.variations.map((relation) => ({
            valueId: relation.variationValueId,
            valueAr: relation.variationValue.valueAr,
            hexColor: relation.variationValue.hexColor,
            variationId: relation.variationValue.variation.id,
            variationNameAr: relation.variationValue.variation.nameAr,
        })),
    };
}

async function assertVariationValuesBelongToType(productTypeId: number, variationValueIds: number[]) {
    const uniqueVariationValueIds = Array.from(new Set(variationValueIds));

    if (uniqueVariationValueIds.length === 0) {
        return uniqueVariationValueIds;
    }

    const values = await prisma.variationValue.findMany({
        where: {
            id: {
                in: uniqueVariationValueIds,
            },
        },
        include: {
            variation: {
                select: {
                    productTypeId: true,
                },
            },
        },
    });

    if (values.length !== uniqueVariationValueIds.length) {
        throw new Error("INVALID_VARIATION_VALUE_IDS");
    }

    if (values.some((value) => value.variation.productTypeId !== productTypeId)) {
        throw new Error("MISMATCHED_PRODUCT_TYPE_VARIATIONS");
    }

    return uniqueVariationValueIds;
}

export async function listAdminProducts() {
    const products = await prisma.product.findMany({
        include: adminProductInclude,
        orderBy: {
            createdAt: "desc",
        },
    });

    return products.map(toAdminProduct);
}

export async function createAdminProduct(input: AdminProductInput) {
    const imageUrls = normalizeImageUrls(input.imageUrls);

    if (imageUrls.length === 0) {
        throw new Error("PRODUCT_IMAGES_REQUIRED");
    }

    const variationValueIds = await assertVariationValuesBelongToType(input.productTypeId, input.variationValueIds);

    const product = await prisma.product.create({
        data: {
            slug: input.slug,
            nameAr: input.nameAr,
            subtitleAr: input.subtitleAr,
            descriptionAr: input.descriptionAr,
            price: input.price,
            discountActive: input.discountActive,
            discountedPrice: input.discountActive ? input.discountedPrice : null,
            gender: input.gender,
            isFeatured: input.isFeatured,
            productTypeId: input.productTypeId,
            images: {
                create: imageUrls.map((url, index) => ({
                    url,
                    altAr: input.nameAr,
                    sortOrder: index,
                })),
            },
            variations: {
                createMany: {
                    data: variationValueIds.map((variationValueId) => ({
                        variationValueId,
                    })),
                },
            },
        },
        include: adminProductInclude,
    });

    return toAdminProduct(product);
}

export async function updateAdminProduct(id: number, input: AdminProductInput) {
    const imageUrls = normalizeImageUrls(input.imageUrls);

    if (imageUrls.length === 0) {
        throw new Error("PRODUCT_IMAGES_REQUIRED");
    }

    const variationValueIds = await assertVariationValuesBelongToType(input.productTypeId, input.variationValueIds);

    const product = await prisma.product.update({
        where: {
            id,
        },
        data: {
            slug: input.slug,
            nameAr: input.nameAr,
            subtitleAr: input.subtitleAr,
            descriptionAr: input.descriptionAr,
            price: input.price,
            discountActive: input.discountActive,
            discountedPrice: input.discountActive ? input.discountedPrice : null,
            gender: input.gender,
            isFeatured: input.isFeatured,
            productTypeId: input.productTypeId,
            images: {
                deleteMany: {},
                create: imageUrls.map((url, index) => ({
                    url,
                    altAr: input.nameAr,
                    sortOrder: index,
                })),
            },
            variations: {
                deleteMany: {},
                ...(variationValueIds.length > 0
                    ? {
                        createMany: {
                            data: variationValueIds.map((variationValueId) => ({
                                variationValueId,
                            })),
                        },
                    }
                    : {}),
            },
        },
        include: adminProductInclude,
    });

    return toAdminProduct(product);
}

export async function deleteAdminProduct(id: number) {
    return prisma.product.delete({
        where: {
            id,
        },
    });
}

export async function listAdminProductTypes() {
    return prisma.productType.findMany({
        include: {
            _count: {
                select: {
                    products: true,
                    variations: true,
                },
            },
        },
        orderBy: {
            id: "asc",
        },
    });
}

export async function createAdminProductType(input: { slug: string; nameAr: string }) {
    return prisma.productType.create({
        data: {
            slug: input.slug,
            nameAr: input.nameAr,
        },
        include: {
            _count: {
                select: {
                    products: true,
                    variations: true,
                },
            },
        },
    });
}

export async function updateAdminProductType(id: number, input: { slug: string; nameAr: string }) {
    return prisma.productType.update({
        where: {
            id,
        },
        data: {
            slug: input.slug,
            nameAr: input.nameAr,
        },
        include: {
            _count: {
                select: {
                    products: true,
                    variations: true,
                },
            },
        },
    });
}

export async function deleteAdminProductType(id: number) {
    return prisma.productType.delete({
        where: {
            id,
        },
    });
}

const adminVariationInclude = {
    productType: {
        select: {
            id: true,
            slug: true,
            nameAr: true,
        },
    },
    values: {
        orderBy: {
            id: "asc",
        },
    },
} satisfies Prisma.VariationInclude;

export async function listAdminVariations(productTypeId?: number) {
    return prisma.variation.findMany({
        where: productTypeId
            ? {
                productTypeId,
            }
            : undefined,
        include: adminVariationInclude,
        orderBy: [
            {
                productTypeId: "asc",
            },
            {
                id: "asc",
            },
        ],
    });
}

export async function createAdminVariation(input: AdminVariationInput) {
    return prisma.variation.create({
        data: {
            productTypeId: input.productTypeId,
            nameAr: input.nameAr,
        },
        include: adminVariationInclude,
    });
}

export async function updateAdminVariation(id: number, input: { nameAr: string }) {
    return prisma.variation.update({
        where: {
            id,
        },
        data: {
            nameAr: input.nameAr,
        },
        include: adminVariationInclude,
    });
}

export async function deleteAdminVariation(id: number) {
    return prisma.variation.delete({
        where: {
            id,
        },
    });
}

export async function createAdminVariationValue(input: AdminVariationValueInput) {
    return prisma.variationValue.create({
        data: {
            variationId: input.variationId,
            valueAr: input.valueAr,
            hexColor: normalizeHexColor(input.hexColor),
        },
        include: {
            variation: {
                include: {
                    productType: {
                        select: {
                            id: true,
                            slug: true,
                            nameAr: true,
                        },
                    },
                },
            },
        },
    });
}

export async function updateAdminVariationValue(id: number, input: { valueAr: string; hexColor?: string | null }) {
    return prisma.variationValue.update({
        where: {
            id,
        },
        data: {
            valueAr: input.valueAr,
            hexColor: normalizeHexColor(input.hexColor),
        },
        include: {
            variation: {
                include: {
                    productType: {
                        select: {
                            id: true,
                            slug: true,
                            nameAr: true,
                        },
                    },
                },
            },
        },
    });
}

export async function deleteAdminVariationValue(id: number) {
    return prisma.variationValue.delete({
        where: {
            id,
        },
    });
}

export async function listAdminTestimonials() {
    return prisma.testimonial.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });
}

export async function createAdminTestimonial(input: {
    nameAr: string;
    roleAr: string;
    textAr: string;
    rating: number;
}) {
    return prisma.testimonial.create({
        data: {
            nameAr: input.nameAr,
            roleAr: input.roleAr,
            textAr: input.textAr,
            rating: input.rating,
        },
    });
}

export async function updateAdminTestimonial(
    id: number,
    input: {
        nameAr: string;
        roleAr: string;
        textAr: string;
        rating: number;
    }
) {
    return prisma.testimonial.update({
        where: {
            id,
        },
        data: {
            nameAr: input.nameAr,
            roleAr: input.roleAr,
            textAr: input.textAr,
            rating: input.rating,
        },
    });
}

export async function deleteAdminTestimonial(id: number) {
    return prisma.testimonial.delete({
        where: {
            id,
        },
    });
}
