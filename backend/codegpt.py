from io import BytesIO
from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
from langchain_cohere import ChatCohere, create_cohere_react_agent
from langchain_experimental.tools import PythonREPLTool
from langchain_core.prompts import ChatPromptTemplate
from langchain.agents import AgentExecutor
import json
import re
import pdfplumber

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

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

def parse_leetcode_problem_to_chroma(problem_description):
    """
    Parse a LeetCode problem description into a Chroma prompt.
    """
    return f"""
    Given the following problem statement:

    {problem_description}

    Write a function that solves the problem. Your function should take the necessary input parameters and return the expected output.
    """

# Function to review code
def review_leetcode_solution(problem_description, code):
    preamble = """
        You are a technical interviewer who is reviewing a candidate's code for a software engineering position. You need to provide feedback on what the candidate did well and what can be improved.
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

    Generate a JSON that represents your detailed feedback in the following format:
    {{
        "correctness": "Feedback on whether the solution is correct.",
        "efficiency": "Feedback on the time and space complexity, and optimizations.",
        "style_readability": "Feedback on code style and readability.",
        "scalability": "Feedback on how well the code scales.",
        "edge_cases": "Feedback on edge cases and missing test cases.",
        "error_handling": "Feedback on error handling and validation.",
        "improvements": "Specific suggestions for improvement or alternative approaches."
    }}
    """
    return agent_executor.invoke({
        "input": human_input,
        "preamble": preamble
    })

# API endpoint
@app.route('/api/review_code', methods=['POST'])
def evaluate_code():
    data = request.get_json()
    problem_description = data.get("problem_description")
    code = data.get("code")

    # Run the review function
    response = review_leetcode_solution(problem_description, code)

    feedback = response["output"]
    match = re.search(r'```json(.*?)```', feedback, re.DOTALL)

    # If feedback is found and is in JSON format, return it
    if match:
        feedback = json.loads(match.group(1))
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
            text += page.extract_text() + '\n'
        # Perform any further analysis or parsing
        analysis_result["text"] = text.strip()
    return analysis_result

# API endpoint to upload and analyze the PDF
@app.route('/api/upload_pdf', methods=['POST'])
def upload_pdf():
    # Check if the post request has the file part
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']

    # If no file is selected
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Check if the file has an allowed extension
    if file and allowed_file(file.filename):
        # Analyze the PDF file directly from memory without saving it
        file_stream = BytesIO(file.read())
        analysis = analyze_pdf(file_stream)

        # Return the analysis result
        return jsonify(analysis), 200
    else:
        return jsonify({"error": "File type not allowed. Only PDF files are allowed."}), 400

# Run the Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5678, debug=True)