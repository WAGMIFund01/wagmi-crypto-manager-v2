'use client';

import React, { useState, useEffect } from 'react';
import WagmiCard from './WagmiCard';
import WagmiText from './WagmiText';
import { RefreshIcon } from './icons/WagmiIcons';

interface AutoRefreshStatusProps {
  className?: string;
}

export default function AutoRefreshStatus({ className }: AutoRefreshStatusProps) {
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [nextRefresh, setNextRefresh] = useState<Date | null>(null);

  // Calculate next refresh time (every 30 minutes)
  useEffect(() => {
    const calculateNextRefresh = () => {
      const now = new Date();
      const next = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now
      setNextRefresh(next);
    };

    calculateNextRefresh();
    const interval = setInterval(calculateNextRefresh, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Format time remaining
  const getTimeRemaining = () => {
    if (!nextRefresh) return 'Calculating...';
    
    const now = new Date();
    const diff = nextRefresh.getTime() - now.getTime();
    
    if (diff <= 0) return 'Refreshing...';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  // Simulate refresh (in real implementation, this would be triggered by the actual refresh)
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Call the refresh API
      const response = await fetch('/api/cron/refresh-prices', {
        method: 'POST'
      });
      
      if (response.ok) {
        setLastRefresh(new Date());
        // Recalculate next refresh
        const now = new Date();
        setNextRefresh(new Date(now.getTime() + 30 * 60 * 1000));
      }
    } catch (error) {
      console.error('Manual refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <WagmiCard variant="container" theme="green" size="sm" className={className}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <RefreshIcon className="w-4 h-4 text-green-400" />
            <WagmiText variant="body" className="text-green-400 font-medium">
              Auto Refresh
            </WagmiText>
          </div>
          
          <div className="text-xs text-gray-400">
            {lastRefresh ? (
              <span>Last: {lastRefresh.toLocaleTimeString()}</span>
            ) : (
              <span>Starting soon...</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-xs text-gray-400">
            Next: {getTimeRemaining()}
          </div>
          
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-1 rounded hover:bg-gray-700 disabled:opacity-50"
            title="Manual refresh"
          >
            <RefreshIcon 
              className={`w-3 h-3 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} 
            />
          </button>
        </div>
      </div>
    </WagmiCard>
  );
}
