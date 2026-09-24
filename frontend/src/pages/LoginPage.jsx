import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { GlassCard } from '../components/common/GlassCard';
import { Modal } from '../components/common/Modal';
import {
  Sparkles,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Zap,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export const LoginPage = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('harshitha@university.edu');
  const [password, setPassword] = useState('SecurePass2026!');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password, rememberMe);
    setIsLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMessage(result.message || 'Invalid credentials. Please try again.');
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    await demoLogin();
    setIsLoading(false);
    navigate(from, { replace: true });
  };

  const handleSendReset = (e) => {
    e.preventDefault();
    if (forgotEmail) {
      setResetSent(true);
      setTimeout(() => {
        setResetSent(false);
        setShowForgotModal(false);
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow meshes */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-brand-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 relative z-10">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </Link>
        <h2 className="mt-4 text-3xl font-extrabold font-display text-white tracking-tight">
          Welcome back to <span className="gradient-text">Learn-Lynx</span>
        </h2>
        <p className="mt-2 text-xs text-slate-400">
          Sign in to access your grounded notes, ChromaDB vectors & study tools.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <GlassCard className="p-8 shadow-2xl border border-white/10 relative">
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Student Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., student@university.edu"
              icon={Mail}
            />

            <Input
              label="Account Password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              icon={Lock}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span>Remember me for 30 days</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={ArrowRight}
            >
              Sign In to Workspace
            </Button>
          </form>

          {/* Social / Google Sign-In Placeholder */}
          <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-brand-500/20 hover:from-cyan-500/30 hover:to-brand-500/30 text-cyan-200 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Instant 1-Click Demo Login</span>
            </button>

            <button
              type="button"
              onClick={() => alert('Google OAuth integration ready for backend JWT callback!')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium flex items-center justify-center gap-2.5 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.6 6.4C.6 8.4 0 10.6 0 12s.6 3.6 1.6 5.6l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        </GlassCard>

        {/* Link to Signup */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Don't have an account yet?{' '}
          <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-4">
            Sign up now
          </Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title="Reset Account Password"
        subtitle="Enter your verified university email to receive a password reset link."
      >
        {resetSent ? (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>Reset instructions have been sent to {forgotEmail}!</span>
          </div>
        ) : (
          <form onSubmit={handleSendReset} className="space-y-4">
            <Input
              label="Registered Email"
              type="email"
              required
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="e.g. student@university.edu"
              icon={Mail}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowForgotModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Send Reset Link
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
