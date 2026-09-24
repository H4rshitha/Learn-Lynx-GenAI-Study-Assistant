import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import {
  Settings as SettingsIcon,
  User,
  Cpu,
  Key,
  Bell,
  CheckCircle2,
  Sparkles,
  Shield,
  Save,
  Database,
  Sliders,
} from 'lucide-react';

export const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const { aiConfig, updateAiConfig } = useApp();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'ai' | 'keys'
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Harshitha R.',
    email: user?.email || 'harshitha@university.edu',
    college: user?.college || 'National Institute of Engineering',
    department: user?.department || 'Computer Science & Engineering',
    semester: user?.semester || '6th Semester',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  });

  // AI Form State
  const [aiForm, setAiForm] = useState({ ...aiConfig });

  // API Keys Form State
  const [geminiKey, setGeminiKey] = useState('AIzaSyD-••••••••••••••••••••••');
  const [chromaUrl, setChromaUrl] = useState('http://localhost:8000/chroma');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile(profileForm);
    triggerSuccess();
  };

  const handleSaveAI = (e) => {
    e.preventDefault();
    updateAiConfig(aiForm);
    triggerSuccess();
  };

  const triggerSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const tabs = [
    { id: 'profile', label: 'Student Profile', icon: User },
    { id: 'ai', label: 'AI & RAG Parameters', icon: Cpu },
    { id: 'keys', label: 'API Keys & ChromaDB', icon: Key },
  ];

  return (
    <DashboardLayout
      title="System Settings & Preferences"
      subtitle="Manage your student profile, Gemini reasoning parameters, and vector store connections"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Save Notification */}
        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Preferences updated and saved to local session successfully!</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Student Profile */}
        {activeTab === 'profile' && (
          <GlassCard className="p-6 sm:p-8 space-y-6 animate-fadeIn">
            <div className="flex items-center gap-4 pb-6 border-b border-white/10">
              <img
                src={profileForm.avatar}
                alt="Avatar"
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500"
              />
              <div>
                <h3 className="text-base font-bold text-white font-display">{profileForm.name}</h3>
                <p className="text-xs text-slate-400">{profileForm.email}</p>
                <Badge variant="brand" size="sm" className="mt-1">Verified Student</Badge>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                />
                <Input
                  label="University Email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="College / University"
                  value={profileForm.college}
                  onChange={(e) => setProfileForm({ ...profileForm, college: e.target.value })}
                />
                <Input
                  label="Department / Branch"
                  value={profileForm.department}
                  onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                />
              </div>

              <Input
                label="Current Semester"
                value={profileForm.semester}
                onChange={(e) => setProfileForm({ ...profileForm, semester: e.target.value })}
              />

              <div className="flex justify-end pt-4 border-t border-white/10">
                <Button type="submit" variant="primary" size="md" leftIcon={Save}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </GlassCard>
        )}

        {/* Tab 2: AI & RAG Parameters */}
        {activeTab === 'ai' && (
          <GlassCard className="p-6 sm:p-8 space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-white font-display">Gemini & RAG Generation Parameters</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tune temperature, retrieval depth, and default prompt persona.
              </p>
            </div>

            <form onSubmit={handleSaveAI} className="space-y-5">
              {/* Model Choice */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider">
                  Foundation LLM
                </label>
                <select
                  value={aiForm.model}
                  onChange={(e) => setAiForm({ ...aiForm, model: e.target.value })}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                >
                  <option value="Gemini 1.5 Pro (RAG Enhanced)">Google Gemini 1.5 Pro (Deep Reasoning & Proofs)</option>
                  <option value="Gemini 1.5 Flash (Ultra Fast)">Google Gemini 1.5 Flash (Instant Low-Latency Q&A)</option>
                </select>
              </div>

              {/* Temperature Slider */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">Temperature: {aiForm.temperature}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {aiForm.temperature <= 0.3 ? 'Deterministic / Academic' : 'Creative / Exploratory'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={aiForm.temperature}
                  onChange={(e) => setAiForm({ ...aiForm, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-brand-500 cursor-pointer"
                />
              </div>

              {/* Top-K Chunks Slider */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">Retrieved Context Chunks (Top-K): {aiForm.topKChunks}</span>
                  <span className="text-[10px] text-slate-400 font-mono">ChromaDB semantic window</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="1"
                  value={aiForm.topKChunks}
                  onChange={(e) => setAiForm({ ...aiForm, topKChunks: parseInt(e.target.value) })}
                  className="w-full accent-brand-500 cursor-pointer"
                />
              </div>

              {/* Default Persona */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider">
                  Default Persona
                </label>
                <select
                  value={aiForm.persona}
                  onChange={(e) => setAiForm({ ...aiForm, persona: e.target.value })}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                >
                  <option value="Socratic Academic Tutor">Socratic Academic Tutor</option>
                  <option value="Exam Cram Coach">Exam Cram Coach</option>
                  <option value="Code & Proof Specialist">Code & Proof Specialist</option>
                </select>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10">
                <Button type="submit" variant="primary" size="md" leftIcon={Save}>
                  Save AI Parameters
                </Button>
              </div>
            </form>
          </GlassCard>
        )}

        {/* Tab 3: API Keys & ChromaDB */}
        {activeTab === 'keys' && (
          <GlassCard className="p-6 sm:p-8 space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-white font-display">External Service Credentials</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure your personal Google Generative AI key and ChromaDB local vector server.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                triggerSuccess();
              }}
              className="space-y-4"
            >
              <Input
                label="Google Gemini API Key"
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                helperText="Used for response generation and text-embedding-004 vector embeddings."
                icon={Key}
              />

              <Input
                label="ChromaDB Host URL"
                value={chromaUrl}
                onChange={(e) => setChromaUrl(e.target.value)}
                helperText="Defaults to local Chroma vector store instance or Docker container."
                icon={Database}
              />

              <div className="flex justify-end pt-4 border-t border-white/10">
                <Button type="submit" variant="primary" size="md" leftIcon={Save}>
                  Save API Keys
                </Button>
              </div>
            </form>
          </GlassCard>
        )}
      </div>
    </DashboardLayout>
  );
};
