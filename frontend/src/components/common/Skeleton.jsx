import React from 'react';

export const PulseBlock = ({ className = '', height = 'h-4', width = 'w-full' }) => (
  <div className={`animate-pulse bg-slate-800/80 rounded-lg ${height} ${width} ${className}`} />
);

export const CardSkeleton = ({ count = 1, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl animate-pulse space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800/90" />
            <div className="space-y-2">
              <div className="w-32 h-4 rounded bg-slate-800/90" />
              <div className="w-20 h-3 rounded bg-slate-800/60" />
            </div>
          </div>
          <div className="w-16 h-6 rounded-full bg-slate-800/70" />
        </div>
        <div className="space-y-2 pt-2">
          <div className="w-full h-3.5 rounded bg-slate-800/70" />
          <div className="w-4/5 h-3.5 rounded bg-slate-800/60" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
          <div className="w-24 h-3 rounded bg-slate-800/60" />
          <div className="w-16 h-4 rounded bg-slate-800/80" />
        </div>
      </div>
    ))}
  </div>
);

export const StatsSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl animate-pulse space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="w-24 h-3.5 rounded bg-slate-800/80" />
          <div className="w-8 h-8 rounded-xl bg-slate-800/80" />
        </div>
        <div className="w-20 h-7 rounded bg-slate-800/90" />
        <div className="w-32 h-3 rounded bg-slate-800/60" />
      </div>
    ))}
  </div>
);

export const TableRowSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="divide-y divide-slate-800/60 animate-pulse">
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="py-4 px-4 flex items-center justify-between gap-4">
        {Array.from({ length: cols }).map((_, c) => (
          <div
            key={c}
            className={`h-4 rounded bg-slate-800/80 ${
              c === 0 ? 'w-1/3' : c === cols - 1 ? 'w-16' : 'w-24'
            }`}
          />
        ))}
      </div>
    ))}
  </div>
);

export const ChatMessageSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex items-start gap-4 max-w-2xl">
      <div className="w-9 h-9 rounded-xl bg-slate-800" />
      <div className="flex-1 space-y-2 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="w-48 h-4 rounded bg-slate-800" />
        <div className="w-full h-3.5 rounded bg-slate-800/70" />
        <div className="w-3/4 h-3.5 rounded bg-slate-800/60" />
      </div>
    </div>
    <div className="flex items-start justify-end gap-4 max-w-2xl ml-auto">
      <div className="flex-1 space-y-2 bg-cyan-950/20 p-4 rounded-2xl border border-cyan-800/30">
        <div className="w-full h-3.5 rounded bg-cyan-900/40" />
        <div className="w-2/3 h-3.5 rounded bg-cyan-900/30" />
      </div>
      <div className="w-9 h-9 rounded-xl bg-cyan-800/40" />
    </div>
  </div>
);
