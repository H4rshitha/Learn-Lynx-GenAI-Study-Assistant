import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { GlassCard } from '../components/common/GlassCard';
import {
  Sparkles,
  User,
  Mail,
  Lock,
  Building,
  BookOpen,
  GraduationCap,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: '',
    department: 'Computer Science & Engineering',
    semester: '6th Semester',
    acceptTerms: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const departments = [
    'Computer Science & Engineering',
    'Artificial Intelligence & Data Science',
    'Information Technology',
    'Electronics & Communication',
    'Electrical & Electronics',
    'Mechanical Engineering',
    'Biotechnology',
    'Other / Multidisciplinary',
  ];

  const semesters = [
    '1st Semester',
    '2nd Semester',
    '3rd Semester',
    '4th Semester',
    '5th Semester',
    '6th Semester',
    '7th Semester',
    '8th Semester',
    'Postgraduate / Research',
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!formData.acceptTerms) {
      setErrorMessage('Please accept the Terms and Conditions.');
      return;
    }

    setIsLoading(true);
    const result = await signup(formData);
    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrorMessage(result.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Glow Backdrops */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center mb-8 relative z-10">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </Link>
        <h2 className="mt-4 text-3xl font-extrabold font-display text-white tracking-tight">
          Create Your <span className="gradient-text">Learn-Lynx</span> Account
        </h2>
        <p className="mt-2 text-xs text-slate-400">
          Personalize your agentic AI study tutor based on your college curriculum & department.
        </p>
      </div>

      {/* Main Registration Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <GlassCard className="p-8 sm:p-10 shadow-2xl border border-white/10">
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Row 1: Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Harshitha R."
                icon={User}
              />
              <Input
                label="University Email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="student@university.edu"
                icon={Mail}
              />
            </div>

            {/* Row 2: College & Dept */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="College / Institution"
                name="college"
                required
                value={formData.college}
                onChange={handleChange}
                placeholder="e.g. National Institute of Tech"
                icon={Building}
              />

              <div className="w-full flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300">Department / Major *</label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full bg-slate-900/70 border border-slate-700/70 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept} className="bg-slate-900 text-slate-200">
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Row 3: Semester */}
            <div className="w-full flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300">Current Semester *</label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full bg-slate-900/70 border border-slate-700/70 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                >
                  {semesters.map((sem) => (
                    <option key={sem} value={sem} className="bg-slate-900 text-slate-200">
                      {sem}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 4: Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password (min. 8 characters)"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleChange}
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

              <Input
                label="Confirm Password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••••••"
                icon={Lock}
              />
            </div>

            {/* Terms Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 select-none">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="mt-0.5 rounded bg-slate-900 border-slate-700 text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span>
                  I agree to the Learn-Lynx Terms of Service and Privacy Policy regarding AI document indexing and academic honor code.
                </span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-4"
              isLoading={isLoading}
              rightIcon={ArrowRight}
            >
              Create Student Account & Launch
            </Button>
          </form>
        </GlassCard>

        {/* Link to Login */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-4">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};
