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
    imageUrls: string[];
    variationValues: string[];
};

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
                    create: product.imageUrls.map((url, index) => ({
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
    await prisma.orderItemSelection.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
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
                imageUrls: [
                    "/products/nomad-1.svg",
                    "/products/nomad-2.svg",
                    "/products/nomad-3.svg",
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
                imageUrls: ["/products/linen-1.svg", "/products/linen-2.svg"],
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
                imageUrls: ["/products/denim-1.svg", "/products/denim-2.svg"],
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
                imageUrls: ["/products/boot-1.svg", "/products/boot-2.svg"],
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
