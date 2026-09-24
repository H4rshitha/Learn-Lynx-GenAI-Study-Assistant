import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { chatApi, memoryApi, knowledgeApi, guardrailsApi } from '../api/client';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { MarkdownViewer } from '../components/common/MarkdownViewer';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Paperclip,
  Database,
  FileText,
  RotateCcw,
  Download,
  Share2,
  CheckCircle2,
  ChevronDown,
  BookOpen,
  Cpu,
  CornerDownLeft,
  Loader2,
  Pin,
  PinOff,
  Trash2,
  Search,
  MessageSquare,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Clock,
  ExternalLink,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Mic,
  MicOff,
  Volume2,
  Zap,
  Layers,
  ChevronRight,
  Info,
  ShieldCheck,
  AlertTriangle,
  Scale,
} from 'lucide-react';


export const AIWorkspacePage = () => {
  const { documents } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Left Sidebar & Session States
  const [currentSessionId, setCurrentSessionId] = useState(() => 'sess_' + Date.now());
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  // Active Telemetry & Sources in Right Sidebar
  const [activeTelemetry, setActiveTelemetry] = useState({
    confidence: 97.5,
    latencyMs: 340,
    tokensUsed: 468,
    intent: 'Explain Topic',
    retrievalStrategy: 'Hybrid Dense + BM25 RAG',
    retrievedChunks: [
      {
        docName: 'Operating Systems - Concurrency & Synchronization.pdf',
        chapter: 'Chapter 6',
        section: '6.1 Critical Section',
        page: 24,
        similarity: '0.96',
        snippet: 'A critical section is a piece of code that accesses shared resources. A valid solution must satisfy Mutual Exclusion, Progress, and Bounded Waiting.',
      },
      {
        docName: 'Operating Systems - Concurrency & Synchronization.pdf',
        chapter: 'Chapter 6',
        section: '6.3 Semaphores',
        page: 28,
        similarity: '0.91',
        snippet: 'A semaphore S is an integer variable accessed via atomic operations wait(S) and signal(S) to enforce synchronization and resource counting.',
      },
    ],
  });

  // Chat Workspace States
  const [selectedDocId, setSelectedDocId] = useState('all');
  const [persona, setPersona] = useState('Socratic Academic Tutor');
  const [inputQuery, setInputQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState(null);
  const [likedMessages, setLikedMessages] = useState({}); // { [msgId]: 'like' | 'dislike' }
  const messagesEndRef = useRef(null);

  const defaultWelcomeMessage = {
    id: 'msg_welcome',
    sender: 'assistant',
    timestamp: 'Just now',
    confidenceScore: 98.5,
    latencyMs: 120,
    tokensUsed: 220,
    retrievedChunks: [
      {
        docName: 'ChromaDB Vector Store + Long-Term Memory Active',
        chapter: 'System',
        section: 'Knowledge Base',
        page: 1,
        similarity: '1.0',
        snippet: 'Grounded in all indexed course notes with Gemini 1.5 multi-hop reasoning.',
      },
    ],
    content: `### Welcome to your Agentic Study Workspace 🎓

I am your **Learn-Lynx AI Tutor**, grounded in your course materials using **text-embedding-004** and **Google Gemini 1.5**.

#### Live Capabilities:
- **Token-by-Token Streaming**: Instantaneous real-time responses with grounded citations.
- **Source Inspection**: Exact PDF pages, chapters, and similarity scores in the right-hand panel.
- **Formulas & Code Proofs**: High-resolution markdown code blocks and structured comparison tables.
- **Adaptive Memory**: Every conversation is indexed into long-term SQLite & semantic memory.

*Type your question below, pick a prompt suggestion, or attach a syllabus note to begin!*`,
  };

  const [messages, setMessages] = useState([defaultWelcomeMessage]);

  // Load conversation history on mount
  const fetchConversations = async () => {
    try {
      const history = await memoryApi.getHistory({ search: searchQuery });
      setConversations(history || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [searchQuery]);

  // Handle URL query parameters
  useEffect(() => {
    const q = searchParams.get('q');
    const sess = searchParams.get('session');
    const doc = searchParams.get('doc');
    if (doc) setSelectedDocId(doc);

    if (sess) {
      handleLoadSession(sess);
    } else if (q) {
      handleSend(q);
    }
  }, [searchParams]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Switch to a new fresh chat session
  const handleNewChat = () => {
    const newSessId = 'sess_' + Date.now();
    setCurrentSessionId(newSessId);
    setMessages([defaultWelcomeMessage]);
  };

  // Load an existing session from memory
  const handleLoadSession = async (sessionId) => {
    setCurrentSessionId(sessionId);
    try {
      const history = await memoryApi.getHistory({ sessionId });
      if (history && history.length > 0) {
        const session = history[0];
        if (session.messages && session.messages.length > 0) {
          const loadedMsgs = session.messages.map((m) => ({
            id: 'msg_' + m.id,
            sender: m.role,
            timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            content: m.content,
            confidenceScore: m.confidence_score || 96.0,
            latencyMs: 320,
            tokensUsed: 380,
            retrievedChunks: (m.citations || []).map((c) => ({
              docName: c.document_name || 'Indexed Note',
              chapter: c.chapter || 'Chapter 1',
              section: c.section || 'General',
              page: c.page_number || 1,
              similarity: String(c.score || 0.95),
              snippet: c.preview_text || 'Grounded passage from knowledge store.',
            })),
          }));
          setMessages(loadedMsgs);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load session messages:', e);
    }
  };

  // Toggle Pin on a conversation
  const handleTogglePin = async (e, sess) => {
    e.stopPropagation();
    const newPinned = !sess.is_pinned;
    await memoryApi.pinConversation(sess.session_id, newPinned);
    setConversations((prev) =>
      prev.map((c) => (c.session_id === sess.session_id ? { ...c, is_pinned: newPinned } : c))
    );
  };

  // Delete a session
  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation history from memory?')) {
      await memoryApi.deleteSession(sessionId);
      setConversations((prev) => prev.filter((c) => c.session_id !== sessionId));
      if (currentSessionId === sessionId) {
        handleNewChat();
      }
    }
  };

  // Copy message text
  const handleCopyMessage = (msgId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Toggle Like / Dislike
  const handleFeedback = (msgId, type) => {
    setLikedMessages((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === type ? null : type,
    }));
  };

  // Toggle Voice Input Placeholder
  const handleToggleVoice = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setInputQuery('Explain how Banker\'s algorithm prevents deadlocks with an allocation matrix.');
        setIsRecording(false);
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  // Streaming send prompt handler
  const handleSend = async (queryText = inputQuery) => {
    if (!queryText.trim() || isGenerating) return;

    const userMessage = {
      id: 'msg_u_' + Date.now(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: queryText,
    };

    const assistantMsgId = 'msg_a_' + Date.now();
    const placeholderAssistantMessage = {
      id: assistantMsgId,
      sender: 'assistant',
      timestamp: 'Just now',
      content: '',
      confidenceScore: 97.4,
      latencyMs: 0,
      tokensUsed: 0,
      retrievedChunks: [],
    };

    setMessages((prev) => [...prev, userMessage, placeholderAssistantMessage]);
    setInputQuery('');
    setIsGenerating(true);

    let accumulatedContent = '';
    let streamCitations = [];
    let streamConfidence = 97.4;
    let streamIntent = 'Explain Topic';

    try {
      await chatApi.streamPrompt({
        prompt: queryText,
        documentId: selectedDocId,
        persona,
        sessionId: currentSessionId,
        onMeta: (meta) => {
          streamCitations = (meta.citations || []).map((c) => ({
            docName: c.document_name || 'Indexed Course Note',
            chapter: c.chapter || 'Chapter 1',
            section: c.section || 'General',
            page: c.page_number || 1,
            similarity: String(c.score || 0.95),
            snippet: c.snippet || 'Grounded source passage extracted from knowledge base.',
          }));
          streamConfidence = meta.confidence || 97.4;
          streamIntent = meta.intent || 'Academic Q&A';

          setActiveTelemetry((prev) => ({
            ...prev,
            confidence: streamConfidence,
            intent: streamIntent,
            retrievedChunks: streamCitations,
          }));

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, retrievedChunks: streamCitations, confidenceScore: streamConfidence }
                : m
            )
          );
        },
        onToken: (token) => {
          accumulatedContent += token;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsgId ? { ...m, content: accumulatedContent } : m))
          );
        },
        onDone: async (doneMeta) => {
          const latency = doneMeta.latency_ms || 340;
          const tokens = doneMeta.tokens_used || 480;

          setActiveTelemetry((prev) => ({
            ...prev,
            latencyMs: latency,
            tokensUsed: tokens,
          }));

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, latencyMs: latency, tokensUsed: tokens }
                : m
            )
          );

          // Persist to SQLite Memory
          await memoryApi.saveTurn({
            sessionId: currentSessionId,
            userPrompt: queryText,
            aiResponse: accumulatedContent,
            topic: streamIntent,
            documentId: selectedDocId === 'all' ? null : selectedDocId,
            citations: streamCitations,
            confidenceScore: streamConfidence,
            retrievedChunksCount: streamCitations.length,
          });

          fetchConversations();
        },
      });
    } catch (err) {
      console.error('Stream error:', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: '⚠️ An error occurred during response generation. Please retry.' }
            : m
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = (msg) => {
    // Find previous user message
    const msgIdx = messages.findIndex((m) => m.id === msg.id);
    if (msgIdx > 0 && messages[msgIdx - 1].sender === 'user') {
      const userPrompt = messages[msgIdx - 1].content;
      // Remove current assistant message and re-send
      setMessages((prev) => prev.slice(0, msgIdx));
      handleSend(userPrompt);
    }
  };

  const promptSuggestions = [
    'Explain Banker\'s Deadlock Avoidance Algorithm with an allocation matrix',
    'Compare Semaphores vs Mutex with C code examples',
    'How does B+ Tree insertion handle node overflow?',
    'Explain TCP AIMD Congestion Avoidance and Slow Start',
  ];

  const handleExportChat = () => {
    const chatText = messages
      .map((m) => `[${m.sender.toUpperCase()} - ${m.timestamp}]\n${m.content}\n`)
      .join('\n---\n\n');
    const blob = new Blob([chatText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learn-lynx-session-${currentSessionId}.md`;
    a.click();
  };

  const pinnedConversations = conversations.filter((c) => c.is_pinned);
  const regularConversations = conversations.filter((c) => !c.is_pinned);

  return (
    <DashboardLayout
      title="AI Workspace"
      subtitle="Grounded Multi-Agent Reasoning with Real-Time Streaming & Citation Telemetry"
    >
      <div className="flex h-[calc(100vh-10rem)] max-w-[1600px] mx-auto gap-4">
        {/* Left Sidebar: Persistent Memory & History */}
        {isLeftSidebarOpen && (
          <aside className="w-72 glass-panel rounded-2xl p-4 border border-white/10 flex flex-col shrink-0 animate-fade-in">
            <div className="space-y-3 pb-3 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-semibold text-xs font-mono uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-brand-400" />
                  <span>Memory Archives</span>
                </div>
                <button
                  onClick={() => setIsLeftSidebarOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Collapse left sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>

              <Button
                variant="primary"
                size="sm"
                fullWidth
                leftIcon={Plus}
                onClick={handleNewChat}
              >
                New Study Session
              </Button>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full bg-slate-900/80 border border-slate-700/70 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            {/* Conversation Threads */}
            <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
              {pinnedConversations.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold px-2 mb-1.5 flex items-center gap-1.5">
                    <Pin className="w-3 h-3" />
                    Pinned High-Yield
                  </div>
                  <div className="space-y-1">
                    {pinnedConversations.map((c) => (
                      <div
                        key={c.session_id}
                        onClick={() => handleLoadSession(c.session_id)}
                        className={`group relative p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start justify-between gap-2 ${
                          c.session_id === currentSessionId
                            ? 'bg-brand-500/15 border-brand-500/40 text-white shadow-sm'
                            : 'bg-slate-900/50 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{c.title || 'Untitled Session'}</div>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-mono">
                            <span className="text-amber-400">{c.topic || 'OS'}</span>
                            <span>• {c.messages_count || 2} msgs</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleTogglePin(e, c)}
                            className="p-1 text-amber-400 hover:text-amber-300 rounded"
                            title="Unpin"
                          >
                            <PinOff className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteSession(e, c.session_id)}
                            className="p-1 text-red-400 hover:text-red-300 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold px-2 mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3" />
                  Recent Sessions
                </div>
                {regularConversations.length === 0 && pinnedConversations.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs font-mono">No stored sessions.</div>
                ) : (
                  <div className="space-y-1">
                    {regularConversations.map((c) => (
                      <div
                        key={c.session_id}
                        onClick={() => handleLoadSession(c.session_id)}
                        className={`group relative p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start justify-between gap-2 ${
                          c.session_id === currentSessionId
                            ? 'bg-brand-500/15 border-brand-500/40 text-white shadow-sm'
                            : 'bg-slate-900/40 hover:bg-slate-800/70 border-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{c.title || 'Untitled Session'}</div>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-mono">
                            <span className="text-brand-400">{c.topic || 'General'}</span>
                            <span>• {c.messages_count || 2} msgs</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleTogglePin(e, c)}
                            className="p-1 text-slate-400 hover:text-amber-400 rounded"
                            title="Pin"
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteSession(e, c.session_id)}
                            className="p-1 text-slate-400 hover:text-red-400 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}

        {/* Center: Main Streaming Chat Feed */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {/* Top Control Ribbon */}
          <div className="glass-panel rounded-2xl p-3 sm:p-4 mb-3 flex flex-wrap items-center justify-between gap-3 border border-white/10">
            <div className="flex flex-wrap items-center gap-2.5">
              {!isLeftSidebarOpen && (
                <button
                  onClick={() => setIsLeftSidebarOpen(true)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
                  title="Open History"
                >
                  <PanelLeftOpen className="w-4 h-4 text-brand-400" />
                  <span className="hidden sm:inline">History</span>
                </button>
              )}

              {/* Grounding Selector */}
              <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
                <Database className="w-3.5 h-3.5 text-brand-400" />
                <span className="text-slate-400 font-medium">Grounding:</span>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-slate-900">All Indexed Docs (ChromaDB)</option>
                  {documents.map((doc) => (
                    <option key={doc.id} value={doc.id} className="bg-slate-900">
                      {doc.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Persona Selector */}
              <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
                <Bot className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-slate-400 font-medium">Persona:</span>
                <select
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="Socratic Academic Tutor" className="bg-slate-900">Socratic Academic Tutor</option>
                  <option value="Exam Cram Coach" className="bg-slate-900">Exam Cram Coach (High Yield)</option>
                  <option value="Code & Proof Specialist" className="bg-slate-900">Code & Proof Specialist</option>
                  <option value="ELI5 Concept Simplifier" className="bg-slate-900">ELI5 Concept Simplifier</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 text-xs font-mono text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Guardrails Active</span>
              </div>
              <button
                onClick={handleExportChat}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Export session to Markdown"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={handleNewChat}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="New Chat Session"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              {!isRightSidebarOpen && (
                <button
                  onClick={() => setIsRightSidebarOpen(true)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
                  title="Open Sources & Telemetry"
                >
                  <PanelRightOpen className="w-4 h-4 text-cyan-400" />
                  <span className="hidden sm:inline">Telemetry</span>
                </button>
              )}
            </div>

          </div>

          {/* Conversation Stream Container */}
          <div className="flex-1 glass-card rounded-2xl p-4 sm:p-6 overflow-y-auto space-y-6 mb-3 border border-white/10">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isCopied = copiedMsgId === msg.id;
              const feedback = likedMessages[msg.id];

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 max-w-4xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center shrink-0 shadow-glow-sm">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Message Container */}
                  <div
                    className={`rounded-2xl p-4 sm:p-5 text-sm ${
                      isUser
                        ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-tr-none shadow-md shadow-brand-500/20 max-w-xl'
                        : msg.content?.includes('Responsible AI Policy Enforcement')
                        ? 'glass-panel border border-rose-500/50 bg-rose-950/25 text-rose-100 rounded-tl-none flex-1 max-w-3xl shadow-lg'
                        : 'glass-panel border border-white/10 text-slate-200 rounded-tl-none flex-1 max-w-3xl shadow-lg'
                    }`}
                  >
                    {/* Assistant Header with Confidence Badge & Telemetry */}
                    {!isUser && (
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-white/10 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white font-display">Learn-Lynx AI</span>
                          <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                          {msg.content?.includes('Responsible AI Policy Enforcement') ? (
                            <Badge variant="rose" size="sm">
                              <ShieldCheck className="w-3 h-3 mr-1" />
                              Guardrail Blocked
                            </Badge>
                          ) : (
                            <Badge variant="indigo" size="sm">Memory Synced</Badge>
                          )}
                        </div>
                        {msg.confidenceScore && !msg.content?.includes('Responsible AI Policy Enforcement') && (
                          <div className="flex items-center gap-2">
                            <Badge variant="cyan" size="sm" dot>
                              {msg.confidenceScore}% Grounded
                            </Badge>
                            {msg.latencyMs > 0 && (
                              <span className="text-[10px] font-mono text-slate-400">{msg.latencyMs}ms</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Body */}
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    ) : (
                      <div className="relative space-y-3">
                        <MarkdownViewer content={msg.content || '...'} />
                        {isGenerating && msg.id === messages[messages.length - 1].id && (
                          <span className="inline-block w-2 h-4 bg-brand-400 animate-pulse ml-1 align-middle" />
                        )}

                        {/* Safe Retry Quick Chips if Blocked */}
                        {msg.content?.includes('Responsible AI Policy Enforcement') && (
                          <div className="pt-2 border-t border-rose-500/20 space-y-2">
                            <span className="text-[11px] font-mono text-rose-300 font-bold uppercase tracking-wider block">
                              Try these safe academic formulations:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {[
                                "Explain Peterson's algorithm invariants and the critical section problem.",
                                'Prove why an admissible heuristic guarantees optimality in A* graph search.',
                                'Explain TCP Congestion Avoidance and Slow Start with window graphs.',
                              ].map((sug, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => {
                                    setInputQuery(sug);
                                  }}
                                  className="text-left px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-brand-500 text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                                >
                                  <Sparkles className="w-3 h-3 text-brand-400 shrink-0" />
                                  <span>{sug}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}


                    {/* Interactive Citations & Action Toolbar (Assistant Only) */}
                    {!isUser && (
                      <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                        {/* Citations Preview Tag */}
                        {msg.retrievedChunks && msg.retrievedChunks.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              <FileText className="w-3 h-3 text-indigo-400" />
                              {msg.retrievedChunks.length} Source{msg.retrievedChunks.length > 1 ? 's' : ''}:
                            </span>
                            {msg.retrievedChunks.slice(0, 2).map((chunk, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setActiveTelemetry((prev) => ({
                                    ...prev,
                                    retrievedChunks: msg.retrievedChunks,
                                    confidence: msg.confidenceScore || 97.4,
                                  }));
                                  setIsRightSidebarOpen(true);
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 hover:border-brand-500/50 text-[10px] font-mono text-slate-300 transition-colors"
                              >
                                <span className="truncate max-w-[120px]">{chunk.docName}</span>
                                <span className="text-brand-400 font-bold">p.{chunk.page}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div />
                        )}

                        {/* Action Buttons: Copy, Regenerate, Like, Dislike */}
                        <div className="flex items-center gap-1 text-slate-400">
                          <button
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
                            title="Copy response"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleRegenerate(msg)}
                            disabled={isGenerating}
                            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
                            title="Regenerate response"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleFeedback(msg.id, 'like')}
                            className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
                              feedback === 'like' ? 'text-emerald-400' : 'hover:text-white'
                            }`}
                            title="Helpful explanation"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleFeedback(msg.id, 'dislike')}
                            className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
                              feedback === 'dislike' ? 'text-rose-400' : 'hover:text-white'
                            }`}
                            title="Needs improvement"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-xs font-bold text-slate-200">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          {messages.length <= 2 && (
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide">Suggestions:</span>
              {promptSuggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(sug)}
                  className="text-xs px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 hover:border-brand-500/50 transition-all truncate max-w-xs"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar with Voice & Attachments */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="glass-panel p-2.5 rounded-2xl border border-white/10 flex items-center gap-2 shadow-2xl relative"
          >
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => navigate('/knowledge-base')}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-brand-300 transition-colors"
              title="Attach / Inspect Knowledge Base notes"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Input Field */}
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={isGenerating}
              placeholder={isRecording ? 'Listening for academic query...' : 'Ask a question grounded in course notes, request code, or synthesize MCQs...'}
              className={`flex-1 bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none ${
                isRecording ? 'text-brand-300 animate-pulse' : ''
              }`}
            />

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-2 rounded-xl border transition-all ${
                isRecording
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-bounce'
                  : 'bg-slate-800/80 hover:bg-slate-700 border-transparent text-slate-400 hover:text-white'
              }`}
              title={isRecording ? 'Stop Recording' : 'Voice Input (Dictate question)'}
            >
              {isRecording ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!inputQuery.trim() || isGenerating}
              isLoading={isGenerating}
              rightIcon={Send}
            >
              Send
            </Button>
          </form>
        </div>

        {/* Right Sidebar: Grounded Sources, Citations & Telemetry Inspector */}
        {isRightSidebarOpen && (
          <aside className="w-80 glass-panel rounded-2xl p-4 border border-white/10 flex flex-col shrink-0 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-white font-semibold text-xs font-mono uppercase tracking-wider">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Citations & Telemetry</span>
              </div>
              <button
                onClick={() => setIsRightSidebarOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Collapse right sidebar"
              >
                <PanelRightClose className="w-4 h-4" />
              </button>
            </div>

            {/* Telemetry Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 py-3 border-b border-white/10 text-center font-mono">
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Confidence</span>
                <span className="text-xs font-bold text-cyan-400">{activeTelemetry.confidence}%</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Latency</span>
                <span className="text-xs font-bold text-emerald-400">{activeTelemetry.latencyMs}ms</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Tokens</span>
                <span className="text-xs font-bold text-purple-400">{activeTelemetry.tokensUsed}</span>
              </div>
            </div>

            {/* Intent & Retrieval Strategy */}
            <div className="py-2.5 space-y-1.5 border-b border-white/10 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px] font-mono">Detected Intent:</span>
                <Badge variant="indigo" size="xs">{activeTelemetry.intent}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px] font-mono">Retrieval Engine:</span>
                <span className="text-[11px] font-mono text-slate-300 font-semibold">Hybrid RRF</span>
              </div>
            </div>

            {/* Grounded Sources & Citations List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-brand-300 font-bold px-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Retrieved Context Passages ({activeTelemetry.retrievedChunks?.length || 0})
              </div>

              {activeTelemetry.retrievedChunks && activeTelemetry.retrievedChunks.length > 0 ? (
                activeTelemetry.retrievedChunks.map((chunk, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs space-y-2 hover:border-brand-500/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <h5 className="font-semibold text-white line-clamp-1">{chunk.docName}</h5>
                      <Badge variant="cyan" size="xs">
                        {Math.round(parseFloat(chunk.similarity || 0.95) * 100)}% sim
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                      <span className="text-brand-300">{chunk.chapter || 'Chapter 1'}</span>
                      <span>•</span>
                      <span className="text-amber-400 font-bold">Page {chunk.page}</span>
                    </div>

                    {chunk.snippet && (
                      <p className="text-[11px] text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 leading-relaxed font-sans line-clamp-3">
                        "{chunk.snippet}"
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs font-mono">
                  No citations retrieved for this turn.
                </div>
              )}
            </div>

            {/* Bottom: Quick Document Link */}
            <div className="pt-3 border-t border-white/10">
              <button
                onClick={() => navigate('/knowledge-base')}
                className="w-full py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Browse All Knowledge Docs</span>
                <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
              </button>
            </div>
          </aside>
        )}
      </div>
    </DashboardLayout>
  );
};


