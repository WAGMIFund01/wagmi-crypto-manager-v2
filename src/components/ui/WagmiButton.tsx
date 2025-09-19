'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/shared/utils';

interface WagmiButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'icon';
  theme?: 'green' | 'orange' | 'blue' | 'red' | 'gray';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children?: React.ReactNode;
}

const WagmiButton = forwardRef<HTMLButtonElement, WagmiButtonProps>(
  ({
    variant = 'primary',
    theme = 'green',
    size = 'md',
    loading = false,
    icon,
    iconPosition = 'left',
    className,
    children,
    disabled,
    ...props
  }, ref) => {
    // Base classes for all buttons
    const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    
    // Size variants
    const sizeClasses = {
      sm: 'h-8 px-3 text-sm rounded-md',
      md: 'h-10 px-4 text-sm rounded-lg',
      lg: 'h-12 px-6 text-base rounded-lg',
      icon: 'w-7 h-7 p-0 rounded-md' // Special size for icon-only buttons
    };
    
    // Icon size variants
    const iconSizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      icon: 'w-3 h-3' // Special size for icon-only buttons
    };
    
    // Theme colors
    const themeColors = {
      green: {
        primary: {
          bg: '#FF6600',
          hover: '#00E085',
          text: '#000000',
          shadow: '0 0 20px rgba(0, 255, 149, 0.3)',
          focus: 'rgba(0, 255, 149, 0.3)'
        },
        outline: {
          bg: 'transparent',
          hover: 'rgba(0, 255, 149, 0.1)',
          text: '#FF6600',
          border: '#FF6600',
          shadow: '0 0 10px rgba(0, 255, 149, 0.3)',
          focus: 'rgba(0, 255, 149, 0.3)'
        },
        ghost: {
          bg: 'transparent',
          hover: 'rgba(0, 255, 149, 0.1)',
          text: '#FF6600',
          shadow: '0 0 8px rgba(0, 255, 149, 0.2)',
          focus: 'rgba(0, 255, 149, 0.3)'
        }
      },
      orange: {
        primary: {
          bg: '#FF6B35',
          hover: '#E55A2B',
          text: '#FFFFFF',
          shadow: '0 0 20px rgba(255, 107, 53, 0.3)',
          focus: 'rgba(255, 107, 53, 0.3)'
        },
        outline: {
          bg: 'transparent',
          hover: 'rgba(255, 107, 53, 0.1)',
          text: '#FF6B35',
          border: '#FF6B35',
          shadow: '0 0 10px rgba(255, 107, 53, 0.3)',
          focus: 'rgba(255, 107, 53, 0.3)'
        },
        ghost: {
          bg: 'transparent',
          hover: 'rgba(255, 107, 53, 0.1)',
          text: '#FF6B35',
          shadow: '0 0 8px rgba(255, 107, 53, 0.2)',
          focus: 'rgba(255, 107, 53, 0.3)'
        }
      },
      blue: {
        primary: {
          bg: '#3B82F6',
          hover: '#2563EB',
          text: '#FFFFFF',
          shadow: '0 0 20px rgba(59, 130, 246, 0.3)',
          focus: 'rgba(59, 130, 246, 0.3)'
        },
        outline: {
          bg: 'transparent',
          hover: 'rgba(59, 130, 246, 0.1)',
          text: '#3B82F6',
          border: '#3B82F6',
          shadow: '0 0 10px rgba(59, 130, 246, 0.3)',
          focus: 'rgba(59, 130, 246, 0.3)'
        },
        ghost: {
          bg: 'transparent',
          hover: 'rgba(59, 130, 246, 0.1)',
          text: '#3B82F6',
          shadow: '0 0 8px rgba(59, 130, 246, 0.2)',
          focus: 'rgba(59, 130, 246, 0.3)'
        }
      },
      red: {
        primary: {
          bg: '#EF4444',
          hover: '#DC2626',
          text: '#FFFFFF',
          shadow: '0 0 20px rgba(239, 68, 68, 0.3)',
          focus: 'rgba(239, 68, 68, 0.3)'
        },
        outline: {
          bg: 'transparent',
          hover: 'rgba(239, 68, 68, 0.1)',
          text: '#EF4444',
          border: '#EF4444',
          shadow: '0 0 10px rgba(239, 68, 68, 0.3)',
          focus: 'rgba(239, 68, 68, 0.3)'
        },
        ghost: {
          bg: 'transparent',
          hover: 'rgba(239, 68, 68, 0.1)',
          text: '#EF4444',
          shadow: '0 0 8px rgba(239, 68, 68, 0.2)',
          focus: 'rgba(239, 68, 68, 0.3)'
        }
      },
      gray: {
        primary: {
          bg: '#6B7280',
          hover: '#4B5563',
          text: '#FFFFFF',
          shadow: '0 0 20px rgba(107, 114, 128, 0.3)',
          focus: 'rgba(107, 114, 128, 0.3)'
        },
        outline: {
          bg: 'transparent',
          hover: 'rgba(107, 114, 128, 0.1)',
          text: '#6B7280',
          border: '#6B7280',
          shadow: '0 0 10px rgba(107, 114, 128, 0.3)',
          focus: 'rgba(107, 114, 128, 0.3)'
        },
        ghost: {
          bg: 'transparent',
          hover: 'rgba(107, 114, 128, 0.1)',
          text: '#6B7280',
          shadow: '0 0 8px rgba(107, 114, 128, 0.2)',
          focus: 'rgba(107, 114, 128, 0.3)'
        }
      }
    };

    const colors = themeColors[theme];
    const actualVariant = variant === 'icon' ? 'ghost' : variant;
    const variantStyles = colors[actualVariant];
    
    // Icon-only button sizing
    const iconOnlySizes = {
      sm: 'h-8 w-8 p-0 rounded-md',
      md: 'h-10 w-10 p-0 rounded-lg',
      lg: 'h-12 w-12 p-0 rounded-lg',
      icon: 'w-7 h-7 p-0 rounded-md'
    };

    const isIconOnly = variant === 'icon' || (!children && icon);
    const sizeClass = isIconOnly ? iconOnlySizes[size] : sizeClasses[size];
    const iconSizeClass = iconSizeClasses[size];

    const buttonStyles: React.CSSProperties = {
      backgroundColor: variantStyles.bg,
      color: variantStyles.text,
      border: actualVariant === 'outline' ? `1px solid ${themeColors[theme].outline.border}` : 'none',
      boxShadow: 'none'
    };

    const hoverStyles: React.CSSProperties = {
      backgroundColor: variantStyles.hover,
      boxShadow: variantStyles.shadow
    };

    const focusStyles: React.CSSProperties = {
      boxShadow: `0 0 0 2px ${variantStyles.focus}`
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          sizeClass,
          className
        )}
        style={buttonStyles}
        disabled={disabled || loading}
        onMouseEnter={(e) => {
          if (!disabled && !loading) {
            Object.assign(e.currentTarget.style, hoverStyles);
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !loading) {
            Object.assign(e.currentTarget.style, buttonStyles);
          }
        }}
        onFocus={(e) => {
          if (!disabled && !loading) {
            Object.assign(e.currentTarget.style, focusStyles);
          }
        }}
        onBlur={(e) => {
          if (!disabled && !loading) {
            Object.assign(e.currentTarget.style, buttonStyles);
          }
        }}
        {...props}
      >
        {loading && (
          <div className={cn('animate-spin', iconSizeClass, children && 'mr-2')}>
            <svg
              className="w-full h-full"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
        
        {!loading && icon && iconPosition === 'left' && children && (
          <span className={cn(iconSizeClass, 'mr-2')}>
            {icon}
          </span>
        )}
        
        {children && (
          <span>{children}</span>
        )}
        
        {!loading && icon && iconPosition === 'right' && children && (
          <span className={cn(iconSizeClass, 'ml-2')}>
            {icon}
          </span>
        )}
        
        {/* Icon-only button - render icon directly without margin */}
        {!loading && icon && !children && (
          <span className={iconSizeClass}>
            {icon}
          </span>
        )}
      </button>
    );
  }
);

WagmiButton.displayName = 'WagmiButton';

export default WagmiButton;
