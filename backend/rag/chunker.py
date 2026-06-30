import re

class Chunker:
    def chunk_product(self, doc):
        """
        For product documents, we don't need to chunk them further.
        """
        return [doc]

    def chunk_markdown(self, doc):
        """
        Split markdown documents by main sections starting with '## [Number].'.
        """
        text = doc.get("text", "")
        metadata = doc.get("metadata", {})
        
        # Split by heading format '## [Number].' using positive lookahead so headings are kept in the chunks
        sections = re.split(r'\n(?=## \d+\.\s)', text)
        
        chunks = []
        for i, section in enumerate(sections):
            section_content = section.strip()
            if not section_content:
                continue
                
            chunks.append({
                "text": section_content,
                "metadata": {
                    **metadata,
                    "section_index": i
                }
            })
        return chunks

    def chunk_all(self, docs):
        """
        Process a list of loaded documents and chunk them accordingly.
        """
        all_chunks = []
        for doc in docs:
            doc_type = doc.get("metadata", {}).get("type", "")
            if doc_type == "product":
                all_chunks.extend(self.chunk_product(doc))
            elif doc_type == "markdown":
                all_chunks.extend(self.chunk_markdown(doc))
            else:
                all_chunks.append(doc)
        return all_chunks