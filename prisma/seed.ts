import { PrismaClient, Gender } from "@prisma/client";

const prisma = new PrismaClient();

type ProductSeed = {
    slug: string;
    nameAr: string;
    subtitleAr: string;
    descriptionAr: string;
    price: string;
    discountActive?: boolean;
    discountedPrice?: string;
    gender: Gender;
    isFeatured?: boolean;
    imageSearchQueries: string[];
    fallbackImageUrls: string[];
    variationValues: string[];
};

type UnsplashSearchResponse = {
    results: Array<{
        urls: {
            regular: string;
        };
    }>;
};

const unsplashAccessKey =
    process.env.UNSPLASH_ACCESS_KEY ?? process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

async function fetchUnsplashImageUrl(query: string, page: number) {
    if (!unsplashAccessKey) {
        return null;
    }

    const searchParams = new URLSearchParams({
        query,
        orientation: "portrait",
        per_page: "1",
        page: String(page),
        content_filter: "high",
        client_id: unsplashAccessKey,
    });

    try {
        const response = await fetch(`https://api.unsplash.com/search/photos?${searchParams.toString()}`, {
            headers: {
                "Accept-Version": "v1",
            },
            cache: "no-store",
        });

        if (!response.ok) {
            console.warn(
                `[seed] Unsplash API request failed for "${query}": ${response.status} ${response.statusText}`
            );
            return null;
        }

        const payload = (await response.json()) as UnsplashSearchResponse;
        const firstPhoto = payload.results[0];

        return firstPhoto?.urls.regular ?? null;
    } catch (error) {
        console.warn(`[seed] Unsplash API request error for "${query}":`, error);
        return null;
    }
}

async function resolveProductImageUrls(product: ProductSeed) {
    if (!unsplashAccessKey) {
        return product.fallbackImageUrls;
    }

    const fetchedUrls = await Promise.all(
        product.imageSearchQueries.map((query, index) => fetchUnsplashImageUrl(query, index + 1))
    );

    const validUrls = fetchedUrls.filter((url): url is string => Boolean(url));

    if (validUrls.length === product.imageSearchQueries.length) {
        return validUrls;
    }

    console.warn(
        `[seed] Falling back to bundled Unsplash URLs for ${product.slug} (${validUrls.length}/${product.imageSearchQueries.length} API matches).`
    );

    return product.fallbackImageUrls;
}

async function seedProductType(
    typeSlug: string,
    typeNameAr: string,
    variationSpec: Record<string, { valueAr: string; hexColor?: string }[]>,
    products: ProductSeed[]
) {
    const productType = await prisma.productType.create({
        data: {
            slug: typeSlug,
            nameAr: typeNameAr,
            variations: {
                create: Object.entries(variationSpec).map(([nameAr, values]) => ({
                    nameAr,
                    values: {
                        create: values,
                    },
                })),
            },
        },
        include: {
            variations: {
                include: {
                    values: true,
                },
            },
        },
    });

    const valueIdByLabel = new Map<string, number>();

    for (const variation of productType.variations) {
        for (const value of variation.values) {
            valueIdByLabel.set(`${variation.nameAr}:${value.valueAr}`, value.id);
        }
    }

    for (const product of products) {
        const selectedVariationIds = product.variationValues.map((key) => {
            const valueId = valueIdByLabel.get(key);
            if (!valueId) {
                throw new Error(`Missing variation value for key: ${key}`);
            }
            return valueId;
        });

        const imageUrls = await resolveProductImageUrls(product);

        await prisma.product.create({
            data: {
                slug: product.slug,
                nameAr: product.nameAr,
                subtitleAr: product.subtitleAr,
                descriptionAr: product.descriptionAr,
                price: product.price,
                discountActive: product.discountActive ?? false,
                discountedPrice: product.discountedPrice,
                gender: product.gender,
                isFeatured: product.isFeatured ?? false,
                productTypeId: productType.id,
                images: {
                    create: imageUrls.map((url, index) => ({
                        url,
                        altAr: product.nameAr,
                        sortOrder: index,
                    })),
                },
                variations: {
                    createMany: {
                        data: selectedVariationIds.map((variationValueId) => ({
                            variationValueId,
                        })),
                    },
                },
            },
        });
    }
}

async function main() {
    await prisma.productVariation.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.variationValue.deleteMany();
    await prisma.variation.deleteMany();
    await prisma.product.deleteMany();
    await prisma.productType.deleteMany();
    await prisma.admin.deleteMany();
    await prisma.testimonial.deleteMany();

    await prisma.admin.create({
        data: {
            username: "vetdz-admin",
            email: "admin@vetdz.dz",
            passwordHash: "replace-with-hash",
        },
    });

    await seedProductType(
        "toppings",
        "توبينغز",
        {
            "المقاس": [{ valueAr: "S" }, { valueAr: "M" }, { valueAr: "L" }, { valueAr: "XL" }],
            "اللون": [
                { valueAr: "أسود", hexColor: "#181A1F" },
                { valueAr: "رمادي", hexColor: "#6B7280" },
                { valueAr: "بيج", hexColor: "#D6C8B1" },
            ],
        },
        [
            {
                slug: "nomad-sculpted-overshirt",
                nameAr: "قميص نوماد المنحوت",
                subtitleAr: "قصة معمارية مريحة",
                descriptionAr:
                    "قطعة مميزة من صوف معاد تدويره بقصة نظيفة وتفاصيل دقيقة مناسبة للإطلالات اليومية الأنيقة.",
                price: "14500",
                discountActive: true,
                discountedPrice: "12600",
                gender: Gender.MALE,
                isFeatured: true,
                imageSearchQueries: [
                    "men overshirt neutral fashion",
                    "beige overshirt menswear portrait",
                    "streetwear shirt jacket men",
                ],
                fallbackImageUrls: [
                    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=1200&q=80",
                ],
                variationValues: ["المقاس:M", "المقاس:L", "اللون:أسود", "اللون:رمادي"],
            },
            {
                slug: "linen-architecture-blazer",
                nameAr: "بلايزر لينن آركيتكتشر",
                subtitleAr: "أناقة خفيفة بلمسة فاخرة",
                descriptionAr: "بلايزر من الكتان الخفيف مناسب للمواسم الدافئة مع قصّة مستقيمة أنيقة.",
                price: "12200",
                gender: Gender.BOTH,
                imageSearchQueries: ["linen blazer fashion model", "minimal blazer outfit"],
                fallbackImageUrls: [
                    "https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
                ],
                variationValues: ["المقاس:S", "المقاس:M", "المقاس:L", "اللون:بيج", "اللون:أسود"],
            },
        ]
    );

    await seedProductType(
        "leggings",
        "ليغينغز",
        {
            "المقاس": [{ valueAr: "S" }, { valueAr: "M" }, { valueAr: "L" }],
            "اللون": [
                { valueAr: "أزرق داكن", hexColor: "#1F2A44" },
                { valueAr: "أسود", hexColor: "#181A1F" },
            ],
        },
        [
            {
                slug: "selvage-denim",
                nameAr: "جينز سلفاج",
                subtitleAr: "قصة مستقيمة",
                descriptionAr: "جينز بخامة متينة ومريحة للاستخدام اليومي مع مظهر عصري.",
                price: "15500",
                gender: Gender.BOTH,
                isFeatured: true,
                imageSearchQueries: ["selvedge denim jeans fashion", "dark denim outfit"],
                fallbackImageUrls: [
                    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
                ],
                variationValues: ["المقاس:S", "المقاس:M", "المقاس:L", "اللون:أزرق داكن"],
            },
        ]
    );

    await seedProductType(
        "shoes",
        "أحذية",
        {
            "المقاس": [
                { valueAr: "40" },
                { valueAr: "41" },
                { valueAr: "42" },
                { valueAr: "43" },
            ],
            "اللون": [
                { valueAr: "بني", hexColor: "#8B4A2B" },
                { valueAr: "أسود", hexColor: "#111827" },
            ],
        },
        [
            {
                slug: "chelsea-boot",
                nameAr: "حذاء تشيلسي",
                subtitleAr: "جلد إيطالي",
                descriptionAr: "حذاء كلاسيكي بلمسة عصرية مصنوع من جلد طبيعي فاخر.",
                price: "31000",
                discountActive: true,
                discountedPrice: "27900",
                gender: Gender.MALE,
                isFeatured: true,
                imageSearchQueries: ["chelsea boots leather men fashion", "brown leather boots studio"],
                fallbackImageUrls: [
                    "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
                ],
                variationValues: ["المقاس:41", "المقاس:42", "المقاس:43", "اللون:بني"],
            },
        ]
    );

    // Seed testimonials
    await prisma.testimonial.createMany({
        data: [
            {
                nameAr: "سارة. ب",
                roleAr: "مهندسة معمارية",
                textAr: "جودة المنتجات ممتازة، والأسعار عادلة مقارنة بالسوق. المقاسات دقيقة والتوصيل سريع جداً.",
                rating: 5,
            },
            {
                nameAr: "ياسين. د",
                roleAr: "مصور أزياء",
                textAr: "تشكيلة رائعة من المنتجات! كل قطعة مختارة بعناية وتعكس ذوق عالي. أنا مشتري متكرر.",
                rating: 5,
            },
            {
                nameAr: "مريم. ع",
                roleAr: "صانعة محتوى رقمي",
                textAr: "التوصيل سريع والتغليف أنيق جداً. الألوان مطابقة تمامًا للصور والجودة ممتازة طوال الموسم.",
                rating: 5,
            },
            {
                nameAr: "علي. ك",
                roleAr: "رجل أعمال",
                textAr: "أنا مشتري متكرر! المنتجات تحتفظ بجودتها بعد الغسيل والاستخدام. الفريق حساس للملاحظات.",
                rating: 5,
            },
        ],
    });

    console.log("✓ Database seeded successfully!");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (error) => {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    });
