/**
 * Store module - Contains all database queries and data transformations for products and orders.
 * This module handles fetching products, filters, pagination, order creation, and converting
 * database entities to UI-friendly formats.
 */

import { type DeliveryType, type Gender, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { discountPercent, toNumber } from "@/lib/format";

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
    values: {
        id: number;
        valueAr: string;
        hexColor: string | null;
    }[];
};

/**
 * UiProduct type - Product data formatted for frontend UI consumption.
 * This is the normalized, easy-to-use format for components.
 * All prices are converted to numbers, variations are grouped, and images are simplified.
 * @property id, slug, nameAr, etc. - Basic product information
 * @property productTypeSlug, productTypeNameAr - Category information
 * @property price, discountActive, discountedPrice, finalPrice, discountPercent - Pricing details
 * @property variations - Grouped variation options ready for UI rendering
 * @property images - Sorted product images with metadata
 */
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

/**
 * Converts a raw Prisma product entity to a UI-friendly format.
 * Transforms:
 * - Decimal prices to numbers
 * - Calculates final price based on active discounts
 * - Groups variations by type for easier UI rendering
 * - Simplifies image data
 * - Calculates discount percentage when applicable
 *
 * @param product - Raw product data from Prisma query
 * @returns Formatted product ready for frontend consumption
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

/**
 * Fetches all product categories/types.
 * @returns Array of all product types (toppings, leggings, shoes, etc.) ordered by ID
 */
export async function getProductTypes() {
    return prisma.productType.findMany({
        orderBy: {
            id: "asc",
        },
    });
}

/**
 * Fetches products for the home page with optional filtering.
 * Results are ordered with featured products first, then by creation date.
 *
 * @param gender - Filter by gender (MALE, FEMALE, BOTH, or ALL for all products)
 * @param productTypeSlug - Optional filter by product type slug (e.g., "toppings")
 * @param search - Optional text search across name, subtitle, and description
 * @returns Array of UI-formatted products matching the filters
 */
export async function getHomeProducts(gender: Gender | "ALL", productTypeSlug?: string, search?: string) {
    const trimmedSearch = search?.trim();

    const products = await prisma.product.findMany({
        include: productInclude,
        where: {
            ...(productTypeSlug ? { productType: { slug: productTypeSlug } } : {}),
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
 * Returns total count, current page items, and whether more pages exist.
 * Applies the same filters and ordering as getHomeProducts but with pagination.
 * Fetches one extra item to determine if hasMore is true.
 *
 * @param options - Filter and pagination parameters
 * @returns Object containing items array, hasMore flag, nextPage number, and totalCount
 */
export async function getProductsPage({
    gender = "ALL",
    productTypeSlug,
    search,
    page = 1,
    limit = 8,
}: ProductPageFilters) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const skip = (safePage - 1) * safeLimit;
    const trimmedSearch = search?.trim();

    const [totalCount, products] = await Promise.all([
        prisma.product.count({
            where: {
                ...(productTypeSlug ? { productType: { slug: productTypeSlug } } : {}),
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
        }),
        prisma.product.findMany({
            include: productInclude,
            where: {
                ...(productTypeSlug ? { productType: { slug: productTypeSlug } } : {}),
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
}

/**
 * Fetches featured products marked with isFeatured: true.
 * These are curated products displayed in the featured carousel on the home page.
 *
 * @param limit - Maximum number of featured products to return (default: 6)
 * @returns Array of featured products ordered by creation date (newest first)
 */
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

/**
 * Fetches a single product by its URL slug.
 * Used for the product detail page.
 *
 * @param slug - The unique URL-friendly product identifier
 * @returns Formatted product or null if not found
 */
export async function getProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
        where: { slug },
        include: productInclude,
    });

    if (!product) return null;
    return toUiProduct(product);
}

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
    deliveryType: DeliveryType;
    notes?: string;
    productSlug: string;
    selectedVariationValueIds: number[];
    quantity: number;
};

/**
 * Creates a new order in the database.
 * Validates that the selected variations are valid for the product.
 * Calculates order total based on quantity and applies active discounts.
 * Creates order items and variation selections in a transaction.
 *
 * @param input - Order creation parameters including customer info and product selection
 * @returns The created order with all items and variation selections included
 * @throws "PRODUCT_NOT_FOUND" if the product doesn't exist
 * @throws "INVALID_VARIATION_SELECTION" if a selected variation isn't valid for this product
 */
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

/**
 * Fetches all customer testimonials.
 * Used to display social proof on the home page.
 *
 * @returns Array of testimonials ordered by creation date (newest first)
 */
export async function getTestimonials() {
    return prisma.testimonial.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });
}
