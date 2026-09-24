import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { plannerApi, quizApi } from '../api/client';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  PlusCircle,
  Sparkles,
  Flame,
  Target,
  BookOpen,
  CalendarCheck,
  RotateCcw,
  Zap,
  TrendingUp,
  AlertTriangle,
  Layers,
  ListTodo,
  Timer,
  Play,
  Pause,
  ArrowRight,
  HelpCircle,
  ChevronRight,
  Check,
  Activity,
} from 'lucide-react';

export const StudyPlannerPage = () => {
  const navigate = useNavigate();
  const { documents } = useApp();

  // Active View Tab: 'calendar' | 'checklist' | 'spaced_repetition' | 'pomodoro' | 'weekly_phases'
  const [activeView, setActiveView] = useState('calendar');

  // Study Plan Data State
  const [planData, setPlanData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdapting, setIsAdapting] = useState(false);
  const [adaptiveMessage, setAdaptiveMessage] = useState(null);

  // Planner Agent Inputs Modal State
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [examDate, setExamDate] = useState('2026-04-20');
  const [selectedSubjects, setSelectedSubjects] = useState(['Operating Systems', 'Artificial Intelligence', 'Database Systems']);
  const [hoursPerDay, setHoursPerDay] = useState(4.0);
  const [difficulty, setDifficulty] = useState('Standard');
  const [priority, setPriority] = useState('Weak Topics First');
  const [customWeakTopic, setCustomWeakTopic] = useState('');
  const [weakTopicsList, setWeakTopicsList] = useState([
    'Process Synchronization & Peterson Invariants',
    'A* Search Admissible vs Consistent Heuristics',
    'Relational 3NF & BCNF Decomposition',
  ]);

  // Pomodoro Live Timer State
  const [pomoMode, setPomoMode] = useState('focus'); // 'focus' | 'shortBreak' | 'longBreak'
  const [pomoSeconds, setPomoSeconds] = useState(25 * 60);
  const [isPomoRunning, setIsPomoRunning] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(3);

  // Fetch initial active plan on mount
  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    setIsLoading(true);
    try {
      const data = await plannerApi.getCurrentPlan();
      setPlanData(data);
    } catch (e) {
      console.warn('Error loading plan:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Pomodoro Tick Effect
  useEffect(() => {
    let interval = null;
    if (isPomoRunning && pomoSeconds > 0) {
      interval = setInterval(() => {
        setPomoSeconds((prev) => prev - 1);
      }, 1000);
    } else if (pomoSeconds === 0 && isPomoRunning) {
      setIsPomoRunning(false);
      if (pomoMode === 'focus') {
        setCompletedCycles((prev) => prev + 1);
        setPomoMode('shortBreak');
        setPomoSeconds(5 * 60);
      } else {
        setPomoMode('focus');
        setPomoSeconds(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isPomoRunning, pomoSeconds, pomoMode]);

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    try {
      const payload = {
        exam_date: examDate,
        subjects: selectedSubjects,
        hours_per_day: hoursPerDay,
        difficulty,
        priority,
        weak_topics: weakTopicsList,
      };
      const newPlan = await plannerApi.generatePlan(payload);
      setPlanData(newPlan);
      setShowConfigModal(false);
      setAdaptiveMessage('🚀 LangGraph Planner Agent synthesized a new personalized multi-tier study schedule.');
    } catch (e) {
      alert('Error generating plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdaptWithQuizResults = async () => {
    setIsAdapting(true);
    try {
      // Fetch latest analytics to grab detected weak topics
      const analytics = await quizApi.getAnalytics();
      const newWeak = analytics.weak_topics || [];

      const adapted = await plannerApi.adaptPlan({
        plan_id: planData?.plan_id,
        recent_quiz_score: analytics.overall_accuracy,
        new_weak_topics: newWeak,
      });

      setPlanData(adapted);
      setAdaptiveMessage(
        `⚡ Plan dynamically adapted: Injected high-priority drills for '${newWeak[0] || 'Identified Weak Invariants'}'.`
      );
    } catch (e) {
      console.warn('Error adapting plan:', e);
    } finally {
      setIsAdapting(false);
    }
  };

  const handleToggleTask = async (taskId, currentStatus) => {
    const newStatus = !currentStatus;

    // Optimistic UI update
    if (planData) {
      const updatedDaily = planData.daily_plan.map((day) => ({
        ...day,
        tasks: day.tasks.map((t) => (t.id === taskId ? { ...t, completed: newStatus } : t)),
      }));
      const allTasks = updatedDaily.flatMap((d) => d.tasks);
      const done = allTasks.filter((t) => t.completed).length;
      const pct = Math.round((done / Math.max(allTasks.length, 1)) * 100);

      setPlanData({
        ...planData,
        daily_plan: updatedDaily,
        completed_tasks: done,
        total_tasks: allTasks.length,
        completion_percentage: pct,
      });
    }

    try {
      await plannerApi.toggleTask({ task_id: taskId, completed: newStatus });
    } catch (e) {
      console.warn('Toggle task background sync error:', e);
    }
  };

  const handleAddWeakTopic = () => {
    if (customWeakTopic.trim() && !weakTopicsList.includes(customWeakTopic.trim())) {
      setWeakTopicsList((prev) => [...prev, customWeakTopic.trim()]);
      setCustomWeakTopic('');
    }
  };

  const handleRemoveWeakTopic = (topicToRemove) => {
    setWeakTopicsList((prev) => prev.filter((t) => t !== topicToRemove));
  };

  const formatPomoTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <DashboardLayout
      title="AI Study Planning Agent"
      subtitle="LangGraph-powered adaptive exam timetable, spaced repetition intervals, daily checklist & Pomodoro assistant"
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Adaptive Alert Banner */}
        {adaptiveMessage && (
          <div className="p-4 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2.5 text-xs text-brand-200 font-mono">
              <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
              <span>{adaptiveMessage}</span>
            </div>
            <button
              onClick={() => setAdaptiveMessage(null)}
              className="text-xs text-slate-400 hover:text-white font-mono px-2 py-1 rounded-lg bg-white/5"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Hero: Exam Countdown & Overall Completion Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Exam Countdown & Target Card */}
          <GlassCard className="p-6 lg:col-span-2 bg-gradient-to-r from-brand-950/40 via-purple-950/30 to-slate-900 border-brand-500/30 flex flex-col justify-between relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="cyan" size="sm">
                    <Sparkles className="w-3 h-3 mr-1" />
                    LangGraph Planner Active
                  </Badge>
                  <Badge variant="purple" size="sm">{planData?.priority || 'Weak Topics First'}</Badge>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                  Semester Final Examination Target
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Target Date: <strong className="text-white">{planData?.exam_date || examDate}</strong> • Allocated:{' '}
                  <strong className="text-brand-300">{planData?.hours_per_day || hoursPerDay} hrs/day</strong>
                </p>
              </div>

              <div className="text-left sm:text-right bg-slate-900/80 px-4 py-3 rounded-2xl border border-slate-800 shrink-0">
                <span className="text-3xl font-black text-white font-display gradient-text">
                  {planData?.days_remaining || 22}
                </span>
                <span className="block text-[10px] text-slate-400 uppercase font-mono mt-0.5">Days Remaining</span>
              </div>
            </div>

            {/* Subject Badges Bar */}
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Enrolled Courses:</span>
                {(planData?.subjects || selectedSubjects).map((sub, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-slate-200">
                    {sub}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAdaptWithQuizResults}
                  isLoading={isAdapting}
                  leftIcon={Zap}
                >
                  Sync Quiz Memory
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowConfigModal(true)}
                  leftIcon={Sparkles}
                >
                  Reconfigure Plan
                </Button>
              </div>
            </div>
          </GlassCard>

          {/* Completion Percentage Ring & Progress */}
          <GlassCard className="p-6 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Plan Completion</span>
              <Badge variant={planData?.completion_percentage >= 50 ? 'emerald' : 'brand'} size="sm">
                {planData?.completion_percentage || 0}% Done
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <span className="text-3xl font-black text-white font-display">
                  {planData?.completed_tasks || 0}
                  <span className="text-slate-500 text-lg font-normal">/{planData?.total_tasks || 0}</span>
                </span>
                <span className="text-xs text-emerald-400 font-mono font-bold">
                  {planData?.completion_percentage || 0}% Target Met
                </span>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all duration-700"
                  style={{ width: `${planData?.completion_percentage || 0}%` }}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                5 Day Study Streak
              </span>
              <span>Pomodoro: {completedCycles}/{planData?.pomodoro_suggestions?.daily_cycles_target || 8} Cycles</span>
            </div>
          </GlassCard>
        </div>

        {/* View Switcher Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            {[
              { id: 'calendar', label: 'Calendar Timetable', icon: Calendar },
              { id: 'checklist', label: 'Daily Task Checklist', icon: ListTodo },
              { id: 'spaced_repetition', label: 'Spaced Repetition', icon: Activity },
              { id: 'pomodoro', label: 'Pomodoro Assistant', icon: Timer },
              { id: 'weekly_phases', label: 'Weekly Milestones', icon: Layers },
            ].map((v) => {
              const Icon = v.icon;
              return (
                <button
                  key={v.id}
                  onClick={() => setActiveView(v.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold font-mono uppercase tracking-wider transition-all ${
                    activeView === v.id
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{v.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
            <span>Adaptive Planner Mode:</span>
            <span className="text-brand-300 font-bold">{planData?.difficulty || 'Standard'}</span>
          </div>
        </div>

        {/* VIEW 1: CALENDAR TIMETABLE MATRIX */}
        {activeView === 'calendar' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {planData?.daily_plan?.map((day) => {
                const isToday = day.day_number === 1;
                const completedCount = day.tasks.filter((t) => t.completed).length;
                const dayPct = Math.round((completedCount / Math.max(day.tasks.length, 1)) * 100);

                return (
                  <GlassCard
                    key={day.day_number}
                    className={`p-5 flex flex-col justify-between space-y-4 border transition-all ${
                      isToday
                        ? 'border-brand-500 bg-brand-950/20 shadow-glow-sm'
                        : 'border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Day Header */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-brand-400">
                            Day {day.day_number}
                          </span>
                          <span className="text-xs text-slate-300 font-mono">• {day.date_str}</span>
                        </div>
                        {isToday && <Badge variant="cyan" size="sm">Today</Badge>}
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Focus Subject</span>
                        <div className="text-sm font-bold text-white truncate mt-0.5">{day.focus_subject}</div>
                        <div className="text-xs text-brand-300 truncate mt-1">
                          {day.topics[0] || 'Core Concepts'}
                        </div>
                      </div>
                    </div>

                    {/* Day Task Previews */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>Tasks ({completedCount}/{day.tasks.length})</span>
                        <span>{day.hours_allocated} hrs ({day.pomodoro_cycles} Pomodoros)</span>
                      </div>

                      <div className="space-y-1.5">
                        {day.tasks.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => handleToggleTask(t.id, t.completed)}
                            className={`p-2 rounded-lg text-xs cursor-pointer border transition-all flex items-center justify-between ${
                              t.completed
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200 line-through'
                                : 'bg-slate-900/60 border-slate-800/60 text-slate-300 hover:border-brand-500/40'
                            }`}
                          >
                            <span className="truncate pr-2">{t.task}</span>
                            {t.completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Scheduled Quiz Action */}
                    {day.scheduled_quiz && (
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-mono text-purple-300 truncate">
                          🎯 {day.scheduled_quiz}
                        </span>
                        <button
                          onClick={() => navigate('/quiz')}
                          className="text-[10px] font-bold text-brand-400 hover:text-brand-300 font-mono uppercase shrink-0 flex items-center gap-1"
                        >
                          Drill <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </GlassCard>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: INTERACTIVE CHECKLIST VIEW */}
        {activeView === 'checklist' && (
          <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
            <GlassCard className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold font-display text-white">Daily Execution Checklist</h3>
                  <p className="text-xs text-slate-400">Actionable study modules synthesized by LangGraph Planner</p>
                </div>
                <Badge variant="brand" size="sm">
                  {planData?.completed_tasks || 0} of {planData?.total_tasks || 0} Complete
                </Badge>
              </div>

              {/* Grouped by Days */}
              <div className="space-y-6">
                {planData?.daily_plan?.slice(0, 5).map((day) => (
                  <div key={day.day_number} className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-brand-400 uppercase">
                          Day {day.day_number} • {day.date_str}
                        </span>
                        <Badge variant="outline" size="sm">{day.focus_subject}</Badge>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        {day.hours_allocated} Hours ({day.pomodoro_cycles} cycles)
                      </span>
                    </div>

                    <div className="space-y-2">
                      {day.tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                            task.completed
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => handleToggleTask(task.id, task.completed)}
                              className="mt-0.5 text-slate-400 hover:text-white"
                            >
                              {task.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-500" />
                              )}
                            </button>
                            <div className="space-y-1">
                              <span className={`text-sm font-medium ${task.completed ? 'line-through opacity-75' : ''}`}>
                                {task.task}
                              </span>
                              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                                <span>Est: {task.time_est_min} mins</span>
                                <span>•</span>
                                <span className={task.priority === 'High' ? 'text-rose-400' : 'text-slate-400'}>
                                  {task.priority} Priority
                                </span>
                              </div>
                            </div>
                          </div>

                          {task.is_quiz && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => navigate('/quiz')}
                              leftIcon={Zap}
                            >
                              Take Drill
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* VIEW 3: SPACED REPETITION SCHEDULE */}
        {activeView === 'spaced_repetition' && (
          <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
            <GlassCard className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-display text-white">
                      Spaced Repetition Schedule (Ebbinghaus Protocol)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Timed active recall intervals (1d, 3d, 7d, 14d) engineered to eliminate memory decay
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {planData?.revision_schedule?.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-brand-400">{item.interval_stage}</span>
                        <Badge
                          variant={item.status === 'Due Today' ? 'amber' : item.status === 'Completed' ? 'emerald' : 'outline'}
                          size="sm"
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-semibold text-white">{item.topic}</h4>
                      <p className="text-xs text-slate-400">{item.method}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-400">{item.target_date}</span>
                      <Button
                        variant={item.status === 'Due Today' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => navigate('/quiz')}
                      >
                        Launch Review Drill
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* VIEW 4: POMODORO ASSISTANT */}
        {activeView === 'pomodoro' && (
          <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">
            <GlassCard className="p-8 text-center space-y-6">
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => {
                    setPomoMode('focus');
                    setPomoSeconds(25 * 60);
                    setIsPomoRunning(false);
                  }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold font-mono uppercase transition-all ${
                    pomoMode === 'focus' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Focus (25m)
                </button>
                <button
                  onClick={() => {
                    setPomoMode('shortBreak');
                    setPomoSeconds(5 * 60);
                    setIsPomoRunning(false);
                  }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold font-mono uppercase transition-all ${
                    pomoMode === 'shortBreak' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Short Break (5m)
                </button>
                <button
                  onClick={() => {
                    setPomoMode('longBreak');
                    setPomoSeconds(15 * 60);
                    setIsPomoRunning(false);
                  }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold font-mono uppercase transition-all ${
                    pomoMode === 'longBreak' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Long Break (15m)
                </button>
              </div>

              {/* Huge Timer Digits */}
              <div className="py-6">
                <div className="text-6xl sm:text-7xl font-black font-mono text-white tracking-widest">
                  {formatPomoTime(pomoSeconds)}
                </div>
                <span className="text-xs text-brand-300 font-mono uppercase mt-2 block">
                  {pomoMode === 'focus' ? 'Deep Work Cycle Active' : 'Restorative Interval'}
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setIsPomoRunning(!isPomoRunning)}
                  leftIcon={isPomoRunning ? Pause : Play}
                >
                  {isPomoRunning ? 'Pause Session' : 'Start Focus Interval'}
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    setIsPomoRunning(false);
                    setPomoSeconds(pomoMode === 'focus' ? 25 * 60 : pomoMode === 'shortBreak' ? 5 * 60 : 15 * 60);
                  }}
                  leftIcon={RotateCcw}
                >
                  Reset
                </Button>
              </div>

              {/* Circadian & Slot Telemetry */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-left space-y-2 text-xs">
                <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">
                  AI Circadian Guidance
                </span>
                <p className="text-slate-300">{planData?.pomodoro_suggestions?.circadian_tip}</p>
                <div className="text-brand-300 font-mono text-[11px] pt-1">
                  Optimal Daily Blocks: {planData?.pomodoro_suggestions?.optimal_time_slots?.join(', ')}
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* VIEW 5: WEEKLY MILESTONES */}
        {activeView === 'weekly_phases' && (
          <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
            <div className="space-y-4">
              {planData?.weekly_plan?.map((week) => (
                <GlassCard key={week.week_number} className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                    <div>
                      <span className="text-xs font-mono font-bold text-brand-400 uppercase">
                        Week {week.week_number}
                      </span>
                      <h3 className="text-lg font-bold font-display text-white">{week.phase_name}</h3>
                      <p className="text-xs text-slate-300 mt-0.5">{week.objective}</p>
                    </div>
                    <Badge variant="purple" size="md">{week.hours_allocated} Hours</Badge>
                  </div>

                  {/* Target Topics */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono uppercase text-slate-400 block">Focus Topics:</span>
                    <div className="flex flex-wrap gap-2">
                      {week.target_topics.map((t, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Milestones Checklist */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-mono uppercase text-slate-400 block">Weekly Milestones:</span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {week.milestones.map((m, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* CONFIGURATION MODAL (LangGraph Planner Inputs) */}
        <Modal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          title="Configure AI Planning Agent"
        >
          <div className="space-y-5">
            <p className="text-xs text-slate-300">
              Provide your exam schedule and focus constraints to invoke the LangGraph Planner Agent.
            </p>

            {/* Exam Date */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider">
                Exam Target Date
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Hours Per Day */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider flex justify-between">
                <span>Daily Study Time Target</span>
                <span className="text-brand-400">{hoursPerDay} Hours/day</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[2, 4, 6, 8].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHoursPerDay(h)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      hoursPerDay === h
                        ? 'bg-brand-600 border-brand-500 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {h} hrs
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider">
                  Cognitive Pace
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="Foundational">Foundational (Gentle)</option>
                  <option value="Standard">Standard (Balanced)</option>
                  <option value="Intensive">Intensive (Exam Cram)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider">
                  Optimization Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="Weak Topics First">Weak Topics First</option>
                  <option value="Balanced Syllabus">Balanced Syllabus</option>
                  <option value="High Yield Exams">High Yield Exams</option>
                </select>
              </div>
            </div>

            {/* Weak Topics Chips */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider">
                Prioritized Weak Topics
              </label>
              <div className="flex flex-wrap gap-2 pb-2">
                {weakTopicsList.map((wt, idx) => (
                  <span
                    key={idx}
                    onClick={() => handleRemoveWeakTopic(wt)}
                    className="cursor-pointer px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-1.5 hover:bg-rose-500/20 hover:border-rose-500/30 hover:text-rose-200 transition-all"
                  >
                    <span>{wt}</span>
                    <span className="text-[10px]">✕</span>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customWeakTopic}
                  onChange={(e) => setCustomWeakTopic(e.target.value)}
                  placeholder="Add another weak concept..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
                <Button variant="secondary" size="sm" onClick={handleAddWeakTopic}>
                  Add
                </Button>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
              <Button variant="secondary" size="md" onClick={() => setShowConfigModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleGeneratePlan}
                isLoading={isLoading}
                rightIcon={Sparkles}
              >
                Synthesize Plan
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};
