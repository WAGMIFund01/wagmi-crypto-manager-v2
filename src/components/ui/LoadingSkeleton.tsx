'use client';

import React from 'react';
import { cn } from '@/shared/utils';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = '100%',
  height = '1rem',
  rounded = true
}) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-700',
        rounded && 'rounded',
        className
      )}
      style={{ width, height }}
    />
  );
};

// Pre-configured skeleton components
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-6 border border-gray-700 rounded-lg bg-gray-800/50', className)}>
    <Skeleton height="1.5rem" width="60%" className="mb-4" />
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex justify-between">
            <Skeleton height="0.875rem" width="40%" />
            <Skeleton height="0.875rem" width="30%" />
          </div>
          <Skeleton height="0.5rem" width="100%" />
          <Skeleton height="0.75rem" width="20%" />
        </div>
      ))}
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; className?: string }> = ({ 
  rows = 5, 
  className 
}) => (
  <div className={cn('space-y-3', className)}>
    {/* Header */}
    <div className="grid grid-cols-6 gap-4 p-4 border-b border-gray-700">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} height="0.875rem" width="80%" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="grid grid-cols-6 gap-4 p-4">
        {Array.from({ length: 6 }).map((_, colIndex) => (
          <Skeleton key={colIndex} height="1rem" width="90%" />
        ))}
      </div>
    ))}
  </div>
);

export const DistributionCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-4 md:p-6 border border-gray-700 rounded-lg bg-gray-800/50', className)}>
    <Skeleton height="1.5rem" width="60%" className="mb-4" />
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex justify-between">
            <Skeleton height="0.875rem" width="40%" />
            <Skeleton height="0.875rem" width="30%" />
          </div>
          <Skeleton height="0.5rem" width="100%" />
          <Skeleton height="0.75rem" width="20%" />
        </div>
      ))}
    </div>
  </div>
);

export const ChartSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-6 border border-gray-700 rounded-lg bg-gray-800/50', className)}>
    <Skeleton height="1.5rem" width="50%" className="mb-6" />
    <div className="h-64 flex items-end justify-between space-x-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton 
          key={i} 
          height={`${Math.random() * 200 + 50}px`} 
          width="100%" 
          className="rounded-t"
        />
      ))}
    </div>
  </div>
);

export const NavbarSkeleton: React.FC = () => (
  <header className="bg-gray-900 border-b border-gray-700">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-18 py-4">
        <Skeleton height="2.25rem" width="120px" />
        <div className="flex items-center space-x-4">
          <Skeleton height="1rem" width="150px" />
          <Skeleton height="2.5rem" width="2.5rem" rounded />
          <Skeleton height="2.5rem" width="2.5rem" rounded />
          <Skeleton height="2.5rem" width="2.5rem" rounded />
        </div>
      </div>
    </div>
  </header>
);
