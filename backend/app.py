from io import BytesIO
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from langchain_cohere import ChatCohere, create_cohere_react_agent
from langchain_experimental.tools import PythonREPLTool
from langchain_core.prompts import ChatPromptTemplate
from langchain.agents import AgentExecutor
import json
import re
import pdfplumber

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

from flask_cors import CORS

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

leetcode_question = None

# Enable CORS for all routes
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Set up Cohere Chat model
cohere_api_key = os.getenv("COHERE_API_KEY")
llm = ChatCohere(api_key=cohere_api_key)

# Set up Python environment tool
python_repl = PythonREPLTool()

# Create the agent with tools
tools = [python_repl]

# Get the prompt to use
prompt_template = ChatPromptTemplate.from_template("{input}")

# Construct the ReAct agent
agent = create_cohere_react_agent(llm, tools, prompt_template)

# Create an agent executor by passing in the agent and tools
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# Function to review code and give marks for each property
def review_leetcode_solution(problem_description, code):
    preamble = """
        You are a technical interviewer who is reviewing a candidate's code for a software engineering position. You need to provide feedback on what the candidate did well and what can be improved. Additionally, assign a score out of 100 for each review area: Correctness (40%), Efficiency (20%), Style & Readability (10%), Scalability (10%), Edge Cases (10%), and Error Handling (10%).
    """

    human_input = f"""The following is a work-in-progress code interview code snippet.\n\nProblem: {problem_description}\n\nCode:\n{code}
    Review the code on:
    1. **Correctness**: Does the code solve the problem? If not, give examples of failing cases.
    2. **Time Complexity**: Analyze it and suggest optimizations, if any.
    3. **Space Complexity**: How can memory usage be reduced?
    4. **Code Style**: Highlight any style issues (naming, structure) and suggest improvements.
    5. **Improvements**: Recommend optimizations or alternative approaches with reasoning.
    6. **Edge Cases**: Point out missing edge cases and give examples.
    7. **Error Handling**: Suggest how to handle potential errors or invalid inputs, but do not be too picky.
    8. **Efficiency**: Could a better algorithm or data structure improve performance?
    9. **Scalability**: Will the solution scale well? Suggest improvements if needed.
    10. **Readability**: How can the code be made easier to understand?
    11. **Modularity**: Suggest improvements for making the code more modular if needed.

    For each review area, provide feedback and a score out of 100 in the following format:
    {{
        "correctness": {{
            "feedback": "Feedback on whether the solution is correct.",
            "score": "Score for correctness out of 100"
        }},
        "efficiency": {{
            "feedback": "Feedback on time and space complexity, and optimizations.",
            "score": "Score for efficiency out of 100"
        }},
        "style_readability": {{
            "feedback": "Feedback on code style and readability.",
            "score": "Score for style and readability out of 100"
        }},
        "scalability": {{
            "feedback": "Feedback on how well the code scales.",
            "score": "Score for scalability out of 100"
        }},
        "edge_cases": {{
            "feedback": "Feedback on edge cases and missing test cases.",
            "score": "Score for edge cases out of 100"
        }},
        "error_handling": {{
            "feedback": "Feedback on error handling and validation.",
            "score": "Score for error handling out of 100"
        }},
        "improvements": "Specific suggestions for improvement or alternative approaches."
    }}
    """
    print(human_input)
    return agent_executor.invoke({
        "input": human_input,
        "preamble": preamble
    })

# API endpoint
@app.route('/api/review_code', methods=['POST'])
def evaluate_code():
    data = request.get_json()
    # TODO: change this to leetcode question
    problem_description = data.get("problem_description")
    code = data.get("code")

    # Run the review function
    response = review_leetcode_solution(problem_description, code)

    feedback = response["output"]
    print(feedback)
    match = re.search(r'```json(.*?)```', feedback, re.DOTALL)

    # If feedback is found and is in JSON format, return it
    if match:
        feedback = json.loads(match.group(1))
        # Extract and return feedback along with individual scores for each property
        print(feedback)
        return jsonify(feedback)
    else:
        return jsonify({"error": "Feedback not generated properly"}), 500

# Function to review behavioral interview and give marks for each aspect
def review_behavioral_interview(chat_history):
    preamble = """
        You are a technical interviewer who is reviewing a behavioral interview. You need to provide feedback on how the candidate performed in the conversation, particularly focusing on their communication, problem-solving, leadership, and other key aspects. Additionally, assign a score out of 100 for each review area.
    """

    human_input = f"""The following is a transcript of a behavioral interview.\n\nChat History: {chat_history}\n
    Review the candidate's performance on the following aspects:
    1. **Clarity**: Did the candidate express their thoughts clearly and effectively?
    2. **Conciseness**: Did the candidate avoid unnecessary details and stay focused on the questions?
    3. **Problem-Solving Approach**: Did the candidate demonstrate structured thinking in problem-solving scenarios?
    4. **Leadership & Ownership**: Did the candidate show leadership qualities or take ownership of their work?
    5. **Teamwork**: Did the candidate demonstrate the ability to collaborate and work well in a team?
    6. **Adaptability**: How well did the candidate handle unexpected or challenging questions?
    7. **Self-Awareness**: Did the candidate show awareness of their strengths and weaknesses?
    8. **Culture Fit**: Did the candidate align with the company’s culture and values?
    9. **Emotional Intelligence**: How well did the candidate handle stressful or difficult parts of the interview?
    10. **Growth Mindset**: Did the candidate demonstrate a willingness to learn and improve?

    For each review area, provide feedback and a score out of 100 in the following format:
    {{
        "clarity": {{
            "feedback": "Feedback on the clarity of communication.",
            "score": "Score for clarity out of 100"
        }},
        "conciseness": {{
            "feedback": "Feedback on the conciseness of responses.",
            "score": "Score for conciseness out of 100"
        }},
        "problem_solving_approach": {{
            "feedback": "Feedback on the candidate's problem-solving approach.",
            "score": "Score for problem-solving approach out of 100"
        }},
        "leadership_ownership": {{
            "feedback": "Feedback on leadership and ownership.",
            "score": "Score for leadership and ownership out of 100"
        }},
        "teamwork": {{
            "feedback": "Feedback on teamwork and collaboration.",
            "score": "Score for teamwork out of 100"
        }},
    }}
    """
    return agent_executor.invoke({
        "input": human_input,
        "preamble": preamble
    })

# API endpoint
@app.route('/api/evaluate_behavioral', methods=['POST'])
def evaluate_behavioral():
    data = request.get_json()
    chat_history = data.get("chat_history")

    # Run the review function
    response = review_behavioral_interview(chat_history)

    feedback = response["output"]
    match = re.search(r'```json(.*?)```', feedback, re.DOTALL)

    # If feedback is found and is in JSON format, return it
    if match:
        feedback = json.loads(match.group(1))

        # Extract and return feedback along with individual scores for each aspect
        return jsonify(feedback)
    else:
        return jsonify({"error": "Feedback not generated properly"}), 500

# Utility function to check if file extension is allowed
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() == 'pdf'

# Function to analyze the PDF (extract text)
def analyze_pdf(file_stream):
    analysis_result = {}
    with pdfplumber.open(file_stream) as pdf:
        # Extract text from the PDF pages
        text = ''
        for page in pdf.pages:
            text += page.extract_text() + ' '  # Replace '\n' with space
        # Perform any further analysis or parsing
        analysis_result["text"] = text.strip().replace('\n', ' ')  # Replace any remaining newlines with spaces
    return analysis_result

# API endpoint to upload and analyze the PDF
@app.route('/api/upload_pdf', methods=['POST', 'OPTIONS'])
def upload_pdf():
    if request.method == 'OPTIONS':
        # Respond to preflight request
        response = app.make_default_options_response()
        response.headers['Access-Control-Allow-Methods'] = 'POST'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response

    app.logger.info("Received POST request for /api/upload_pdf")
    app.logger.debug(f"Request headers: {request.headers}")
    app.logger.debug(f"Request files: {request.files}")

    # Check if the post request has the file part
    if 'file' not in request.files:
        app.logger.error("No file part in the request")
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']

    # If no file is selected
    if file.filename == '':
        app.logger.error("No selected file")
        return jsonify({"error": "No selected file"}), 400

    # Check if the file has an allowed extension
    if file and allowed_file(file.filename):
        app.logger.info(f"Processing file: {file.filename}")
        # Analyze the PDF file directly from memory without saving it
        file_stream = BytesIO(file.read())
        analysis = analyze_pdf(file_stream)

        # Return the analysis result
        app.logger.info("File analysis complete")
        return jsonify(analysis), 200
    else:
        app.logger.error(f"Invalid file type: {file.filename}")
        return jsonify({"error": "File type not allowed. Only PDF files are allowed."}), 400

# Function to get the formatted LeetCode document
def format_lc_document(document):
    """Extracts and formats the LeetCode question from a Document object."""
    # Split the page_content into lines
    content_lines = document.page_content.split("\n")
    content_dict = {"hidden_context": []}

    # Extract title, text, and any hidden context
    for line in content_lines:
        if line.startswith("Title:"):
            content_dict["title"] = line.replace("Title:", "").strip()
        elif line.startswith("Text:"):
            content_dict["text"] = line.replace("Text:", "").strip()
        else:
            # Store any non-title and non-text lines as hidden context
            if line.strip():  # Only add non-empty lines
                content_dict["hidden_context"].append(line.strip())

    # Return metadata along with title, text, and hidden context
    return {
        "metadata": document.metadata,
        "content": {
            "title": content_dict.get("title", "No title found"),
            "text": content_dict.get("text", "No text found"),
            "hidden_context": content_dict["hidden_context"]
        }
    }

# API endpoint to find LeetCode question
@app.route('/api/find_lc_question', methods=['POST'])
def find_lc_question():
    global leetcode_question
    data = request.get_json()
    query = data.get("query")

    if not query:
        return jsonify({"error": "Query is required"}), 400

    try:
        results = db.similarity_search(query, k=1)
        if results:
            leetcode_question = format_lc_document(results[0])
            return jsonify(leetcode_question), 200
        else:
            return jsonify({"error": "No results found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API endpoint to get the stored LeetCode question
@app.route('/api/get_lc_question', methods=['GET'])
def get_lc_question():
    global leetcode_question  # Access the global variable

    # Check if leetcode_question is None
    if leetcode_question is None:
        return jsonify({"error": "No LeetCode question found. Please run /api/find_lc_question first."}), 404

    # Return the stored LeetCode question
    return jsonify(leetcode_question), 200


@app.route('/', methods=['GET'])
def hello():
    return "Hello, World!"

# Run the Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5678, debug=True)