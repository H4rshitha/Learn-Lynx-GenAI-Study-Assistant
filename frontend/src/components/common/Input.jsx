import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export const Input = forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  rightElement,
  className,
  wrapperClassName,
  type = 'text',
  id,
  required,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={cn('w-full flex flex-col gap-1.5', wrapperClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-slate-300 flex items-center justify-between">
          <span>
            {label} {required && <span className="text-red-400">*</span>}
          </span>
        </label>
      )}
      
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
            <Icon className="w-4 h-4" />
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          className={cn(
            'w-full bg-slate-900/70 border border-slate-700/70 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-all duration-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-900/30 disabled:opacity-60',
            Icon ? 'pl-10' : '',
            rightElement ? 'pr-11' : '',
            error ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500/20' : '',
            className
          )}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400 mt-0.5 animate-fadeIn">{error}</p>
      )}

      {helperText && !error && (
        <p className="text-xs text-slate-400 mt-0.5">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
