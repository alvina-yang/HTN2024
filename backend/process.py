import csv
from pathlib import Path

def process_csv_file(file_path):
    processed_strings = []

    with open(file_path, 'r', newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)

        for row in reader:
            processed_string = f"Question ID: {row['Question ID']}\n"
            processed_string += f"Title: {row['Question Title']}\n"
            processed_string += f"Slug: {row['Question Slug']}\n"
            processed_string += f"Text: {row['Question Text']}\n"
            processed_string += f"Topics: {row['Topic Tagged text']}\n"
            processed_string += f"Difficulty: {row['Difficulty Level']}\n"
            processed_string += f"Success Rate: {row['Success Rate']}\n"
            processed_string += f"Total Submissions: {row['total submission']}\n"
            processed_string += f"Total Accepted: {row['total accepted']}\n"
            processed_string += f"Likes: {row['Likes']}\n"
            processed_string += f"Dislikes: {row['Dislikes']}\n"
            processed_string += f"Hints: {row['Hints']}\n"
            processed_string += f"Similar Questions IDs: {row['Similar Questions ID']}\n"
            processed_string += f"Similar Questions: {row['Similar Questions Text']}"

            processed_strings.append(processed_string)

    return processed_strings

# Example usage
file_path = Path(__file__).parent / 'leetcode_questions.csv'
result = process_csv_file(file_path)

from langchain.schema.document import Document
from langchain_chroma import Chroma
from langchain_community.embeddings.ollama import OllamaEmbeddings
model = 'nomic-embed-text'

import chromadb
client = chromadb.HttpClient(host="44.203.121.234", port=8000)
embeddings = OllamaEmbeddings(model=model)

db = Chroma(
    client=client,
    collection_name="leetcode_chroma",
    embedding_function=embeddings
)

def add_to_chroma(chunks: list[Document]):

    # Calculate Page IDs.
    chunks_with_ids = calculate_chunk_ids(chunks)

    # Add or Update the documents.
    existing_items = db.get(include=[])  # IDs are always included by default
    existing_ids = set(existing_items["ids"])
    print(f"Number of existing documents in DB: {len(existing_ids)}")

    # Only add documents that don't exist in the DB.
    new_chunks = []
    for chunk in chunks_with_ids:
        if chunk.metadata["id"] not in existing_ids:
            new_chunks.append(chunk)

    if len(new_chunks):
        print(f"👉 Adding new documents: {len(new_chunks)}")
        new_chunk_ids = [chunk.metadata["id"] for chunk in new_chunks]
        db.add_documents(new_chunks, ids=new_chunk_ids)
    else:
        print("✅ No new documents to add")

def calculate_chunk_ids(chunks):

    # This will create IDs like "data/monopoly.pdf:6:2"
    # Page Source : Page Number : Chunk Index

    last_page_id = None
    current_chunk_index = 0

    for chunk in chunks:
        source = chunk.metadata.get("source")
        page = chunk.metadata.get("page")
        current_page_id = f"{source}:{page}"

        # If the page ID is the same as the last one, increment the index.
        if current_page_id == last_page_id:
            current_chunk_index += 1
        else:
            current_chunk_index = 0

        # Calculate the chunk ID.
        chunk_id = f"{current_page_id}:{current_chunk_index}"
        last_page_id = current_page_id

        # Add it to the page meta-data.
        chunk.metadata["id"] = chunk_id

    return chunks

# convert list of strings to Document objects
def convert_to_document_objects(strings: list[str]) -> list[Document]:
    documents = []
    for string in strings:
        doc = Document(
            page_content=string,
            metadata={"source": "LeetCode"},
        )
        documents.append(doc)
    return documents

docs = convert_to_document_objects(result)

add_to_chroma(docs)


def find_closest_query(query: str):
    # Perform similarity search in the Chroma vector database
    results = db.similarity_search(query, k=1)

    return results

# Example usage
query = "Tell me about the most difficult LeetCode question"
closest_docs = find_closest_query(query)

print(closest_docs)

# Print the results
for i, doc in enumerate(closest_docs):
    print(f"Result {i+1}:")
    print(f"ID: {doc.metadata['id']}")
    print(f"Content: {doc.page_content}\n")