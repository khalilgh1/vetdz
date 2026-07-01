import os
import sys

# Ensure the backend directory is in python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

class PromptBuilder:
    @staticmethod
    def build_prompt(query, chunks):
        """
        Builds a structured prompt for the LLM based on the user query and retrieved context chunks.
        """
        context_blocks = []
        for i, chunk in enumerate(chunks):
            metadata = chunk.get("metadata", {})
            source = metadata.get("source", "Unknown Source")
            chunk_type = metadata.get("type", "unknown")
            
            header = f"--- Document {i+1} | Source: {source} (Type: {chunk_type}) ---"
            context_blocks.append(f"{header}\n{chunk['text']}")
            
        context_text = "\n\n".join(context_blocks)
        
        prompt = f"""You are a helpful customer service assistant for VetDz Shop, an e-commerce clothing store based in Algiers, Algeria.
Your goal is to answer the user's question accurately using only the provided context below.

Rules:
1. Base your answer strictly on the provided context.
2. If the context does not contain the answer, politely explain that you do not have that information at the moment. Do not make up facts.
3. Respond in a friendly, helpful manner in Arabic.
4. Keep the response clear, concise, and structured.

Context:
{context_text}

User Question:
{query}

Answer (in Arabic):"""
        return prompt

def main():
    # Simple test for prompt builder
    test_query = "ما هي خيارات التوصيل؟"
    test_chunks = [
        {
            "text": "تقدم VetDz خيارات شحن وتوصيل للمنزل والمكتب.",
            "metadata": {"source": "shipping.md", "type": "markdown"}
        },
        {
            "text": "التوصيل للمنزل يستغرق 1-2 يوم للجزائر العاصمة.",
            "metadata": {"source": "faq.md", "type": "markdown"}
        }
    ]
    
    builder = PromptBuilder()
    prompt = builder.build_prompt(test_query, test_chunks)
    print("=== Built Prompt Sample ===")
    print(prompt)

if __name__ == "__main__":
    main()
