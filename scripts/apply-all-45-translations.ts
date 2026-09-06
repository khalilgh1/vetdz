import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// The 45 actual seeded products in the database
const translations: Record<string, { nameEn: string; subtitleEn: string; descriptionEn: string }> = {
    // TOPPINGS (18 items)
    "nomad-sculpted-overshirt": {
        nameEn: "Sculpted Wool Overshirt",
        subtitleEn: "Architectural & relaxed fit",
        descriptionEn: "A standout structured overshirt tailored from premium recycled wool with clean lines and precision detailing for daily distinction."
    },
    "linen-architecture-blazer": {
        nameEn: "Architectural Linen Blazer",
        subtitleEn: "Lightweight luxury silhouette",
        descriptionEn: "Tailored from breathable, natural flax linen, offering structured drape and relaxed refinement during warmer seasons."
    },
    "sage-knit-sweater": {
        nameEn: "Fine Knit Wool Sweater",
        subtitleEn: "Warm textural comfort",
        descriptionEn: "Comfortable high-grade knit sweater in a calming sage green hue, designed with a soft handle and modern ribbing."
    },
    "classic-organic-tshirt": {
        nameEn: "Classic Organic Cotton T-Shirt",
        subtitleEn: "Timeless everyday comfort",
        descriptionEn: "Crafted from 100% certified organic cotton, soft, breathable, and designed to maintain its shape wash after wash."
    },
    "streetwear-heavy-hoodie": {
        nameEn: "Heavyweight Cotton Hoodie",
        subtitleEn: "Structured modern streetwear",
        descriptionEn: "Dense French terry hoodie engineered for exceptional warmth and an effortlessly modern relaxed silhouette."
    },
    "minimalist-oversized-jacket": {
        nameEn: "Minimalist Oversized Jacket",
        subtitleEn: "Breezy transitional outer layer",
        descriptionEn: "Lightweight structured jacket tailored in a versatile warm tone for balanced modern daily styling."
    },
    "premium-wool-blazer": {
        nameEn: "Classic Premium Wool Blazer",
        subtitleEn: "Sartorial formal elegance",
        descriptionEn: "Meticulously crafted from virgin wool fibers, combining structured shoulders with refined professional comfort."
    },
    "textured-crewneck-sweater": {
        nameEn: "Textured Crewneck Knit",
        subtitleEn: "Soft woven warmth",
        descriptionEn: "Cozy knit sweater with a timeless ribbed crewneck, designed to insulate comfortably in cold weather."
    },
    "minimalist-black-tee": {
        nameEn: "Essential Black Cotton Tee",
        subtitleEn: "Deep tonal minimalism",
        descriptionEn: "Pure combed cotton t-shirt in deep black, cut for a clean flattering drape for everyday rotation."
    },
    "urban-street-hoodie": {
        nameEn: "Urban Casual Fleece Hoodie",
        subtitleEn: "Relaxed daily comfort",
        descriptionEn: "Plush cotton-blend hoodie in versatile neutral tones, offering lasting softness and dependable thermal comfort."
    },
    "casual-cotton-shirt": {
        nameEn: "Everyday Combed Cotton Shirt",
        subtitleEn: "Breathable all-day casual",
        descriptionEn: "Crisp 100% breathable cotton button-down shirt designed with clean seams and effortless casual style."
    },
    "vintage-denim-jacket": {
        nameEn: "Vintage Trucker Denim Jacket",
        subtitleEn: "Rugged durable construction",
        descriptionEn: "Authentic 90s-inspired denim trucker jacket built with heavy-duty denim and reinforced metal hardware."
    },
    "summer-linen-shirt": {
        nameEn: "Breezy Summer Linen Shirt",
        subtitleEn: "Cool comfort in the heat",
        descriptionEn: "Ultra-breathable woven linen shirt crafted for warm summer outings and effortless coastal leisure."
    },
    "cable-knit-cardigan": {
        nameEn: "Long Cable-Knit Cardigan",
        subtitleEn: "Cozy texture and relaxed drape",
        descriptionEn: "Chunky cable-knit open cardigan sweater made from rich yarns, providing layered warmth at home or outdoors."
    },
    "activewear-zipper-jacket": {
        nameEn: "Active Performance Zip Jacket",
        subtitleEn: "Flexible athletic layering",
        descriptionEn: "Lightweight stretch sports jacket featuring a full front zip and secure pockets for dynamic movement."
    },
    "luxury-trench-coat": {
        nameEn: "Classic Long Trench Coat",
        subtitleEn: "Sophisticated weather protection",
        descriptionEn: "Wind and water-resistant tailored long coat with timeless belt details, elevating your winter silhouette."
    },
    "casual-flannel-shirt": {
        nameEn: "Brushed Plaid Flannel Shirt",
        subtitleEn: "Cozy cold-weather check",
        descriptionEn: "Ultra-soft brushed cotton flannel in a heritage plaid pattern, perfect buttoned up or layered open."
    },
    "bomber-flight-jacket": {
        nameEn: "Aviator Bomber Flight Jacket",
        subtitleEn: "Athletic technical silhouette",
        descriptionEn: "Durable water-repellent flight bomber jacket with ribbed collar and cuffs, inspired by military classics."
    },

    // LEGGINGS / PANTS (15 items)
    "selvage-denim": {
        nameEn: "Straight-Leg Selvedge Jeans",
        subtitleEn: "Timeless straight-leg cut",
        descriptionEn: "Heavyweight authentic denim with reinforced stitching and timeless straight-cut proportions for daily durability."
    },
    "slim-indigo-jeans": {
        nameEn: "Slim Fit Indigo Jeans",
        subtitleEn: "Tailored modern stretch",
        descriptionEn: "Classic indigo washed denim tailored in a slim fit with comfortable stretch fibers for lasting ease."
    },
    "utility-cargo-pants": {
        nameEn: "Utility Multi-Pocket Cargo Pants",
        subtitleEn: "Utilitarian modern street style",
        descriptionEn: "Reinforced cotton cargo pants with multiple functional compartments, ideal for urban transit and weekend utility."
    },
    "premium-chino-pants": {
        nameEn: "Tailored Casual Chino Pants",
        subtitleEn: "Smart casual versatility",
        descriptionEn: "Slim-tailored chinos woven in soft neutral tones, transitioning effortlessly between office and evening outings."
    },
    "relaxed-linen-trousers": {
        nameEn: "Relaxed Summer Linen Trousers",
        subtitleEn: "Lightweight warm-weather drape",
        descriptionEn: "Airy natural flax linen trousers with an elastic waistband and relaxed leg, built for warm-weather ease."
    },
    "heavy-fleece-sweatpants": {
        nameEn: "Heavyweight Fleece Sweatpants",
        subtitleEn: "Plush interior comfort",
        descriptionEn: "Thick brushed cotton fleece joggers with ribbed ankles, built for cold morning training or relaxed lounging."
    },
    "classic-black-chinos": {
        nameEn: "Essential Black Chino Trousers",
        subtitleEn: "Sleek wrinkle-resistant elegance",
        descriptionEn: "Deep-black formal chinos in premium twill that resists creases and maintains a sharp tailored profile."
    },
    "distressed-slim-jeans": {
        nameEn: "Distressed Slim-Fit Denim",
        subtitleEn: "Youthful contemporary edge",
        descriptionEn: "Modern slim jeans finished with subtle vintage abrasions and an artisanal wash for bold casual wear."
    },
    "pleated-tailored-trousers": {
        nameEn: "Classic Pleated Dress Trousers",
        subtitleEn: "Refined sartorial elegance",
        descriptionEn: "Tailored dress trousers with sharp front pleats and hand-stitched detailing for upscale occasions and office settings."
    },
    "athleisure-tech-pants": {
        nameEn: "Athleisure Tech Track Pants",
        subtitleEn: "Water-repellent stretch",
        descriptionEn: "Engineered technical track pants offering weather resistance and four-way stretch flexibility throughout your day."
    },
    "mens-relaxed-chinos": {
        nameEn: "Wide Relaxed-Fit Chinos",
        subtitleEn: "Spacious contemporary silhouette",
        descriptionEn: "Pure cotton chinos tailored with a generous cut through the leg, delivering supreme freedom of movement."
    },
    "light-wash-denim": {
        nameEn: "Light-Wash Summer Denim",
        subtitleEn: "Sun-faded seasonal wash",
        descriptionEn: "Crisp light blue denim jeans with a natural faded look, matching effortlessly with white shirts and tees."
    },
    "knit-lounge-pants": {
        nameEn: "Soft Ribbed Lounge Pants",
        subtitleEn: "Ultimate home relaxation",
        descriptionEn: "Silky soft loungewear trousers crafted from a fine cotton-modal blend for supreme leisure comfort."
    },
    "summer-cotton-shorts": {
        nameEn: "Summer Cotton Chino Shorts",
        subtitleEn: "Cool practical coastal cut",
        descriptionEn: "Casual cotton shorts with side slash pockets and breathable weave, ideal for sunny days and coastal walks."
    },
    "wool-blend-trousers": {
        nameEn: "Winter Wool-Blend Trousers",
        subtitleEn: "Insulated formal refinement",
        descriptionEn: "Warm, structured wool-blend trousers with a crisp front crease, perfect for polished cold-weather wear."
    },

    // SHOES (12 items)
    "chelsea-boot": {
        nameEn: "Leather Chelsea Boots",
        subtitleEn: "Supple Italian leather finish",
        descriptionEn: "Handcrafted leather Chelsea boots with elasticated side gussets and a durable rubber outsole for timeless versatility."
    },
    "minimal-white-sneakers": {
        nameEn: "Minimalist White Leather Sneakers",
        subtitleEn: "Clean low-profile lifestyle",
        descriptionEn: "Clean full-grain leather sneakers featuring a cushioned footbed and vulcanized rubber sole for daily pairing."
    },
    "leather-penny-loafers": {
        nameEn: "Classic Leather Penny Loafers",
        subtitleEn: "Handcrafted Italian styling",
        descriptionEn: "Refined slip-on leather penny loafers crafted with subtle stitching and effortless smart-casual polish."
    },
    "urban-running-shoes": {
        nameEn: "Urban Cushioned Running Shoes",
        subtitleEn: "Shock-absorbing athletic support",
        descriptionEn: "High-rebound road runners engineered with breathable mesh uppers and responsive foam midsoles."
    },
    "rugged-combat-boots": {
        nameEn: "Rugged Lug-Sole Combat Boots",
        subtitleEn: "Commanding utilitarian grip",
        descriptionEn: "Tough lace-up boots built with reinforced leather, speed eyelets, and deep-tread rubber lug soles for reliable traction."
    },
    "suede-desert-boots": {
        nameEn: "Suede Desert Chukka Boots",
        subtitleEn: "Earthy heritage refinement",
        descriptionEn: "Supple unlined suede desert boots featuring crepe-textured outsoles and classic ankle-height lacing."
    },
    "classic-oxford-shoes": {
        nameEn: "Formal Lace-Up Oxford Shoes",
        subtitleEn: "Supreme formal distinction",
        descriptionEn: "Burnished black leather Oxford dress shoes featuring closed lacing and clean cap-toe detailing for suits."
    },
    "breathable-knit-sneakers": {
        nameEn: "Featherlight Knit Sneakers",
        subtitleEn: "Weightless sock-like comfort",
        descriptionEn: "Ultra-lightweight walking sneakers with breathable seamless knit uppers for comfortable all-day motion."
    },
    "leather-slip-on-sandals": {
        nameEn: "Ergonomic Leather Slide Sandals",
        subtitleEn: "Comfortable contoured summer slides",
        descriptionEn: "Natural leather slide sandals equipped with an anatomical cork-latex footbed for ergonomic all-day comfort."
    },
    "casual-canvas-sneakers": {
        nameEn: "Low-Profile Canvas Sneakers",
        subtitleEn: "Lightweight breathable lifestyle",
        descriptionEn: "Timeless low-top canvas sneakers featuring contrast stitching and flexible vulcanized outsoles for laid-back ease."
    },
    "winter-insulated-boots": {
        nameEn: "Insulated Winter Snow Boots",
        subtitleEn: "Waterproof thermal protection",
        descriptionEn: "Heavy-duty cold-weather boots engineered with waterproof seam sealing, thermal fleece lining, and non-slip tread."
    },
    "monk-strap-shoes": {
        nameEn: "Double Monk Strap Shoes",
        subtitleEn: "Executive tailored statement",
        descriptionEn: "Distinctive double buckle dress shoes crafted from burnished calfskin leather for an unmistakable sharp wardrobe statement."
    }
};

async function main() {
    let count = 0;
    for (const [slug, trans] of Object.entries(translations)) {
        const res = await prisma.product.updateMany({
            where: { slug },
            data: {
                nameEn: trans.nameEn,
                subtitleEn: trans.subtitleEn,
                descriptionEn: trans.descriptionEn,
            },
        });
        if (res.count > 0) {
            count += res.count;
            await prisma.productImage.updateMany({
                where: { product: { slug } },
                data: { altEn: trans.nameEn },
            });
        } else {
            console.warn(`[NOT FOUND] ${slug}`);
        }
    }
    console.log(`Updated all ${count} products with English translations!`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
