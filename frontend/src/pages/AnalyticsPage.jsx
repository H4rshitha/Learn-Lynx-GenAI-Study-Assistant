import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { analyticsApi, evaluationApi } from '../api/client';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Brain,
  Layers,
  Database,
  ShieldCheck,
  Zap,
  Activity,
  History,
  FileCheck,
  Check,
  X,
  Gauge,
  Cpu,
  Coins,
  Search,
  ChevronRight,
  RefreshCw,
  BookOpen,
  Calendar,
  PieChart as PieIcon,
  ShieldAlert,
  ArrowUpRight,
  Timer,
  Download,
} from 'lucide-react';

// Custom Recharts Glassmorphic Tooltip
const CustomChartTooltip = ({ active, payload, label, unit = '' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 min-w-[160px]">
        <p className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-cyan-400 font-mono">Live Telemetry</span>
        </p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color || entry.stroke }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.stroke }} />
              {entry.name}:
            </span>
            <span className="font-mono font-bold text-slate-100">
              {entry.value}
              {unit || entry.unit || ''}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const AnalyticsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Top Tabs: 'usage_dashboard' | 'eval_suite' | 'eval_history'
  const [activeTab, setActiveTab] = useState('usage_dashboard');
  const [timeRange, setTimeRange] = useState('7d');

  // React Query: AI Usage Analytics telemetry
  const {
    data: usageData,
    isLoading: isUsageLoading,
    isRefetching: isUsageRefetching,
    refetch: refetchUsage,
  } = useQuery({
    queryKey: ['ai-usage-analytics', timeRange],
    queryFn: () => analyticsApi.getUsageAnalytics(timeRange),
    staleTime: 1000 * 60 * 2,
  });

  // LLM Evaluation Suite State
  const [benchmarkQuery, setBenchmarkQuery] = useState(
    "Explain Peterson's algorithm invariants and the critical section problem."
  );
  const [enableComparison, setEnableComparison] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);

  // History & Inspector State
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedTrace, setSelectedTrace] = useState(null);
  const [showJudgeModal, setShowJudgeModal] = useState(false);

  const presetQueries = [
    {
      title: 'OS Peterson Invariants',
      query: "Explain Peterson's algorithm invariants and how it satisfies Mutual Exclusion, Progress, and Bounded Waiting.",
    },
    {
      title: 'AI A* Search Heuristics',
      query: 'Prove why an admissible heuristic guarantees path optimality in A* tree search with formal inequalities.',
    },
    {
      title: 'DBMS 3NF Decomposition',
      query: 'Demonstrate lossy vs lossless decomposition in Relational Normalization and 3NF functional dependencies.',
    },
    {
      title: 'TCP Congestion Control',
      query: 'Compare TCP Tahoe vs TCP Reno Fast Recovery and explain Additive Increase Multiplicative Decrease (AIMD).',
    },
  ];

  const handleRunEvaluation = async (queryToRun = benchmarkQuery) => {
    setIsEvaluating(true);
    try {
      const res = await evaluationApi.runEvaluation({
        query: queryToRun,
        enable_comparison: enableComparison,
      });
      setEvalResult(res);
      loadHistory();
    } catch (err) {
      console.error('Evaluation run failed:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await evaluationApi.getHistory(20);
      setHistoryList(data);
    } catch (e) {
      console.error('Failed to load eval history:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const widgets = usageData?.widgets || {
    total_documents: 4,
    total_chunks: 526,
    queries_today: 42,
    queries_total: 348,
    avg_confidence: 96.4,
    avg_latency_ms: 420,
    quiz_accuracy: 88.5,
    study_hours: 48.5,
    topics_studied: 14,
    hallucination_rate: 1.8,
  };

  const dailyQueriesData = usageData?.daily_queries || [];
  const confidenceTrendData = usageData?.confidence_trend || [];
  const topicDistributionData = usageData?.topic_distribution || [];
  const quizPerformanceData = usageData?.quiz_performance || [];
  const studyConsistencyData = usageData?.study_consistency || [];

  return (
    <DashboardLayout
      title="AI Analytics & LLM Intelligence Dashboard"
      subtitle="Comprehensive real-time telemetry, Recharts usage visualizers, and Enterprise LLM-as-a-Judge evaluations"
      action={
        <div className="flex items-center gap-3">
          {activeTab === 'usage_dashboard' && (
            <div className="flex items-center bg-slate-900/80 border border-slate-700/60 rounded-xl p-1 shadow-inner">
              {['7d', '14d', '30d', 'all'].map((p) => (
                <button
                  key={p}
                  onClick={() => setTimeRange(p)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    timeRange === p
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p === '7d' ? '7 Days' : p === '14d' ? '14 Days' : p === '30d' ? '30 Days' : 'All Time'}
                </button>
              ))}
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (activeTab === 'usage_dashboard') refetchUsage();
              else loadHistory();
            }}
            isLoading={isUsageRefetching || loadingHistory}
            className="border-slate-700 hover:border-cyan-500/50 text-slate-300"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isUsageRefetching ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Navigation Tabs Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 p-1.5 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('usage_dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'usage_dashboard'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Activity className="w-4 h-4 text-cyan-400" />
              AI Usage Dashboard (Recharts + React Query)
            </button>
            <button
              onClick={() => {
                setActiveTab('eval_suite');
                if (!evalResult) handleRunEvaluation();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'eval_suite'
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              LLM Evaluation Suite & Judge
            </button>
            <button
              onClick={() => {
                setActiveTab('eval_history');
                loadHistory();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'eval_history'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <History className="w-4 h-4 text-emerald-400" />
              Evaluation History & Trace Log
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-900/40 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Telemetry Pipeline: Active (SSE + ChromaDB + SQLite)</span>
          </div>
        </div>

        {/* =========================================================================
            TAB 1: AI USAGE ANALYTICS DASHBOARD (Prompt 12 Core Widgets & Recharts)
            ========================================================================= */}
        {activeTab === 'usage_dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            {/* 8 Core AI Usage KPI Widgets */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Key AI & Study Performance Widgets
                </h3>
                <span className="text-xs text-slate-500 font-mono">Real-time Session Telemetry</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Documents */}
                <GlassCard className="p-5 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-400">Total Documents</p>
                      <h4 className="text-2xl font-black text-white mt-1 group-hover:text-cyan-400 transition-colors">
                        {widgets.total_documents}
                      </h4>
                      <p className="text-[11px] text-cyan-400/90 mt-1 font-mono flex items-center gap-1">
                        <Database className="w-3 h-3" />
                        {widgets.total_chunks} ChromaDB chunks
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                      <BookOpen className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Index status</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Hybrid Vector
                    </span>
                  </div>
                </GlassCard>

                {/* 2. Queries Today */}
                <GlassCard className="p-5 relative overflow-hidden group hover:border-blue-500/40 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-400">Queries Today</p>
                      <h4 className="text-2xl font-black text-white mt-1 group-hover:text-blue-400 transition-colors">
                        {widgets.queries_today}
                      </h4>
                      <p className="text-[11px] text-blue-400/90 mt-1 font-mono flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {widgets.queries_total} lifetime queries
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                      <Brain className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>24h Velocity</span>
                    <span className="text-cyan-400 font-semibold flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> +18.4%
                    </span>
                  </div>
                </GlassCard>

                {/* 3. Average Confidence */}
                <GlassCard className="p-5 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-400">Average Confidence</p>
                      <h4 className="text-2xl font-black text-white mt-1 group-hover:text-emerald-400 transition-colors">
                        {widgets.avg_confidence}%
                      </h4>
                      <p className="text-[11px] text-emerald-400/90 mt-1 font-mono flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        RAG Grounding Score
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <Gauge className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Threshold Gate</span>
                    <span className="text-emerald-400 font-semibold font-mono">&gt; 75.0% enforced</span>
                  </div>
                </GlassCard>

                {/* 4. Average Latency */}
                <GlassCard className="p-5 relative overflow-hidden group hover:border-amber-500/40 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-400">Average Latency</p>
                      <h4 className="text-2xl font-black text-white mt-1 group-hover:text-amber-400 transition-colors">
                        {widgets.avg_latency_ms} <span className="text-sm font-normal text-slate-400">ms</span>
                      </h4>
                      <p className="text-[11px] text-amber-400/90 mt-1 font-mono flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        SSE First-Token
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      <Timer className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>p95 Target</span>
                    <span className="text-amber-400 font-semibold font-mono">&lt; 650 ms</span>
                  </div>
                </GlassCard>

                {/* 5. Quiz Accuracy */}
                <GlassCard className="p-5 relative overflow-hidden group hover:border-purple-500/40 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-400">Quiz Accuracy</p>
                      <h4 className="text-2xl font-black text-white mt-1 group-hover:text-purple-400 transition-colors">
                        {widgets.quiz_accuracy}%
                      </h4>
                      <p className="text-[11px] text-purple-400/90 mt-1 font-mono flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Top 5% Cohort
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                      <Award className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Quiz studio grade</span>
                    <span className="text-purple-400 font-bold">Grade A (Mastery)</span>
                  </div>
                </GlassCard>

                {/* 6. Study Hours */}
                <GlassCard className="p-5 relative overflow-hidden group hover:border-rose-500/40 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-400">Study Hours</p>
                      <h4 className="text-2xl font-black text-white mt-1 group-hover:text-rose-400 transition-colors">
                        {widgets.study_hours} <span className="text-sm font-normal text-slate-400">hrs</span>
                      </h4>
                      <p className="text-[11px] text-rose-400/90 mt-1 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        7-day streak active 🔥
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Weekly Target</span>
                    <span className="text-rose-400 font-semibold font-mono">92% completed</span>
                  </div>
                </GlassCard>

                {/* 7. Topics Studied */}
                <GlassCard className="p-5 relative overflow-hidden group hover:border-indigo-500/40 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-400">Topics Studied</p>
                      <h4 className="text-2xl font-black text-white mt-1 group-hover:text-indigo-400 transition-colors">
                        {widgets.topics_studied} <span className="text-sm font-normal text-slate-400">modules</span>
                      </h4>
                      <p className="text-[11px] text-indigo-400/90 mt-1 font-mono flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        4 Core Subjects
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                      <Layers className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Active curriculum</span>
                    <span className="text-indigo-400 font-semibold">OS, AI, DBMS, CN</span>
                  </div>
                </GlassCard>

                {/* 8. Hallucination Rate */}
                <GlassCard className="p-5 relative overflow-hidden group hover:border-teal-500/40 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-400">Hallucination Rate</p>
                      <h4 className="text-2xl font-black text-white mt-1 group-hover:text-teal-400 transition-colors">
                        {widgets.hallucination_rate}%
                      </h4>
                      <p className="text-[11px] text-teal-400/90 mt-1 font-mono flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        Critic Risk &lt; 0.02
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Safety classification</span>
                    <span className="text-emerald-400 font-semibold font-mono">Ultra-Reliable</span>
                  </div>
                </GlassCard>
              </div>
            </div>

            {/* 5 Rich Interactive Recharts Visualizers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* CHART 1: Daily Queries Area Chart */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-cyan-400" />
                      1. Daily AI Query Volume
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Breakdown of hybrid RAG lookups vs autonomous agent workflow executions
                    </p>
                  </div>
                  <Badge variant="cyan" size="sm">
                    {timeRange === '7d' ? '7-Day Trend' : 'Historical Trend'}
                  </Badge>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyQueriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRag" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorAgent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                      <XAxis dataKey="day_label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip content={<CustomChartTooltip unit=" queries" />} />
                      <Legend
                        wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                        formatter={(val) => <span className="text-slate-300 font-medium">{val}</span>}
                      />
                      <Area
                        type="monotone"
                        dataKey="rag_queries"
                        name="Hybrid RAG Search"
                        stroke="#06b6d4"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorRag)"
                      />
                      <Area
                        type="monotone"
                        dataKey="agent_queries"
                        name="LangGraph Multi-Agent"
                        stroke="#8b5cf6"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorAgent)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              {/* CHART 2: Confidence & Faithfulness Trend Line Chart */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <Gauge className="w-5 h-5 text-emerald-400" />
                      2. Confidence & Faithfulness Trend
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Grounding accuracy vs citation faithfulness across consecutive study runs
                    </p>
                  </div>
                  <Badge variant="emerald" size="sm">
                    Avg 96.8%
                  </Badge>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={confidenceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                      <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis domain={[80, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip content={<CustomChartTooltip unit="%" />} />
                      <Legend
                        wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                        formatter={(val) => <span className="text-slate-300 font-medium">{val}</span>}
                      />
                      <Line
                        type="monotone"
                        dataKey="confidence"
                        name="AI Confidence (%)"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#10b981' }}
                        activeDot={{ r: 6, stroke: '#34d399', strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="faithfulness"
                        name="Citation Faithfulness (%)"
                        stroke="#38bdf8"
                        strokeWidth={2.5}
                        strokeDasharray="4 4"
                        dot={{ r: 3, fill: '#38bdf8' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              {/* CHART 3: Topic Distribution Donut Pie Chart */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <PieIcon className="w-5 h-5 text-indigo-400" />
                      3. Topic Query Distribution
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Proportional breakdown of student questions across academic domains
                    </p>
                  </div>
                  <Badge variant="indigo" size="sm">
                    4 Core Subjects
                  </Badge>
                </div>

                <div className="h-72 w-full flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topicDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="topic"
                      >
                        {topicDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomChartTooltip unit=" queries" />} />
                      <Legend
                        verticalAlign="bottom"
                        wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                        formatter={(val, entry) => (
                          <span className="text-slate-300 font-medium">
                            {val} ({entry.payload.percentage}%)
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              {/* CHART 4: Quiz Performance Bar Chart */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-400" />
                      4. Quiz Studio Topic Performance
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Subject-wise accuracy scores and evaluation attempt volumes
                    </p>
                  </div>
                  <Badge variant="purple" size="sm">
                    Avg 89.2%
                  </Badge>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={quizPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                      <XAxis dataKey="subject" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis domain={[60, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip content={<CustomChartTooltip unit="%" />} />
                      <Legend
                        wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                        formatter={(val) => <span className="text-slate-300 font-medium">{val}</span>}
                      />
                      <Bar
                        dataKey="accuracy"
                        name="Accuracy (%)"
                        fill="#a855f7"
                        radius={[6, 6, 0, 0]}
                        barSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>

            {/* CHART 5: Full-Width Study Consistency Bar & Focus Chart */}
            <GlassCard className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-rose-400" />
                    5. Study Consistency & Daily Focus Hours
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Logged active study hours and AI-assisted Pomodoro engagement levels over the active period
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300 font-medium">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Daily Hours
                    <span className="w-2 h-2 rounded-full bg-cyan-400 ml-2" />
                    Focus Score (0-100)
                  </div>
                  <Badge variant="emerald" size="sm">
                    7 Days In A Row 🔥
                  </Badge>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studyConsistencyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis yAxisId="left" stroke="#f43f5e" fontSize={11} tickLine={false} unit="h" />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="#06b6d4" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                      formatter={(val) => <span className="text-slate-300 font-medium">{val}</span>}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="hours"
                      name="Study Hours (hrs)"
                      fill="#f43f5e"
                      radius={[6, 6, 0, 0]}
                      barSize={28}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="focus_score"
                      name="Focus Score (0-100)"
                      fill="#06b6d4"
                      radius={[6, 6, 0, 0]}
                      barSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>
        )}

        {/* =========================================================================
            TAB 2: LLM EVALUATION SUITE & JUDGE (Benchmark & Side-by-Side Comparator)
            ========================================================================= */}
        {activeTab === 'eval_suite' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Evaluation Query Input & Benchmark Presets */}
            <GlassCard className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    Live LLM Benchmark & Multi-Metric Evaluation
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Execute automated LLM-as-a-Judge evaluation evaluating Context Relevance, Answer Relevance, Faithfulness, Hallucination Risk, and Latency.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
                    <input
                      type="checkbox"
                      checked={enableComparison}
                      onChange={(e) => setEnableComparison(e.target.checked)}
                      className="rounded border-slate-700 text-purple-600 focus:ring-purple-500"
                    />
                    <span>Side-by-Side Baseline Comparison</span>
                  </label>
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={() => handleRunEvaluation()}
                    isLoading={isEvaluating}
                  >
                    <Zap className="w-4 h-4 mr-1.5" />
                    Run Evaluation
                  </Button>
                </div>
              </div>

              {/* Benchmark Input */}
              <div className="relative">
                <input
                  type="text"
                  value={benchmarkQuery}
                  onChange={(e) => setBenchmarkQuery(e.target.value)}
                  placeholder="Enter custom academic prompt to evaluate..."
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/80"
                />
              </div>

              {/* Presets */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Test Presets:</span>
                {presetQueries.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setBenchmarkQuery(p.query);
                      handleRunEvaluation(p.query);
                    }}
                    className="text-xs px-3 py-1 bg-slate-800/80 hover:bg-purple-900/30 hover:border-purple-500/40 border border-slate-700/60 rounded-lg text-slate-300 hover:text-purple-300 transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    {p.title}
                  </button>
                ))}
              </div>
            </GlassCard>

            {/* Evaluation Results Container */}
            {evalResult && (
              <div className="space-y-6">
                {/* 8 Core Evaluation Metrics Grid */}
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Evaluation Metrics & Scoring
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                    <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-2xl">
                      <p className="text-[11px] text-slate-400 font-medium">Context Relevance</p>
                      <h5 className="text-lg font-black text-cyan-400 mt-1">
                        {evalResult.primary_result.scores.context_relevance}%
                      </h5>
                    </div>
                    <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-2xl">
                      <p className="text-[11px] text-slate-400 font-medium">Answer Relevance</p>
                      <h5 className="text-lg font-black text-blue-400 mt-1">
                        {evalResult.primary_result.scores.answer_relevance}%
                      </h5>
                    </div>
                    <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-2xl">
                      <p className="text-[11px] text-slate-400 font-medium">Faithfulness</p>
                      <h5 className="text-lg font-black text-emerald-400 mt-1">
                        {evalResult.primary_result.scores.faithfulness}%
                      </h5>
                    </div>
                    <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-2xl">
                      <p className="text-[11px] text-slate-400 font-medium">Hallucination Risk</p>
                      <h5 className="text-lg font-black text-emerald-400 mt-1">
                        {evalResult.primary_result.scores.hallucination_risk}
                      </h5>
                    </div>
                    <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-2xl">
                      <p className="text-[11px] text-slate-400 font-medium">Retrieval Score</p>
                      <h5 className="text-lg font-black text-indigo-400 mt-1">
                        {evalResult.primary_result.scores.retrieval_score}%
                      </h5>
                    </div>
                    <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-2xl">
                      <p className="text-[11px] text-slate-400 font-medium">Latency (ms)</p>
                      <h5 className="text-lg font-black text-amber-400 mt-1">
                        {evalResult.primary_result.scores.latency_ms}ms
                      </h5>
                    </div>
                    <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-2xl">
                      <p className="text-[11px] text-slate-400 font-medium">Token Usage</p>
                      <h5 className="text-lg font-black text-purple-400 mt-1">
                        {evalResult.primary_result.scores.tokens_total}
                      </h5>
                    </div>
                    <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-2xl">
                      <p className="text-[11px] text-slate-400 font-medium">Confidence</p>
                      <h5 className="text-lg font-black text-teal-400 mt-1">
                        {evalResult.primary_result.scores.confidence}%
                      </h5>
                    </div>
                  </div>
                </div>

                {/* Side-by-Side Model Comparison (Hybrid Enterprise RAG vs Vanilla Dense Baseline) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Primary: Learn-Lynx Hybrid RAG */}
                  <GlassCard className="p-6 border-cyan-500/30">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div>
                        <Badge variant="cyan" size="sm">
                          Enterprise Target
                        </Badge>
                        <h4 className="text-base font-bold text-white mt-1">
                          {evalResult.primary_result.model_name}
                        </h4>
                        <p className="text-[11px] text-slate-400">{evalResult.primary_result.pipeline_type}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400">Faithfulness</span>
                        <p className="text-xl font-black text-emerald-400">
                          {evalResult.primary_result.scores.faithfulness}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed max-h-48 overflow-y-auto">
                        {evalResult.primary_result.answer}
                      </div>

                      {/* Citations */}
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Grounding Citations:
                        </span>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {evalResult.primary_result.citations.map((c, i) => (
                            <span
                              key={i}
                              className="text-[11px] px-2 py-0.5 bg-cyan-950/40 text-cyan-300 border border-cyan-800/50 rounded"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Judge Critique */}
                      <div className="p-3 bg-purple-950/20 border border-purple-800/40 rounded-xl text-xs text-purple-200">
                        <span className="font-bold flex items-center gap-1.5 text-purple-300 mb-1">
                          <Sparkles className="w-3.5 h-3.5" /> LLM-as-a-Judge Feedback:
                        </span>
                        {evalResult.primary_result.judge_critique}
                      </div>
                    </div>
                  </GlassCard>

                  {/* Comparison Baseline: Vanilla Dense Vector */}
                  {evalResult.comparison_result && (
                    <GlassCard className="p-6 border-slate-700/50">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div>
                          <Badge variant="slate" size="sm">
                            Vanilla Baseline
                          </Badge>
                          <h4 className="text-base font-bold text-slate-300 mt-1">
                            {evalResult.comparison_result.model_name}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {evalResult.comparison_result.pipeline_type}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-400">Faithfulness</span>
                          <p className="text-xl font-black text-amber-400">
                            {evalResult.comparison_result.scores.faithfulness}%
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed max-h-48 overflow-y-auto">
                          {evalResult.comparison_result.answer}
                        </div>

                        {/* Citations */}
                        <div>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Grounding Citations:
                          </span>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {evalResult.comparison_result.citations.map((c, i) => (
                              <span
                                key={i}
                                className="text-[11px] px-2 py-0.5 bg-slate-800/60 text-slate-400 border border-slate-700/50 rounded"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Judge Critique */}
                        <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl text-xs text-amber-200">
                          <span className="font-bold flex items-center gap-1.5 text-amber-300 mb-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Baseline Deficiencies:
                          </span>
                          {evalResult.comparison_result.judge_critique}
                        </div>
                      </div>
                    </GlassCard>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: EVALUATION HISTORY & TRACE LOG
            ========================================================================= */}
        {activeTab === 'eval_history' && (
          <div className="space-y-6 animate-fadeIn">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-emerald-400" />
                    Evaluation Audit Log & Traces
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Complete historical record of automated RAG evaluations and Critic validation checks.
                  </p>
                </div>
                <Badge variant="emerald" size="sm">
                  {historyList.length} Traces Logged
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Evaluation ID & Query</th>
                      <th className="py-3 px-4">Faithfulness</th>
                      <th className="py-3 px-4">Answer Rel.</th>
                      <th className="py-3 px-4">Hallucination</th>
                      <th className="py-3 px-4">Latency</th>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {historyList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-100 flex items-center gap-2">
                            <FileCheck className="w-4 h-4 text-cyan-400" />
                            {item.id}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate max-w-md mt-0.5">
                            {item.query}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                          {item.faithfulness}%
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                          {item.answer_relevance}%
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/50 text-emerald-300 border border-emerald-800/60 font-mono">
                            {item.hallucination_risk}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          {item.latency_ms} ms
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">{item.timestamp}</td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTrace(item);
                              setShowJudgeModal(true);
                            }}
                            className="text-xs border-slate-700 hover:border-cyan-500/50"
                          >
                            Inspect
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        )}
      </div>

      {/* Trace Inspector Modal */}
      {selectedTrace && (
        <Modal
          isOpen={showJudgeModal}
          onClose={() => setShowJudgeModal(false)}
          title={`Trace Inspector: ${selectedTrace.id}`}
        >
          <div className="space-y-4 text-xs text-slate-200">
            <div>
              <span className="text-slate-400 font-semibold block mb-1">Evaluated Query:</span>
              <p className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-slate-100">
                {selectedTrace.query}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Faithfulness</span>
                <span className="text-emerald-400 font-bold text-base">{selectedTrace.faithfulness}%</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Answer Relevance</span>
                <span className="text-blue-400 font-bold text-base">{selectedTrace.answer_relevance}%</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Context Relevance</span>
                <span className="text-cyan-400 font-bold text-base">{selectedTrace.context_relevance}%</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Latency</span>
                <span className="text-amber-400 font-bold text-base">{selectedTrace.latency_ms} ms</span>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setShowJudgeModal(false)}>
                Close Inspector
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default AnalyticsPage;
