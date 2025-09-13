'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { WagmiCard, WagmiText } from '@/components/ui';

interface ModuleCardProps {
  title: string;
  route: string;
  isComingSoon?: boolean;
  className?: string;
}

export default function ModuleCard({ 
  title, 
  route, 
  isComingSoon = false, 
  className = '' 
}: ModuleCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (isComingSoon) {
      // For now, just show an alert or do nothing
      return;
    }
    router.push(route);
  };

  return (
    <WagmiCard
      variant="default"
      theme="green"
      size="lg"
      hover={true}
      glow={false}
      onClick={handleClick}
      className={`
        w-full max-w-sm mx-auto cursor-pointer
        transition-all duration-300 hover:scale-105 active:scale-95
        ${isComingSoon ? 'opacity-60 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {/* Content */}
      <div className="flex flex-col items-center justify-center h-full min-h-[120px]">
        <WagmiText 
          variant="h4" 
          weight="bold" 
          color="accent" 
          align="center"
          className="leading-tight"
        >
          {title}
        </WagmiText>
        
        {isComingSoon && (
          <WagmiText 
            variant="small" 
            color="muted" 
            align="center"
            className="mt-2 opacity-70"
          >
            Coming Soon
          </WagmiText>
        )}
      </div>
    </WagmiCard>
  );
}
