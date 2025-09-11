'use client';

import React from 'react';
import { WagmiCard } from '@/components/ui';

export default function CardDemo() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          WagmiCard Component Demo
        </h1>
        
        {/* Variants */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Card Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <WagmiCard variant="default" theme="green" size="md">
              <h3 className="text-lg font-semibold text-white mb-2">Default Card</h3>
              <p className="text-gray-300 text-sm">Standard card with green theme</p>
            </WagmiCard>
            
            <WagmiCard variant="kpi" theme="green" size="md">
              <h3 className="text-lg font-semibold text-white mb-2">KPI Card</h3>
              <p className="text-gray-300 text-sm">Optimized for KPI metrics</p>
            </WagmiCard>
            
            <WagmiCard variant="container" theme="green" size="md">
              <h3 className="text-lg font-semibold text-white mb-2">Container Card</h3>
              <p className="text-gray-300 text-sm">For content containers</p>
            </WagmiCard>
            
            <WagmiCard variant="modal" theme="green" size="md">
              <h3 className="text-lg font-semibold text-white mb-2">Modal Card</h3>
              <p className="text-gray-300 text-sm">For modal content</p>
            </WagmiCard>
          </div>
        </section>

        {/* Themes */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Theme Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <WagmiCard variant="kpi" theme="green" size="md">
              <div className="text-center">
                <h3 className="text-sm font-normal text-gray-400 mb-1">Green Theme</h3>
                <p className="text-2xl font-bold text-white">$1,234</p>
              </div>
            </WagmiCard>
            
            <WagmiCard variant="kpi" theme="orange" size="md">
              <div className="text-center">
                <h3 className="text-sm font-normal text-gray-400 mb-1">Orange Theme</h3>
                <p className="text-2xl font-bold text-white">$1,234</p>
              </div>
            </WagmiCard>
            
            <WagmiCard variant="kpi" theme="blue" size="md">
              <div className="text-center">
                <h3 className="text-sm font-normal text-gray-400 mb-1">Blue Theme</h3>
                <p className="text-2xl font-bold text-white">$1,234</p>
              </div>
            </WagmiCard>
            
            <WagmiCard variant="kpi" theme="red" size="md">
              <div className="text-center">
                <h3 className="text-sm font-normal text-gray-400 mb-1">Red Theme</h3>
                <p className="text-2xl font-bold text-white">$1,234</p>
              </div>
            </WagmiCard>
            
            <WagmiCard variant="kpi" theme="gray" size="md">
              <div className="text-center">
                <h3 className="text-sm font-normal text-gray-400 mb-1">Gray Theme</h3>
                <p className="text-2xl font-bold text-white">$1,234</p>
              </div>
            </WagmiCard>
          </div>
        </section>

        {/* Sizes */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Card Sizes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <WagmiCard variant="kpi" theme="green" size="sm">
              <div className="text-center">
                <h3 className="text-xs font-normal text-gray-400 mb-1">Small</h3>
                <p className="text-lg font-bold text-white">$1,234</p>
              </div>
            </WagmiCard>
            
            <WagmiCard variant="kpi" theme="green" size="md">
              <div className="text-center">
                <h3 className="text-sm font-normal text-gray-400 mb-1">Medium</h3>
                <p className="text-2xl font-bold text-white">$1,234</p>
              </div>
            </WagmiCard>
            
            <WagmiCard variant="kpi" theme="green" size="lg">
              <div className="text-center">
                <h3 className="text-sm font-normal text-gray-400 mb-1">Large</h3>
                <p className="text-3xl font-bold text-white">$1,234</p>
              </div>
            </WagmiCard>
            
            <WagmiCard variant="kpi" theme="green" size="xl">
              <div className="text-center">
                <h3 className="text-base font-normal text-gray-400 mb-1">Extra Large</h3>
                <p className="text-4xl font-bold text-white">$1,234</p>
              </div>
            </WagmiCard>
          </div>
        </section>

        {/* KPI Ribbon */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">KPI Ribbon (Compact)</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <WagmiCard variant="ribbon" theme="green" size="sm">
              <div>
                <p className="text-xs font-normal text-gray-400 mb-1 uppercase tracking-wide">Active Investors</p>
                <p className="text-sm font-semibold text-white">24</p>
              </div>
            </WagmiCard>
            
            <WagmiCard variant="ribbon" theme="green" size="sm">
              <div>
                <p className="text-xs font-normal text-gray-400 mb-1 uppercase tracking-wide">Total AUM</p>
                <p className="text-sm font-semibold text-white">$2.4M</p>
              </div>
            </WagmiCard>
            
            <WagmiCard variant="ribbon" theme="green" size="sm">
              <div>
                <p className="text-xs font-normal text-gray-400 mb-1 uppercase tracking-wide">Cumulative Return</p>
                <p className="text-sm font-semibold text-green-400">+12.5%</p>
              </div>
            </WagmiCard>
            
            <WagmiCard variant="ribbon" theme="green" size="sm">
              <div>
                <p className="text-xs font-normal text-gray-400 mb-1 uppercase tracking-wide">MoM Return</p>
                <p className="text-sm font-semibold text-green-400">+2.1%</p>
              </div>
            </WagmiCard>
          </div>
        </section>

        {/* Interactive Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Interactive Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WagmiCard variant="kpi" theme="green" size="md" hover={true}>
              <div className="text-center">
                <h3 className="text-sm font-normal text-gray-400 mb-1">Hover Enabled</h3>
                <p className="text-2xl font-bold text-white">Hover me!</p>
                <p className="text-xs text-gray-500 mt-2">Shows glow effect on hover</p>
              </div>
            </WagmiCard>
            
            <WagmiCard variant="kpi" theme="green" size="md" hover={false}>
              <div className="text-center">
                <h3 className="text-sm font-normal text-gray-400 mb-1">Hover Disabled</h3>
                <p className="text-2xl font-bold text-white">Static</p>
                <p className="text-xs text-gray-500 mt-2">No hover effects</p>
              </div>
            </WagmiCard>
            
            <WagmiCard variant="kpi" theme="green" size="md" glow={true}>
              <div className="text-center">
                <h3 className="text-sm font-normal text-gray-400 mb-1">Glow Effect</h3>
                <p className="text-2xl font-bold text-white">Always glowing</p>
                <p className="text-xs text-gray-500 mt-2">Persistent glow effect</p>
              </div>
            </WagmiCard>
            
            <WagmiCard variant="kpi" theme="green" size="md" hover={true} glow={true}>
              <div className="text-center">
                <h3 className="text-sm font-normal text-gray-400 mb-1">Hover + Glow</h3>
                <p className="text-2xl font-bold text-white">Enhanced</p>
                <p className="text-xs text-gray-500 mt-2">Both hover and glow effects</p>
              </div>
            </WagmiCard>
          </div>
        </section>

        {/* Real Usage Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Real Usage Examples</h2>
          
          {/* Investor Dashboard KPI Cards */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Investor Dashboard KPI Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <WagmiCard variant="kpi" theme="green" size="md">
                <div className="space-y-1 md:space-y-2">
                  <h3 className="text-xs md:text-sm font-normal text-gray-400 leading-none">
                    Total Invested
                  </h3>
                  <p className="text-lg md:text-2xl font-bold text-white leading-tight">
                    $50,000
                  </p>
                </div>
              </WagmiCard>
              
              <WagmiCard variant="kpi" theme="green" size="md">
                <div className="space-y-1 md:space-y-2">
                  <h3 className="text-xs md:text-sm font-normal text-gray-400 leading-none">
                    Current Value
                  </h3>
                  <p className="text-lg md:text-2xl font-bold text-white leading-tight">
                    $62,500
                  </p>
                </div>
              </WagmiCard>
              
              <WagmiCard variant="kpi" theme="green" size="md">
                <div className="space-y-1 md:space-y-2">
                  <h3 className="text-xs md:text-sm font-normal text-gray-400 leading-none">
                    Total P&L
                  </h3>
                  <p className="text-lg md:text-2xl font-bold text-green-400 leading-tight">
                    +$12,500
                  </p>
                </div>
              </WagmiCard>
              
              <WagmiCard variant="kpi" theme="green" size="md">
                <div className="space-y-1 md:space-y-2">
                  <h3 className="text-xs md:text-sm font-normal text-gray-400 leading-none">
                    Total Return
                  </h3>
                  <p className="text-lg md:text-2xl font-bold text-green-400 leading-tight">
                    +25.0%
                  </p>
                </div>
              </WagmiCard>
            </div>
          </div>
          
          {/* Manager Dashboard KPI Ribbon */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Manager Dashboard KPI Ribbon</h3>
            <div className="flex flex-wrap gap-4 justify-center">
              <WagmiCard variant="ribbon" theme="green" size="sm">
                <div>
                  <p className="text-xs font-normal text-gray-400 mb-1 uppercase tracking-wide">Active Investors</p>
                  <p className="text-sm font-semibold text-white">24</p>
                </div>
              </WagmiCard>
              
              <WagmiCard variant="ribbon" theme="green" size="sm">
                <div>
                  <p className="text-xs font-normal text-gray-400 mb-1 uppercase tracking-wide">Total AUM</p>
                  <p className="text-sm font-semibold text-white">$2.4M</p>
                </div>
              </WagmiCard>
              
              <WagmiCard variant="ribbon" theme="green" size="sm">
                <div>
                  <p className="text-xs font-normal text-gray-400 mb-1 uppercase tracking-wide">Cumulative Return</p>
                  <p className="text-sm font-semibold text-green-400">+12.5%</p>
                </div>
              </WagmiCard>
              
              <WagmiCard variant="ribbon" theme="green" size="sm">
                <div>
                  <p className="text-xs font-normal text-gray-400 mb-1 uppercase tracking-wide">MoM Return</p>
                  <p className="text-sm font-semibold text-green-400">+2.1%</p>
                </div>
              </WagmiCard>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
