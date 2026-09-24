import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message, title = 'Success') => addToast({ title, message, type: 'success' }),
    error: (message, title = 'Error') => addToast({ title, message, type: 'error', duration: 5000 }),
    warning: (message, title = 'Warning') => addToast({ title, message, type: 'warning' }),
    info: (message, title = 'Notification') => addToast({ title, message, type: 'info' }),
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-cyan-400 shrink-0" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/40 bg-slate-900/95 shadow-emerald-500/10';
      case 'error':
        return 'border-rose-500/40 bg-slate-900/95 shadow-rose-500/10';
      case 'warning':
        return 'border-amber-500/40 bg-slate-900/95 shadow-amber-500/10';
      default:
        return 'border-cyan-500/40 bg-slate-900/95 shadow-cyan-500/10';
    }
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      {/* Toast Notification Portal */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={`pointer-events-auto p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 flex items-start gap-3.5 ${getBorderColor(
              t.type
            )}`}
          >
            {getIcon(t.type)}
            <div className="flex-1 text-xs">
              {t.title && <h5 className="font-bold text-slate-100 mb-0.5">{t.title}</h5>}
              <p className="text-slate-300 leading-relaxed">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-500 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast: {
        success: (m) => console.log('Toast success:', m),
        error: (m) => console.error('Toast error:', m),
        warning: (m) => console.warn('Toast warning:', m),
        info: (m) => console.info('Toast info:', m),
      },
    };
  }
  return context;
};
