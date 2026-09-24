import React from 'react';
import { cn } from '../../utils/cn';

export const GlassCard = ({
  children,
  className,
  hoverEffect = false,
  glow = false,
  borderGradient = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass-card rounded-2xl p-6 transition-all duration-300 relative overflow-hidden',
        hoverEffect && 'glass-card-hover cursor-pointer',
        glow && 'shadow-glow-sm hover:shadow-glow-md',
        borderGradient && 'gradient-border',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
