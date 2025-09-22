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
  const [timeRemaining, setTimeRemaining] = useState<string>('Calculating...');

  // Calculate next refresh time and update countdown
  useEffect(() => {
    const calculateNextRefresh = () => {
      const now = new Date();
      // If we have a last refresh, calculate from that time
      // Otherwise, calculate from now
      const baseTime = lastRefresh || now;
      const next = new Date(baseTime.getTime() + 30 * 60 * 1000); // 30 minutes from base time
      setNextRefresh(next);
    };

    calculateNextRefresh();
  }, [lastRefresh]);

  // Update countdown every second
  useEffect(() => {
    const updateCountdown = () => {
      if (!nextRefresh) {
        setTimeRemaining('Calculating...');
        return;
      }
      
      const now = new Date();
      const diff = nextRefresh.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeRemaining('Refreshing...');
        // Reset the timer for the next cycle
        const newNext = new Date(now.getTime() + 30 * 60 * 1000);
        setNextRefresh(newNext);
        return;
      }
      
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      setTimeRemaining(`${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000); // Update every second

    return () => clearInterval(interval);
  }, [nextRefresh]);


  // Manual refresh function
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Call the refresh API
      const response = await fetch('/api/cron/refresh-prices', {
        method: 'POST'
      });
      
      if (response.ok) {
        const now = new Date();
        setLastRefresh(now);
        console.log('Manual refresh completed at:', now.toLocaleTimeString());
      } else {
        console.error('Manual refresh failed:', response.status);
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
            Next: {timeRemaining}
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
