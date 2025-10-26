'use client';

import React from 'react';
import WagmiCard from './WagmiCard';
import WagmiText from './WagmiText';
import { formatCurrency } from '@/shared/utils/maskSensitiveData';

interface LiquidityPoolPerformanceCardProps {
  initialDeposit: number;
  currentValue: number;
  yieldGenerated: number;
  spotValue: number; // HODL value
  isPrivacyMode?: boolean;
  className?: string;
}

/**
 * Liquidity Pool Performance Card - Shows LP position metrics
 */
export default function LiquidityPoolPerformanceCard({
  initialDeposit,
  currentValue,
  yieldGenerated,
  spotValue,
  isPrivacyMode = false,
  className = ''
}: LiquidityPoolPerformanceCardProps) {
  // Computed values
  const capitalAppreciation = currentValue - initialDeposit;
  const totalReturn = capitalAppreciation + yieldGenerated;
  const roi = (totalReturn / initialDeposit) * 100;
  const oppCostDelta = currentValue - spotValue;
  const oppCostRatio = spotValue > 0 ? (currentValue / spotValue) * 100 : 0;

  return (
    <WagmiCard 
      variant="default" 
      theme="green" 
      size="lg" 
      className={className}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <WagmiText variant="h4" weight="bold" color="white">
            Liquidity Pool Performance
          </WagmiText>
          <div className="text-right">
            <WagmiText variant="h5" weight="bold" color="accent">
              {formatCurrency(currentValue, isPrivacyMode)}
            </WagmiText>
            <WagmiText variant="small" color="muted">
              Current Value
            </WagmiText>
          </div>
        </div>

        {/* KPI Grid - Responsive: 4-col desktop, 2-col tablet, 1-col mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Initial Deposit */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <WagmiText variant="label" color="muted" className="mb-2">
              Initial Deposit
            </WagmiText>
            <WagmiText variant="h6" weight="semibold" color="white" className="mb-1">
              {formatCurrency(initialDeposit, isPrivacyMode)}
            </WagmiText>
          </div>

          {/* Capital Appreciation */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <WagmiText variant="label" color="muted" className="mb-2">
              Capital Appreciation
            </WagmiText>
            <WagmiText 
              variant="h6" 
              weight="semibold" 
              color={capitalAppreciation >= 0 ? "success" : "error"}
              className="mb-1"
            >
              {isPrivacyMode ? formatCurrency(capitalAppreciation, isPrivacyMode) : `${capitalAppreciation >= 0 ? '+' : ''}${formatCurrency(capitalAppreciation, isPrivacyMode)}`}
            </WagmiText>
          </div>

          {/* Yield Generated */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <WagmiText variant="label" color="muted" className="mb-2">
              Yield Generated
            </WagmiText>
            <WagmiText variant="h6" weight="semibold" color="success" className="mb-1">
              {formatCurrency(yieldGenerated, isPrivacyMode)}
            </WagmiText>
          </div>

          {/* Spot Value (HODL) */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <WagmiText variant="label" color="muted" className="mb-2">
              HODL Value
            </WagmiText>
            <WagmiText variant="h6" weight="semibold" color="white" className="mb-1">
              {formatCurrency(spotValue, isPrivacyMode)}
            </WagmiText>
          </div>

          {/* Total Return with ROI */}
          <div className="bg-gray-800/50 rounded-lg p-4 lg:col-span-2">
            <WagmiText variant="label" color="muted" className="mb-2">
              Total Return
            </WagmiText>
            <WagmiText 
              variant="h6" 
              weight="semibold" 
              color={totalReturn >= 0 ? "success" : "error"}
              className="mb-1"
            >
              {isPrivacyMode ? formatCurrency(totalReturn, isPrivacyMode) : `${totalReturn >= 0 ? '+' : ''}${formatCurrency(totalReturn, isPrivacyMode)}`}
            </WagmiText>
            <div className="flex items-center justify-between mb-2">
              <WagmiText variant="small" color="muted">
                ROI: {Math.round(roi)}%
              </WagmiText>
            </div>
            {/* ROI Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="h-full bg-[#00FF95] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(Math.abs(roi), 100)}%` }}
              />
            </div>
          </div>

          {/* Opportunity Cost vs HODL */}
          <div className="bg-gray-800/50 rounded-lg p-4 lg:col-span-2">
            <WagmiText variant="label" color="muted" className="mb-2">
              Opportunity Cost vs HODL
            </WagmiText>
            <WagmiText 
              variant="h6" 
              weight="semibold" 
              color={oppCostDelta >= 0 ? "success" : "error"}
              className="mb-1"
            >
              {isPrivacyMode ? formatCurrency(oppCostDelta, isPrivacyMode) : `${oppCostDelta >= 0 ? '+' : ''}${formatCurrency(oppCostDelta, isPrivacyMode)}`}
            </WagmiText>
            <div className="flex items-center justify-between mb-2">
              <WagmiText variant="small" color="muted">
                Ratio: {Math.round(oppCostRatio)}%
              </WagmiText>
            </div>
            {/* Opportunity Cost Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  oppCostDelta >= 0 ? 'bg-[#00FF95]' : 'bg-red-400'
                }`}
                style={{ width: `${Math.min(Math.abs(oppCostRatio), 100)}%` }}
              />
            </div>
          </div>
        </div>

      </div>
    </WagmiCard>
  );
}
