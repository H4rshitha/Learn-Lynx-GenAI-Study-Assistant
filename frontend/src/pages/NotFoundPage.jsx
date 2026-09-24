import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { GlassCard } from '../components/common/GlassCard';
import {
  Brain,
  Home,
  ArrowLeft,
  Search,
  BookOpen,
  Award,
  Calendar,
  Activity,
  Sparkles,
  Compass,
} from 'lucide-react';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  const suggestedLinks = [
    { title: 'AI Workspace', path: '/workspace', icon: Brain, desc: 'Chat with LangGraph Socratic AI' },
    { title: 'Knowledge Base', path: '/knowledge-base', icon: BookOpen, desc: 'Search indexed textbooks' },
    { title: 'Quiz Studio', path: '/quiz-studio', icon: Award, desc: 'Test knowledge with MCQs' },
    { title: 'Study Planner', path: '/study-planner', icon: Calendar, desc: 'Adaptive revision calendar' },
    { title: 'AI Analytics', path: '/analytics', icon: Activity, desc: 'Telemetry & LLM metrics' },
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-2xl w-full text-center relative z-10 space-y-8 animate-fadeIn">
        {/* Animated Badge & Hero Code */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-cyan-400 text-xs font-semibold shadow-inner">
            <Compass className="w-4 h-4 animate-spin text-cyan-400" />
            <span>404 — Route Not Found</span>
          </div>

          <h1 className="text-7xl sm:text-9xl font-black font-display tracking-tight bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
            404
          </h1>

          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Lost in the Knowledge Graph?
          </h2>

          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            The study note, assessment, or page you were trying to access does not exist or has been reorganized in Learn-Lynx v2.
          </p>
        </div>

        {/* Suggested Quick Destinations */}
        <GlassCard className="p-6 text-left border-slate-800/80">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Jump Back to Active Study Modules:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suggestedLinks.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  to={item.path}
                  className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/40 transition-all flex items-center gap-3 group"
                >
                  <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-cyan-400 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </GlassCard>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button variant="gradient" size="md" onClick={() => navigate('/dashboard')}>
            <Home className="w-4 h-4 mr-2" />
            Return to Dashboard
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate(-1)}
            className="border-slate-700 hover:border-slate-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back Previous Page
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
