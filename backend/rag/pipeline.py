import os
import sys

# Ensure the backend directory is in python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from rag.retriever import Retriever
from rag.prompt_builder import PromptBuilder
from rag.generator import GeminiGenerator

class RAGPipeline:
    def __init__(self, model="gemini-3.5-flash", embeddings_path=None):
        self.retriever = Retriever(embeddings_path=embeddings_path)
        self.generator = GeminiGenerator(model=model)
        
    def answer_query(self, query, k=3, verbose=False):
        """
        Runs the complete online RAG pipeline:
        embedder -> retriever -> prompt_builder -> generator
        """
        if verbose:
            print(f"Retrieving top {k} context chunks for: '{query}'...")
            
        # Steps 1 & 2: Embed the query and retrieve matching chunks
        chunks = self.retriever.retrieve(query, k=k)
        
        if verbose:
            print(f"Retrieved {len(chunks)} chunks.")
            for i, chunk in enumerate(chunks):
                source = chunk["metadata"].get("source", "unknown")
                score = chunk["similarity"]
                print(f"  [{i+1}] Source: {source} (Similarity: {score:.4f})")
                
        # Step 3: Build the prompt using query and chunks
        if verbose:
            print("Building prompt...")
        prompt = PromptBuilder.build_prompt(query, chunks)
        
        # Step 4: Generate response from Gemini
        if verbose:
            print("Generating response from Gemini...")
        response = self.generator.generate_response(prompt)
        
        return response, chunks

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
        print("Usage: python pipeline.py <query_text> [k] [model]")
        sys.exit(1)
        
    query = sys.argv[1]
    k = int(sys.argv[2]) if len(sys.argv) > 2 else 3
    model = sys.argv[3] if len(sys.argv) > 3 else "gemini-3.5-flash"
    
    print("=" * 60)
    print("RUNNING ONLINE RAG PIPELINE")
    print("=" * 60)
    
    try:
        pipeline = RAGPipeline(model=model)
        response, chunks = pipeline.answer_query(query, k=k, verbose=True)
        
        print("\n" + "=" * 60)
        print("FINAL ANSWER")
        print("=" * 60)
        print(response)
        print("=" * 60)
        
    except Exception as e:
        print(f"\nError running pipeline: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
