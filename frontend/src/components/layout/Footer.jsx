import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Globe, Code2, Share2, Heart, Shield, Cpu, BookOpen } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#070A11] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-brand-500/10 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold font-display text-white">Learn-Lynx <span className="text-brand-400 font-normal text-sm">v2</span></span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Enterprise-grade GenAI learning companion and study partner. Grounded with ChromaDB vector embeddings, Google Gemini, and adaptive cognitive quiz generators.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-brand-500/50 transition-colors" title="Repository">
                <Code2 className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-brand-500/50 transition-colors" title="Social">
                <Globe className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-brand-500/50 transition-colors" title="Network">
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 1 */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4 font-mono">Platform</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/workspace" className="hover:text-brand-300 transition-colors">AI Workspace</Link></li>
              <li><Link to="/knowledge-base" className="hover:text-brand-300 transition-colors">Knowledge Base (RAG)</Link></li>
              <li><Link to="/quiz-studio" className="hover:text-brand-300 transition-colors">Quiz Studio</Link></li>
              <li><Link to="/study-planner" className="hover:text-brand-300 transition-colors">Study Planner</Link></li>
              <li><Link to="/analytics" className="hover:text-brand-300 transition-colors">AI Insights</Link></li>
            </ul>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4 font-mono">Technology</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-brand-400" /> Google Gemini 1.5</li>
              <li className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-purple-400" /> ChromaDB Vectors</li>
              <li className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-cyan-400" /> LangChain Pipeline</li>
              <li><span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">pdfplumber text extraction</span></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4 font-mono">Account</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/login" className="hover:text-brand-300 transition-colors">Sign In</Link></li>
              <li><Link to="/signup" className="hover:text-brand-300 transition-colors">Register as Student</Link></li>
              <li><Link to="/settings" className="hover:text-brand-300 transition-colors">Student Profile</Link></li>
              <li><Link to="/settings" className="hover:text-brand-300 transition-colors">API Keys & Tokens</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Learn-Lynx GenAI Learning Assistant. Built for high-impact academic mastery.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">System Status</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
