from langchain_chroma import Chroma
from langchain_community.embeddings.ollama import OllamaEmbeddings
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableBranch
from langchain_community.llms import Ollama
import chromadb

SYSTEM_MESSAGE_PROMPT = """
You are a helpful chatbot that answers questions from the perspective of a senior software engineer.
You should answer the user's question in plain and precise language based on the below context.

If the context doesn't contain any relevant information to the question, don't make something up. Instead, just say "I don't have information on that topic":

If applicable, please provide the name of the document where the context originated from.
<context>
{context}
</context>
        """

model = 'nomic-embed-text'

class ChatBot:
    """
    Input:
        pdf_path (str): Path to the PDF folder that you want to use for your queries
    """

    def __init__(self, path: str = '') -> None:

        client = chromadb.HttpClient(host="44.203.121.234", port=8000)

        embeddings = OllamaEmbeddings(model=model)
        vectordb = Chroma(
            client=client,
            collection_name="leetcode_chroma",
            embedding_function=embeddings
        )

        retriever = vectordb.as_retriever()

        self.llm = Ollama(model="llama3")

        question_answering_prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    SYSTEM_MESSAGE_PROMPT,
                ),
                MessagesPlaceholder(variable_name="messages"),
            ]
        )

        document_chain = create_stuff_documents_chain(self.llm, question_answering_prompt)

        query_transform_prompt = ChatPromptTemplate.from_messages(
            [
                MessagesPlaceholder(variable_name="messages"),
                (
                    "user",
                    "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation. Only respond with the query, nothing else.",
                ),
            ]
        )

        query_transforming_retriever_chain = RunnableBranch(
            (
                lambda x: len(x.get("messages", [])) == 1,
                # If only one message, then we just pass that message's content to retriever
                (lambda x: x["messages"][-1].content) | retriever,
            ),
            # If messages, then we pass inputs to LLM chain to transform the query, then pass to retriever
            query_transform_prompt | self.llm | StrOutputParser() | retriever,
        ).with_config(run_name="chat_retriever_chain")

        self.conversational_retrieval_chain = RunnablePassthrough.assign(
            context=query_transforming_retriever_chain,
        ).assign(
            answer=document_chain,
        )

    def query(self, message, chat_history):
        chat_history.append(HumanMessage(content=message))
        response = self.conversational_retrieval_chain.invoke({
            "messages": [
                HumanMessage(content=message),
            ]
        })
        return response['answer']

ChatBot().query("Can you give me a hint for two sum", [])
