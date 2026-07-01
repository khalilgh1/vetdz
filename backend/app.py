import os
import sys

# Ensure the backend directory is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, request, jsonify
from flask_cors import CORS
from rag.pipeline import RAGPipeline

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes (allows requests from frontend)

# Initialize RAG Pipeline
# Default to gemini-3.5-flash
try:
    pipeline = RAGPipeline()
except Exception as e:
    print(f"Error initializing RAG Pipeline: {e}", file=sys.stderr)
    pipeline = None

@app.route('/api/chat', methods=['POST'])
def chat():
    if not pipeline:
        return jsonify({"error": "RAG pipeline not initialized. Ensure embeddings.json exists and environment is configured."}), 500
        
    data = request.get_json(silent=True) or {}
    query = data.get('query')
    if not query:
        return jsonify({"error": "Query parameter is required. Make sure to send a JSON body with a 'query' field, and set the Content-Type header to 'application/json'."}), 400
        
    k = data.get('k', 3)
    model = data.get('model', 'gemini-3.5-flash')
    
    try:
        # Re-initialize pipeline if model differs from default
        if model != pipeline.generator.model:
            req_pipeline = RAGPipeline(model=model)
        else:
            req_pipeline = pipeline
            
        response, chunks = req_pipeline.answer_query(query, k=k)
        
        return jsonify({
            "response": response,
            "chunks": chunks
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy", 
        "pipeline_initialized": pipeline is not None
    })

if __name__ == '__main__':
    # Run Flask app on port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
