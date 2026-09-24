import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Bot,
  BookMarked,
  HelpCircle,
  CalendarCheck,
  BarChart3,
  Settings,
  PlusCircle,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Database,
  FileText,
  Zap,
  MessageSquare,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  const { documents, chats } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Workspace', path: '/workspace', icon: Bot, badge: 'Agentic' },
    { name: 'Recent Chats', path: '/recent-chats', icon: MessageSquare, badge: 'Memory' },
    { name: 'Knowledge Base', path: '/knowledge-base', icon: BookMarked, count: documents.length },
    { name: 'Quiz Studio', path: '/quiz-studio', icon: HelpCircle, badge: 'Adaptive' },
    { name: 'Study Planner', path: '/study-planner', icon: CalendarCheck },
    { name: 'AI Insights', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNewChat = () => {
    navigate('/workspace');
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen z-40 bg-[#0B0F19]/95 border-r border-white/10 backdrop-blur-2xl flex flex-col justify-between transition-all duration-300',
          collapsed ? 'w-20' : 'w-72',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Top Header */}
        <div>
          <div className="h-20 flex items-center justify-between px-5 border-b border-white/10">
            <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center shrink-0 shadow-md shadow-brand-500/25">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              {!collapsed && (
                <div className="flex flex-col truncate">
                  <span className="font-display font-extrabold text-white text-lg tracking-tight truncate flex items-center gap-1.5">
                    Learn-Lynx <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-brand-500/20 text-brand-300">v2</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                    AI Study Companion
                  </span>
                </div>
              )}
            </NavLink>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white items-center justify-center transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* New Chat Action Button */}
          <div className="p-4 pb-2">
            <button
              onClick={handleNewChat}
              className={cn(
                'w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-medium shadow-md shadow-brand-500/20 transition-all active:scale-95 border border-white/10',
                collapsed ? 'p-3' : 'py-3 px-4 text-sm'
              )}
              title="New AI Chat"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              {!collapsed && <span>New AI Chat Session</span>}
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-3 space-y-1">
            {!collapsed && (
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                Workspace
              </div>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
                    isActive
                      ? 'bg-brand-600/15 text-white border border-brand-500/30 shadow-sm shadow-brand-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-brand-500 to-purple-500 rounded-r-full" />
                  )}
                  <Icon
                    className={cn(
                      'w-5 h-5 shrink-0 transition-colors',
                      isActive ? 'text-brand-400' : 'text-slate-400 group-hover:text-slate-200'
                    )}
                  />
                  {!collapsed && (
                    <div className="flex items-center justify-between flex-1 truncate">
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {item.badge}
                        </span>
                      )}
                      {item.count !== undefined && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">
                          {item.count}
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* RAG Engine Status Pill */}
          {!collapsed && (
            <div className="mx-4 mt-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Database className="w-4 h-4 text-emerald-400 animate-pulse" />
              </div>
              <div className="flex-1 truncate">
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <span>ChromaDB Vector</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  {documents.length} Docs • text-embedding-004
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom User Area */}
        <div className="p-3 border-t border-white/10 bg-[#080C14]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-3 truncate">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                alt={user?.name || 'User'}
                className="w-9 h-9 rounded-lg object-cover ring-1 ring-brand-500/40 shrink-0"
              />
              {!collapsed && (
                <div className="flex flex-col truncate">
                  <span className="text-xs font-semibold text-white truncate">{user?.name || 'Scholar'}</span>
                  <span className="text-[10px] text-slate-400 truncate">{user?.department || 'CSE Student'}</span>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
