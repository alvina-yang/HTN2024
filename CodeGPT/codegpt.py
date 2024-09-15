import os
from dotenv import load_dotenv
from langchain_cohere import ChatCohere, create_cohere_react_agent
from langchain_experimental.tools import PythonREPLTool
from langchain_core.prompts import ChatPromptTemplate
from langchain.agents import AgentExecutor
import json
import re

# Load the .env file
load_dotenv()

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

    Generate a JSON that represents your detail feedback in the following format:
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

# Example usage
problem_description = "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."
code = """
def twoSum(nums, target):
    answer = []
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                answer = [i, j]
"""

response = review_leetcode_solution(problem_description, code)
print(response)
feedback = response["output"]
match = re.search('```json(.*?)```', feedback, re.DOTALL)
feedback = json.loads(match.group(1))
# Assuming feedback comes in proper JSON format, let's print it:
print(f'''
Feedback:
Correctness: {feedback['correctness']}
Efficiency: {feedback['efficiency']}
Style and Readability: {feedback['style_readability']}
Scalability: {feedback['scalability']}
Edge Cases: {feedback['edge_cases']}
Error Handling: {feedback['error_handling']}
Improvements: {feedback['improvements']}
''')