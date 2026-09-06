import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const englishTranslations: Record<
    string,
    { nameEn: string; subtitleEn: string; descriptionEn: string }
> = {
    "nomad-sculpted-overshirt": {
        nameEn: "Sculpted Wool Overshirt",
        subtitleEn: "Architectural & relaxed fit",
        descriptionEn: "A standout structured overshirt tailored from premium recycled wool with clean lines and precision detailing for daily distinction.",
    },
    "linen-architecture-blazer": {
        nameEn: "Architectural Linen Blazer",
        subtitleEn: "Lightweight luxury silhouette",
        descriptionEn: "Tailored from breathable, natural flax linen, offering structured drape and relaxed refinement during warmer seasons.",
    },
    "sage-knit-sweater": {
        nameEn: "Fine Knit Wool Sweater",
        subtitleEn: "Warm textural comfort",
        descriptionEn: "Comfortable high-grade knit sweater in a calming sage green hue, designed with a soft handle and modern ribbing.",
    },
    "classic-organic-tshirt": {
        nameEn: "Classic Organic Cotton T-Shirt",
        subtitleEn: "Timeless everyday comfort",
        descriptionEn: "Crafted from 100% certified organic cotton, soft, breathable, and designed to maintain its shape wash after wash.",
    },
    "streetwear-heavy-hoodie": {
        nameEn: "Heavyweight Cotton Hoodie",
        subtitleEn: "Structured modern streetwear",
        descriptionEn: "Dense French terry hoodie engineered for exceptional warmth and an effortlessly modern relaxed silhouette.",
    },
    "essential-turtleneck": {
        nameEn: "Merino Wool Turtleneck",
        subtitleEn: "Sleek cold-weather layering",
        descriptionEn: "Finely spun wool turtleneck sweater designed for thermal warmth, softness, and refined cold-season styling.",
    },
    "minimalist-zip-polo": {
        nameEn: "Minimalist Quarter-Zip Polo",
        subtitleEn: "Modern refined casual",
        descriptionEn: "Contemporary polo shirt featuring a sleek metallic zipper and breathable combed cotton blend texture.",
    },
    "denim-western-shirt": {
        nameEn: "Western Denim Shirt",
        subtitleEn: "Durable vintage styling",
        descriptionEn: "Rugged yet refined denim shirt featuring classic Western pointed yokes and durable pearl snap button closures.",
    },
    "relaxed-camp-shirt": {
        nameEn: "Relaxed Camp Collar Shirt",
        subtitleEn: "Effortless summer ease",
        descriptionEn: "Breezy short-sleeve shirt with an open camp collar and airy drape, designed for relaxed warm days.",
    },
    "cashmere-blend-crewneck": {
        nameEn: "Cashmere-Blend Crewneck",
        subtitleEn: "Ultra-soft seasonal luxury",
        descriptionEn: "Sumptuously soft cashmere blend sweater that provides lightweight thermal warmth and a premium hand-feel.",
    },
    "tactical-utility-vest": {
        nameEn: "Tactical Utility Vest",
        subtitleEn: "Functional urban outerwear",
        descriptionEn: "Modular utility vest featuring reinforced cargo compartments and technical water-resistant construction.",
    },
    "striped-oxford-shirt": {
        nameEn: "Striped Oxford Button-Down",
        subtitleEn: "Timeless heritage tailoring",
        descriptionEn: "Classic striped Oxford cotton shirt with a structured collar and durable woven texture suitable for work or weekend.",
    },
    "cropped-knit-cardigan": {
        nameEn: "Cropped Knit Cardigan",
        subtitleEn: "Chic contemporary drape",
        descriptionEn: "Modern cropped cardigan sweater knit from warm textured yarns with tonal buttons and effortless styling appeal.",
    },
    "quilted-liner-jacket": {
        nameEn: "Quilted Thermal Liner Jacket",
        subtitleEn: "Lightweight modular insulation",
        descriptionEn: "Versatile diamond-quilted jacket ideal as a lightweight standalone layer or snapped underneath a heavier overcoat.",
    },
    "waffle-long-sleeve": {
        nameEn: "Waffle-Knit Long Sleeve",
        subtitleEn: "Textured thermal baseline",
        descriptionEn: "Deep waffle-textured knit long sleeve tee providing breathability, warmth, and reliable durability for casual daily wear.",
    },
    "double-breasted-trench": {
        nameEn: "Classic Double-Breasted Trench Coat",
        subtitleEn: "Iconic weather-resistant drape",
        descriptionEn: "Timeless storm-resistant long trench coat with a waist belt, wide lapels, and sophisticated protective craftsmanship.",
    },
    "casual-flannel-shirt": {
        nameEn: "Winter Plaid Flannel Shirt",
        subtitleEn: "Warm brushed cotton check",
        descriptionEn: "Brushed flannel shirt in an authentic plaid pattern, engineered for comfort either buttoned up or worn open over a tee.",
    },
    "bomber-flight-jacket": {
        nameEn: "Aviation Bomber Flight Jacket",
        subtitleEn: "Iconic athletic silhouette",
        descriptionEn: "Durable water-repellent flight bomber jacket with ribbed storm collar and cuffs, inspired by military heritage.",
    },
    // LEGGINGS (Pants/Jeans)
    "tailored-pleated-trousers": {
        nameEn: "Tailored Pleated Trousers",
        subtitleEn: "Architectural dress trousers",
        descriptionEn: "Sophisticated pleated trousers cut with a relaxed taper, blending sartorial elegance with supreme ease of movement.",
    },
    "heavyweight-denim-jeans": {
        nameEn: "Classic Selvedge Denim Jeans",
        subtitleEn: "Sturdy straight-leg fit",
        descriptionEn: "Heavyweight authentic denim jeans crafted with reinforced stitching and timeless straight-cut proportions.",
    },
    "minimal-canvas-chino": {
        nameEn: "Minimalist Canvas Chino Pants",
        subtitleEn: "Versatile smart-casual trousers",
        descriptionEn: "Clean cotton canvas chinos with a tailored leg, suitable for everyday office wear or weekend outings.",
    },
    "cargo-track-pants": {
        nameEn: "Technical Cargo Track Pants",
        subtitleEn: "Urban utilitarian streetwear",
        descriptionEn: "Engineered cargo track trousers featuring elasticized ankle cuffs, drawstring waist, and modular snap cargo pockets.",
    },
    "wide-leg-wool-pant": {
        nameEn: "Wide-Leg Wool Blend Pants",
        subtitleEn: "Fluid contemporary silhouette",
        descriptionEn: "Luxuriously fluid wide-leg trousers cut from a premium wool blend with a graceful drape and comfortable rise.",
    },
    "linen-drawstring-trousers": {
        nameEn: "Linen Drawstring Trousers",
        subtitleEn: "Breathable vacation ease",
        descriptionEn: "Relaxed linen trousers with an adjustable drawstring waist, crafted for cool breathability in summer weather.",
    },
    "slim-tapered-joggers": {
        nameEn: "Slim Tapered Fleece Joggers",
        subtitleEn: "Cozy refined loungewear",
        descriptionEn: "Premium dense fleece joggers with ribbed cuffs and zippered pockets, combining athletic relaxation with a sharp profile.",
    },
    "corduroy-straight-pants": {
        nameEn: "Straight-Leg Corduroy Pants",
        subtitleEn: "Vintage textured warmth",
        descriptionEn: "Supple wide-wale corduroy trousers featuring a comfortable mid-rise and straight leg for timeless autumn/winter dressing.",
    },
    "relaxed-carpenter-jeans": {
        nameEn: "Relaxed Carpenter Denim Jeans",
        subtitleEn: "Authentic workwear details",
        descriptionEn: "Durable denim utility pants featuring authentic hammer loops, reinforced tool pockets, and relaxed movement.",
    },
    "cropped-tailored-slacks": {
        nameEn: "Cropped Tailored Slacks",
        subtitleEn: "Modern ankle-length cut",
        descriptionEn: "Sharp tailored trousers cropped neatly at the ankle, ideal for highlighting leather shoes or low-profile sneakers.",
    },
    "athletic-flex-leggings": {
        nameEn: "Athletic High-Stretch Leggings",
        subtitleEn: "Sculpting compression performance",
        descriptionEn: "Performance stretch leggings with moisture-wicking technology and a non-slip waistband designed for high mobility.",
    },
    "vintage-wash-mom-jeans": {
        nameEn: "Vintage Wash High-Rise Jeans",
        subtitleEn: "Flattering classic mom fit",
        descriptionEn: "Authentic high-rise denim with a gently tapered leg and vintage stonewash, flattering every curve with timeless ease.",
    },
    "water-repellent-hiker-pants": {
        nameEn: "Water-Repellent Trail Pants",
        subtitleEn: "Outdoor technical durability",
        descriptionEn: "Weather-resistant stretch pants engineered with reinforced knee panels and zippered security pockets for any terrain.",
    },
    "pleated-wide-shorts": {
        nameEn: "Pleated Wide-Leg Shorts",
        subtitleEn: "Refined warm-weather tailoring",
        descriptionEn: "Tailored Bermuda shorts with front pleats and a relaxed leg opening, keeping you sophisticated in summer heat.",
    },
    "wool-blend-trousers": {
        nameEn: "Winter Wool-Blend Trousers",
        subtitleEn: "Insulated formal refinement",
        descriptionEn: "Warm, structured wool-blend trousers with a crisp front crease, perfect for polished professional cold-weather attire.",
    },
    // SHOES
    "chelsea-boot": {
        nameEn: "Leather Chelsea Boots",
        subtitleEn: "Supple Italian leather finish",
        descriptionEn: "Handcrafted leather Chelsea boots with elasticated side gussets and a durable rubber outsole for timeless versatility.",
    },
    "leather-derby-shoes": {
        nameEn: "Classic Leather Derby Shoes",
        subtitleEn: "Sophisticated formal polish",
        descriptionEn: "Refined full-grain leather Derby shoes with wax laces and Goodyear welt construction for enduring elegance.",
    },
    "minimalist-white-sneakers": {
        nameEn: "Minimalist Low-Top Sneakers",
        subtitleEn: "Crisp versatile everyday pair",
        descriptionEn: "Clean leather sneakers featuring a cushioned footbed and streamlined vulcanized rubber sole for seamless daily pairing.",
    },
    "suede-loafers": {
        nameEn: "Classic Suede Penny Loafers",
        subtitleEn: "Italian-style velvet hand-feel",
        descriptionEn: "Supple unlined suede loafers offering instant comfort, subtle stitching, and effortless smart-casual polish.",
    },
    "combat-lug-sole-boots": {
        nameEn: "Rugged Lug-Sole Combat Boots",
        subtitleEn: "Commanding utilitarian grip",
        descriptionEn: "Tough lace-up boots built with reinforced leather, speed eyelets, and deep-tread rubber lug soles for reliable traction.",
    },
    "leather-mule-slides": {
        nameEn: "Leather Open-Back Mules",
        subtitleEn: "Contemporary summer refinement",
        descriptionEn: "Slip-on leather mules crafted with smooth linings and a sculpted footbed for effortless warm-weather sophistication.",
    },
    "trail-running-sneakers": {
        nameEn: "All-Terrain Trail Sneakers",
        subtitleEn: "High-traction cushioned runner",
        descriptionEn: "Lightweight trail runner featuring grippy lugged outsoles, reinforced toe bumpers, and responsive shock-absorbing midsoles.",
    },
    "monk-strap-shoes": {
        nameEn: "Double Monk Strap Shoes",
        subtitleEn: "Executive tailored statement",
        descriptionEn: "Distinctive double buckle dress shoes crafted from burnished calfskin leather for an unmistakable sharp wardrobe statement.",
    },
    "retro-high-top-sneakers": {
        nameEn: "Retro Leather High-Top Sneakers",
        subtitleEn: "Vintage basketball heritage",
        descriptionEn: "Classic high-top sneakers with padded ankle collars, heritage leather overlays, and athletic street appeal.",
    },
    "leather-slip-on-sandals": {
        nameEn: "Ergonomic Leather Slide Sandals",
        subtitleEn: "Comfortable contoured summer slides",
        descriptionEn: "Natural leather slide sandals equipped with an anatomical cork-latex footbed for ergonomic all-day comfort.",
    },
    "casual-canvas-sneakers": {
        nameEn: "Low-Profile Canvas Sneakers",
        subtitleEn: "Lightweight breathable lifestyle",
        descriptionEn: "Timeless low-top canvas sneakers featuring contrast stitching and flexible vulcanized outsoles for laid-back ease.",
    },
    "winter-insulated-boots": {
        nameEn: "Insulated Winter Snow Boots",
        subtitleEn: "Waterproof thermal protection",
        descriptionEn: "Heavy-duty cold-weather boots engineered with waterproof seam sealing, thermal fleece lining, and non-slip tread.",
    },
};

async function main() {
    console.log("Updating categories with English names...");
    await prisma.productType.updateMany({
        where: { slug: "toppings" },
        data: { nameEn: "Shirts & Tops" },
    });
    await prisma.productType.updateMany({
        where: { slug: "leggings" },
        data: { nameEn: "Pants & Trousers" },
    });
    await prisma.productType.updateMany({
        where: { slug: "shoes" },
        data: { nameEn: "Footwear" },
    });

    console.log("Updating variations with English names...");
    await prisma.variation.updateMany({
        where: { nameAr: "المقاس" },
        data: { nameEn: "Size" },
    });
    await prisma.variation.updateMany({
        where: { nameAr: "اللون" },
        data: { nameEn: "Color" },
    });

    console.log("Updating variation values with English names...");
    const colorValues: Record<string, string> = {
        "أسود": "Black",
        "رمادي": "Grey",
        "بيج": "Beige",
        "أبيض": "White",
        "أخضر مريمي": "Sage Green",
        "أزرق داكن": "Navy Blue",
        "زيتوني": "Olive",
        "بني": "Brown",
        "أحمر": "Red",
    };
    for (const [arVal, enVal] of Object.entries(colorValues)) {
        await prisma.variationValue.updateMany({
            where: { valueAr: arVal },
            data: { valueEn: enVal },
        });
    }

    console.log("Updating products with English titles, subtitles and descriptions...");
    let updatedCount = 0;
    for (const [slug, trans] of Object.entries(englishTranslations)) {
        const res = await prisma.product.updateMany({
            where: { slug },
            data: {
                nameEn: trans.nameEn,
                subtitleEn: trans.subtitleEn,
                descriptionEn: trans.descriptionEn,
            },
        });
        if (res.count > 0) {
            updatedCount += res.count;
            await prisma.productImage.updateMany({
                where: { product: { slug } },
                data: { altEn: trans.nameEn },
            });
        } else {
            console.warn(`Warning: product with slug "${slug}" not found in DB`);
        }
    }

    console.log(`Successfully updated ${updatedCount} products with English translations!`);
}

main()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
