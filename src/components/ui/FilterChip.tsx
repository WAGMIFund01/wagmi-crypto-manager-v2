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
        'focus:outline-none focus:ring-1 focus:ring-[#FF6600]/50 focus:ring-offset-1 focus:ring-offset-gray-900',
        // Default state - outline with transparent fill (using brand orange #FF6600)
        'border border-[#FF6600] bg-transparent text-[#FF6600]',
        // Hover state - subtle green glow (matching WagmiButton)
        'hover:shadow-[0_0_10px_rgba(0,255,149,0.3)]',
        // Active state - filled with brand green, dark text (matching WagmiButton)
        isActive && 'bg-[#FF6600] text-black border-[#FF6600]',
        // Focus state - outer glow for accessibility (matching WagmiButton)
        'focus:shadow-[0_0_0_2px_rgba(0,255,149,0.3)]',
        className
      )}
    >
      {label}
    </button>
  );
}