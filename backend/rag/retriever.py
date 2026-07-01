import os
import sys
import json

# Add parent directory to path to allow importing from backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from rag.embedder import QueryEmbedder

def cosine_similarity(v1, v2):
    dot_product = sum(x * y for x, y in zip(v1, v2))
    norm_v1 = sum(x * x for x in v1) ** 0.5
    norm_v2 = sum(x * x for x in v2) ** 0.5
    if norm_v1 == 0 or norm_v2 == 0:
        return 0.0
    return dot_product / (norm_v1 * norm_v2)

class Retriever:
    def __init__(self, embeddings_path=None):
        if embeddings_path is None:
            embeddings_path = os.path.join(os.path.dirname(__file__), "embeddings.json")
            
        self.embeddings_path = os.path.abspath(embeddings_path)
        if not os.path.exists(self.embeddings_path):
            raise FileNotFoundError(f"Embeddings file not found at {self.embeddings_path}. Please run precompute.py first.")
            
        with open(self.embeddings_path, 'r', encoding='utf-8') as f:
            self.chunks = json.load(f)
            
        self.embedder = QueryEmbedder()

    def retrieve(self, query, k=3):
        """
        Embed the query and retrieve the top k most similar chunks.
        """
        query_embedding = self.embedder.embed_query(query)
        
        results = []
        for chunk in self.chunks:
            sim = cosine_similarity(query_embedding, chunk["embedding"])
            results.append({
                "text": chunk["text"],
                "metadata": chunk["metadata"],
                "similarity": sim
            })
            
        # Sort by similarity descending
        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[:k]

def main():
    # Configure stdout to handle UTF-8 if outputting to Windows terminal
    if sys.platform == "win32":
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    if len(sys.argv) < 2:
        print("Usage: python retriever.py <query_text> [k]")
        sys.exit(1)
        
    query = sys.argv[1]
    k = int(sys.argv[2]) if len(sys.argv) > 2 else 3
    
    print(f"Initializing Retriever and loading embeddings...")
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
