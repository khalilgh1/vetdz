import { Gender, type Prisma } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { toNumber } from "@/lib/format";
import { deleteCloudinaryImagesByUrls } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

function purgeTag(tag: string) {
    try {
        revalidateTag(tag, "max");
    } catch {
        // Ignored if called outside Next.js request context (e.g. scripts)
    }
}

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
    nameEn: string;
    subtitleAr: string;
    subtitleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    gender: Gender;
    productTypeId: number;
    productTypeNameAr: string;
    productTypeNameEn: string;
    price: number;
    discountActive: boolean;
    discountedPrice: number | null;
    isFeatured: boolean;
    imageUrls: string[];
    variationValueIds: number[];
    selectedVariations: {
        valueId: number;
        valueAr: string;
        valueEn?: string | null;
        hexColor: string | null;
        variationId: number;
        variationNameAr: string;
        variationNameEn?: string | null;
    }[];
};

export type AdminProductInput = {
    slug: string;
    nameAr: string;
    nameEn: string;
    subtitleAr: string;
    subtitleEn: string;
    descriptionAr: string;
    descriptionEn: string;
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
    nameEn?: string;
};

export type AdminVariationValueInput = {
    variationId: number;
    valueAr: string;
    valueEn?: string;
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
        nameEn: product.nameEn,
        subtitleAr: product.subtitleAr,
        subtitleEn: product.subtitleEn,
        descriptionAr: product.descriptionAr,
        descriptionEn: product.descriptionEn,
        gender: product.gender,
        productTypeId: product.productTypeId,
        productTypeNameAr: product.productType.nameAr,
        productTypeNameEn: product.productType.nameEn,
        price: toNumber(product.price),
        discountActive: product.discountActive,
        discountedPrice: product.discountedPrice ? toNumber(product.discountedPrice) : null,
        isFeatured: product.isFeatured,
        imageUrls: product.images.map((image) => image.url),
        variationValueIds: product.variations.map((relation) => relation.variationValueId),
        selectedVariations: product.variations.map((relation) => ({
            valueId: relation.variationValueId,
            valueAr: relation.variationValue.valueAr,
            valueEn: relation.variationValue.valueEn,
            hexColor: relation.variationValue.hexColor,
            variationId: relation.variationValue.variation.id,
            variationNameAr: relation.variationValue.variation.nameAr,
            variationNameEn: relation.variationValue.variation.nameEn,
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
            nameEn: input.nameEn,
            subtitleAr: input.subtitleAr,
            subtitleEn: input.subtitleEn,
            descriptionAr: input.descriptionAr,
            descriptionEn: input.descriptionEn,
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
                    altEn: input.nameEn,
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

    purgeTag("products");
    return toAdminProduct(product);
}

export async function updateAdminProduct(id: number, input: AdminProductInput) {
    const imageUrls = normalizeImageUrls(input.imageUrls);

    if (imageUrls.length === 0) {
        throw new Error("PRODUCT_IMAGES_REQUIRED");
    }

    const existingImages = await prisma.productImage.findMany({
        where: {
            productId: id,
        },
        select: {
            url: true,
        },
    });

    const variationValueIds = await assertVariationValuesBelongToType(input.productTypeId, input.variationValueIds);

    const product = await prisma.product.update({
        where: {
            id,
        },
        data: {
            slug: input.slug,
            nameAr: input.nameAr,
            nameEn: input.nameEn,
            subtitleAr: input.subtitleAr,
            subtitleEn: input.subtitleEn,
            descriptionAr: input.descriptionAr,
            descriptionEn: input.descriptionEn,
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
                    altEn: input.nameEn,
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

    const nextImageSet = new Set(imageUrls);
    const removedImageUrls = existingImages
        .map((image) => image.url)
        .filter((url) => !nextImageSet.has(url));

    if (removedImageUrls.length > 0) {
        try {
            await deleteCloudinaryImagesByUrls(removedImageUrls);
        } catch (error) {
            console.error("[admin-products] failed to remove replaced images from cloudinary", error);
        }
    }

    purgeTag("products");
    purgeTag(`product-${input.slug}`);
    return toAdminProduct(product);
}

export async function deleteAdminProduct(id: number) {
    const product = await prisma.product.findUnique({
        where: {
            id,
        },
        include: {
            images: {
                select: {
                    url: true,
                },
            },
        },
    });

    if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
    }

    await deleteCloudinaryImagesByUrls(product.images.map((image) => image.url));

    const deleted = await prisma.product.delete({
        where: {
            id,
        },
    });

    purgeTag("products");
    return deleted;
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
    const item = await prisma.productType.create({
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

    purgeTag("product-types");
    purgeTag("products");
    return item;
}

export async function updateAdminProductType(id: number, input: { slug: string; nameAr: string }) {
    const item = await prisma.productType.update({
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

    purgeTag("product-types");
    purgeTag("products");
    return item;
}

export async function deleteAdminProductType(id: number) {
    const deleted = await prisma.productType.delete({
        where: {
            id,
        },
    });

    purgeTag("product-types");
    purgeTag("products");
    return deleted;
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
    const item = await prisma.variation.create({
        data: {
            productTypeId: input.productTypeId,
            nameAr: input.nameAr,
        },
        include: adminVariationInclude,
    });

    purgeTag("products");
    return item;
}

export async function updateAdminVariation(id: number, input: { nameAr: string }) {
    const item = await prisma.variation.update({
        where: {
            id,
        },
        data: {
            nameAr: input.nameAr,
        },
        include: adminVariationInclude,
    });

    purgeTag("products");
    return item;
}

export async function deleteAdminVariation(id: number) {
    const deleted = await prisma.variation.delete({
        where: {
            id,
        },
    });

    purgeTag("products");
    return deleted;
}

export async function createAdminVariationValue(input: AdminVariationValueInput) {
    const item = await prisma.variationValue.create({
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

    purgeTag("products");
    return item;
}

export async function updateAdminVariationValue(id: number, input: { valueAr: string; hexColor?: string | null }) {
    const item = await prisma.variationValue.update({
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

    purgeTag("products");
    return item;
}

export async function deleteAdminVariationValue(id: number) {
    const deleted = await prisma.variationValue.delete({
        where: {
            id,
        },
    });

    purgeTag("products");
    return deleted;
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
    const item = await prisma.testimonial.create({
        data: {
            nameAr: input.nameAr,
            roleAr: input.roleAr,
            textAr: input.textAr,
            rating: input.rating,
        },
    });

    purgeTag("testimonials");
    return item;
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
    const item = await prisma.testimonial.update({
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

    purgeTag("testimonials");
    return item;
}

export async function deleteAdminTestimonial(id: number) {
    const deleted = await prisma.testimonial.delete({
        where: {
            id,
        },
    });

    purgeTag("testimonials");
    return deleted;
}
