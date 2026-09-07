/**
 * Store module - Contains all database queries and data transformations for products and orders.
 * This module handles fetching products, filters, pagination, order creation, and converting
 * database entities to UI-friendly formats.
 */

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { type Gender, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { discountPercent, toNumber } from "@/lib/format";
import { getDeliveryFeeForWilaya, type DeliveryTypeOption } from "@/lib/wilayas";

/**
 * Prisma include configuration for Product queries.
 * Defines what related data should be eagerly loaded when fetching products:
 * - productType: The category (toppings, leggings, shoes, etc.)
 * - images: Product images sorted by display order
 * - variations: Product variations (size, color, etc.) with their values and associated data
 */
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

/**
 * RawProduct type - The raw database entity returned from Prisma queries.
 * Includes all relations defined in productInclude.
 * This is the internal format from the database before UI transformation.
 */
type RawProduct = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

/**
 * UiVariationGroup type - Represents a grouped variation option (e.g., all sizes or all colors).
 * Used in the UI to display variation options to customers.
 * @property variationId - The ID of the variation type
 * @property variationNameAr - Arabic name of the variation (e.g., "المقاس" for size)
 * @property values - Array of selectable values for this variation with their display properties
 */
export type UiVariationGroup = {
    variationId: number;
    variationNameAr: string;
    variationNameEn: string | null;
    values: {
        id: number;
        valueAr: string;
        valueEn: string | null;
        hexColor: string | null;
    }[];
};

/**
 * UiProduct type - Product data formatted for frontend UI consumption.
 * This is the normalized, easy-to-use format for components.
 * All prices are converted to numbers, variations are grouped, and images are simplified.
 */
export type UiProduct = {
    id: number;
    slug: string;
    nameAr: string;
    nameEn: string;
    subtitleAr: string;
    subtitleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    gender: Gender;
    productTypeSlug: string;
    productTypeNameAr: string;
    productTypeNameEn: string;
    images: { id: number; url: string; altAr: string; altEn: string }[];
    price: number;
    discountActive: boolean;
    discountedPrice: number | null;
    finalPrice: number;
    discountPercent: number;
    variations: UiVariationGroup[];
};

/**
 * Converts a raw Prisma product entity to a UI-friendly format.
 */
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
                variationNameEn: variation.nameEn,
                values: [],
            });
        }

        grouped.get(variation.id)?.values.push({
            id: value.id,
            valueAr: value.valueAr,
            valueEn: value.valueEn,
            hexColor: value.hexColor,
        });
    }

    return {
        id: product.id,
        slug: product.slug,
        nameAr: product.nameAr,
        nameEn: product.nameEn || product.nameAr,
        subtitleAr: product.subtitleAr,
        subtitleEn: product.subtitleEn || product.subtitleAr,
        descriptionAr: product.descriptionAr,
        descriptionEn: product.descriptionEn || product.descriptionAr,
        gender: product.gender,
        productTypeSlug: product.productType.slug,
        productTypeNameAr: product.productType.nameAr,
        productTypeNameEn: product.productType.nameEn || product.productType.nameAr,
        images: product.images.map((image) => ({
            id: image.id,
            url: image.url,
            altAr: image.altAr,
            altEn: image.altEn || image.altAr,
        })),
        price,
        discountActive: product.discountActive,
        discountedPrice,
        finalPrice,
        discountPercent: discountedPrice ? discountPercent(price, discountedPrice) : 0,
        variations: Array.from(grouped.values()),
    };
}

/**
 * Fetches all product categories/types.
 * Cached for 1 hour (product types rarely change).
 * Deduplicated within a single render pass via React cache().
 * @returns Array of all product types (toppings, leggings, shoes, etc.) ordered by ID
 */
export const getProductTypes = cache(
    unstable_cache(
        async () => {
            return prisma.productType.findMany({
                orderBy: {
                    id: "asc",
                },
            });
        },
        ["product-types"],
        { revalidate: 3600, tags: ["product-types"] }
    )
);

/**
 * Fetches products for the home page with optional filtering.
 * Results are ordered with featured products first, then by creation date.
 *
 * @param gender - Filter by gender (MALE, FEMALE, BOTH, or ALL for all products)
 * @param productTypeSlug - Optional filter by product type slug (e.g., "toppings")
 * @param search - Optional text search across name, subtitle, and description
 * @returns Array of UI-formatted products matching the filters
 */
export function getHomeProducts(gender: Gender | "ALL", productTypeSlug?: string, search?: string) {
    const trimmedSearch = search?.trim() ?? "";
    const typeSlug = productTypeSlug ?? "";

    return unstable_cache(
        async () => {
            const products = await prisma.product.findMany({
                include: productInclude,
                where: {
                    ...(typeSlug ? { productType: { slug: typeSlug } } : {}),
                    ...(trimmedSearch
                        ? {
                            OR: [
                                { nameAr: { contains: trimmedSearch } },
                                { subtitleAr: { contains: trimmedSearch } },
                                { descriptionAr: { contains: trimmedSearch } },
                            ],
                        }
                        : {}),
                    ...(gender === "ALL"
                        ? {}
                        : {
                            OR: [{ gender }, { gender: "BOTH" }],
                        }),
                },
                orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
            });

            return products.map(toUiProduct);
        },
        ["home-products", gender, typeSlug, trimmedSearch],
        { revalidate: 300, tags: ["products"] }
    )();
}

/**
 * ProductPageFilters type - Configuration object for paginated product queries.
 * All filters are optional and default to ALL/1/8 if not provided.
 */
export type ProductPageFilters = {
    gender?: Gender | "ALL";
    productTypeSlug?: string;
    search?: string;
    page?: number;
    limit?: number;
};

/**
 * Fetches a paginated page of products with filtering and search.
 * Cached for 2 minutes with composite key from all filter parameters.
 * Returns total count, current page items, and whether more pages exist.
 * Applies the same filters and ordering as getHomeProducts but with pagination.
 * Fetches one extra item to determine if hasMore is true.
 *
 * @param options - Filter and pagination parameters
 * @returns Object containing items array, hasMore flag, nextPage number, and totalCount
 */
export function getProductsPage(options: ProductPageFilters) {
    const gender = options.gender ?? "ALL";
    const productTypeSlug = options.productTypeSlug;
    const search = options.search;
    const page = options.page ?? 1;
    const limit = options.limit ?? 8;

    return unstable_cache(
        async () => {
            const safePage = Math.max(1, page);
            const safeLimit = Math.max(1, limit);
            const skip = (safePage - 1) * safeLimit;
            const trimmedSearch = search?.trim();

            const searchFilter = trimmedSearch
                ? {
                    OR: [
                        { nameAr: { contains: trimmedSearch, mode: "insensitive" as const } },
                        { nameEn: { contains: trimmedSearch, mode: "insensitive" as const } },
                        { subtitleAr: { contains: trimmedSearch, mode: "insensitive" as const } },
                        { subtitleEn: { contains: trimmedSearch, mode: "insensitive" as const } },
                        { descriptionAr: { contains: trimmedSearch, mode: "insensitive" as const } },
                        { descriptionEn: { contains: trimmedSearch, mode: "insensitive" as const } },
                    ],
                }
                : {};

            const [totalCount, products] = await Promise.all([
                prisma.product.count({
                    where: {
                        ...(productTypeSlug ? { productType: { slug: productTypeSlug } } : {}),
                        ...searchFilter,
                        ...(gender === "ALL"
                            ? {}
                            : {
                                OR: [{ gender }, { gender: "BOTH" }],
                            }),
                    },
                }),
                prisma.product.findMany({
                    include: productInclude,
                    where: {
                        ...(productTypeSlug ? { productType: { slug: productTypeSlug } } : {}),
                        ...searchFilter,
                        ...(gender === "ALL"
                            ? {}
                            : {
                                OR: [{ gender }, { gender: "BOTH" }],
                            }),
                    },
                    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
                    skip,
                    take: safeLimit + 1,
                }),
            ]);

            const hasMore = products.length > safeLimit;
            const items = products.slice(0, safeLimit).map(toUiProduct);

            return {
                items,
                hasMore,
                nextPage: hasMore ? safePage + 1 : null,
                totalCount,
            };
        },
        ["products-page", gender, productTypeSlug ?? "", search ?? "", String(page), String(limit)],
        { revalidate: 120, tags: ["products"] }
    )();
}

/**
 * Fetches featured products marked with isFeatured: true.
 * These are curated products displayed in the featured carousel on the home page.
 *
 * @param limit - Maximum number of featured products to return (default: 6)
 * @returns Array of featured products ordered by creation date (newest first)
 */
export function getFeaturedProducts(limit = 6) {
    return _getCachedFeaturedProducts(limit);
}

const _getCachedFeaturedProducts = cache(
    (limit: number) =>
        unstable_cache(
            async () => {
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
            },
            ["featured-products", String(limit)],
            { revalidate: 300, tags: ["products"] }
        )()
);

/**
 * Fetches a single product by its URL slug.
 * Used for the product detail page.
 *
 * @param slug - The unique URL-friendly product identifier
 * @returns Formatted product or null if not found
 */
export function getProductBySlug(slug: string) {
    return _getCachedProductBySlug(slug);
}

const _getCachedProductBySlug = cache(
    (slug: string) =>
        unstable_cache(
            async () => {
                const product = await prisma.product.findUnique({
                    where: { slug },
                    include: productInclude,
                });

                if (!product) return null;
                return toUiProduct(product);
            },
            ["product", slug],
            { revalidate: 300, tags: ["products", `product-${slug}`] }
        )()
);

/**
 * CreateOrderInput type - Data required to create a new order.
 * Includes customer information, delivery details, and product selection.
 * @property selectedVariationValueIds - Array of variation IDs (e.g., size and color choices)
 */
export type CreateOrderInput = {
    fullName: string;
    phone: string;
    wilaya: string;
    address: string;
    deliveryType: DeliveryTypeOption;
    notes?: string;
    productSlug: string;
    selectedVariationValueIds: number[];
    quantity: number;
};

export type PreparedOrderSummary = {
    orderId: number;
    fullName: string;
    phone: string;
    wilaya: string;
    address: string;
    deliveryType: DeliveryTypeOption;
    notes?: string | null;
    totalAmount: number;
    itemNameAr: string;
    selections: {
        variationNameAr: string;
        valueAr: string;
    }[];
};

function generateOrderReference() {
    const base = Number(String(Date.now()).slice(-9));
    const randomSuffix = Math.floor(Math.random() * 90) + 10;
    return Number(`${base}${randomSuffix}`);
}

/**
 * Prepares a validated order summary without persisting order records.
 * Validates that the selected variations are valid for the product.
 * Calculates order total based on quantity, discounts, and shipping fees.
 * Returns a payload ready for downstream integrations (email / sheets).
 *
 * @param input - Order creation parameters including customer info and product selection
 * @returns A validated order summary payload
 * @throws "PRODUCT_NOT_FOUND" if the product doesn't exist
 * @throws "INVALID_VARIATION_SELECTION" if a selected variation isn't valid for this product
 */
export async function createOrder(input: CreateOrderInput) {
    const product = await prisma.product.findUnique({
        where: { slug: input.productSlug },
        include: {
            variations: {
                include: {
                    variationValue: {
                        include: {
                            variation: true,
                        },
                    },
                },
            },
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
    const deliveryFee = getDeliveryFeeForWilaya(input.wilaya, input.deliveryType);

    if (deliveryFee === null) {
        throw new Error("DELIVERY_NOT_AVAILABLE");
    }

    const totalAmount = lineTotal + deliveryFee;
    const uniqueSelectionIds = Array.from(new Set(input.selectedVariationValueIds));
    const variationValueById = new Map(
        product.variations.map((relation) => [relation.variationValueId, relation.variationValue] as const)
    );

    const selections = uniqueSelectionIds
        .map((variationValueId) => variationValueById.get(variationValueId))
        .filter((value): value is NonNullable<typeof value> => Boolean(value))
        .map((value) => ({
            variationNameAr: value.variation.nameAr,
            valueAr: value.valueAr,
        }));

    return {
        orderId: generateOrderReference(),
        fullName: input.fullName,
        phone: input.phone,
        wilaya: input.wilaya,
        address: input.address,
        deliveryType: input.deliveryType,
        notes: input.notes || null,
        totalAmount,
        itemNameAr: product.nameAr,
        selections,
    };
}

/**
 * Fetches all customer testimonials.
 * Used to display social proof on the home page.
 *
 * @returns Array of testimonials ordered by creation date (newest first)
 */
export const getTestimonials = cache(
    unstable_cache(
        async () => {
            return prisma.testimonial.findMany({
                orderBy: {
                    createdAt: "desc",
                },
            });
        },
        ["testimonials"],
        { revalidate: 3600, tags: ["testimonials"] }
    )
);
