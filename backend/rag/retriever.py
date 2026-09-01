import os
import sys
import json
import logging

# Add parent directory to path to allow importing from backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from rag.embedder import QueryEmbedder

logger = logging.getLogger(__name__)

def load_env(dotenv_path):
    env_vars = {}
    if os.path.exists(dotenv_path):
        with open(dotenv_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                if '=' in line:
                    key, val = line.split('=', 1)
                    key = key.strip()
                    val = val.strip()
                    if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                        val = val[1:-1]
                    env_vars[key] = val
    return env_vars

def cosine_similarity(v1, v2):
    dot_product = sum(x * y for x, y in zip(v1, v2))
    norm_v1 = sum(x * x for x in v1) ** 0.5
    norm_v2 = sum(x * x for x in v2) ** 0.5
    if norm_v1 == 0 or norm_v2 == 0:
        return 0.0
    return dot_product / (norm_v1 * norm_v2)

class Retriever:
    def __init__(self, embeddings_path=None, use_pgvector=True):
        self.embedder = QueryEmbedder()
        self.use_pgvector = use_pgvector
        self.db_url = None
        self.chunks = None

        # Resolve DB URL
        root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
        env_vars = load_env(os.path.join(root_dir, ".env.local"))
        if not env_vars:
            env_vars = load_env(os.path.join(root_dir, ".env"))

        self.db_url = (
            os.environ.get("DATABASE_URL")
            or env_vars.get("DATABASE_URL")
            or env_vars.get("DIRECT_URL")
        )

        # Fallback local json path
        if embeddings_path is None:
            embeddings_path = os.path.join(os.path.dirname(__file__), "embeddings.json")
        self.embeddings_path = os.path.abspath(embeddings_path)

        # If pgvector is disabled or db_url is not present, load local embeddings.json
        if not self.use_pgvector or not self.db_url:
            self._load_local_embeddings()

    def _load_local_embeddings(self):
        if not os.path.exists(self.embeddings_path):
            raise FileNotFoundError(f"Embeddings file not found at {self.embeddings_path}. Please run precompute.py or migrate to PostgreSQL first.")
        with open(self.embeddings_path, 'r', encoding='utf-8') as f:
            self.chunks = json.load(f)

    def retrieve_pgvector(self, query_embedding, k=3):
        import psycopg
        from psycopg.rows import dict_row

        # Format embedding as vector string: [0.1, 0.2, ...]
        vector_str = f"[{','.join(str(x) for x in query_embedding)}]"

        with psycopg.connect(self.db_url, row_factory=dict_row) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT text, metadata, 1 - (embedding <=> %s::vector) AS similarity
                    FROM document_embeddings
                    ORDER BY embedding <=> %s::vector
                    LIMIT %s;
                    """,
                    (vector_str, vector_str, k)
                )
                rows = cur.fetchall()

        results = []
        for r in rows:
            meta = r["metadata"]
            if isinstance(meta, str):
                try:
                    meta = json.loads(meta)
                except Exception:
                    pass
            results.append({
                "text": r["text"],
                "metadata": meta,
                "similarity": float(r["similarity"])
            })
        return results

    def retrieve_local(self, query_embedding, k=3):
        if self.chunks is None:
            self._load_local_embeddings()

        results = []
        for chunk in self.chunks:
            sim = cosine_similarity(query_embedding, chunk["embedding"])
            results.append({
                "text": chunk["text"],
                "metadata": chunk["metadata"],
                "similarity": sim
            })
        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[:k]

    def retrieve(self, query, k=3):
        """
        Embed the query and retrieve the top k most similar chunks using pgvector,
        with automated fallback to local embeddings.json if database is unreachable.
        """
        query_embedding = self.embedder.embed_query(query)

        if self.use_pgvector and self.db_url:
            try:
                return self.retrieve_pgvector(query_embedding, k=k)
            except Exception as e:
                logger.warning(f"pgvector retrieval failed ({e}), falling back to local embeddings: {e}")
                return self.retrieve_local(query_embedding, k=k)

        return self.retrieve_local(query_embedding, k=k)

def main():
    # Configure stdout to handle UTF-8 if outputting to Windows terminal
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except AttributeError:
            import io
            if not isinstance(sys.stdout, io.TextIOWrapper) or sys.stdout.encoding != 'utf-8':
                sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', write_through=True)

    if len(sys.argv) < 2:
        print("Usage: python retriever.py <query_text> [k]")
        sys.exit(1)
        
    query = sys.argv[1]
    k = int(sys.argv[2]) if len(sys.argv) > 2 else 3
    
    print(f"Initializing Retriever and connecting to pgvector...")
    try:
        retriever = Retriever()
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
        
    print(f"Retrieving top {k} matches for query: '{query}'\n")
    top_chunks = retriever.retrieve(query, k=k)
    
    for i, chunk in enumerate(top_chunks):
        print("=" * 60)
        print(f"Result {i+1} | Similarity Score: {chunk['similarity']:.4f}")
        print(f"Source: {chunk['metadata'].get('source')} | Type: {chunk['metadata'].get('type')}")
        if "product_id" in chunk['metadata']:
            print(f"Product ID: {chunk['metadata']['product_id']}")
        print("-" * 60)
        print(chunk["text"])
        print()

if __name__ == "__main__":
    main()
