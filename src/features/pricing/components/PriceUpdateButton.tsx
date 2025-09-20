import React from 'react';
import WagmiButton from '@/components/ui/WagmiButton';
import WagmiSpinner from '@/components/ui/WagmiSpinner';

export interface PriceUpdateButtonProps {
  isUpdating: boolean;
  onUpdate: () => void;
  variant?: 'all' | 'single' | 'changes';
  symbol?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Button component for triggering price updates
 */
export function PriceUpdateButton({
  isUpdating,
  onUpdate,
  variant = 'all',
  symbol,
  disabled = false,
  className = ''
}: PriceUpdateButtonProps) {
  const getButtonText = () => {
    if (isUpdating) {
      switch (variant) {
        case 'all':
          return 'Updating All Prices...';
        case 'single':
          return `Updating ${symbol}...`;
        case 'changes':
          return 'Updating Changes...';
        default:
          return 'Updating...';
      }
    }

    switch (variant) {
      case 'all':
        return 'Update All Prices';
      case 'single':
        return `Update ${symbol}`;
      case 'changes':
        return 'Update Price Changes';
      default:
        return 'Update Prices';
    }
  };

  const getIcon = () => {
    if (isUpdating) {
      return <WagmiSpinner size="sm" />;
    }
    
    return (
      <svg 
        className="w-4 h-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
        />
      </svg>
    );
  };

  return (
    <WagmiButton
      onClick={onUpdate}
      disabled={disabled || isUpdating}
      variant="primary"
      size="sm"
      className={`flex items-center gap-2 ${className}`}
    >
      {getIcon()}
      {getButtonText()}
    </WagmiButton>
  );
}

export interface PriceUpdateStatusProps {
  isUpdating: boolean;
  lastUpdate: Date | null;
  updateCount?: number;
  error?: Error | null;
  className?: string;
}

/**
 * Component for displaying price update status
 */
export function PriceUpdateStatus({
  isUpdating,
  lastUpdate,
  updateCount,
  error,
  className = ''
}: PriceUpdateStatusProps) {
  if (isUpdating) {
    return (
      <div className={`flex items-center gap-2 text-blue-600 ${className}`}>
        <WagmiSpinner size="sm" />
        <span className="text-sm">Updating prices...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 text-red-600 ${className}`}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span className="text-sm">Update failed: {error.message}</span>
      </div>
    );
  }

  if (lastUpdate) {
    return (
      <div className={`flex items-center gap-2 text-green-600 ${className}`}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span className="text-sm">
          Last updated: {lastUpdate.toLocaleTimeString()}
          {updateCount && ` (${updateCount} assets)`}
        </span>
      </div>
    );
  }

  return null;
}
