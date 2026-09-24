import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#090D16] disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-purple text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:from-brand-500 hover:to-purple-500 focus:ring-brand-500 border border-white/10',
    secondary: 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-100 border border-slate-700/80 shadow-sm focus:ring-slate-400',
    outline: 'border border-slate-700/80 hover:border-brand-500/60 bg-transparent hover:bg-brand-500/10 text-slate-200 hover:text-white focus:ring-brand-500',
    ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white focus:ring-slate-400',
    cyan: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 hover:from-cyan-400 hover:to-blue-500 focus:ring-cyan-400',
    danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 focus:ring-red-500',
    glass: 'glass-card glass-card-hover text-slate-200 hover:text-white',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
    icon: 'p-2.5 text-sm',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        LeftIcon && <LeftIcon className={cn('shrink-0', size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
      )}
      {children}
      {!isLoading && RightIcon && (
        <RightIcon className={cn('shrink-0', size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
      )}
    </button>
  );
};
