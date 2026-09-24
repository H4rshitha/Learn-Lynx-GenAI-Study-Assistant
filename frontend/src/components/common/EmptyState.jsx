import React from 'react';
import { BookOpen, FolderOpen, Search, HelpCircle, Sparkles } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No Items Found',
  description = 'There are no records matching your current filter or selection.',
  actionLabel = '',
  onAction = null,
  actionIcon: ActionIcon = Sparkles,
  className = '',
}) => {
  return (
    <div
      className={`p-10 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl text-center flex flex-col items-center justify-center space-y-4 ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-400 shadow-inner">
        <Icon className="w-8 h-8 text-cyan-400/80" />
      </div>

      <div className="max-w-sm space-y-1.5">
        <h4 className="text-base font-bold text-white tracking-tight">{title}</h4>
        <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
      </div>

      {actionLabel && onAction && (
        <div className="pt-2">
          <Button variant="gradient" size="sm" onClick={onAction}>
            <ActionIcon className="w-4 h-4 mr-1.5" />
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
