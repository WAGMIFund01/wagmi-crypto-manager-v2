'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/shared/utils';

interface WagmiSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'green' | 'orange' | 'blue' | 'red' | 'gray' | 'white';
  text?: string;
  showText?: boolean;
  centered?: boolean;
}

const WagmiSpinner = forwardRef<HTMLDivElement, WagmiSpinnerProps>(
  ({
    size = 'md',
    theme = 'green',
    text,
    showText = false,
    centered = false,
    className,
    ...props
  }, ref) => {
    // Size variants
    const sizeClasses = {
      xs: 'h-4 w-4',
      sm: 'h-6 w-6',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16'
    };
    
    // Theme colors
    const themeColors = {
      green: '#FF6600',
      orange: '#FF6B35',
      blue: '#3B82F6',
      red: '#EF4444',
      gray: '#6B7280',
      white: '#FFFFFF'
    };
    
    // Text size variants (matches spinner size)
    const textSizeClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg'
    };
    
    const spinnerSize = sizeClasses[size];
    const textSize = textSizeClasses[size];
    const color = themeColors[theme];
    
    const SpinnerIcon = () => (
      <div
        className={cn(
          'animate-spin rounded-full border-b-2',
          spinnerSize
        )}
        style={{
          borderColor: color,
          borderTopColor: 'transparent'
        }}
      />
    );
    
    const content = (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          centered ? 'justify-center' : 'justify-start',
          showText && text ? 'space-x-2' : '',
          className
        )}
        {...props}
      >
        <SpinnerIcon />
        {showText && text && (
          <span className={cn('text-gray-300', textSize)}>
            {text}
          </span>
        )}
      </div>
    );
    
    return content;
  }
);

WagmiSpinner.displayName = 'WagmiSpinner';

export default WagmiSpinner;
