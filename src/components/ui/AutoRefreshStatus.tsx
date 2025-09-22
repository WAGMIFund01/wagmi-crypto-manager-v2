'use client';

import React, { useState, useEffect } from 'react';
import WagmiCard from './WagmiCard';
import WagmiText from './WagmiText';
import { RefreshIcon } from './icons/WagmiIcons';

interface AutoRefreshStatusProps {
  className?: string;
  onRefresh?: () => Promise<void>;
}

export default function AutoRefreshStatus({ className, onRefresh }: AutoRefreshStatusProps) {
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [nextRefresh, setNextRefresh] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('Calculating...');

  // Calculate next 30-minute mark (e.g., 2:00, 2:30, 3:00, etc.)
  useEffect(() => {
    const calculateNextRefresh = () => {
      const now = new Date();
      
      // Find the next 30-minute mark
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      const milliseconds = now.getMilliseconds();
      
      // Calculate minutes until next 30-minute mark
      let minutesUntilNext = 30 - (minutes % 30);
      
      // If we're exactly at a 30-minute mark, go to the next one
      if (minutes % 30 === 0 && seconds === 0 && milliseconds === 0) {
        minutesUntilNext = 30;
      }
      
      const next = new Date(now.getTime() + minutesUntilNext * 60 * 1000);
      // Reset seconds and milliseconds to get clean 30-minute marks
      next.setSeconds(0, 0);
      
      setNextRefresh(next);
    };

    calculateNextRefresh();
  }, []);

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
        // Trigger the actual refresh
        if (onRefresh) {
          console.log('Auto-refresh: Triggering refresh...');
          onRefresh().then(() => {
            console.log('Auto-refresh: Completed successfully');
            setLastRefresh(new Date());
          }).catch((error) => {
            console.error('Auto-refresh: Failed:', error);
          });
        }
        // Calculate the next 30-minute mark
        const next30Min = new Date(now.getTime() + 30 * 60 * 1000);
        next30Min.setSeconds(0, 0);
        setNextRefresh(next30Min);
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
      if (onRefresh) {
        console.log('Manual refresh: Triggering refresh...');
        await onRefresh();
        setLastRefresh(new Date());
        console.log('Manual refresh completed at:', new Date().toLocaleTimeString());
      } else {
        console.error('Manual refresh: No refresh function provided');
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
