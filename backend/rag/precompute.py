import os
import sys
import json
import urllib.request
import urllib.error
import time

# Add parent directory to path to allow importing from backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from rag.loader import DocumentLoader
from rag.chunker import Chunker

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
                    # Remove surrounding quotes
                    if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                        val = val[1:-1]
                    env_vars[key] = val
    return env_vars

def get_embeddings_batch(texts, api_token):
    url = "https://router.huggingface.co/hf-inference/models/intfloat/multilingual-e5-base/pipeline/feature-extraction"
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json"
    }
    # Prepend 'passage: ' as required by the multilingual-e5-base model for indexing/document passages
    payload = {
        "inputs": [f"passage: {text}" for text in texts],
        "options": {"wait_for_model": True}
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST"
    )
    
    max_retries = 5
    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(req) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            try:
                err_content = e.read().decode("utf-8")
                err_msg = json.loads(err_content)
            except Exception:
                err_msg = err_content
            
            print(f"HTTP Error {e.code}: {err_msg}")
            # If the model is loading or we are rate-limited, wait and retry
            if e.code in [503, 429]:
                wait_time = 15 if e.code == 503 else 10
                print(f"Retrying in {wait_time} seconds (attempt {attempt + 1}/{max_retries})...")
                time.sleep(wait_time)
                continue
            raise e
        except Exception as e:
            print(f"Network error: {e}")
            time.sleep(2)
            
    raise Exception("Failed to get embeddings after maximum retries.")

def main():
    # Configure stdout to handle UTF-8 if outputting to Windows terminal
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except AttributeError:
            # Fallback if reconfigure is not available
            if not isinstance(sys.stdout, io.TextIOWrapper) or sys.stdout.encoding != 'utf-8':
                import io
                sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', write_through=True)

    print("Loading environment variables...")
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    env_vars = load_env(os.path.join(root_dir, ".env.local"))
    
    hf_token = env_vars.get("HF_TOKEN")
    if not hf_token:
        print("Error: HF_TOKEN not found in .env.local")
        sys.exit(1)
        
    print("Loading documents...")
    loader = DocumentLoader()
    documents = loader.load_all()
    print(f"Loaded {len(documents)} raw documents.")
    
    print("Chunking documents...")
    chunker = Chunker()
    chunks = chunker.chunk_all(documents)
    print(f"Created {len(chunks)} chunks in total.")
    
    # Process chunks in batches to avoid API limits and payload size issues
    batch_size = 16
    processed_chunks = []
    
    print("Generating embeddings via Hugging Face Inference API...")
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i : i + batch_size]
        batch_texts = [c["text"] for c in batch]
        
        print(f"Processing batch {i // batch_size + 1}/{(len(chunks) - 1) // batch_size + 1} (size {len(batch)})...")
        
        embeddings = get_embeddings_batch(batch_texts, hf_token)
        
        # Verify result length matches
        if len(embeddings) != len(batch):
            raise Exception(f"Expected {len(batch)} embeddings, but received {len(embeddings)} from HF API")
            
        for chunk, embedding in zip(batch, embeddings):
            processed_chunks.append({
                "text": chunk["text"],
                "metadata": chunk["metadata"],
                "embedding": embedding
            })
            
        # Small delay to respect rate limits
        time.sleep(0.5)
        
    # Write the output to embeddings.json
    output_path = os.path.join(os.path.dirname(__file__), "embeddings.json")
    print(f"Saving {len(processed_chunks)} embedded chunks to {output_path}...")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(processed_chunks, f, ensure_ascii=False, indent=2)
        
    print("Embedding generation completed successfully!")

if __name__ == "__main__":
    main()
