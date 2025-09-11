'use client';

import React from 'react';
import { cn } from '@/shared/utils';

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

export default function FilterChip({ label, isActive, onClick, className }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        // Base styles - pill shape with generous padding
        'px-4 py-2 rounded-full text-sm font-medium transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:ring-offset-2 focus:ring-offset-gray-900',
        // Default state - outline with transparent fill
        'border border-green-400 bg-transparent text-green-400',
        // Hover state - subtle green glow
        'hover:shadow-[0_0_8px_rgba(0,255,149,0.3)]',
        // Active state - filled with green, dark text
        isActive && 'bg-green-400 text-gray-900 border-green-400',
        // Focus state - outer glow for accessibility
        'focus:shadow-[0_0_12px_rgba(0,255,149,0.4)]',
        className
      )}
    >
      {label}
    </button>
  );
}
