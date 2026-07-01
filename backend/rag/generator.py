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

class GeminiGenerator:
    def __init__(self, model="gemini-3.5-flash"):
        root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
        env_vars = load_env(os.path.join(root_dir, ".env.local"))
        
        # Prefer GEMINI_API_KEY or GEMINI_KEY from env.local or system environment
        self.api_key = (
            env_vars.get("GEMINI_API_KEY") or 
            env_vars.get("GEMINI_KEY") or 
            os.environ.get("GEMINI_API_KEY") or 
            os.environ.get("GEMINI_KEY")
        )
        if not self.api_key:
            print("Warning: Neither GEMINI_API_KEY nor GEMINI_KEY was found in env or .env.local. Requests may fail.", file=sys.stderr)
            
        self.model = model
        
    def generate_response(self, prompt):
        """
        Sends the prompt to Google's Gemini API and returns the generated response text.
        """
        if not self.api_key:
            raise ValueError("GEMINI_KEY or GEMINI_API_KEY is required to generate responses. Please add it to your .env.local file.")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        headers = {
            "Content-Type": "application/json"
        }
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ]
        }
        
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST"
        )
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                with urllib.request.urlopen(req, timeout=30) as response:
                    res_data = json.loads(response.read().decode("utf-8"))
                    # Extract text response from Gemini structure
                    candidates = res_data.get("candidates", [])
                    if candidates and len(candidates) > 0:
                        content = candidates[0].get("content", {})
                        parts = content.get("parts", [])
                        if parts and len(parts) > 0:
                            return parts[0].get("text", "")
                    raise ValueError(f"Unexpected response format from Gemini: {res_data}")
            except urllib.error.HTTPError as e:
                try:
                    err_content = e.read().decode("utf-8")
                    err_msg = json.loads(err_content)
                except Exception:
                    err_msg = err_content
                
                print(f"HTTP Error {e.code}: {err_msg}", file=sys.stderr)
                if e.code in [503, 429]:
                    time.sleep(5)
                    continue
                raise e
            except Exception as e:
                print(f"Network error: {e}", file=sys.stderr)
                time.sleep(2)
                
        raise Exception("Failed to generate response from Gemini API after maximum retries.")

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
        print("Usage: python generator.py <prompt_text> [model_name]")
        sys.exit(1)
        
    prompt = sys.argv[1]
    model = sys.argv[2] if len(sys.argv) > 2 else "gemini-3.5-flash"
    
    print(f"Sending prompt to Gemini model '{model}'...")
    try:
        generator = GeminiGenerator(model=model)
        response = generator.generate_response(prompt)
        print("\n=== Gemini Response ===")
        print(response)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
