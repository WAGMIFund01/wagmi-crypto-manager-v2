import React from 'react';
import WagmiCard from './WagmiCard';
import CardHeader from './CardHeader';

interface Performer {
  symbol: string;
  name: string;
  returnPercentage: number;
  value: number;
}

interface PerformerCardProps {
  title: string;
  performers: Performer[];
  type: 'top' | 'worst';
  formatPercentage: (value: number) => string;
  formatCurrency: (value: number) => string;
  className?: string;
}

/**
 * Universal performer card component for displaying top/worst performing assets
 * Used in Analytics tab for consistent performance visualization
 * Memoized to prevent unnecessary re-renders when parent re-renders
 */
export const PerformerCard: React.FC<PerformerCardProps> = React.memo(({
  title,
  performers,
  type,
  formatPercentage,
  formatCurrency,
  className = '',
}) => {
  const badgeColor = type === 'top' ? 'bg-green-600' : 'bg-red-600';
  const textColor = type === 'top' ? 'text-green-400' : 'text-red-400';

  return (
    <WagmiCard variant="default" theme="green" size="lg" className={className}>
      <div className="pt-2 pb-4 px-4 md:pt-3 md:pb-6 md:px-6">
        <CardHeader title={title} theme="default" className="mb-4" />
        <div className="space-y-2 md:space-y-3">
          {performers.map((asset, index) => (
            <div 
              key={`${asset.symbol}-${index}`} 
              className="flex items-center justify-between p-2 md:p-3 bg-gray-800/50 rounded-lg transition-all duration-200 hover:bg-gray-800/70"
            >
              <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                <div 
                  className={`w-6 h-6 md:w-8 md:h-8 ${badgeColor} rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold flex-shrink-0`}
                >
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-white font-medium text-sm md:text-base truncate">
                    {asset.symbol}
                  </div>
                  <div className="text-gray-400 text-xs md:text-sm truncate">
                    {asset.name}
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <div className={`${textColor} font-medium text-sm md:text-base`}>
                  {formatPercentage(asset.returnPercentage)}
                </div>
                <div className="text-gray-400 text-xs md:text-sm">
                  {formatCurrency(asset.value)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WagmiCard>
  );
});

PerformerCard.displayName = 'PerformerCard';

export default PerformerCard;

