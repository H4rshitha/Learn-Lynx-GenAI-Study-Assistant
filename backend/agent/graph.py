from typing import Literal
from langgraph.graph import StateGraph, START, END
from backend.agent.state import AgentState
from backend.agent.nodes.planner import planner_node
from backend.agent.nodes.retriever import retriever_node
from backend.agent.nodes.reasoning import reasoning_node
from backend.agent.nodes.critic import critic_node
from backend.agent.memory import conversation_memory

def should_revise(state: AgentState) -> Literal["reasoning", "end_node"]:
    """
    Conditional Routing Edge:
    Evaluates Critic feedback. If revision is needed and max iterations not exceeded,
    routes back to Reasoning node. Otherwise, terminates at END.
    """
    critic_eval = state.get("critic_evaluation", {})
    needs_revision = critic_eval.get("needs_revision", False)
    iteration_count = state.get("iteration_count", 0)
    max_iterations = state.get("max_iterations", 2)

    if needs_revision and iteration_count < max_iterations:
        return "reasoning"
    return "end_node"

def build_learnlynx_agent_graph():
    """
    Constructs the 4-Agent LangGraph Workflow:
    START -> Planner -> Retriever -> Reasoning -> Critic -> (Conditional Revision) -> END
    """
    workflow = StateGraph(AgentState)

    # 1. Add Agent Nodes
    workflow.add_node("planner", planner_node)
    workflow.add_node("retriever", retriever_node)
    workflow.add_node("reasoning", reasoning_node)
    workflow.add_node("critic", critic_node)

    # Simple pass-through end node to satisfy conditional edge target
    def end_node_handler(state: AgentState):
        # Record to memory
        session_id = state.get("session_id", "default_session")
        conversation_memory.add_message(
            session_id=session_id,
            role="user",
            content=state.get("query", "")
        )
        conversation_memory.add_message(
            session_id=session_id,
            role="assistant",
            content=state.get("final_answer", ""),
            metadata={"confidence": state.get("confidence")}
        )
        return state

    workflow.add_node("end_node", end_node_handler)

    # 2. Add Fixed Edges
    workflow.add_edge(START, "planner")
    workflow.add_edge("planner", "retriever")
    workflow.add_edge("retriever", "reasoning")
    workflow.add_edge("reasoning", "critic")

    # 3. Add Conditional Edge from Critic
    workflow.add_conditional_edges(
        "critic",
        should_revise,
        {
            "reasoning": "reasoning",
            "end_node": "end_node",
        }
    )

    workflow.add_edge("end_node", END)

    # 4. Compile Graph
    app = workflow.compile()
    return app

# Compile graph singleton
learnlynx_agent = build_learnlynx_agent_graph()

def run_agentic_workflow(
    query: str,
    session_id: str = "default_session",
    persona: str = "Socratic Academic Tutor",
    document_id: str = None,
    max_iterations: int = 2,
) -> AgentState:
    """
    Helper function to invoke the full LangGraph agent workflow.
    """
    initial_state: AgentState = {
        "session_id": session_id,
        "query": query,
        "persona": persona,
        "document_id": document_id,
        "iteration_count": 0,
        "max_iterations": max_iterations,
        "tools_called": [],
    }

    final_state = learnlynx_agent.invoke(initial_state)
    return final_state
