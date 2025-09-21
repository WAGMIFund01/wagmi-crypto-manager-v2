'use client';

import React from 'react';
import { cn } from '@/shared/utils';

export interface FormErrorProps {
  error?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'inline' | 'block';
}

/**
 * Standardized error display component for forms
 */
export default function FormError({ 
  error, 
  className,
  size = 'md',
  variant = 'default'
}: FormErrorProps) {
  if (!error) return null;

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const variantClasses = {
    default: 'p-3 bg-red-900/20 border border-red-500/30 rounded-lg',
    inline: 'text-red-400',
    block: 'block text-red-400'
  };

  return (
    <div className={cn(
      variantClasses[variant],
      sizeClasses[size],
      className
    )}>
      <p className="text-red-400">{error}</p>
    </div>
  );
}

/**
 * Field-specific error display
 */
export function FieldError({ 
  error, 
  className,
  size = 'sm'
}: Omit<FormErrorProps, 'variant'>) {
  return (
    <FormError 
      error={error} 
      variant="inline" 
      size={size}
      className={cn('mt-1', className)}
    />
  );
}

/**
 * Form-level error display
 */
export function FormErrorDisplay({ 
  errors, 
  className,
  size = 'md'
}: {
  errors: string[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  if (errors.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {errors.map((error, index) => (
        <FormError 
          key={index} 
          error={error} 
          size={size}
        />
      ))}
    </div>
  );
}
