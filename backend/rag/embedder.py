import os
import sys
import json
import urllib.request
import urllib.error
import time

# Add parent directory to path to allow importing from backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

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

class QueryEmbedder:
    def __init__(self):
        self.hf_token = os.environ.get("HF_TOKEN")
        if not self.hf_token:
            root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
            env_vars = load_env(os.path.join(root_dir, ".env.local"))
            self.hf_token = env_vars.get("HF_TOKEN")
        if not self.hf_token:
            raise ValueError("HF_TOKEN not found in environment or .env.local")
        self.url = "https://router.huggingface.co/hf-inference/models/intfloat/multilingual-e5-base/pipeline/feature-extraction"

    def embed_query(self, query):
        """
        Embed a single user query. Prepend with 'query: ' as required by multilingual-e5-base.
        """
        headers = {
            "Authorization": f"Bearer {self.hf_token}",
            "Content-Type": "application/json"
        }
        # Prepend 'query: ' for queries in E5 models
        payload = {
            "inputs": [f"query: {query}"],
            "options": {"wait_for_model": True}
        }
        
        urls = [
            "https://router.huggingface.co/hf-inference/models/intfloat/multilingual-e5-base/pipeline/feature-extraction",
            "https://api-inference.huggingface.co/pipeline/feature-extraction/intfloat/multilingual-e5-base",
            "https://api-inference.huggingface.co/models/intfloat/multilingual-e5-base"
        ]
        
        last_error = None
        for url in urls:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers=headers,
                method="POST"
            )
            for attempt in range(3):
                try:
                    with urllib.request.urlopen(req, timeout=60) as response:
                        res = json.loads(response.read().decode("utf-8"))
                        if isinstance(res, list) and len(res) > 0:
                            return res[0]
                        raise ValueError(f"Unexpected response format from API: {res}")
                except urllib.error.HTTPError as e:
                    try:
                        err_content = e.read().decode("utf-8")
                        err_msg = json.loads(err_content)
                    except Exception:
                        err_msg = err_content
                    
                    print(f"[{url}] HTTP Error {e.code}: {err_msg}", file=sys.stderr)
                    last_error = e
                    if e.code in [503, 429]:
                        wait_time = 12 if e.code == 503 else 5
                        print(f"Retrying in {wait_time} seconds (attempt {attempt + 1}/3)...", file=sys.stderr)
                        time.sleep(wait_time)
                        continue
                    break # try next url
                except Exception as e:
                    print(f"Network error on {url}: {e}", file=sys.stderr)
                    last_error = e
                    time.sleep(2)
                    
        raise Exception(f"Failed to get query embedding after trying all endpoints: {last_error}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python embedder.py <query_text>")
        sys.exit(1)
        
    query = " ".join(sys.argv[1:])
    print(f"Embedding query: '{query}'")
    
    embedder = QueryEmbedder()
    embedding = embedder.embed_query(query)
    print(f"Success! Embedding vector length: {len(embedding)}")
    print(f"First 10 values: {embedding[:10]}")

if __name__ == "__main__":
    main()
