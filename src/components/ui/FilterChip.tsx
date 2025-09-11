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
        // Base styles - 5% size reduction
        'px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-150',
        'whitespace-nowrap', // Prevent text wrapping
        'focus:outline-none focus:ring-1 focus:ring-[#00FF95]/50 focus:ring-offset-1 focus:ring-offset-gray-900',
        // Default state - outline with transparent fill (using brand green #00FF95)
        'border border-[#00FF95] bg-transparent text-[#00FF95]',
        // Hover state - subtle green glow (matching WagmiButton)
        'hover:shadow-[0_0_10px_rgba(0,255,149,0.3)]',
        // Active state - filled with brand green, dark text (matching WagmiButton)
        isActive && 'bg-[#00FF95] text-black border-[#00FF95]',
        // Focus state - outer glow for accessibility (matching WagmiButton)
        'focus:shadow-[0_0_0_2px_rgba(0,255,149,0.3)]',
        className
      )}
    >
      {label}
    </button>
  );
}