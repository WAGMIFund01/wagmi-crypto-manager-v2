import React from 'react';
import { formatPrice, formatPercentageChange } from '../utils/priceFormatters';

export interface PriceDisplayProps {
  price: number;
  change24h?: number;
  showChange?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Reusable component for displaying prices with optional 24hr change
 */
export function PriceDisplay({
  price,
  change24h,
  showChange = true,
  size = 'md',
  className = ''
}: PriceDisplayProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const changeColor = change24h !== undefined 
    ? (change24h >= 0 ? 'text-green-600' : 'text-red-600')
    : 'text-gray-500';

  return (
    <div className={`flex flex-col ${className}`}>
      <span className={`font-semibold ${sizeClasses[size]}`}>
        {formatPrice(price)}
      </span>
      {showChange && change24h !== undefined && (
        <span className={`text-xs ${changeColor}`}>
          {formatPercentageChange(change24h)}
        </span>
      )}
    </div>
  );
}

export interface PriceChangeIndicatorProps {
  change: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Component for displaying price change indicators
 */
export function PriceChangeIndicator({
  change,
  showIcon = true,
  size = 'sm',
  className = ''
}: PriceChangeIndicatorProps) {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const isPositive = change >= 0;
  const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
  const bgColorClass = isPositive ? 'bg-green-100' : 'bg-red-100';
  
  const icon = isPositive ? '↗' : '↘';

  return (
    <span className={`
      inline-flex items-center px-2 py-1 rounded-full
      ${bgColorClass} ${colorClass} ${sizeClasses[size]}
      ${className}
    `}>
      {showIcon && <span className="mr-1">{icon}</span>}
      {formatPercentageChange(change)}
    </span>
  );
}

export interface PriceCardProps {
  symbol: string;
  price: number;
  change24h?: number;
  marketCap?: number;
  volume24h?: number;
  lastUpdated?: string;
  className?: string;
}

/**
 * Card component for displaying comprehensive price information
 */
export function PriceCard({
  symbol,
  price,
  change24h,
  marketCap,
  volume24h,
  lastUpdated,
  className = ''
}: PriceCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 border ${className}`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {symbol}
        </h3>
        {change24h !== undefined && (
          <PriceChangeIndicator change={change24h} />
        )}
      </div>
      
      <div className="space-y-2">
        <PriceDisplay 
          price={price} 
          change24h={change24h} 
          size="lg"
        />
        
        {marketCap && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Market Cap:</span>{' '}
            {formatPrice(marketCap, { decimals: 0 })}
          </div>
        )}
        
        {volume24h && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">24h Volume:</span>{' '}
            {formatPrice(volume24h, { decimals: 0 })}
          </div>
        )}
        
        {lastUpdated && (
          <div className="text-xs text-gray-500">
            Updated: {new Date(lastUpdated).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}
