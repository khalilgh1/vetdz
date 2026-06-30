import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        include: {
            productType: true,
            variations: {
                include: {
                    variationValue: {
                        include: {
                            variation: true
                        }
                    }
                }
            }
        }
    });

    const result = products.map((p) => {
        const variationsMap = new Map<number, { id: number; nameAr: string; values: Set<string> }>();
        
        for (const pv of p.variations) {
            const val = pv.variationValue;
            const variation = val.variation;
            if (!variationsMap.has(variation.id)) {
                variationsMap.set(variation.id, {
                    id: variation.id,
                    nameAr: variation.nameAr,
                    values: new Set<string>(),
                });
            }
            variationsMap.get(variation.id)!.values.add(val.valueAr);
        }

        const variations = Array.from(variationsMap.values()).map(v => ({
            id: v.id,
            nameAr: v.nameAr,
            values: Array.from(v.values),
        }));

        return {
            id: p.id,
            slug: p.slug,
            nameAR: p.nameAr,
            subtitleAR: p.subtitleAr,
            descriptionAR: p.descriptionAr,
            price: Number(p.price),
            discountActive: p.discountActive,
            discountedPrice: p.discountedPrice ? Number(p.discountedPrice) : null,
            gender: p.gender,
            isFeatured: p.isFeatured,
            producttypeID: p.productTypeId,
            type_slug: p.productType.slug,
            type_nameAR: p.productType.nameAr,
            variations: variations,
        };
    });

    const outputPath = path.join(__dirname, "../backend/data/products.json");
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf-8");
    console.log(`Successfully exported ${result.length} products to ${outputPath}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
