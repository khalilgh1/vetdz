import os
import sys

# Ensure the backend directory is in python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def main():
    # Configure stdout to handle UTF-8 if outputting to Windows terminal
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except AttributeError:
            import io
            if not isinstance(sys.stdout, io.TextIOWrapper) or sys.stdout.encoding != 'utf-8':
                sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', write_through=True)

    print("=" * 60)
    print("STARTING INGESTION PIPELINE")
    print("=" * 60)

    # Step 1: Loading Documents
    print("\n--- STEP 1: Loading Documents ---")
    from rag.loader import DocumentLoader
    loader = DocumentLoader()
    documents = loader.load_all()
    print(f"Successfully loaded {len(documents)} raw documents.")

    # Step 2: Chunking Documents
    print("\n--- STEP 2: Chunking Documents ---")
    from rag.chunker import Chunker
    chunker = Chunker()
    chunks = chunker.chunk_all(documents)
    print(f"Successfully created {len(chunks)} chunks in total.")

    # Step 3: Precomputing Embeddings
    print("\n--- STEP 3: Precomputing Embeddings ---")
    from rag.precompute import main as run_precompute
    # run_precompute handles loading env, chunking, sending to Hugging Face, and saving
    run_precompute()

    print("\n" + "=" * 60)
    print("INGESTION PIPELINE COMPLETED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    main()
