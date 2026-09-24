import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/common/Button';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Bot,
  HelpCircle,
  Database,
  Cpu,
  Layers,
  Zap,
  CheckCircle2,
  FileText,
  Clock,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleLaunchDemo = async () => {
    await demoLogin();
    navigate('/dashboard');
  };

  const featureCards = [
    {
      icon: Database,
      iconColor: 'text-brand-400 bg-brand-500/10 border-brand-500/30',
      title: 'Document-Grounded RAG',
      desc: 'Upload lecture slides, textbooks, and notes. Learn-Lynx indexes them into ChromaDB vectors with 768-dim embeddings to eliminate hallucinations.',
      badge: 'Zero Hallucinations',
    },
    {
      icon: Bot,
      iconColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      title: 'Agentic Academic Tutor',
      desc: 'Powered by Gemini 1.5. Engages in multi-turn Socratic dialogues, generates step-by-step mathematical proofs, and visualizes complex code structures.',
      badge: 'Gemini 1.5 Pro',
    },
    {
      icon: HelpCircle,
      iconColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      title: 'Adaptive Quiz Studio',
      desc: 'Instantly transforms your documents into challenging MCQs with automated difficulty adjustment and deep concept explanations.',
      badge: 'Smart MCQs',
    },
    {
      icon: Clock,
      iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      title: 'Cognitive Study Planner',
      desc: 'Automates revision timetables using spaced repetition principles, exam countdowns, and topic mastery tracking.',
      badge: 'Spaced Repetition',
    },
    {
      icon: TrendingUp,
      iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      title: 'AI Analytics & Heatmaps',
      desc: 'Pinpoints conceptual weak spots, tracks retrieval confidence, and highlights topics needing urgent revision before exams.',
      badge: 'Deep Insights',
    },
    {
      icon: ShieldCheck,
      iconColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      title: 'Citation Grounding',
      desc: 'Every AI response highlights exact PDF page numbers, chunks, and similarity scores so you can cross-verify source material instantly.',
      badge: 'Verifiable',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Upload Syllabus & Notes',
      desc: 'Drag and drop PDFs or text documents. pdfplumber extracts clean text into vector chunks.',
    },
    {
      step: '02',
      title: 'Vector Embedding & ChromaDB',
      desc: 'Embeddings are calculated using text-embedding-004 and stored in local Chroma collections.',
    },
    {
      step: '03',
      title: 'Contextual Retrieval (RAG)',
      desc: 'When you ask a question, the top relevant chunks are dynamically retrieved with cosine similarity.',
    },
    {
      step: '04',
      title: 'Gemini Reasoning & Tutor Chat',
      desc: 'Gemini synthesizes grounded answers, practice questions, and code examples in real-time.',
    },
  ];

  const stats = [
    { value: '99.4%', label: 'Factual Grounding Accuracy' },
    { value: '10x', label: 'Faster Concept Revision' },
    { value: '768-D', label: 'Vector Embedding Precision' },
    { value: '100%', label: 'Syllabus Alignment' },
  ];

  const faqs = [
    {
      q: 'How does Learn-Lynx prevent AI hallucinations?',
      a: 'Learn-Lynx uses Retrieval-Augmented Generation (RAG) backed by ChromaDB. Before answering, the system retrieves the most relevant paragraphs from your uploaded course notes and instructs Google Gemini to ground its explanation strictly in those verified excerpts.',
    },
    {
      q: 'What types of documents can I upload?',
      a: 'You can upload lecture slides, PDF textbooks, handwritten typed notes, and research papers. Our extraction pipeline processes tables, text, and technical outlines efficiently.',
    },
    {
      q: 'Can I generate quizzes from my own notes?',
      a: 'Yes! The Quiz Studio extracts key definitions, conceptual relationships, and formulas from your uploaded documents to generate multi-choice quizzes with timer controls and instant answer feedback.',
    },
    {
      q: 'Is my study data private?',
      a: 'Your document vectors and chat sessions are stored locally in your workspace session and authenticated user profile.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 selection:bg-brand-500/30 selection:text-brand-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        {/* Glow Mesh Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-brand-600/20 via-purple-600/20 to-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Top Pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-brand-500/30 mb-8 shadow-glow-sm"
          >
            <Sparkles className="w-4 h-4 text-brand-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-200 tracking-wide">
              Introducing Learn-Lynx v2.0 • Enterprise Agentic AI
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/30 text-brand-200 font-mono">
              NEW
            </span>
          </motion.div>

          {/* Main Hero Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-display tracking-tight text-white max-w-5xl mx-auto leading-[1.15]"
          >
            Master Any Subject with{' '}
            <span className="gradient-text">Agentic AI Reasoning</span> & Grounded RAG
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mt-6 leading-relaxed"
          >
            Turn complex textbooks and lecture slides into interactive Socratic dialogues, automated MCQs, and structured revision plans powered by Google Gemini and ChromaDB.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
          >
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="primary" size="lg" rightIcon={ArrowRight}>
                  Go to Student Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/signup">
                  <Button variant="primary" size="lg" rightIcon={ArrowRight}>
                    Get Started Free
                  </Button>
                </Link>
                <button onClick={handleLaunchDemo}>
                  <Button variant="secondary" size="lg" leftIcon={Zap}>
                    Instant 1-Click Demo
                  </Button>
                </button>
              </>
            )}
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16 pt-10 border-t border-white/10"
          >
            {stats.map((stat, idx) => (
              <div key={idx} className="p-4 rounded-xl glass-card text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-display gradient-text">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-400 mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Interactive App Preview Showcase */}
      <section id="demo-preview" className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="relative rounded-3xl p-1 bg-gradient-to-r from-brand-600/40 via-purple-600/40 to-cyan-500/40 shadow-glow-lg">
          <div className="bg-[#0D1322] rounded-[22px] p-4 sm:p-8 border border-white/10 overflow-hidden">
            {/* Window titlebar */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-slate-400 ml-2">learn-lynx-workspace // Gemini 1.5 Pro</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="emerald" size="sm" dot>ChromaDB Vector Synced</Badge>
              </div>
            </div>

            {/* Mock Chat & Tutor Interface Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Context Pane */}
              <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-4">
                <div className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider">
                  Indexed Document Context
                </div>
                <div className="p-3 rounded-lg bg-slate-900/90 border border-brand-500/30">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <FileText className="w-4 h-4 text-brand-400" />
                    <span>Operating Systems - Lecture 8.pdf</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-3">
                    "Process synchronization involves Peterson's algorithm, semaphores, and monitor invariants to prevent race conditions..."
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-indigo-300 font-mono">
                    <span>Similarity: 0.94</span>
                    <span>Page 24</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="text-xs font-medium text-slate-300">Active Persona</div>
                  <div className="text-xs text-brand-300 font-mono mt-1">Socratic Academic Tutor</div>
                </div>
              </div>

              {/* Right Mock Conversation */}
              <div className="lg:col-span-2 space-y-4">
                {/* User Message */}
                <div className="flex items-start gap-3 justify-end">
                  <div className="max-w-md bg-brand-600/30 border border-brand-500/40 p-3.5 rounded-2xl rounded-tr-none text-xs text-slate-100">
                    How does Peterson's solution ensure mutual exclusion without hardware support?
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    U
                  </div>
                </div>

                {/* Assistant Grounded Message */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-glow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1 max-w-xl glass-card p-4 rounded-2xl rounded-tl-none border border-white/10 text-xs text-slate-200 space-y-2">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                      <span className="font-semibold text-indigo-300">Learn-Lynx RAG Assistant</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        96.8% Confidence
                      </span>
                    </div>
                    <p>
                      **Peterson's algorithm** achieves mutual exclusion between two processes using two shared variables:
                    </p>
                    <div className="bg-[#070A11] p-2.5 rounded-lg font-mono text-[11px] text-indigo-300 border border-slate-800">
                      <code>int turn; boolean flag[2]; // flag[i] = true & turn = j</code>
                    </div>
                    <p className="text-slate-400">
                      Mutual exclusion is preserved because process $P_i$ can only enter when <code className="text-brand-300">flag[j] == false</code> or <code className="text-brand-300">turn == i</code>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="purple" size="md" className="mb-4">Features Overview</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-display text-white tracking-tight">
            Designed for Academic Excellence
          </h2>
          <p className="text-slate-400 text-base mt-4">
            Everything you need to digest dense course materials, test your comprehension, and retain knowledge effortlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <GlassCard key={idx} hoverEffect className="flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${card.iconColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant="slate" size="sm">{card.badge}</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors font-display">
                    {card.title}
                  </h3>
                  <p className="text-sm text-slate-400 mt-2.5 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-xs font-semibold text-brand-400 group-hover:text-brand-300 transition-colors">
                  Explore capability <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* Step-by-Step Architecture Pipeline */}
      <section id="architecture" className="py-20 bg-slate-950/60 border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="cyan" size="md" className="mb-4">System Workflow</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
              The Learn-Lynx RAG Architecture
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              How your course documents are ingested, transformed into dense embeddings, and synthesized into answers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div key={idx} className="glass-card p-6 rounded-2xl relative group">
                <div className="text-3xl font-extrabold font-mono text-brand-500/40 mb-3 group-hover:text-brand-400 transition-colors">
                  {step.step}
                </div>
                <h3 className="text-base font-bold text-white font-display mb-2">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <Badge variant="brand" size="md" className="mb-4">FAQ</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <GlassCard key={idx} className="p-6">
              <h3 className="text-base font-bold text-white mb-2 font-display flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-brand-400 shrink-0" />
                {faq.q}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed pl-6">{faq.a}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-brand-900/60 via-indigo-900/60 to-purple-900/60 border border-brand-500/30 text-center relative overflow-hidden shadow-glow-lg">
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
              Ready to Accelerate Your Academic Mastery?
            </h2>
            <p className="text-slate-300 text-base">
              Experience modern AI-driven study sessions grounded in your exact university syllabus and notes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/signup">
                <Button variant="primary" size="lg" rightIcon={ArrowRight}>
                  Create Free Student Account
                </Button>
              </Link>
              <button onClick={handleLaunchDemo}>
                <Button variant="secondary" size="lg" leftIcon={Zap}>
                  Launch 1-Click Demo
                </Button>
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
