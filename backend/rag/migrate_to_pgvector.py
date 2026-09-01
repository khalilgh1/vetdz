import os
import sys
import json
import psycopg
from psycopg.rows import dict_row

# Add parent directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from rag.embedder import load_env

def migrate():
    # 1. Resolve connection string
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    env_vars = load_env(os.path.join(root_dir, ".env.local"))
    if not env_vars:
        env_vars = load_env(os.path.join(root_dir, ".env"))

    db_url = (
        os.environ.get("DATABASE_URL")
        or env_vars.get("DATABASE_URL")
        or env_vars.get("DIRECT_URL")
    )
    if not db_url:
        print("Error: DATABASE_URL not found in environment or .env/.env.local")
        sys.exit(1)

    # 2. Read embeddings.json
    embeddings_file = os.path.join(os.path.dirname(__file__), "embeddings.json")
    if not os.path.exists(embeddings_file):
        print(f"Error: embeddings.json not found at {embeddings_file}")
        sys.exit(1)

    with open(embeddings_file, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    print(f"Loaded {len(chunks)} chunks from embeddings.json")
    print(f"Connecting to Neon PostgreSQL...")

    with psycopg.connect(db_url) as conn:
        with conn.cursor() as cur:
            # Create extension
            print("Ensuring pgvector extension is enabled...")
            cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")

            # Create table
            print("Creating document_embeddings table if not exists...")
            cur.execute("""
                CREATE TABLE IF NOT EXISTS document_embeddings (
                    id SERIAL PRIMARY KEY,
                    text TEXT NOT NULL,
                    metadata JSONB NOT NULL DEFAULT '{}',
                    embedding vector(768) NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            """)

            # Create index
            print("Creating HNSW cosine index...")
            cur.execute("""
                CREATE INDEX IF NOT EXISTS document_embeddings_embedding_idx 
                ON document_embeddings USING hnsw (embedding vector_cosine_ops);
            """)

            # Truncate and insert
            print("Truncating and inserting embeddings...")
            cur.execute("TRUNCATE TABLE document_embeddings RESTART IDENTITY;")

            for chunk in chunks:
                vec_str = f"[{','.join(str(x) for x in chunk['embedding'])}]"
                meta_str = json.dumps(chunk.get("metadata", {}))
                cur.execute(
                    "INSERT INTO document_embeddings (text, metadata, embedding) VALUES (%s, %s::jsonb, %s::vector)",
                    (chunk["text"], meta_str, vec_str)
                )

        conn.commit()

    print(f"Successfully migrated {len(chunks)} chunks into Neon pgvector!")

if __name__ == "__main__":
    migrate()
