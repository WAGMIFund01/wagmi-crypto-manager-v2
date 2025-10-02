import React from 'react';
import { COLORS } from '@/shared/constants/colors';

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  theme?: 'default' | 'green' | 'gray';
  className?: string;
}

/**
 * Universal card header component for consistent styling across the app
 * Provides standardized padding, typography, and optional actions
 */
export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  theme = 'default',
  className = '',
}) => {
  const getTitleColor = () => {
    switch (theme) {
      case 'green':
        return COLORS.primary;
      case 'gray':
        return COLORS.text.secondary;
      default:
        return COLORS.text.primary;
    }
  };

  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div className="min-w-0 flex-1">
        <h3 
          className="text-lg font-semibold truncate" 
          style={{ color: getTitleColor() }}
        >
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="ml-4 flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

export default CardHeader;

