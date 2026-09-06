import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

function escapeCsv(val: any): string {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
}

async function main() {
    const products = await prisma.product.findMany({
        orderBy: { id: "asc" },
        include: {
            productType: true,
            images: {
                orderBy: { sortOrder: "asc" },
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
        },
    });

    // 1. Export JSON with full details
    const jsonOutput = products.map((p) => {
        const variationsMap = new Map<string, Set<string>>();
        for (const pv of p.variations) {
            const vName = pv.variationValue.variation.nameAr;
            if (!variationsMap.has(vName)) {
                variationsMap.set(vName, new Set());
            }
            variationsMap.get(vName)!.add(pv.variationValue.valueAr);
        }

        return {
            id: p.id,
            slug: p.slug,
            currentNameAr: p.nameAr,
            newNameAr: "", // User can fill this in
            categorySlug: p.productType.slug,
            categoryNameAr: p.productType.nameAr,
            gender: p.gender,
            price: Number(p.price),
            discountedPrice: p.discountedPrice ? Number(p.discountedPrice) : null,
            subtitleAr: p.subtitleAr,
            descriptionAr: p.descriptionAr,
            imageUrls: p.images.map((img) => img.url),
            variations: Array.from(variationsMap.entries()).map(([name, vals]) => ({
                name,
                values: Array.from(vals),
            })),
        };
    });

    const jsonPath = path.join(__dirname, "../products_export.json");
    fs.writeFileSync(jsonPath, JSON.stringify(jsonOutput, null, 2), "utf-8");

    // 2. Export CSV (easy to view in Excel / Google Sheets or text editor)
    const csvHeaders = [
        "id",
        "slug",
        "currentNameAr",
        "newNameAr",
        "category",
        "gender",
        "price",
        "subtitleAr",
        "imageUrl",
    ];

    const csvRows = jsonOutput.map((p) => [
        escapeCsv(p.id),
        escapeCsv(p.slug),
        escapeCsv(p.currentNameAr),
        escapeCsv(p.newNameAr),
        escapeCsv(p.categoryNameAr),
        escapeCsv(p.gender),
        escapeCsv(p.price),
        escapeCsv(p.subtitleAr),
        escapeCsv(p.imageUrls[0] ?? ""),
    ]);

    const csvContent = "\uFEFF" + [csvHeaders.join(","), ...csvRows.map((r) => r.join(","))].join("\r\n");
    const csvPath = path.join(__dirname, "../products_export.csv");
    fs.writeFileSync(csvPath, csvContent, "utf-8");

    console.log(`✓ Exported ${products.length} products to:`);
    console.log(`  - ${jsonPath}`);
    console.log(`  - ${csvPath}`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
