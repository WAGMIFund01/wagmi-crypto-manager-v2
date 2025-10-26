'use client';

import React from 'react';
import WagmiCard from './WagmiCard';
import WagmiText from './WagmiText';
import CardHeader from './CardHeader';
import { formatCurrency } from '@/shared/utils/maskSensitiveData';

interface PortfolioPeakRatioCardProps {
  currentPortfolioValue: number;
  portfolioPeakValue: number;
  lastUpdated?: string;
  isPrivacyMode?: boolean;
  className?: string;
}

/**
 * Portfolio Peak Ratio Card - Shows how close portfolio is to historical best
 */
export default function PortfolioPeakRatioCard({
  currentPortfolioValue,
  portfolioPeakValue,
  lastUpdated,
  isPrivacyMode = false,
  className = ''
}: PortfolioPeakRatioCardProps) {
  // Computed values
  const peakRatio = Math.min((currentPortfolioValue / portfolioPeakValue) * 100, 100);
  const distanceToPeak = Math.max(0, portfolioPeakValue - currentPortfolioValue);

  return (
    <WagmiCard 
      variant="default" 
      theme="green" 
      size="lg" 
      className={className}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <WagmiText variant="h4" weight="bold" color="white">
              Portfolio Peak Ratio
            </WagmiText>
          </div>
          <div className="text-right">
            <WagmiText variant="h5" weight="bold" color="accent">
              {formatCurrency(currentPortfolioValue, isPrivacyMode)}
            </WagmiText>
            <WagmiText variant="small" color="muted">
              Now
            </WagmiText>
          </div>
        </div>

        {/* Main Ratio Display */}
        <div className="mb-6">
          <div className="flex items-baseline space-x-2 mb-3">
            <WagmiText variant="h2" weight="bold" color="white">
              {Math.round(peakRatio)}%
            </WagmiText>
            <WagmiText variant="body" color="muted">
              of peak
            </WagmiText>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-[#00FF95] transition-all duration-500 ease-out"
              style={{ width: `${Math.min(peakRatio, 100)}%` }}
              role="progressbar"
              aria-valuenow={Math.round(peakRatio)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Portfolio is at ${Math.round(peakRatio)}% of peak value`}
            />
          </div>
        </div>

        {/* Facts Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <WagmiText variant="label" color="muted" className="mb-1">
              Peak Value
            </WagmiText>
            <WagmiText variant="h6" weight="semibold" color="white">
              {formatCurrency(portfolioPeakValue, isPrivacyMode)}
            </WagmiText>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <WagmiText variant="label" color="muted" className="mb-1">
              Distance to Peak
            </WagmiText>
            <WagmiText variant="h6" weight="semibold" color="white">
              {formatCurrency(distanceToPeak, isPrivacyMode)}
            </WagmiText>
          </div>
        </div>
      </div>
    </WagmiCard>
  );
}
