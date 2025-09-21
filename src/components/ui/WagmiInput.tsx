'use client';

import React, { forwardRef, useState } from 'react';
import { cn } from '@/shared/utils';
import WagmiButton from './WagmiButton';

interface WagmiInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'search' | 'password' | 'email' | 'number';
  theme?: 'green' | 'orange' | 'blue' | 'red' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  showPasswordToggle?: boolean;
  children?: React.ReactNode;
  validateOnBlur?: boolean;
  onValidationChange?: (isValid: boolean, error?: string) => void;
}

const WagmiInput = forwardRef<HTMLInputElement, WagmiInputProps>(
  ({
    variant = 'default',
    theme = 'green',
    size = 'md',
    label,
    error,
    helperText,
    icon,
    iconPosition = 'left',
    showPasswordToggle = false,
    validateOnBlur = false,
    onValidationChange,
    className,
    type,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    // const [isFocused, setIsFocused] = useState(false); // For future use
    
    // Determine input type
    const inputType = variant === 'password' || (variant === 'default' && type === 'password') 
      ? (showPassword ? 'text' : 'password') 
      : variant === 'email' || (variant === 'default' && type === 'email')
      ? 'email'
      : variant === 'number' || (variant === 'default' && type === 'number')
      ? 'number'
      : type || 'text';

    // Base classes for all inputs
    const baseClasses = 'w-full transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none';
    
    // Size variants
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm rounded-md',
      md: 'px-4 py-3 text-base rounded-lg',
      lg: 'px-5 py-4 text-lg rounded-lg'
    };
    
    // Theme colors
    const themeColors = {
      green: {
        bg: '#374151',
        border: '#4B5563',
        focus: 'rgba(0, 255, 149, 0.3)',
        text: '#FFFFFF',
        placeholder: '#9CA3AF',
        error: '#EF4444',
        errorFocus: 'rgba(239, 68, 68, 0.3)'
      },
      orange: {
        bg: '#374151',
        border: '#4B5563',
        focus: 'rgba(255, 107, 53, 0.3)',
        text: '#FFFFFF',
        placeholder: '#9CA3AF',
        error: '#EF4444',
        errorFocus: 'rgba(239, 68, 68, 0.3)'
      },
      blue: {
        bg: '#374151',
        border: '#4B5563',
        focus: 'rgba(59, 130, 246, 0.3)',
        text: '#FFFFFF',
        placeholder: '#9CA3AF',
        error: '#EF4444',
        errorFocus: 'rgba(239, 68, 68, 0.3)'
      },
      red: {
        bg: '#374151',
        border: '#4B5563',
        focus: 'rgba(239, 68, 68, 0.3)',
        text: '#FFFFFF',
        placeholder: '#9CA3AF',
        error: '#EF4444',
        errorFocus: 'rgba(239, 68, 68, 0.3)'
      },
      gray: {
        bg: '#374151',
        border: '#4B5563',
        focus: 'rgba(107, 114, 128, 0.3)',
        text: '#FFFFFF',
        placeholder: '#9CA3AF',
        error: '#EF4444',
        errorFocus: 'rgba(239, 68, 68, 0.3)'
      }
    };
    
    const colors = themeColors[theme];
    const sizeClass = sizeClasses[size];
    const hasError = !!error;
    
    // Icon size based on input size
    const iconSizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };
    
    const iconSize = iconSizeClasses[size];
    
    // Input styles
    const inputStyles: React.CSSProperties = {
      backgroundColor: colors.bg,
      color: colors.text,
      borderColor: hasError ? colors.error : colors.border,
      paddingLeft: (icon && iconPosition === 'left') || variant === 'search' ? '2.75rem' : undefined,
      paddingRight: (icon && iconPosition === 'right') || showPasswordToggle ? '2.75rem' : 
                   (variant === 'number' || (variant === 'default' && type === 'number')) ? '3.5rem' : undefined
    };
    
    const focusStyles: React.CSSProperties = {
      borderColor: hasError ? colors.error : colors.focus,
      boxShadow: `0 0 0 3px ${hasError ? colors.errorFocus : colors.focus}`
    };

    // Search icon for search variant
    const SearchIcon = () => (
      <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    );
    
    // Eye icons for password toggle
    const EyeIcon = () => (
      <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    );
    
    const EyeOffIcon = () => (
      <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
      </svg>
    );

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label className="block text-white text-sm font-medium mb-2">
            {label}
          </label>
        )}
        
        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          
          {/* Search Icon for search variant */}
          {variant === 'search' && !icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
          )}
          
          {/* Input */}
          <input
            ref={ref}
            type={inputType}
            className={cn(
              baseClasses,
              sizeClass,
              className
            )}
            style={inputStyles}
            onFocus={(e) => {
              Object.assign(e.target.style, focusStyles);
            }}
            onBlur={(e) => {
              Object.assign(e.target.style, inputStyles);
              if (validateOnBlur && onValidationChange) {
                const isValid = !error;
                onValidationChange(isValid, error || undefined);
              }
            }}
            {...props}
          />
          
          {/* Right Icon or Password Toggle */}
          {(icon && iconPosition === 'right') || showPasswordToggle ? (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {showPasswordToggle ? (
                <WagmiButton
                  variant="ghost"
                  theme="gray"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="p-0 w-6 h-6"
                  icon={showPassword ? <EyeOffIcon /> : <EyeIcon />}
                />
              ) : (
                <div className="text-gray-400">
                  {icon}
                </div>
              )}
            </div>
          ) : null}
        </div>
        
        {/* Helper Text or Error */}
        {(helperText || error) && (
          <div className="mt-2">
            {error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : (
              <p className="text-sm text-gray-400">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

WagmiInput.displayName = 'WagmiInput';

export default WagmiInput;
