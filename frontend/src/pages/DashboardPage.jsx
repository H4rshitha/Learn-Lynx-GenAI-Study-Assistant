import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  FileText,
  MessageSquare,
  Award,
  Clock,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  PlusCircle,
  BookOpen,
  HelpCircle,
  Calendar,
  CheckCircle2,
  Circle,
  Database,
  Layers,
  ChevronRight,
  Bot,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { documents, chats, goals, toggleGoal, stats } = useApp();
  const navigate = useNavigate();

  const statCards = [
    {
      title: 'Uploaded Documents',
      value: documents.length,
      subvalue: `${documents.reduce((acc, d) => acc + (d.chunksCount || 0), 0)} ChromaDB Chunks`,
      icon: FileText,
      color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400',
      trend: '+2 this week',
    },
    {
      title: 'Total AI Queries',
      value: stats.totalQueries,
      subvalue: 'Multi-turn RAG Reasoning',
      icon: MessageSquare,
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
      trend: '+18% vs last week',
    },
    {
      title: 'Quiz Accuracy',
      value: `${stats.quizAccuracy}%`,
      subvalue: 'Across 4 Topic Assessments',
      icon: Award,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
      trend: 'Top 5% in Class',
    },
    {
      title: 'Study Hours',
      value: `${stats.studyHours} hrs`,
      subvalue: `${stats.streakDays}-day streak active 🔥`,
      icon: Clock,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
      trend: '4.5 hrs today',
    },
    {
      title: 'AI Confidence Average',
      value: `${stats.aiConfidenceAvg}%`,
      subvalue: 'text-embedding-004 precision',
      icon: Sparkles,
      color: 'from-cyan-500/20 to-brand-500/20 border-cyan-500/30 text-cyan-400',
      trend: 'Verified Grounded',
    },
  ];

  const quickActions = [
    {
      title: 'Ask AI Workspace',
      desc: 'Socratic tutoring with citations',
      icon: Bot,
      path: '/workspace',
      color: 'hover:border-brand-500/60 bg-brand-500/5',
    },
    {
      title: 'Upload Syllabus Notes',
      desc: 'Extract & vector embed in ChromaDB',
      icon: Database,
      path: '/knowledge-base',
      color: 'hover:border-purple-500/60 bg-purple-500/5',
    },
    {
      title: 'Adaptive Quiz Studio',
      desc: 'Generate instant MCQs from notes',
      icon: HelpCircle,
      path: '/quiz-studio',
      color: 'hover:border-emerald-500/60 bg-emerald-500/5',
    },
    {
      title: 'Plan Study Timetable',
      desc: 'Exam goals & spaced repetition',
      icon: Calendar,
      path: '/study-planner',
      color: 'hover:border-amber-500/60 bg-amber-500/5',
    },
  ];

  return (
    <DashboardLayout
      title={`Hello, ${user?.name?.split(' ')[0] || 'Scholar'} 👋`}
      subtitle={`${user?.department || 'Computer Science'} • ${user?.semester || '6th Sem'}`}
    >
      <div className="space-y-8">
        {/* Top Hero Banner */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-brand-900/40 via-purple-900/30 to-slate-900/80 border border-brand-500/30 overflow-hidden shadow-glow-sm">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-500/40 text-brand-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Agentic AI Grounding Active</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
                Ready to review Operating Systems & Concurrency today?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                You have 4 active knowledge base documents indexed and 2 upcoming study goals due tonight.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={() => navigate('/workspace')}
                leftIcon={Sparkles}
              >
                Launch AI Tutor
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/quiz-studio')}
                leftIcon={HelpCircle}
              >
                Take Quiz
              </Button>
            </div>
          </div>
        </div>

        {/* 5 Primary Widgets */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-slate-300">
              Key Metrics & Intelligence
            </h3>
            <span className="text-xs text-brand-400 cursor-pointer hover:underline" onClick={() => navigate('/analytics')}>
              View Detailed Analytics →
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {statCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <GlassCard key={idx} hoverEffect className="p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">{card.title}</span>
                    <div className={`p-2 rounded-xl bg-gradient-to-br border ${card.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="my-3">
                    <div className="text-2xl font-black font-display text-white">{card.value}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">{card.subvalue}</div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>{card.trend}</span>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* Quick Launchpad Grid */}
        <div>
          <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-slate-300 mb-4">
            Quick Action Launchpad
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Link key={idx} to={action.path}>
                  <GlassCard hoverEffect className={`p-5 h-full flex flex-col justify-between ${action.color}`}>
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-brand-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                    </div>
                    <div className="mt-4">
                      <h4 className="text-sm font-bold text-white font-display">{action.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">{action.desc}</p>
                    </div>
                  </GlassCard>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Content 2-Column Split: Recent Chats vs Active Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Recent Chats */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-slate-300 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-400" />
                Recent Grounded AI Chats
              </h3>
              <Link to="/workspace" className="text-xs text-brand-400 hover:text-brand-300">
                Open Workspace →
              </Link>
            </div>

            <div className="space-y-3">
              {chats.map((chat) => (
                <GlassCard
                  key={chat.id}
                  hoverEffect
                  onClick={() => navigate('/workspace')}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white truncate font-display">{chat.title}</h4>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">{chat.preview}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                      <span className="flex items-center gap-1 text-indigo-300">
                        <FileText className="w-3 h-3" /> {chat.docSource}
                      </span>
                      <span>• {chat.timestamp}</span>
                      <span>• {chat.messagesCount} turns</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="sm" rightIcon={ChevronRight}>
                      Resume
                    </Button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Right 1 Col: Active Study Goals */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-slate-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                Active Study Goals
              </h3>
              <Link to="/study-planner" className="text-xs text-purple-400 hover:text-purple-300">
                Manage →
              </Link>
            </div>

            <GlassCard className="p-5 space-y-4">
              <div className="divide-y divide-white/5 space-y-3">
                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className="pt-3 first:pt-0 flex items-start gap-3 cursor-pointer group"
                  >
                    <button className="mt-0.5 text-slate-400 group-hover:text-brand-400 transition-colors">
                      {goal.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-semibold ${
                          goal.completed ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        {goal.title}
                      </p>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                        <span>{goal.subject}</span>
                        <span className="text-amber-400 font-mono">{goal.dueDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => navigate('/study-planner')}
                  leftIcon={PlusCircle}
                >
                  Add Custom Goal
                </Button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
