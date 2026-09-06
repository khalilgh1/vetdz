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
    if (!unsplashAccessKey || product.imageSearchQueries.length === 0) {
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

    // 1. TOPPINGS (Tops/Shirts/Blazers) - 18 Products
    await seedProductType(
        "toppings",
        "أقمصة",
        {
            "المقاس": [{ valueAr: "S" }, { valueAr: "M" }, { valueAr: "L" }, { valueAr: "XL" }],
            "اللون": [
                { valueAr: "أسود", hexColor: "#181A1F" },
                { valueAr: "رمادي", hexColor: "#6B7280" },
                { valueAr: "بيج", hexColor: "#D6C8B1" },
                { valueAr: "أبيض", hexColor: "#FFFFFF" },
                { valueAr: "أخضر مريمي", hexColor: "#87A987" },
            ],
        },
        [
            {
                slug: "nomad-sculpted-overshirt",
                nameAr: "قميص صوف خفيف",
                subtitleAr: "قصة معمارية مريحة",
                descriptionAr: "قطعة مميزة من صوف معاد تدويره بقصة نظيفة وتفاصيل دقيقة مناسبة للإطلالات اليومية الأنيقة.",
                price: "14500",
                discountActive: true,
                discountedPrice: "12600",
                gender: Gender.MALE,
                isFeatured: true,
                imageSearchQueries: [],
                fallbackImageUrls: ["/products/overshirt_neutral.png"],
                variationValues: ["المقاس:M", "المقاس:L", "اللون:أسود", "اللون:رمادي"],
            },
            {
                slug: "linen-architecture-blazer",
                nameAr: "فيست كتان",
                subtitleAr: "أناقة خفيفة بلمسة فاخرة",
                descriptionAr: "بلايزر من الكتان الخفيف مناسب للمواسم الدافئة مع قصّة مستقيمة أنيقة.",
                price: "12200",
                gender: Gender.BOTH,
                isFeatured: true,
                imageSearchQueries: [],
                fallbackImageUrls: ["/products/linen_blazer.png"],
                variationValues: ["المقاس:S", "المقاس:M", "المقاس:L", "اللون:بيج", "اللون:أسود"],
            },
            {
                slug: "sage-knit-sweater",
                nameAr: "بول صوف خفيف",
                subtitleAr: "خامة صوفية دافئة",
                descriptionAr: "سترة صوفية مريحة وعالية الجودة بلون أخضر مريمي وتصميم ناعم.",
                price: "11500",
                discountActive: true,
                discountedPrice: "9500",
                gender: Gender.FEMALE,
                isFeatured: true,
                imageSearchQueries: [],
                fallbackImageUrls: ["/products/knit_sweater.png"],
                variationValues: ["المقاس:M", "المقاس:L", "اللون:أخضر مريمي", "اللون:رمادي"],
            },
            {
                slug: "classic-organic-tshirt",
                nameAr: "تيشيرت قطني كلاسيكي",
                subtitleAr: "بساطة وراحة تدوم",
                descriptionAr: "تيشيرت مصنوع من القطن العضوي 100%، خفيف ومناسب للارتداء اليومي.",
                price: "4500",
                gender: Gender.BOTH,
                imageSearchQueries: [],
                fallbackImageUrls: ["/products/classic_tshirt.png"],
                variationValues: ["المقاس:S", "المقاس:M", "المقاس:L", "المقاس:XL", "اللون:أبيض", "اللون:أسود"],
            },
            {
                slug: "streetwear-heavy-hoodie",
                nameAr: "هودي قطني دافئ",
                subtitleAr: "تصميم عصري مريح",
                descriptionAr: "هودي سميك ومقاوم للبرد بتصميم فضفاض يناسب الإطلالات اليومية البسيطة والحديثة.",
                price: "9800",
                discountActive: true,
                discountedPrice: "8500",
                gender: Gender.BOTH,
                isFeatured: true,
                imageSearchQueries: [],
                fallbackImageUrls: ["/products/hoodie_streetwear.png"],
                variationValues: ["المقاس:M", "المقاس:L", "المقاس:XL", "اللون:رمادي", "اللون:أسود"],
            },
            {
                slug: "minimalist-oversized-jacket",
                nameAr: "جاكيت واسعة وخفيفة",
                subtitleAr: "سترة خريفية خفيفة",
                descriptionAr: "سترة خفيفة الوزن بتصميم مريح وعصري باللون البيج الدافئ لمظهر يومي متناسق.",
                price: "16500",
                gender: Gender.MALE,
                imageSearchQueries: [],
                fallbackImageUrls: ["/products/overshirt_neutral.png"],
                variationValues: ["المقاس:L", "المقاس:XL", "اللون:بيج", "اللون:أسود"],
            },
            {
                slug: "premium-wool-blazer",
                nameAr: "فيست صوف كلاسيكية",
                subtitleAr: "أناقة رسمية كلاسيكية",
                descriptionAr: "بلايزر مصنوع من أجود أنواع الصوف ليوفر الدفء والأناقة الرسمية في آن واحد.",
                price: "21000",
                gender: Gender.MALE,
                imageSearchQueries: [],
                fallbackImageUrls: ["/products/linen_blazer.png"],
                variationValues: ["المقاس:M", "المقاس:L", "اللون:أسود", "اللون:رمادي"],
            },
            {
                slug: "textured-crewneck-sweater",
                nameAr: "بول صوف برقبة دائرية",
                subtitleAr: "ملمس ناعم ودافئ",
                descriptionAr: "كنزة صوفية منسوجة بنمط كلاسيكي مريح ومناسب للأجواء الباردة.",
                price: "12800",
                gender: Gender.BOTH,
                imageSearchQueries: [],
                fallbackImageUrls: ["/products/knit_sweater.png"],
                variationValues: ["المقاس:S", "المقاس:M", "اللون:أخضر مريمي", "اللون:بيج"],
            },
            {
                slug: "minimalist-black-tee",
                nameAr: "تيشيرت أسود بسيط",
                subtitleAr: "قطن مميز ناعم",
                descriptionAr: "تيشيرت بلون أسود داكن وقصة مثالية تناسب جميع الإطلالات اليومية والرياضية.",
                price: "4200",
                gender: Gender.BOTH,
                imageSearchQueries: [],
                fallbackImageUrls: ["/products/classic_tshirt.png"],
                variationValues: ["المقاس:M", "المقاس:L", "المقاس:XL", "اللون:أسود"],
            },
            {
                slug: "urban-street-hoodie",
                nameAr: "هودي كاجوال مريح",
                subtitleAr: "قصة مريحة يومية",
                descriptionAr: "هودي مصنوع من خامة قطنية ممتازة بتصميم عصري وألوان محايدة يمنحك الراحة والدفء.",
                price: "9500",
                gender: Gender.FEMALE,
                imageSearchQueries: [],
                fallbackImageUrls: ["/products/hoodie_streetwear.png"],
                variationValues: ["المقاس:S", "المقاس:M", "اللون:رمادي", "اللون:بيج"],
            },
            {
                slug: "casual-cotton-shirt",
                nameAr: "قميص قطني كاجوال",
                subtitleAr: "مظهر يومي مريح",
                descriptionAr: "قميص مصنوع من القطن الناعم بنسبة 100% لراحة مثالية طوال اليوم.",
                price: "7800",
                gender: Gender.MALE,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:M", "المقاس:L", "اللون:أبيض", "اللون:رمادي"],
            },
            {
                slug: "vintage-denim-jacket",
                nameAr: "جاكيت جينز كلاسيكية",
                subtitleAr: "جاكيت جينز متين",
                descriptionAr: "سترة جينز كلاسيكية بتصميم مستوحى من التسعينات، متينة وعملية للغاية.",
                price: "18500",
                gender: Gender.BOTH,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:S", "المقاس:M", "المقاس:L", "اللون:أسود", "اللون:رمادي"],
            },
            {
                slug: "summer-linen-shirt",
                nameAr: "قميص كتان صيفي",
                subtitleAr: "خفيف وبارد للحر",
                descriptionAr: "قميص كتان خفيف للغاية ومسامي، مثالي للأيام الحارة والرحلات الصيفية.",
                price: "8200",
                gender: Gender.MALE,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:M", "المقاس:L", "اللون:بيج", "اللون:أبيض"],
            },
            {
                slug: "cable-knit-cardigan",
                nameAr: "كارديغان صوف طويل",
                subtitleAr: "دفء وأناقة مريحة",
                descriptionAr: "كارديجان مفتوح بأزرار أمامية مصنوع من خيوط صوفية سميكة ومريحة للمنزل والخارج.",
                price: "14800",
                gender: Gender.FEMALE,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:S", "المقاس:M", "اللون:بيج", "اللون:رمادي"],
            },
            {
                slug: "activewear-zipper-jacket",
                nameAr: "جاكيت رياضية بسحاب",
                subtitleAr: "مناسبة للتمارين والأنشطة",
                descriptionAr: "سترة رياضية خفيفة ومرنة بسحاب كامل وجيوب جانبية آمنة للمحافظة على الأغراض.",
                price: "11000",
                gender: Gender.BOTH,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:S", "المقاس:M", "المقاس:L", "اللون:أسود", "اللون:رمادي"],
            },
            {
                slug: "luxury-trench-coat",
                nameAr: "مونطو طويل كلاسيكي",
                subtitleAr: "تصميم كلاسيكي طويل",
                descriptionAr: "معطف طويل واقٍ من المطر والرياح، يضفي لمسة من الرقي على إطلالتك الشتوية.",
                price: "29500",
                discountActive: true,
                discountedPrice: "24500",
                gender: Gender.FEMALE,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:S", "المقاس:M", "اللون:بيج", "اللون:أسود"],
            },
            {
                slug: "casual-flannel-shirt",
                nameAr: "قميص كاروهات شتوي",
                subtitleAr: "مظهر شتوي دافئ",
                descriptionAr: "قميص فلانيل ناعم بنقشة المربعات الكلاسيكية، مثالي للارتداء اليومي أو كقطعة خارجية.",
                price: "8900",
                gender: Gender.MALE,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:M", "المقاس:L", "اللون:رمادي", "اللون:أسود"],
            },
            {
                slug: "bomber-flight-jacket",
                nameAr: "جاكيت بومبر",
                subtitleAr: "تصميم عصري رياضي",
                descriptionAr: "سترة بومبر متينة ومقاومة للماء بتصميم مستوحى من ملابس الطيارين الكلاسيكية.",
                price: "19200",
                gender: Gender.MALE,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:M", "المقاس:L", "المقاس:XL", "اللون:أسود", "اللون:رمادي"],
            },
        ]
    );

    // 2. LEGGINGS (Pants/Jeans/Trousers) - 15 Products
    await seedProductType(
        "leggings",
        "سراويل",
        {
            "المقاس": [{ valueAr: "S" }, { valueAr: "M" }, { valueAr: "L" }, { valueAr: "XL" }],
            "اللون": [
                { valueAr: "أزرق داكن", hexColor: "#1F2A44" },
                { valueAr: "أسود", hexColor: "#181A1F" },
                { valueAr: "رمادي", hexColor: "#6B7280" },
                { valueAr: "زيتوني", hexColor: "#556B2F" },
                { valueAr: "بيج", hexColor: "#D6C8B1" },
            ],
        },
        [
            {
                slug: "selvage-denim",
                nameAr: "جينز بقصة مستقيمة",
                subtitleAr: "قصة مستقيمة",
                descriptionAr: "جينز بخامة متينة ومريحة للاستخدام اليومي مع مظهر عصري وجذاب.",
                price: "15500",
                gender: Gender.BOTH,
                isFeatured: true,
                imageSearchQueries: [],
                fallbackImageUrls: ["/products/denim_jeans.png"],
                variationValues: ["المقاس:S", "المقاس:M", "المقاس:L", "اللون:أزرق داكن"],
            },
            {
                slug: "slim-indigo-jeans",
                nameAr: "جينز كحلي سليم",
                subtitleAr: "قصة عصرية ضيقة",
                descriptionAr: "جينز ضيق بلون نيلي كلاسيكي، مصنوع من القطن المرن لراحة تدوم طويلاً.",
                price: "13500",
                discountActive: true,
                discountedPrice: "11500",
                gender: Gender.MALE,
                isFeatured: true,
                imageSearchQueries: [],
                fallbackImageUrls: ["/products/denim_jeans.png"],
                variationValues: ["المقاس:M", "المقاس:L", "اللون:أزرق داكن"],
            },
            {
                slug: "utility-cargo-pants",
                nameAr: "سروال كارجو بجيوب",
                subtitleAr: "جيوب متعددة وتصميم عصري",
                descriptionAr: "بنطال كارغو متين وعملي بجيوب جانبية كافية لجميع أغراضك اليومية، رائع للمغامرات.",
                price: "12500",
                gender: Gender.BOTH,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1517423568366-8b83523034fd?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:S", "المقاس:M", "المقاس:L", "اللون:زيتوني", "اللون:أسود"],
            },
            {
                slug: "premium-chino-pants",
                nameAr: "سروال تشينو كاجوال",
                subtitleAr: "أناقة يومية ورسمية",
                descriptionAr: "بنطال تشينو بقصة ضيقة وألوان هادئة، مناسب للعمل والنزهات الكاجوال على حد سواء.",
                price: "11800",
                gender: Gender.MALE,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:M", "المقاس:L", "اللون:بيج", "اللون:أسود"],
            },
            {
                slug: "relaxed-linen-trousers",
                nameAr: "سروال كتان صيفي",
                subtitleAr: "مثالي للأجواء الصيفية",
                descriptionAr: "بنطال صيفي من الكتان الطبيعي بقصة واسعة ومريحة مع حزام مطاطي ناعم.",
                price: "9500",
                gender: Gender.BOTH,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:S", "المقاس:M", "المقاس:L", "اللون:بيج", "اللون:أزرق داكن"],
            },
            {
                slug: "heavy-fleece-sweatpants",
                nameAr: "سروال رياضي قطني",
                subtitleAr: "راحة فائقة ودفء كامل",
                descriptionAr: "بنطال رياضي مبطن بالصوف الناعم من الداخل، مناسب للاسترخاء أو للأنشطة الرياضية الباردة.",
                price: "8500",
                gender: Gender.BOTH,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1551854838-212c50b4c184?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:S", "المقاس:M", "المقاس:L", "اللون:رمادي", "اللون:أسود"],
            },
            {
                slug: "classic-black-chinos",
                nameAr: "سروال تشينو أسود",
                subtitleAr: "أناقة بسيطة ومريحة",
                descriptionAr: "بنطال تشينو بلون أسود قاتم وقماش عالي الجودة يقاوم التجعد ويحافظ على مظهره الأنيق.",
                price: "11500",
                gender: Gender.MALE,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:M", "المقاس:L", "المقاس:XL", "اللون:أسود"],
            },
            {
                slug: "distressed-slim-jeans",
                nameAr: "جينز مقطع سليم",
                subtitleAr: "تصميم شبابي جريء",
                descriptionAr: "جينز ممزق بلمسات عصرية ممتازة تناسب الإطلالات الكاجوال اليومية والشبابية.",
                price: "14000",
                gender: Gender.BOTH,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:S", "المقاس:M", "اللون:أزرق داكن", "اللون:رمادي"],
            },
            {
                slug: "pleated-tailored-trousers",
                nameAr: "سروال قماش كلاسيكي",
                subtitleAr: "مظهر كلاسيكي أنيق",
                descriptionAr: "بنطال رسمي بتفاصيل الخياطة اليدوية وكسرات أمامية تمنحك إطلالة مهندمة للمكتب والمناسبات.",
                price: "16500",
                gender: Gender.FEMALE,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:S", "المقاس:M", "اللون:أسود", "اللون:رمادي"],
            },
            {
                slug: "athleisure-tech-pants",
                nameAr: "سروال رياضي خفيف",
                subtitleAr: "مقاوم للماء ومرن",
                descriptionAr: "بنطال رياضي بخامات مطورة تقاوم الماء وتوفر حرية حركة كاملة طوال اليوم.",
                price: "12800",
                gender: Gender.BOTH,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:S", "المقاس:M", "المقاس:L", "اللون:أسود", "اللون:رمادي"],
            },
            {
                slug: "mens-relaxed-chinos",
                nameAr: "سروال تشينو واسع",
                subtitleAr: "قصة فضفاضة عصرية",
                descriptionAr: "بنطال تشينو قطني بقصة مريحة واسعة تعطي إحساساً بالراحة الفائقة والحرية.",
                price: "12000",
                gender: Gender.MALE,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:M", "المقاس:L", "المقاس:XL", "اللون:بيج", "اللون:زيتوني"],
            },
            {
                slug: "light-wash-denim",
                nameAr: "جينز أزرق فاتح",
                subtitleAr: "لون صيفي رائع",
                descriptionAr: "جينز بلون أزرق فاتح مميز، مناسب للارتداء مع تيشيرتات بيضاء لإطلالة كلاسيكية صيفية.",
                price: "13200",
                gender: Gender.BOTH,
                imageSearchQueries: [],
                fallbackImageUrls: ["/products/denim_jeans.png"],
                variationValues: ["المقاس:S", "المقاس:M", "المقاس:L", "اللون:رمادي", "اللون:أزرق داكن"],
            },
            {
                slug: "knit-lounge-pants",
                nameAr: "سروال مريح للدار",
                subtitleAr: "راحة تامة في المنزل",
                descriptionAr: "بنطال منزلي ناعم للغاية من مزيج القطن والألياف المرنة عالية الجودة.",
                price: "7900",
                gender: Gender.FEMALE,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1580637254553-6ef7d2169622?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:S", "المقاس:M", "اللون:بيج", "اللون:أسود"],
            },
            {
                slug: "summer-cotton-shorts",
                nameAr: "شورت قطني صيفي",
                subtitleAr: "خفيف وعملي للشاطئ",
                descriptionAr: "شورت كاجوال مريح بجيوب جانبية وخامة قطنية مسامية وخفيفة للمناطق الساحلية.",
                price: "6500",
                gender: Gender.MALE,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:M", "المقاس:L", "اللون:بيج", "اللون:أزرق داكن"],
            },
            {
                slug: "wool-blend-trousers",
                nameAr: "سروال صوف شتوي",
                subtitleAr: "أناقة ودفء متكامل",
                descriptionAr: "بنطال شتوي أنيق من الصوف المختلط مع قصة مستقيمة ومريحة ومظهر مهندم وراقي.",
                price: "18500",
                gender: Gender.MALE,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:M", "المقاس:L", "اللون:أسود", "اللون:رمادي"],
            },
        ]
    );

    // 3. SHOES (Shoes/Boots) - 12 Products
    await seedProductType(
        "shoes",
        "أحذية",
        {
            "المقاس": [
                { valueAr: "40" },
                { valueAr: "41" },
                { valueAr: "42" },
                { valueAr: "43" },
                { valueAr: "44" },
            ],
            "اللون": [
                { valueAr: "بني", hexColor: "#8B4A2B" },
                { valueAr: "أسود", hexColor: "#111827" },
                { valueAr: "أبيض", hexColor: "#FFFFFF" },
                { valueAr: "بيج", hexColor: "#D6C8B1" },
                { valueAr: "أحمر", hexColor: "#DC2626" },
            ],
        },
        [
            {
                slug: "chelsea-boot",
                nameAr: "بوط تشيلسي جلد",
                subtitleAr: "جلد إيطالي فاخر",
                descriptionAr: "حذاء كلاسيكي بلمسة عصرية مصنوع من جلد طبيعي فاخر يدوم طويلاً ويمنحك إطلالة فريدة.",
                price: "31000",
                discountActive: true,
                discountedPrice: "27900",
                gender: Gender.MALE,
                isFeatured: true,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:41", "المقاس:42", "المقاس:43", "اللون:بني"],
            },
            {
                slug: "minimal-white-sneakers",
                nameAr: "باسكيت بيضاء كلاسيكية",
                subtitleAr: "جلد طبيعي فاخر",
                descriptionAr: "حذاء رياضي أبيض كلاسيكي ومبسط يناسب جميع أنواع الملابس والأنشطة اليومية المختلفة.",
                price: "18500",
                gender: Gender.BOTH,
                isFeatured: true,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:40", "المقاس:41", "المقاس:42", "اللون:أبيض"],
            },
            {
                slug: "leather-penny-loafers",
                nameAr: "صباط جلد كلاسيكي",
                subtitleAr: "تصميم كلاسيكي إيطالي",
                descriptionAr: "حذاء بدون أربطة مصنوع يدوياً من الجلد الفاخر لإطلالة رسمية أنيقة ومثيرة للإعجاب.",
                price: "24500",
                gender: Gender.MALE,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:41", "المقاس:42", "المقاس:43", "اللون:أسود", "اللون:بني"],
            },
            {
                slug: "urban-running-shoes",
                nameAr: "باسكيت للجري",
                subtitleAr: "وسادة قدم مريحة ودعم كامل",
                descriptionAr: "حذاء رياضي خفيف مصمم للجري والمشي لمسافات طويلة مع تهوية مثالية لحماية القدم وتوفير المرونة.",
                price: "19500",
                discountActive: true,
                discountedPrice: "16500",
                gender: Gender.BOTH,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:42", "المقاس:43", "المقاس:44", "اللون:أحمر", "اللون:أسود"],
            },
            {
                slug: "rugged-combat-boots",
                nameAr: "بوط عالي متين",
                subtitleAr: "مقاوم لظروف الطقس الصعبة",
                descriptionAr: "حذاء برقبة مرتفعة مصمم ليدوم طويلاً مع نعل مطاطي مانع للانزلاق وحماية فائقة للكاحل.",
                price: "28500",
                gender: Gender.BOTH,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:40", "المقاس:41", "المقاس:42", "اللون:أسود"],
            },
            {
                slug: "suede-desert-boots",
                nameAr: "بوط شامواه",
                subtitleAr: "مظهر كاجوال أنيق",
                descriptionAr: "حذاء ديرت برقبة منخفضة مصنوع من جلد الغزال الفاخر بألوان ترابية كلاسيكية وجميلة.",
                price: "22000",
                gender: Gender.MALE,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:41", "المقاس:42", "المقاس:43", "اللون:بني", "اللون:بيج"],
            },
            {
                slug: "classic-oxford-shoes",
                nameAr: "صباط رسمي بالخيط",
                subtitleAr: "للأناقة الرسمية المطلقة",
                descriptionAr: "حذاء أكسفورد رسمي برباط، مصمم من جلد لامع ومثالي للمناسبات الرسمية والبدلات الكاملة.",
                price: "27500",
                gender: Gender.MALE,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:41", "المقاس:42", "المقاس:43", "اللون:أسود"],
            },
            {
                slug: "breathable-knit-sneakers",
                nameAr: "باسكيت خفيفة ومريحة",
                subtitleAr: "خفيف مثل الريشة",
                descriptionAr: "حذاء رياضي مريح بجزء علوي من النسيج المحبوك لتوفير تهوية تامة للقدم طوال فترة الاستخدام اليومي.",
                price: "16000",
                gender: Gender.BOTH,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:40", "المقاس:41", "المقاس:42", "اللون:أبيض", "اللون:أسود"],
            },
            {
                slug: "leather-slip-on-sandals",
                nameAr: "صندل جلد مريح",
                subtitleAr: "لأيام الصيف والراحة",
                descriptionAr: "صندل صيفي مصنوع من الجلد الطبيعي مع وسادة قدم مبطنة لراحة إضافية وسهولة في الحركة.",
                price: "9800",
                gender: Gender.BOTH,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:40", "المقاس:41", "المقاس:42", "اللون:بني", "اللون:أسود"],
            },
            {
                slug: "casual-canvas-sneakers",
                nameAr: "باسكيت قماش",
                subtitleAr: "خفيف وعصري",
                descriptionAr: "حذاء قماشي كلاسيكي بنعل مطاطي مسطح، مثالي للارتداء اليومي السريع والمريح.",
                price: "11500",
                gender: Gender.BOTH,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:40", "المقاس:41", "المقاس:42", "اللون:أبيض", "اللون:أسود"],
            },
            {
                slug: "winter-insulated-boots",
                nameAr: "بوط شتوي دافئ",
                subtitleAr: "مقاوم للثلج والماء",
                descriptionAr: "حذاء شتوي برقبة يوفر عزلاً حرارياً ممتازاً للحفاظ على دفء قدميك في أصعب الظروف المناخية.",
                price: "29500",
                gender: Gender.BOTH,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:41", "المقاس:42", "المقاس:43", "اللون:أسود", "اللون:بني"],
            },
            {
                slug: "monk-strap-shoes",
                nameAr: "صباط كلاسيكي بإبزيم",
                subtitleAr: "أناقة فريدة ومميزة",
                descriptionAr: "حذاء رسمي بمشبك ثنائي مميز مصنوع من أجود الجلود لمظهر متألق وجريء في العمل والمناسبات.",
                price: "28900",
                gender: Gender.MALE,
                imageSearchQueries: [],
                fallbackImageUrls: ["https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1200&q=80"],
                variationValues: ["المقاس:41", "المقاس:42", "المقاس:43", "اللون:أسود", "اللون:بني"],
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
