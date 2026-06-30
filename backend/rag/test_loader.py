from loader import DocumentLoader

loader = DocumentLoader()

documents = loader.load_all()

print(f"Loaded {len(documents)} documents.\n")

for i, doc in enumerate(documents):
    print("=" * 60)
    print(f"Document {i+1}")
    print("Metadata:")
    print(doc["metadata"])
    print("\nText:")
    print(doc["text"][:500])   # Show first 500 characters
    print()