import os
import sys
import logging

# Ensure the backend directory is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from rag.pipeline import RAGPipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# --- CORS: allow only your frontend origin ---
# Set FRONTEND_ORIGIN env var in production (e.g. https://vetdz.com)
# Falls back to localhost for local development.
frontend_origin = os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000")
CORS(app, origins=[frontend_origin])

# --- Rate limiting: 20 requests/minute per IP ---
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["20 per minute"],
    storage_uri="memory://",
)

# --- Allowed Gemini models ---
ALLOWED_MODELS = {
    "gemini-3.5-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
}

# Initialize RAG Pipeline
try:
    pipeline = RAGPipeline()
except Exception as e:
    logger.error(f"Error initializing RAG Pipeline: {e}")
    pipeline = None


@app.route('/api/chat', methods=['POST'])
@limiter.limit("10 per minute")
def chat():
    if not pipeline:
        return jsonify({"error": "RAG pipeline not initialized. Ensure embeddings.json exists and environment is configured."}), 500

    data = request.get_json(silent=True) or {}

    # Validate query
    query = (data.get('query') or '').strip()
    if not query:
        return jsonify({"error": "Query parameter is required."}), 400
    if len(query) > 2000:
        return jsonify({"error": "Query is too long (max 2000 characters)."}), 400

    # Validate k
    try:
        k = min(max(int(data.get('k', 3)), 1), 10)
    except (TypeError, ValueError):
        k = 3

    # Validate model
    model = data.get('model', 'gemini-3.5-flash')
    if model not in ALLOWED_MODELS:
        return jsonify({"error": f"Invalid model. Allowed: {sorted(ALLOWED_MODELS)}"}), 400

    try:
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
        logger.exception("Error in /api/chat")
        return jsonify({"error": "An internal error occurred. Please try again."}), 500


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "pipeline_initialized": pipeline is not None
    })


if __name__ == '__main__':
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(host='0.0.0.0', port=5000, debug=debug)
