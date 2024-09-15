import os
from dotenv import load_dotenv
from langchain_cohere import ChatCohere, create_cohere_react_agent
from langchain_experimental.tools import PythonREPLTool
from langchain_core.prompts import ChatPromptTemplate
from langchain.agents import AgentExecutor
import json

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
        Please return the response in JSON format with two keys: 'good' for positive feedback, and 'bad' for areas of improvement.
        """

    human_input = f"""The following is a work-in-progress code interview code snippet. Please provide feedback in JSON format.\n\nProblem: {problem_description}\n\nCode:\n{code}
    Provide feedback on the following aspects:
    1. Correctness: Does the code solve the problem correctly? However, if the presented part of the code is correct, but it looks incomplete, do not penalize the correctness score.
    2. Time Complexity: What is the time complexity of the solution?
    3. Space Complexity: What is the space complexity of the solution?
    4. Code Style: Is the code well-formatted and following best practices?

    Generate a JSON that represents your detail feedback in the following format:
    {{
        "good": "Positive feedback here",
        "bad": "Areas of improvement here"
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
feedback = json.loads(feedback)
# Assuming feedback comes in proper JSON format, let's print it:
print(f'''
Feedback:
      good: {feedback["good"]}
      bad: {feedback["bad"]}
''')