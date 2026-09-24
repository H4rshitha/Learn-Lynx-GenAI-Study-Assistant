import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { memoryApi } from '../api/client';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  MessageSquare,
  Pin,
  PinOff,
  Trash2,
  Search,
  Clock,
  ExternalLink,
  Bot,
  User,
  Sparkles,
  BookOpen,
  Filter,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

export const RecentChatsPage = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'pinned'
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [previewSession, setPreviewSession] = useState(null);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const data = await memoryApi.getHistory({
        search: searchQuery,
        pinnedOnly: filterTab === 'pinned',
      });
      setConversations(data || []);
    } catch (e) {
      console.error('Failed to fetch memory history:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [searchQuery, filterTab]);

  const topicsList = ['All', ...new Set(conversations.map((c) => c.topic).filter(Boolean))];

  const filteredConversations = conversations.filter((c) => {
    if (selectedTopic !== 'All' && c.topic !== selectedTopic) return false;
    return true;
  });

  const handleTogglePin = async (e, sess) => {
    e.stopPropagation();
    const newPinned = !sess.is_pinned;
    await memoryApi.pinConversation(sess.session_id, newPinned);
    setConversations((prev) =>
      prev.map((c) => (c.session_id === sess.session_id ? { ...c, is_pinned: newPinned } : c))
    );
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (window.confirm('Permanently delete this conversation from persistent memory?')) {
      await memoryApi.deleteSession(sessionId);
      setConversations((prev) => prev.filter((c) => c.session_id !== sessionId));
      if (previewSession?.session_id === sessionId) {
        setPreviewSession(null);
      }
    }
  };

  const handleResumeInWorkspace = (sessionId) => {
    navigate(`/workspace?session=${sessionId}`);
  };

  const totalMessagesCount = conversations.reduce((acc, curr) => acc + (curr.messages_count || 0), 0);
  const pinnedCount = conversations.filter((c) => c.is_pinned).length;

  return (
    <DashboardLayout
      title="Recent Chats & AI Memory"
      subtitle="Browse, search, and resume all past persistent study sessions and grounded explanations"
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Memory Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <GlassCard className="p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{conversations.length}</div>
              <div className="text-xs text-slate-400">Total Persistent Sessions</div>
            </div>
          </GlassCard>

          <GlassCard className="p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Pin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{pinnedCount}</div>
              <div className="text-xs text-slate-400">Pinned High-Yield Chats</div>
            </div>
          </GlassCard>

          <GlassCard className="p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{totalMessagesCount}</div>
              <div className="text-xs text-slate-400">Exchanges Grounded in Vector DB</div>
            </div>
          </GlassCard>
        </div>

        {/* Controls Ribbon */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations by title, topic, or question..."
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-700/80 text-xs">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filterTab === 'all'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Sessions
              </button>
              <button
                onClick={() => setFilterTab('pinned')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  filterTab === 'pinned'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Pin className="w-3 h-3" />
                Pinned Only
              </button>
            </div>

            {/* Topic Filter */}
            {topicsList.length > 2 && (
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="bg-slate-900/80 border border-slate-700/80 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
              >
                {topicsList.map((t) => (
                  <option key={t} value={t} className="bg-slate-900">
                    Topic: {t}
                  </option>
                ))}
              </select>
            )}

            <Button
              variant="primary"
              size="sm"
              leftIcon={Sparkles}
              onClick={() => navigate('/workspace')}
            >
              New Chat
            </Button>
          </div>
        </div>

        {/* Sessions Grid */}
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 font-mono text-sm animate-pulse">
            Loading conversations from persistent memory database...
          </div>
        ) : filteredConversations.length === 0 ? (
          <GlassCard className="py-16 text-center space-y-3">
            <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-semibold text-slate-200">No conversations found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No previous chat sessions match your search criteria. Start a new study session in the AI Workspace.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/workspace')}
              className="mt-2"
            >
              Open AI Workspace
            </Button>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConversations.map((sess) => {
              const formattedDate = sess.updated_at
                ? new Date(sess.updated_at).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Recent';

              return (
                <GlassCard
                  key={sess.session_id}
                  className="p-5 flex flex-col justify-between hover:border-brand-500/40 transition-all group relative cursor-pointer"
                  onClick={() => setPreviewSession(sess)}
                >
                  <div>
                    {/* Card Top */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <Badge variant={sess.is_pinned ? 'yellow' : 'cyan'} size="sm">
                        {sess.topic || 'Academic Q&A'}
                      </Badge>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleTogglePin(e, sess)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            sess.is_pinned
                              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-amber-400'
                          }`}
                          title={sess.is_pinned ? 'Unpin' : 'Pin conversation'}
                        >
                          {sess.is_pinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={(e) => handleDeleteSession(e, sess.session_id)}
                          className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                          title="Delete from memory"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title & Preview */}
                    <h3 className="font-semibold text-white text-sm line-clamp-2 mb-2 group-hover:text-brand-300 transition-colors">
                      {sess.title || 'Untitled Session'}
                    </h3>

                    {sess.messages && sess.messages.length > 0 && (
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                        {sess.messages[sess.messages.length - 1].content}
                      </p>
                    )}
                  </div>

                  {/* Card Bottom: Metadata & Actions */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{formattedDate}</span>
                    </div>

                    <Button
                      variant="ghost"
                      size="xs"
                      rightIcon={ExternalLink}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResumeInWorkspace(sess.session_id);
                      }}
                    >
                      Resume
                    </Button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}

        {/* Modal: Full Thread Preview */}
        {previewSession && (
          <Modal
            isOpen={!!previewSession}
            onClose={() => setPreviewSession(null)}
            title={previewSession.title || 'Conversation Detail'}
          >
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant="cyan">{previewSession.topic || 'Computer Science'}</Badge>
                  <span className="text-slate-400 font-mono">
                    Session: {previewSession.session_id}
                  </span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={ExternalLink}
                  onClick={() => handleResumeInWorkspace(previewSession.session_id)}
                >
                  Continue in Workspace
                </Button>
              </div>

              {previewSession.messages && previewSession.messages.length > 0 ? (
                previewSession.messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl text-xs space-y-1.5 ${
                      m.role === 'user'
                        ? 'bg-brand-500/15 border border-brand-500/30 text-white ml-6'
                        : 'glass-panel border border-white/10 text-slate-200 mr-6'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span className="font-semibold uppercase text-brand-300">{m.role}</span>
                      <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">No stored message entries.</div>
              )}
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};
