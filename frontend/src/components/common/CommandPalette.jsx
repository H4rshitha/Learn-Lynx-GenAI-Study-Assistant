import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Brain,
  Award,
  Calendar,
  Activity,
  Settings,
  MessageSquare,
  ShieldCheck,
  Zap,
  ArrowRight,
  Command,
  X,
  FileText,
} from 'lucide-react';

export const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigationItems = [
    { name: 'AI Study Workspace (SSE Streaming)', path: '/workspace', icon: Brain, category: 'Core' },
    { name: 'Recent Conversations & Memory', path: '/recent-chats', icon: MessageSquare, category: 'Core' },
    { name: 'Knowledge Base (Hybrid RAG)', path: '/knowledge-base', icon: BookOpen, category: 'Core' },
    { name: 'AI Quiz Studio & Assessments', path: '/quiz-studio', icon: Award, category: 'Tools' },
    { name: 'Adaptive Study Planner', path: '/study-planner', icon: Calendar, category: 'Tools' },
    { name: 'AI Usage & Evaluation Dashboard', path: '/analytics', icon: Activity, category: 'Analytics' },
    { name: 'Settings & Security Policies', path: '/settings', icon: Settings, category: 'System' },
  ];

  const quickActions = [
    {
      name: 'Ask AI: Explain Peterson\'s Algorithm Invariants',
      action: () => navigate('/workspace?q=Explain+Peterson%27s+algorithm+invariants'),
      icon: Zap,
    },
    {
      name: 'Ask AI: A* Admissible Heuristics Proof',
      action: () => navigate('/workspace?q=Prove+optimality+of+admissible+heuristics+in+A*'),
      icon: Zap,
    },
    {
      name: 'Launch Timed Operating Systems MCQ Quiz',
      action: () => navigate('/quiz-studio?topic=Operating+Systems'),
      icon: Award,
    },
    {
      name: 'Generate 14-Day Adaptive Exam Plan',
      action: () => navigate('/study-planner?action=new_plan'),
      icon: Calendar,
    },
  ];

  const filteredNav = navigationItems.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );
  const filteredActions = quickActions.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (action) => {
    setIsOpen(false);
    setQuery('');
    action();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/70 backdrop-blur-md animate-fadeIn"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/60">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, search concept, or navigate (e.g. 'Quiz', 'RAG')..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
            autoFocus
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700 rounded-md">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results List */}
        <div className="p-3 overflow-y-auto space-y-4 text-xs">
          {/* Navigation Items */}
          {filteredNav.length > 0 && (
            <div>
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Navigation
              </span>
              <div className="mt-1 space-y-1">
                {filteredNav.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(() => navigate(item.path))}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left text-slate-200 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400 group-hover:border-cyan-500/40">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-slate-200 group-hover:text-white">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 group-hover:text-cyan-400 flex items-center gap-1">
                        Go <ArrowRight className="w-3 h-3" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick AI Actions */}
          {filteredActions.length > 0 && (
            <div>
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Quick AI Actions
              </span>
              <div className="mt-1 space-y-1">
                {filteredActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(action.action)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left text-slate-200 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-purple-950/40 border border-purple-800/50 text-purple-400">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-slate-200 group-hover:text-white truncate max-w-sm">
                          {action.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-purple-400 font-mono">Execute</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredNav.length === 0 && filteredActions.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <Search className="w-6 h-6 mx-auto mb-2 text-slate-600" />
              <p>No commands or shortcuts matching "{query}"</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>
            Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 font-mono">↵</kbd> to select
          </span>
          <span className="flex items-center gap-1">
            <Command className="w-3 h-3" /> + K anywhere
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
