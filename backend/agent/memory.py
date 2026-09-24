from typing import Dict, List, Any, Optional
from datetime import datetime

class ConversationMemoryHook:
    """
    In-memory session and conversation history store with checkpointing hooks for LangGraph.
    """
    def __init__(self):
        self._sessions: Dict[str, List[Dict[str, Any]]] = {}

    def add_message(self, session_id: str, role: str, content: str, metadata: Optional[Dict[str, Any]] = None):
        """Adds a turn to the conversation memory buffer."""
        if session_id not in self._sessions:
            self._sessions[session_id] = []

        self._sessions[session_id].append({
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": metadata or {},
        })

    def get_history(self, session_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Retrieves recent conversation history for context injection."""
        return self._sessions.get(session_id, [])[-limit:]

    def clear_history(self, session_id: str):
        """Clears memory for a given session."""
        if session_id in self._sessions:
            del self._sessions[session_id]

# Global memory instance
conversation_memory = ConversationMemoryHook()
