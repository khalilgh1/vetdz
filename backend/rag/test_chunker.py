import sys
import os

# Ensure the backend directory is in python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from rag.loader import DocumentLoader
from rag.chunker import Chunker

def test_chunker():
    loader = DocumentLoader()
    chunker = Chunker()
    
    docs = loader.load_all()
    print(f"Loaded {len(docs)} raw documents.")
    
    chunks = chunker.chunk_all(docs)
    print(f"Created {len(chunks)} chunks in total.\n")
    
    # Analyze markdown chunks
    md_chunks = [c for c in chunks if c["metadata"]["type"] == "markdown"]
    print("=== Markdown Chunk Analysis ===")
    print(f"Number of Markdown chunks: {len(md_chunks)}")
    
    # Group by source to ensure we see samples from all files
    chunks_by_source = {}
    for chunk in md_chunks:
        src = chunk["metadata"]["source"]
        chunks_by_source.setdefault(src, []).append(chunk)
        
    for src, src_chunks in chunks_by_source.items():
        print(f"\nSource File: {src} ({len(src_chunks)} chunks)")
        for i, chunk in enumerate(src_chunks):
            text_len = len(chunk["text"])
            words_count = len(chunk["text"].split())
            first_line = chunk["text"].split("\n")[0]
            print(f"  Chunk {i+1} | Length: {text_len} chars | Words: {words_count}")
            print(f"    Snippet: {first_line[:100]}")
        print("-" * 40)
        
    # Analyze product chunks
    prod_chunks = [c for c in chunks if c["metadata"]["type"] == "product"]
    print("\n=== Product Chunk Analysis ===")
    print(f"Number of Product chunks: {len(prod_chunks)}")
    if prod_chunks:
        sample = prod_chunks[0]
        print(f"Sample Product Chunk (ID: {sample['metadata']['product_id']}) Length: {len(sample['text'])} chars")
        print(sample["text"])

if __name__ == "__main__":
    # Configure stdout to handle UTF-8 if outputting to Windows terminal
    if sys.platform == "win32":
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    test_chunker()
