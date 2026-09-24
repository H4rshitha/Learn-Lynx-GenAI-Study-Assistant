import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { quizApi } from '../api/client';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  BrainCircuit,
  Sparkles,
  Award,
  Clock,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BookOpen,
  ChevronRight,
  TrendingUp,
  Flame,
  Target,
  Trophy,
  History,
  BarChart3,
  HelpCircle,
  AlertTriangle,
  FileText,
  Zap,
  Check,
  Search,
  Filter,
} from 'lucide-react';

export const QuizStudioPage = () => {
  const { documents, setStats } = useApp();

  // Navigation tabs: 'studio' | 'analytics' | 'leaderboard' | 'history'
  const [activeTab, setActiveTab] = useState('studio');

  // Studio Sub-State: 'config' | 'playing' | 'result'
  const [mode, setMode] = useState('config');

  // Quiz Configuration State
  const [selectedTopic, setSelectedTopic] = useState('All Documents');
  const [customTopic, setCustomTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionType, setQuestionType] = useState('mixed'); // 'mixed' | 'mcq' | 'true_false' | 'short_answer'
  const [questionCount, setQuestionCount] = useState(5);
  const [timeLimitPerQ, setTimeLimitPerQ] = useState(45); // seconds per question

  // Active Quiz State
  const [sessionId, setSessionId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [shortAnswerInput, setShortAnswerInput] = useState('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [recordedAnswers, setRecordedAnswers] = useState([]); // [{ question_id, user_answer, time_spent_sec }]
  const [timer, setTimer] = useState(45);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Result / Evaluation State
  const [quizResult, setQuizResult] = useState(null);
  const [expandedReviewId, setExpandedReviewId] = useState(null);

  // Analytics & Leaderboard State
  const [analyticsData, setAnalyticsData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Fetch Analytics & History on tab switch
  useEffect(() => {
    if (activeTab === 'analytics' || activeTab === 'leaderboard') {
      fetchAnalytics();
    } else if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const data = await quizApi.getAnalytics();
      setAnalyticsData(data);
    } catch (e) {
      console.warn('Error fetching quiz analytics:', e);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingAnalytics(true);
    try {
      const history = await quizApi.getHistory();
      setHistoryData(history);
    } catch (e) {
      console.warn('Error fetching quiz history:', e);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Live Timer during playing
  useEffect(() => {
    let interval = null;
    if (mode === 'playing' && timer > 0 && !isAnswerSubmitted) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
        setTotalTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else if (timer === 0 && !isAnswerSubmitted && mode === 'playing') {
      // Auto submit timeout
      handleInstantSubmit(currentQ?.type === 'short_answer' ? shortAnswerInput : selectedAnswer || 'No Answer (Timed Out)');
    }
    return () => clearInterval(interval);
  }, [mode, timer, isAnswerSubmitted, selectedAnswer, shortAnswerInput]);

  const currentQ = questions[currentIdx];

  const handleStartQuiz = async () => {
    setIsLoading(true);
    const targetTopic = customTopic.trim() ? customTopic.trim() : selectedTopic;
    try {
      const response = await quizApi.startQuiz({
        topic: targetTopic,
        difficulty,
        question_type: questionType,
        count: questionCount,
        time_limit_sec: timeLimitPerQ * questionCount,
      });

      setSessionId(response.session_id);
      setQuestions(response.questions || []);
      setCurrentIdx(0);
      setRecordedAnswers([]);
      setSelectedAnswer('');
      setShortAnswerInput('');
      setIsAnswerSubmitted(false);
      setTimer(timeLimitPerQ);
      setTotalTimeElapsed(0);
      setQuizResult(null);
      setMode('playing');
    } catch (e) {
      console.error('Quiz start error:', e);
      alert('Unable to synthesize quiz. Please check network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantSubmit = (answerVal) => {
    if (isAnswerSubmitted) return;
    const finalAnswer = String(answerVal || '').trim();
    setSelectedAnswer(finalAnswer);
    setIsAnswerSubmitted(true);

    const timeSpentOnThisQ = timeLimitPerQ - timer;
    setRecordedAnswers((prev) => [
      ...prev,
      {
        question_id: currentQ.id,
        user_answer: finalAnswer,
        time_spent_sec: Math.max(timeSpentOnThisQ, 1),
      },
    ]);
  };

  const handleNextOrFinish = async () => {
    if (currentIdx < questions.length - 1) {
      // Move to next question
      setCurrentIdx((prev) => prev + 1);
      setSelectedAnswer('');
      setShortAnswerInput('');
      setIsAnswerSubmitted(false);
      setTimer(timeLimitPerQ);
    } else {
      // Final submission to backend
      setIsLoading(true);
      const targetTopic = customTopic.trim() ? customTopic.trim() : selectedTopic;
      try {
        const payload = {
          session_id: sessionId,
          topic: targetTopic,
          difficulty,
          time_taken_sec: totalTimeElapsed,
          answers: recordedAnswers,
        };

        const result = await quizApi.submitQuiz(payload);
        setQuizResult(result);
        setMode('result');

        // Confetti celebration
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });

        // Update global AppContext stats
        if (setStats) {
          setStats((prev) => ({
            ...prev,
            quizAccuracy: result.accuracy,
            activeQuizzes: (prev.activeQuizzes || 0) + 1,
          }));
        }
      } catch (err) {
        console.error('Quiz evaluation error:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <DashboardLayout
      title="AI Quiz Studio"
      subtitle="Adaptive active-recall drills with grounded syllabus citations, multi-format questions, and instant Socratic evaluation"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => {
                setActiveTab('studio');
                if (mode === 'result') setMode('config');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono uppercase tracking-wider transition-all ${
                activeTab === 'studio'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Quiz Studio
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono uppercase tracking-wider transition-all ${
                activeTab === 'analytics'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Analytics & Weak Topics
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono uppercase tracking-wider transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Leaderboard
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono uppercase tracking-wider transition-all ${
                activeTab === 'history'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Attempt History
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="cyan" size="md">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              RAG Grounded Quiz Engine
            </Badge>
          </div>
        </div>

        {/* TAB 1: QUIZ STUDIO / PLAY */}
        {activeTab === 'studio' && (
          <>
            {/* 1.1 CONFIGURATION VIEW */}
            {mode === 'config' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Hero Feature Banner */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-brand-500/30 relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 shadow-glow-sm">
                        <BrainCircuit className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                          Synthesize AI Practice Assessment
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                          Configure multi-format cognitive drills with instant verification against uploaded textbook notes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Configurator Form */}
                <GlassCard className="p-6 sm:p-8 space-y-8">
                  {/* Topic & Syllabus Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-brand-400" />
                        Select Ingested Document
                      </label>
                      <select
                        value={selectedTopic}
                        onChange={(e) => {
                          setSelectedTopic(e.target.value);
                          setCustomTopic('');
                        }}
                        className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                      >
                        <option value="All Documents">All Knowledge Base Collections (Full Syllabus)</option>
                        {documents.map((doc) => (
                          <option key={doc.id} value={doc.title}>
                            {doc.title} ({doc.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider flex items-center gap-2">
                        <Target className="w-3.5 h-3.5 text-purple-400" />
                        Or Focus On Specific Topic
                      </label>
                      <input
                        type="text"
                        value={customTopic}
                        onChange={(e) => setCustomTopic(e.target.value)}
                        placeholder="e.g., Peterson Algorithm Invariants, Heuristic Admissibility"
                        className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Question Types & Difficulty */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                    {/* Question Format */}
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider">
                        Question Format
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { id: 'mixed', label: 'Mixed Studio', sub: 'MCQs, True/False & Short Answer' },
                          { id: 'mcq', label: 'Multiple Choice', sub: '4 Options, 1 Correct' },
                          { id: 'true_false', label: 'True / False', sub: 'Binary Theorem Verification' },
                          { id: 'short_answer', label: 'Short Answer', sub: 'Active Recall Typing' },
                        ].map((q) => (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => setQuestionType(q.id)}
                            className={`p-3 rounded-xl text-left border transition-all ${
                              questionType === q.id
                                ? 'bg-brand-600/20 border-brand-500 text-white shadow-sm shadow-brand-500/10'
                                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                            }`}
                          >
                            <div className="text-xs font-bold text-slate-200">{q.label}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{q.sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Cognitive Difficulty */}
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider">
                        Cognitive Difficulty
                      </label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {[
                          { id: 'Easy', label: 'Easy', desc: 'Foundational' },
                          { id: 'Medium', label: 'Medium', desc: 'Standard Exam' },
                          { id: 'Hard', label: 'Hard', desc: 'Deep Invariants' },
                        ].map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setDifficulty(d.id)}
                            className={`p-3 rounded-xl text-center border transition-all ${
                              difficulty === d.id
                                ? 'bg-purple-600/25 border-purple-500 text-white shadow-sm shadow-purple-500/10'
                                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                            }`}
                          >
                            <div className="text-xs font-bold text-slate-100">{d.label}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{d.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Question Count & Timer Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                    {/* Question Count */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider">
                        Question Count: <span className="text-brand-400 font-bold">{questionCount} Questions</span>
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[3, 5, 8, 10].map((cnt) => (
                          <button
                            key={cnt}
                            type="button"
                            onClick={() => setQuestionCount(cnt)}
                            className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                              questionCount === cnt
                                ? 'bg-brand-600 border-brand-500 text-white'
                                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {cnt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Timer Pace */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        Timed Quiz Mode (Per Question)
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { sec: 30, label: '30s (Blitz)' },
                          { sec: 45, label: '45s (Standard)' },
                          { sec: 90, label: '90s (Thoughtful)' },
                        ].map((t) => (
                          <button
                            key={t.sec}
                            type="button"
                            onClick={() => setTimeLimitPerQ(t.sec)}
                            className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                              timeLimitPerQ === t.sec
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Launch Action */}
                  <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-brand-400" />
                      <span>Questions synthesized from verified local RAG embeddings with full academic explanations.</span>
                    </div>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleStartQuiz}
                      isLoading={isLoading}
                      rightIcon={ArrowRight}
                      className="w-full sm:w-auto"
                    >
                      Generate & Start Timed Quiz
                    </Button>
                  </div>
                </GlassCard>
              </div>
            )}

            {/* 1.2 ACTIVE PLAYING VIEW */}
            {mode === 'playing' && currentQ && (
              <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
                {/* Progress Header & Live Timer */}
                <div className="flex items-center justify-between glass-panel p-4 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-brand-400 uppercase">
                      Question {currentIdx + 1} of {questions.length}
                    </span>
                    <Badge variant={currentQ.type === 'short_answer' ? 'cyan' : currentQ.type === 'true_false' ? 'purple' : 'brand'} size="sm">
                      {currentQ.type === 'short_answer' ? 'Short Answer' : currentQ.type === 'true_false' ? 'True / False' : 'Multiple Choice'}
                    </Badge>
                    <Badge variant="outline" size="sm">
                      {currentQ.difficulty}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                    <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                    <span className={timer <= 10 ? 'text-red-400 font-bold animate-pulse' : 'text-slate-200'}>
                      {timer}s remaining
                    </span>
                  </div>
                </div>

                {/* Question Arena Card */}
                <GlassCard className="p-6 sm:p-8 space-y-6">
                  {/* Context Citation Header */}
                  {currentQ.context_citation && (
                    <div className="text-[11px] font-mono text-indigo-300/80 flex items-center gap-1.5 pb-2 border-b border-white/5">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Syllabus Source: {currentQ.context_citation}</span>
                    </div>
                  )}

                  {/* Question Stem */}
                  <h3 className="text-lg sm:text-xl font-bold font-display text-white leading-relaxed">
                    {currentQ.question}
                  </h3>

                  {/* Interactive Options: MCQ & True/False */}
                  {(currentQ.type === 'mcq' || currentQ.type === 'true_false') && currentQ.options && (
                    <div className="space-y-3 pt-2">
                      {currentQ.options.map((opt, idx) => {
                        const isSelected = selectedAnswer === opt || selectedAnswer === String(idx);

                        let style = 'bg-slate-900/70 border-slate-800 hover:border-brand-500/50 text-slate-200';
                        if (isAnswerSubmitted) {
                          if (isSelected) {
                            style = 'bg-brand-600/25 border-brand-500 text-white font-medium';
                          } else {
                            style = 'bg-slate-900/30 border-slate-800/60 text-slate-500 opacity-60';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            disabled={isAnswerSubmitted}
                            onClick={() => handleInstantSubmit(opt)}
                            className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center justify-between ${style}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-lg bg-white/5 font-mono text-xs flex items-center justify-center shrink-0">
                                {currentQ.type === 'true_false' ? (idx === 0 ? 'T' : 'F') : String.fromCharCode(65 + idx)}
                              </span>
                              <span>{opt}</span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-brand-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Interactive Input: Short Answer */}
                  {currentQ.type === 'short_answer' && (
                    <div className="space-y-3 pt-2">
                      <label className="text-xs text-slate-400 font-mono">
                        Type your conceptual explanation below:
                      </label>
                      <textarea
                        disabled={isAnswerSubmitted}
                        value={shortAnswerInput}
                        onChange={(e) => setShortAnswerInput(e.target.value)}
                        placeholder="Explain the key invariant or difference in 1-3 sentences..."
                        rows={4}
                        className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 disabled:opacity-75 transition-all"
                      />

                      {!isAnswerSubmitted && (
                        <div className="flex justify-end">
                          <Button
                            variant="primary"
                            size="md"
                            disabled={!shortAnswerInput.trim()}
                            onClick={() => handleInstantSubmit(shortAnswerInput)}
                          >
                            Submit Answer for Evaluation
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hint Accordion */}
                  {currentQ.hint && !isAnswerSubmitted && (
                    <div className="pt-2 text-xs text-slate-400 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-amber-400/80" />
                      <span><strong>Hint:</strong> {currentQ.hint}</span>
                    </div>
                  )}

                  {/* Instant Socratic Feedback Panel */}
                  {isAnswerSubmitted && (
                    <div className="p-4 rounded-xl bg-slate-900/95 border border-brand-500/40 space-y-2 animate-fadeIn">
                      <div className="flex items-center gap-2 text-xs font-bold text-brand-300 font-mono uppercase">
                        <Sparkles className="w-4 h-4 text-brand-400" />
                        <span>Answer Locked • Ready for Socratic Evaluation</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Your answer is recorded. Instant grading and grounded syllabus citations will be computed upon completion.
                      </p>
                    </div>
                  )}

                  {/* Next / Complete Action */}
                  {isAnswerSubmitted && (
                    <div className="flex justify-end pt-2">
                      <Button
                        variant="primary"
                        size="md"
                        onClick={handleNextOrFinish}
                        isLoading={isLoading}
                        rightIcon={ChevronRight}
                      >
                        {currentIdx < questions.length - 1 ? 'Next Question' : 'Complete & Instant Evaluate'}
                      </Button>
                    </div>
                  )}
                </GlassCard>
              </div>
            )}

            {/* 1.3 RESULTS & SCOREBOARD VIEW */}
            {mode === 'result' && quizResult && (
              <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
                <GlassCard className="p-8 sm:p-10 text-center space-y-6">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center mx-auto shadow-glow-md">
                    <Award className="w-10 h-10 text-white" />
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                      Assessment Evaluation Completed!
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      Targeted active-recall performance analyzed against course notes
                    </p>
                  </div>

                  {/* Score & Analytics Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Score</span>
                      <div className="text-2xl font-black text-white font-display mt-1">
                        {quizResult.score}/{quizResult.total_questions}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Accuracy</span>
                      <div className={`text-2xl font-black font-display mt-1 ${quizResult.accuracy >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {quizResult.accuracy}%
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Time Taken</span>
                      <div className="text-2xl font-black text-indigo-300 font-display mt-1">
                        {quizResult.time_taken_sec}s
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">XP Earned</span>
                      <div className="text-2xl font-black text-brand-400 font-display mt-1">
                        +{quizResult.rank_points_earned} XP
                      </div>
                    </div>
                  </div>

                  {/* Weak Topic Detection Alert */}
                  {quizResult.weak_topics && quizResult.weak_topics.length > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-300 font-mono uppercase">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span>Weak Topic Detected • Saved to Persistent Memory</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {quizResult.weak_topics.map((wt, idx) => (
                          <Badge key={idx} variant="amber" size="sm">
                            {wt}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Revision Suggestions */}
                  {quizResult.revision_suggestions && (
                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-brand-500/20 text-left space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-brand-300 font-mono uppercase">
                        <Sparkles className="w-4 h-4 text-brand-400" />
                        <span>AI Revision Action Plan</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {quizResult.revision_suggestions.map((sug, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-brand-400 font-bold">•</span>
                            <span>{sug}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-white/10">
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => setMode('config')}
                      leftIcon={RotateCcw}
                    >
                      New Quiz Setup
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleStartQuiz}
                      leftIcon={Sparkles}
                    >
                      Retake Drill
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => setActiveTab('analytics')}
                      leftIcon={BarChart3}
                    >
                      View Full Analytics
                    </Button>
                  </div>
                </GlassCard>

                {/* Detailed Question Review Breakdown */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-400" />
                    Detailed Question Evaluation & Explanations
                  </h3>

                  <div className="space-y-3">
                    {quizResult.evaluations?.map((ev, idx) => (
                      <GlassCard key={idx} className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-slate-400">
                                Question {idx + 1}
                              </span>
                              <Badge variant={ev.is_correct ? 'emerald' : 'rose'} size="sm">
                                {ev.is_correct ? 'Correct' : 'Incorrect'}
                              </Badge>
                              <Badge variant="outline" size="sm">
                                {ev.concept_tag}
                              </Badge>
                            </div>
                            <h4 className="text-sm font-semibold text-slate-100">{ev.question}</h4>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span className="text-[10px] text-slate-500 uppercase font-mono block">Your Answer</span>
                            <span className={ev.is_correct ? 'text-emerald-300 font-medium' : 'text-rose-300 font-medium'}>
                              {ev.user_answer}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span className="text-[10px] text-slate-500 uppercase font-mono block">Correct / Model Answer</span>
                            <span className="text-slate-200 font-medium">{ev.correct_answer}</span>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-brand-950/20 border border-brand-500/20 text-xs text-slate-300 space-y-1">
                          <div className="font-bold text-brand-300 font-mono text-[11px] uppercase flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-brand-400" />
                            Academic Explanation
                          </div>
                          <p>{ev.explanation}</p>
                          {ev.citation && (
                            <div className="text-[10px] text-indigo-300 font-mono pt-1">
                              Source Citation: {ev.citation}
                            </div>
                          )}
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB 2: ANALYTICS & TOPIC MASTERY */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fadeIn">
            {loadingAnalytics ? (
              <div className="text-center py-20 text-slate-400 font-mono text-sm">
                Aggregating topic mastery metrics...
              </div>
            ) : analyticsData ? (
              <>
                {/* Aggregate KPI Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <GlassCard className="p-5">
                    <span className="text-xs text-slate-400 uppercase font-mono">Overall Accuracy</span>
                    <div className="text-2xl font-black text-emerald-400 font-display mt-1">
                      {analyticsData.overall_accuracy}%
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Across all drills</span>
                  </GlassCard>

                  <GlassCard className="p-5">
                    <span className="text-xs text-slate-400 uppercase font-mono">Quizzes Taken</span>
                    <div className="text-2xl font-black text-white font-display mt-1">
                      {analyticsData.total_quizzes}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">{analyticsData.total_questions_answered} questions</span>
                  </GlassCard>

                  <GlassCard className="p-5">
                    <span className="text-xs text-slate-400 uppercase font-mono">Time Spent</span>
                    <div className="text-2xl font-black text-indigo-300 font-display mt-1">
                      {analyticsData.total_time_spent_min} min
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Active recall time</span>
                  </GlassCard>

                  <GlassCard className="p-5">
                    <span className="text-xs text-slate-400 uppercase font-mono">Study Streak</span>
                    <div className="text-2xl font-black text-amber-400 font-display mt-1 flex items-center gap-1.5">
                      <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                      {analyticsData.current_streak_days} Days
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Continuous consistency</span>
                  </GlassCard>
                </div>

                {/* Topic-Wise Performance Mastery */}
                <GlassCard className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold font-display text-white">Topic-Wise Performance</h3>
                      <p className="text-xs text-slate-400">Mastery breakdown by course subject</p>
                    </div>
                    <Badge variant="brand" size="sm">
                      {analyticsData.topic_mastery?.length || 0} Topics Tracked
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {analyticsData.topic_mastery?.map((tm, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-200">{tm.topic}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-100">{tm.accuracy}%</span>
                            <Badge
                              variant={tm.status === 'Mastered' ? 'emerald' : tm.status === 'Proficient' ? 'purple' : 'amber'}
                              size="sm"
                            >
                              {tm.status}
                            </Badge>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              tm.accuracy >= 85 ? 'bg-emerald-500' : tm.accuracy >= 65 ? 'bg-brand-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${tm.accuracy}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Weak Topic Detection & Revision Suggestions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Weak Topics */}
                  <GlassCard className="p-6 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-white font-display">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Detected Weak Topics (Priority Attention)
                    </div>
                    <div className="space-y-2">
                      {analyticsData.weak_topics?.map((wt, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
                          <span className="text-amber-200 font-medium">{wt}</span>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedTopic(wt);
                              setCustomTopic(wt);
                              setActiveTab('studio');
                              setMode('config');
                            }}
                          >
                            Drill Now
                          </Button>
                        </div>
                      ))}
                    </div>
                  </GlassCard>

                  {/* Revision Suggestions */}
                  <GlassCard className="p-6 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-white font-display">
                      <Sparkles className="w-4 h-4 text-brand-400" />
                      AI Socratic Revision Suggestions
                    </div>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {analyticsData.revision_suggestions?.map((sug, idx) => (
                        <li key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                          <span>{sug}</span>
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* TAB 3: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
            <GlassCard className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-display text-white">Scholar Leaderboard</h3>
                    <p className="text-xs text-slate-400">Top learners ranked by accuracy and active recall drills</p>
                  </div>
                </div>
              </div>

              {loadingAnalytics ? (
                <div className="text-center py-12 text-slate-400 font-mono text-xs">Loading leaderboard ranks...</div>
              ) : (
                <div className="space-y-3">
                  {analyticsData?.leaderboard?.map((entry) => (
                    <div
                      key={entry.rank}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                        entry.is_current_user
                          ? 'bg-brand-600/20 border-brand-500 shadow-md shadow-brand-500/10'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-mono">
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{entry.user_name}</span>
                            {entry.is_current_user && (
                              <Badge variant="cyan" size="sm">You</Badge>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">{entry.badge}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-right">
                        <div>
                          <span className="text-xs font-mono text-emerald-400 font-bold">{entry.accuracy}%</span>
                          <span className="text-[10px] text-slate-500 block font-mono">Accuracy</span>
                        </div>
                        <div>
                          <span className="text-xs font-mono text-brand-300 font-bold">{entry.points} XP</span>
                          <span className="text-[10px] text-slate-500 block font-mono">{entry.quizzes_completed} Quizzes</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {/* TAB 4: ATTEMPT HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
            <GlassCard className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-display text-white">Quiz Attempt History</h3>
                    <p className="text-xs text-slate-400">Past assessment logs with accuracy and weak topic tracking</p>
                  </div>
                </div>
              </div>

              {loadingAnalytics ? (
                <div className="text-center py-12 text-slate-400 font-mono text-xs">Loading past attempts...</div>
              ) : historyData.length === 0 ? (
                <div className="text-center py-12 text-slate-500 font-mono text-xs">
                  No previous quiz attempts recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {historyData.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-100">{item.topic}</h4>
                          <span className="text-[11px] text-slate-500 font-mono">{item.created_at}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge variant="purple" size="sm">{item.difficulty}</Badge>
                          <span className="text-xs font-bold text-white font-mono">{item.score}/{item.total_questions}</span>
                          <Badge variant={item.accuracy >= 75 ? 'emerald' : 'amber'} size="sm">
                            {item.accuracy}%
                          </Badge>
                        </div>
                      </div>

                      {item.weak_concepts && item.weak_concepts.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] text-amber-300">
                          <span className="text-slate-500 font-mono">Weak Invariants:</span>
                          {item.weak_concepts.map((wc, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                              {wc}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
