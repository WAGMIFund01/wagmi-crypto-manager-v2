'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/shared/utils';

interface WagmiAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'error' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  children?: React.ReactNode;
}

const WagmiAlert = forwardRef<HTMLDivElement, WagmiAlertProps>(
  ({
    variant = 'error',
    size = 'md',
    showIcon = true,
    className,
    children,
    ...props
  }, ref) => {
    // Base classes for all alerts
    const baseClasses = 'rounded-lg border transition-all duration-200';
    
    // Size variants
    const sizeClasses = {
      sm: 'p-2 text-xs',
      md: 'p-3 text-sm',
      lg: 'p-4 text-base'
    };
    
    // Variant-specific styles
    const variantStyles = {
      error: {
        bg: 'bg-red-900/20',
        border: 'border-red-800',
        text: 'text-red-400',
        icon: 'text-red-500'
      },
      success: {
        bg: 'bg-green-900/20',
        border: 'border-green-800',
        text: 'text-green-400',
        icon: 'text-green-500'
      },
      warning: {
        bg: 'bg-yellow-900/20',
        border: 'border-yellow-800',
        text: 'text-yellow-400',
        icon: 'text-yellow-500'
      },
      info: {
        bg: 'bg-blue-900/20',
        border: 'border-blue-800',
        text: 'text-blue-400',
        icon: 'text-blue-500'
      }
    };
    
    const styles = variantStyles[variant];
    const sizeClass = sizeClasses[size];
    
    // Icon component
    const AlertIcon = () => {
      if (!showIcon) return null;
      
      const iconProps = {
        className: cn('w-4 h-4 flex-shrink-0', styles.icon),
        fill: 'none',
        viewBox: '0 0 24 24',
        strokeWidth: 2
      };
      
      switch (variant) {
        case 'error':
          return (
            <svg {...iconProps} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          );
        case 'success':
          return (
            <svg {...iconProps} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          );
        case 'warning':
          return (
            <svg {...iconProps} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          );
        case 'info':
          return (
            <svg {...iconProps} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          );
        default:
          return null;
      }
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          sizeClass,
          styles.bg,
          styles.border,
          styles.text,
          className
        )}
        {...props}
      >
        <div className="flex items-start space-x-2">
          <AlertIcon />
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    );
  }
);

WagmiAlert.displayName = 'WagmiAlert';

export default WagmiAlert;
