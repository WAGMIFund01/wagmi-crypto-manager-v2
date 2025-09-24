/**
 * Standardized component wrappers that enforce consistent usage patterns
 * These components ensure all styling follows the centralized standards
 */

import React from 'react';
import { cn } from '@/shared/utils';
import { 
  getStandardCardStyle, 
  getStandardButtonStyle, 
  getStandardInputStyle,
  getStandardModalStyle,
  getStandardTableStyle,
  getResponsiveGrid,
  getResponsiveFlex,
  getSpacing,
  getBorderRadius,
  getShadow,
  getGlowShadow,
  COMPONENT_STYLES,
  RESPONSIVE,
  ANIMATIONS
} from '@/shared/utils/standardization';
import { COLORS } from '@/shared/constants/colors';

// Standardized Container Component
interface StandardContainerProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  center?: boolean;
}

export const StandardContainer: React.FC<StandardContainerProps> = ({
  children,
  className,
  spacing = 'lg',
  maxWidth = '7xl',
  center = true,
}) => {
  const spacingClass = {
    sm: 'py-4',
    md: 'py-6',
    lg: 'py-8 md:py-12',
    xl: 'py-12 md:py-16',
  }[spacing];

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  }[maxWidth];

  return (
    <div
      className={cn(
        'w-full',
        spacingClass,
        maxWidthClass,
        center && 'mx-auto',
        RESPONSIVE.spacing.container,
        className
      )}
    >
      {children}
    </div>
  );
};

// Standardized Section Component
interface StandardSectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
}

export const StandardSection: React.FC<StandardSectionProps> = ({
  children,
  className,
  title,
  subtitle,
  spacing = 'lg',
}) => {
  const spacingClass = {
    sm: 'mb-4',
    md: 'mb-6',
    lg: 'mb-8',
    xl: 'mb-12',
  }[spacing];

  return (
    <section className={cn(spacingClass, className)}>
      {title && (
        <div className="mb-6">
          <h2
            className="text-2xl font-bold mb-2"
            style={{
              color: COLORS.primary.green,
              textShadow: '0 0 10px rgba(0, 255, 149, 0.3)'
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-400 text-lg">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
};

// Standardized Grid Component
interface StandardGridProps {
  children: React.ReactNode;
  className?: string;
  columns: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

export const StandardGrid: React.FC<StandardGridProps> = ({
  children,
  className,
  columns,
  gap = 'md',
}) => {
  const gapClass = {
    sm: 'gap-2',
    md: 'gap-4 md:gap-6',
    lg: 'gap-6 md:gap-8',
    xl: 'gap-8 md:gap-12',
  }[gap];

  return (
    <div
      className={cn(
        getResponsiveGrid(columns),
        gapClass,
        className
      )}
    >
      {children}
    </div>
  );
};

// Standardized Flex Component
interface StandardFlexProps {
  children: React.ReactNode;
  className?: string;
  direction: 'center' | 'between' | 'start' | 'end' | 'col' | 'row';
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  wrap?: boolean;
}

export const StandardFlex: React.FC<StandardFlexProps> = ({
  children,
  className,
  direction,
  gap = 'md',
  wrap = false,
}) => {
  const gapClass = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  }[gap];

  return (
    <div
      className={cn(
        getResponsiveFlex(direction),
        gapClass,
        wrap && 'flex-wrap',
        className
      )}
    >
      {children}
    </div>
  );
};

// Standardized Loading Component
interface StandardLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  centered?: boolean;
}

export const StandardLoading: React.FC<StandardLoadingProps> = ({
  size = 'md',
  text = 'Loading...',
  centered = true,
}) => {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size];

  const textSizeClass = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }[size];

  const content = (
    <div className={getResponsiveFlex('center')}>
      <div className={cn('animate-spin', sizeClass)}>
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
      {text && (
        <span className={cn('ml-2 text-gray-400', textSizeClass)}>
          {text}
        </span>
      )}
    </div>
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        {content}
      </div>
    );
  }

  return content;
};

// Standardized Error Component
interface StandardErrorProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

export const StandardError: React.FC<StandardErrorProps> = ({
  title = 'Error',
  message,
  onRetry,
  retryText = 'Try Again',
}) => {
  return (
    <div className="text-center py-8">
      <div className="mb-4">
        <svg
          className="w-12 h-12 mx-auto text-red-500 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className={cn(
            getStandardButtonStyle('primary'),
            'px-4 py-2 rounded-lg',
            'bg-red-600 hover:bg-red-700 text-white'
          )}
        >
          {retryText}
        </button>
      )}
    </div>
  );
};

// Standardized Empty State Component
interface StandardEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const StandardEmptyState: React.FC<StandardEmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="text-center py-12">
      {icon && (
        <div className="mb-4 text-gray-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-gray-400 mb-6">{description}</p>
      )}
      {action && action}
    </div>
  );
};

// Standardized Page Layout Component
interface StandardPageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const StandardPageLayout: React.FC<StandardPageLayoutProps> = ({
  children,
  title,
  subtitle,
  actions,
  className,
}) => {
  return (
    <div
      className={cn('min-h-screen', className)}
      style={{ backgroundColor: COLORS.background.primary }}
    >
      <StandardContainer>
        {(title || actions) && (
          <StandardFlex direction="between" className="mb-8">
            <div>
              {title && (
                <h1
                  className="text-3xl font-bold mb-2"
                  style={{
                    color: COLORS.primary.green,
                    textShadow: '0 0 20px rgba(0, 255, 149, 0.5), 0 0 40px rgba(0, 255, 149, 0.3)'
                  }}
                >
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-gray-400 text-lg">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-4">
                {actions}
              </div>
            )}
          </StandardFlex>
        )}
        {children}
      </StandardContainer>
    </div>
  );
};
