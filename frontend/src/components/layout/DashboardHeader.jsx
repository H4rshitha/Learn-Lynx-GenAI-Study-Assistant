import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import {
  Search,
  Bell,
  Sparkles,
  Menu,
  CheckCircle2,
  BookOpen,
  Zap,
  HelpCircle,
  Clock,
  Sun,
  Moon,
  Command,
  ShieldCheck,
} from 'lucide-react';

export const DashboardHeader = ({ title, subtitle, onOpenMobileSidebar }) => {
  const { user } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifications = [
    {
      id: 1,
      title: 'Operating Systems Knowledge Base Indexed',
      desc: '148 vector chunks embedded with text-embedding-004.',
      time: '15m ago',
      icon: BookOpen,
      iconColor: 'text-indigo-400 bg-indigo-500/10',
    },
    {
      id: 2,
      title: 'Quiz Studio High Score!',
      desc: 'You scored 100% on Heuristic Search MCQs.',
      time: '2h ago',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400 bg-emerald-500/10',
    },
    {
      id: 3,
      title: 'Upcoming Study Goal Alert',
      desc: 'Revise Semaphores & Deadlock Avoidance due at 6:00 PM.',
      time: '4h ago',
      icon: Clock,
      iconColor: 'text-amber-400 bg-amber-500/10',
    },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/workspace?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleCommandPaletteOpen = () => {
    // Trigger custom event or keyboard event for Cmd+K
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: true }));
  };

  return (
    <header className="h-20 border-b border-white/10 bg-[#090D16]/80 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileSidebar}
          aria-label="Open navigation sidebar"
          className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
            {title || 'Dashboard'}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-400 hidden sm:block mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Middle: Quick Concept Search Bar with Command Palette trigger */}
      <div className="hidden md:flex items-center max-w-md w-full mx-6">
        <div
          onClick={handleCommandPaletteOpen}
          className="relative w-full cursor-pointer group"
        >
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-cyan-400 transition-colors" />
          <div className="w-full bg-slate-900/80 border border-slate-800 group-hover:border-cyan-500/50 rounded-xl pl-10 pr-20 py-2 text-xs text-slate-400 flex items-center justify-between transition-all">
            <span>Search concepts or type a command...</span>
            <div className="flex items-center gap-1">
              <kbd className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </div>

      {/* Right: AI Model Status, Theme Toggle & Notifications */}
      <div className="flex items-center gap-2.5">
        {/* Model Selector Tag */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-slate-300 font-medium">Gemini 1.5 Pro</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded font-mono">
            RAG Active
          </span>
        </div>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={() => {
            toggleTheme();
            toast.info(`Switched to ${isDark ? 'Light' : 'Dark'} mode theme`);
          }}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View notifications"
            className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#090D16]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-panel rounded-2xl border border-white/10 shadow-2xl p-4 animate-fadeIn z-50">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Notifications & Activity
                </span>
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    toast.success('All study alerts marked as read.');
                  }}
                  className="text-[10px] text-cyan-400 cursor-pointer hover:underline bg-transparent border-0"
                >
                  Mark all as read
                </button>
              </div>

              <div className="divide-y divide-white/5 max-h-72 overflow-y-auto mt-2">
                {notifications.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="py-3 flex items-start gap-3 hover:bg-white/5 p-2 rounded-xl transition-colors cursor-pointer"
                      onClick={() => {
                        toast.info(item.desc, item.title);
                        setShowNotifications(false);
                      }}
                    >
                      <div className={`p-2 rounded-xl ${item.iconColor} shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-200">{item.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{item.desc}</p>
                        <span className="text-[10px] text-slate-500 mt-1 block font-mono">{item.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div
          onClick={() => navigate('/settings')}
          aria-label="Account settings"
          className="flex items-center gap-2 cursor-pointer p-1.5 rounded-xl hover:bg-slate-800/60 transition-colors"
        >
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
            alt="User avatar"
            className="w-8 h-8 rounded-lg object-cover ring-1 ring-cyan-500/40"
          />
        </div>
      </div>
    </header>
  );
};
