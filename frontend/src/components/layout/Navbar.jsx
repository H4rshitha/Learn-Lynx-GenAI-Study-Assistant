import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Sparkles, ArrowRight, BookOpen, Layers, Zap, LogIn, LayoutDashboard, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const { isAuthenticated, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTryDemo = async () => {
    await demoLogin();
    navigate('/dashboard');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#090D16]/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-brand-purple flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight font-display text-white group-hover:text-brand-300 transition-colors flex items-center gap-2">
              Learn-Lynx <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-brand-500/20 text-brand-300 font-mono border border-brand-500/30">v2.0</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Agentic AI Study Assistant</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#architecture" className="hover:text-white transition-colors">RAG Architecture</a>
          <a href="#demo-preview" className="hover:text-white transition-colors">Workspace Preview</a>
          <a href="#workflow" className="hover:text-white transition-colors">How It Works</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={handleTryDemo}
            className="text-xs px-3 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-all"
          >
            ⚡ Instant 1-Click Demo
          </button>

          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button variant="primary" size="sm" rightIcon={ArrowRight}>
                Open Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" leftIcon={LogIn}>
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm" rightIcon={ArrowRight}>
                  Get Started Free
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-white/10 px-6 py-6 flex flex-col gap-4 animate-fadeIn">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-slate-300 py-1"
          >
            Features
          </a>
          <a
            href="#architecture"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-slate-300 py-1"
          >
            RAG Architecture
          </a>
          <a
            href="#workflow"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-slate-300 py-1"
          >
            How It Works
          </a>
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleTryDemo();
              }}
              className="w-full py-2.5 text-xs rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
            >
              ⚡ Instant 1-Click Demo
            </button>
            {isAuthenticated ? (
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full" variant="primary">Go to Dashboard</Button>
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full" variant="ghost">Sign In</Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full" variant="primary">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
