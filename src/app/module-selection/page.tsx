'use client';

import React from 'react';
import { ModuleCard, WagmiText } from '@/components/ui';

export default function ModuleSelectionPage() {
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ 
        backgroundColor: '#0B0B0B',
        backgroundImage: 'radial-gradient(circle at center, rgba(0,255,149,0.02) 0%, transparent 70%)'
      }}
    >
      {/* WAGMI Logo */}
      <div className="mb-16">
        <WagmiText 
          variant="h1" 
          weight="bold" 
          color="accent" 
          align="center"
          className="leading-tight"
          style={{ 
            textShadow: '0 0 25px rgba(0, 255, 149, 0.6), 0 0 50px rgba(0, 255, 149, 0.4), 0 0 75px rgba(0, 255, 149, 0.2)',
            letterSpacing: '0.05em'
          }}
        >
          WAGMI
        </WagmiText>
      </div>

      {/* Module Cards */}
      <div className="w-full max-w-6xl">
        {/* Desktop: Three cards in a row */}
        <div className="hidden md:flex md:justify-center md:space-x-12">
          <ModuleCard 
            title="WAGMI Fund Module"
            route="/wagmi-fund-module"
            className="flex-1 max-w-sm"
          />
          <ModuleCard 
            title="Personal Portfolio Module"
            route="/personal-portfolio"
            isComingSoon={true}
            className="flex-1 max-w-sm"
          />
          <ModuleCard 
            title="Developer Module"
            route="/developer"
            isComingSoon={true}
            className="flex-1 max-w-sm"
          />
        </div>

        {/* Tablet: Two cards on first row, one centered on second row */}
        <div className="hidden sm:block md:hidden">
          <div className="flex justify-center space-x-8 mb-8">
            <ModuleCard 
              title="WAGMI Fund Module"
              route="/wagmi-fund-module"
              className="flex-1 max-w-sm"
            />
            <ModuleCard 
              title="Personal Portfolio Module"
              route="/personal-portfolio"
              isComingSoon={true}
              className="flex-1 max-w-sm"
            />
          </div>
          <div className="flex justify-center">
            <ModuleCard 
              title="Developer Module"
              route="/developer"
              isComingSoon={true}
              className="max-w-sm"
            />
          </div>
        </div>

        {/* Mobile: Single column stacked */}
        <div className="block sm:hidden space-y-6">
          <ModuleCard 
            title="WAGMI Fund Module"
            route="/wagmi-fund-module"
          />
          <ModuleCard 
            title="Personal Portfolio Module"
            route="/personal-portfolio"
            isComingSoon={true}
          />
          <ModuleCard 
            title="Developer Module"
            route="/developer"
            isComingSoon={true}
          />
        </div>
      </div>
    </div>
  );
}
