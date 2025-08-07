from langchain_aws import ChatBedrock
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import StructuredTool
from ..config import settings
from ..logger import logger
from ..tools import google_calendar_tool
from ..clients import bedrock_runtime
from langchain_core.messages import AIMessage

# 1. Initialize the LLM
llm = ChatBedrock(
    client=bedrock_runtime, # Pass our existing, configured client
    model_id=settings.bedrock_synthesis_model_id,
    model_kwargs={"temperature": 0.1},
)

# 2. Define the Tools
tools = [
    StructuredTool.from_function(
        func=google_calendar_tool.create_calendar_event,
        name="create_calendar_event",
        description="Creates a new event on the user's Google Calendar. Use this for any request to add an event, reminder, or appointment.",
    )
]

# 3. Create the Prompt
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are Kai, a friendly and helpful AI companion for a user with memory loss.
Your response will be converted directly to speech, so you must speak like a kind, natural, and conversational human.

--- YOUR BEHAVIOR ---
1.  **BE CONVERSATIONAL:** Speak in the first person. Use "I remember..." or "You mentioned...". NEVER say "Based on the context..." or "The user asked...".
2.  **BE DIRECT & GENTLE:** Get straight to the point. Keep your answers short and clear (1-2 sentences).
3.  **USE YOUR TOOLS:** If the user asks you to do something (like create a reminder, an event, or an appointment), use your available tools.
4.  **ANSWER FROM MEMORY & TASKS:** If the user asks a question, use the "CONTEXT" and "UPCOMING TASKS" provided below to answer it. The tasks list is the source of truth for what the user needs to do.
5.  **DON'T MAKE THINGS UP:** If the context doesn't have the answer, just say "I don't seem to have a memory about that." Do not apologize.

--- DO NOT break character. Always speak as Kai. ---
""",
        ),
        ("user", "USER'S QUESTION: {query}\\n\\nCONTEXT (Your Memory):\\n{context}\\n\\nUPCOMING TASKS:\\n{tasks}"),
        ("placeholder", "{agent_scratchpad}"),
    ]
)

# 4. Create the Agent
agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

def run_agent(query: str, context: str, tasks: list) -> str:
    """Runs the LangChain agent with the given query, context, and tasks."""
    try:
        tasks_str = "\\n".join(tasks)
        response = agent_executor.invoke({
            "query": query,
            "context": context,
            "tasks": tasks_str
        })
        output = response.get("output", "I'm sorry, I encountered an issue.")

        # Handle the AIMessage format
        if isinstance(output, list) and output and isinstance(output[0], AIMessage):
            return output[0].content
        
        # Handle the dictionary format, e.g., [{'type': 'text', 'text': '...'}]
        if isinstance(output, list) and output and isinstance(output[0], dict):
            return output[0].get('text', str(output))

        # Handle if it's already a plain string
        if isinstance(output, str):
            return output

        # Fallback for any other unexpected format
        return str(output)

    except Exception as e:
        logger.error(f"Error running LangChain agent: {e}")
        return "There was an error while processing your request." 