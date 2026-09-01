import fs from "fs";
import path from "path";
import { prisma } from "../lib/prisma";

interface ChunkData {
  text: string;
  metadata: Record<string, unknown>;
  embedding: number[];
}

async function migrate() {
  console.log("=== Starting pgvector Migration to Neon PostgreSQL ===");

  // 1. Ensure pgvector extension exists
  console.log("1. Enabling pgvector extension...");
  await prisma.$executeRawUnsafe("CREATE EXTENSION IF NOT EXISTS vector;");

  // 2. Create document_embeddings table
  console.log("2. Creating document_embeddings table...");
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS document_embeddings (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      metadata JSONB NOT NULL DEFAULT '{}',
      embedding vector(768) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Create HNSW index for cosine similarity
  console.log("3. Creating HNSW index for vector cosine distance...");
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS document_embeddings_embedding_idx 
    ON document_embeddings USING hnsw (embedding vector_cosine_ops);
  `);

  // 4. Load embeddings.json
  const embeddingsPath = path.resolve(process.cwd(), "backend", "rag", "embeddings.json");
  if (!fs.existsSync(embeddingsPath)) {
    throw new Error(`embeddings.json not found at ${embeddingsPath}`);
  }

  const raw = fs.readFileSync(embeddingsPath, "utf-8");
  const chunks: ChunkData[] = JSON.parse(raw);
  console.log(`4. Loaded ${chunks.length} chunks from embeddings.json`);

  // 5. Clean existing embeddings and insert
  console.log("5. Truncating document_embeddings table...");
  await prisma.$executeRawUnsafe("TRUNCATE TABLE document_embeddings RESTART IDENTITY;");

  console.log("6. Inserting embedded chunks into PostgreSQL...");
  let inserted = 0;
  for (const chunk of chunks) {
    const vectorStr = `[${chunk.embedding.join(",")}]`;
    const metaStr = JSON.stringify(chunk.metadata || {});
    
    await prisma.$executeRawUnsafe(
      `INSERT INTO document_embeddings (text, metadata, embedding) VALUES ($1, $2::jsonb, $3::vector)`,
      chunk.text,
      metaStr,
      vectorStr
    );
    inserted++;
  }

  console.log(`Successfully migrated ${inserted} chunks to Neon PostgreSQL!`);

  // 6. Test a sample query to verify
  const countResult = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
    "SELECT COUNT(*) as count FROM document_embeddings;"
  );
  console.log(`Verification: Total rows in document_embeddings = ${countResult[0]?.count}`);

  const sampleTest = await prisma.$queryRawUnsafe<
    Array<{ id: number; text: string; similarity: number }>
  >(
    `
    SELECT id, SUBSTRING(text FROM 1 FOR 60) as text, 1 - (embedding <=> $1::vector) as similarity
    FROM document_embeddings
    ORDER BY embedding <=> $1::vector
    LIMIT 3;
    `,
    `[${chunks[0].embedding.join(",")}]`
  );

  console.log("Sample similarity query results (querying using first chunk embedding):");
  console.log(sampleTest);
}

migrate()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
