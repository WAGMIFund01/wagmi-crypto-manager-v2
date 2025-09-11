'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/shared/utils';

interface WagmiTextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption' | 'label' | 'small';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'muted' | 'accent' | 'success' | 'warning' | 'error' | 'white' | 'black';
  align?: 'left' | 'center' | 'right' | 'justify';
  children?: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
}

const WagmiText = forwardRef<HTMLElement, WagmiTextProps>(
  ({
    variant = 'body',
    weight = 'normal',
    color = 'primary',
    align = 'left',
    className,
    children,
    as,
    ...props
  }, ref) => {
    // Variant styles
    const variantStyles = {
      h1: 'text-4xl md:text-5xl lg:text-6xl',
      h2: 'text-3xl md:text-4xl lg:text-5xl',
      h3: 'text-2xl md:text-3xl lg:text-4xl',
      h4: 'text-xl md:text-2xl lg:text-3xl',
      h5: 'text-lg md:text-xl lg:text-2xl',
      h6: 'text-base md:text-lg lg:text-xl',
      body: 'text-sm md:text-base',
      caption: 'text-xs md:text-sm',
      label: 'text-xs font-medium uppercase tracking-wider',
      small: 'text-xs'
    };
    
    // Weight styles
    const weightStyles = {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold'
    };
    
    // Color styles
    const colorStyles = {
      primary: 'text-white',
      secondary: 'text-gray-300',
      muted: 'text-gray-400',
      accent: 'text-[#00FF95]',
      success: 'text-green-400',
      warning: 'text-yellow-400',
      error: 'text-red-400',
      white: 'text-white',
      black: 'text-black'
    };
    
    // Alignment styles
    const alignStyles = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify'
    };
    
    // Default HTML element for each variant
    const defaultElements = {
      h1: 'h1',
      h2: 'h2',
      h3: 'h3',
      h4: 'h4',
      h5: 'h5',
      h6: 'h6',
      body: 'p',
      caption: 'p',
      label: 'label',
      small: 'span'
    };
    
    const Element = as || (defaultElements[variant] as keyof React.JSX.IntrinsicElements);
    
    return React.createElement(
      Element,
      {
        ref,
        className: cn(
          variantStyles[variant],
          weightStyles[weight],
          colorStyles[color],
          alignStyles[align],
          className
        ),
        ...props
      },
      children
    );
  }
);

WagmiText.displayName = 'WagmiText';

export default WagmiText;
