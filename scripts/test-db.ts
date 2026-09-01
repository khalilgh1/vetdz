import { prisma } from "../lib/prisma";

async function main() {
  const result = await prisma.$queryRawUnsafe("SELECT version();");
  console.log("PostgreSQL version:", result);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
