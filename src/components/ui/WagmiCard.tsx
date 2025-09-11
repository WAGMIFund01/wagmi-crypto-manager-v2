'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/shared/utils';

interface WagmiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'kpi' | 'ribbon' | 'container' | 'modal';
  theme?: 'green' | 'orange' | 'blue' | 'red' | 'gray';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  glow?: boolean;
  children?: React.ReactNode;
}

const WagmiCard = forwardRef<HTMLDivElement, WagmiCardProps>(
  ({
    variant = 'default',
    theme = 'green',
    size = 'md',
    hover = true,
    glow = false,
    className,
    children,
    ...props
  }, ref) => {
    // Base classes for all cards
    const baseClasses = 'relative transition-all duration-300';
    
    // Size variants
    const sizeClasses = {
      sm: 'p-3 rounded-lg',
      md: 'p-4 md:p-6 rounded-2xl',
      lg: 'p-6 md:p-8 rounded-2xl',
      xl: 'p-8 md:p-10 rounded-3xl'
    };
    
    // Variant-specific classes
    const variantClasses = {
      default: 'bg-gray-800 border border-gray-700',
      kpi: 'bg-gray-900 border border-gray-800',
      ribbon: 'bg-transparent border-0',
      container: 'bg-gray-900 border border-gray-800',
      modal: 'bg-gray-900 border border-gray-800'
    };
    
    // Theme colors
    const themeColors = {
      green: {
        bg: '#1A1F1A',
        border: 'rgba(0, 255, 149, 0.2)',
        glow: 'rgba(0, 255, 149, 0.1)',
        hover: 'rgba(0, 255, 149, 0.15)',
        shadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 15px rgba(0, 255, 149, 0.1)'
      },
      orange: {
        bg: '#2A1F1A',
        border: 'rgba(255, 107, 53, 0.2)',
        glow: 'rgba(255, 107, 53, 0.1)',
        hover: 'rgba(255, 107, 53, 0.15)',
        shadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 15px rgba(255, 107, 53, 0.1)'
      },
      blue: {
        bg: '#1A1F2A',
        border: 'rgba(59, 130, 246, 0.2)',
        glow: 'rgba(59, 130, 246, 0.1)',
        hover: 'rgba(59, 130, 246, 0.15)',
        shadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 15px rgba(59, 130, 246, 0.1)'
      },
      red: {
        bg: '#2A1A1A',
        border: 'rgba(239, 68, 68, 0.2)',
        glow: 'rgba(239, 68, 68, 0.1)',
        hover: 'rgba(239, 68, 68, 0.15)',
        shadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 15px rgba(239, 68, 68, 0.1)'
      },
      gray: {
        bg: '#1A1A1A',
        border: 'rgba(107, 114, 128, 0.2)',
        glow: 'rgba(107, 114, 128, 0.1)',
        hover: 'rgba(107, 114, 128, 0.15)',
        shadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 15px rgba(107, 114, 128, 0.1)'
      }
    };
    
    const colors = themeColors[theme];
    const sizeClass = sizeClasses[size];
    const variantClass = variantClasses[variant];
    
    // Special handling for ribbon variant (compact horizontal)
    const isRibbon = variant === 'ribbon';
    const ribbonClasses = isRibbon ? 'p-2 rounded-lg min-w-[80px] text-center' : '';
    
    const cardStyles: React.CSSProperties = {
      backgroundColor: isRibbon ? 'transparent' : colors.bg,
      border: isRibbon ? 'none' : `1px solid ${colors.border}`,
      borderRadius: isRibbon ? '8px' : undefined,
      boxShadow: isRibbon ? 'none' : colors.shadow
    };
    
    const hoverStyles: React.CSSProperties = {
      boxShadow: isRibbon ? 'none' : `${colors.shadow}, 0 0 20px ${colors.hover}`
    };
    
    // Glow styles for future use
    // const glowStyles: React.CSSProperties = {
    //   boxShadow: isRibbon ? 'none' : `${colors.shadow}, 0 0 30px ${colors.glow}`
    // };
    
    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          sizeClass,
          variantClass,
          ribbonClasses,
          hover && !isRibbon && 'hover:shadow-[0_0_20px_rgba(0,255,149,0.15)] hover:shadow-green-500/20',
          glow && !isRibbon && 'shadow-[0_0_30px_rgba(0,255,149,0.1)]',
          className
        )}
        style={cardStyles}
        onMouseEnter={(e) => {
          if (hover && !isRibbon) {
            Object.assign(e.currentTarget.style, hoverStyles);
          }
        }}
        onMouseLeave={(e) => {
          if (hover && !isRibbon) {
            Object.assign(e.currentTarget.style, cardStyles);
          }
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

WagmiCard.displayName = 'WagmiCard';

export default WagmiCard;
