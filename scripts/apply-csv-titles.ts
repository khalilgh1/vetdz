import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

function parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }
    values.push(current.trim());
    return values;
}

async function main() {
    const csvPath = path.join(__dirname, "../vetdz_products_updated_arabic_titles.csv");
    const rawContent = fs.readFileSync(csvPath, "utf-8");
    const lines = rawContent.split(/\r?\n/).filter((l) => l.trim().length > 0);

    const headers = parseCSVLine(lines[0]);
    const slugIdx = headers.indexOf("slug");
    const newNameIdx = headers.indexOf("newNameAr");

    if (slugIdx === -1 || newNameIdx === -1) {
        throw new Error("Could not find 'slug' or 'newNameAr' columns in CSV.");
    }

    const titleMap = new Map<string, string>();

    for (let i = 1; i < lines.length; i++) {
        const row = parseCSVLine(lines[i]);
        const slug = row[slugIdx];
        const newNameAr = row[newNameIdx];
        if (slug && newNameAr) {
            titleMap.set(slug, newNameAr);
        }
    }

    console.log(`Found ${titleMap.size} updated titles in CSV.`);

    // 1. Update Prisma Database
    let updatedDbCount = 0;
    for (const [slug, newNameAr] of titleMap.entries()) {
        const updated = await prisma.product.updateMany({
            where: { slug },
            data: { nameAr: newNameAr },
        });
        if (updated.count > 0) {
            updatedDbCount += updated.count;
            console.log(`Updated DB: [${slug}] -> "${newNameAr}"`);
        } else {
            console.warn(`Warning: Product with slug "${slug}" not found in DB.`);
        }
    }

    // 2. Update prisma/seed.ts so future seeds retain these exact titles
    const seedPath = path.join(__dirname, "../prisma/seed.ts");
    let seedContent = fs.readFileSync(seedPath, "utf-8");
    let seedReplaced = 0;

    for (const [slug, newNameAr] of titleMap.entries()) {
        // Pattern matches: slug: "...", \s+ nameAr: "..."
        const regex = new RegExp(`(slug:\\s*["']${slug}["'],\\s*\\r?\\n\\s*nameAr:\\s*")[^"]+(")`, "g");
        if (regex.test(seedContent)) {
            seedContent = seedContent.replace(regex, `$1${newNameAr}$2`);
            seedReplaced++;
        }
    }
    fs.writeFileSync(seedPath, seedContent, "utf-8");
    console.log(`Updated prisma/seed.ts (${seedReplaced} titles replaced).`);

    // 3. Update backend/data/products.json
    const productsJsonPath = path.join(__dirname, "../backend/data/products.json");
    if (fs.existsSync(productsJsonPath)) {
        const productsJson = JSON.parse(fs.readFileSync(productsJsonPath, "utf-8"));
        let jsonReplaced = 0;
        for (const item of productsJson) {
            if (titleMap.has(item.slug)) {
                item.nameAR = titleMap.get(item.slug);
                jsonReplaced++;
            }
        }
        fs.writeFileSync(productsJsonPath, JSON.stringify(productsJson, null, 2), "utf-8");
        console.log(`Updated backend/data/products.json (${jsonReplaced} items replaced).`);
    }

    console.log(`✓ Finished! Database updated: ${updatedDbCount} products.`);
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
