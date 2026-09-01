import { prisma } from "../lib/prisma";

async function main() {
  await prisma.$executeRawUnsafe("CREATE EXTENSION IF NOT EXISTS vector;");
  const ext = await prisma.$queryRawUnsafe("SELECT * FROM pg_extension WHERE extname = 'vector';");
  console.log("pgvector extension check:", ext);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
