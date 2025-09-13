'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

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
    <div
      onClick={handleClick}
      className={`
        relative w-full max-w-sm mx-auto
        bg-gray-900/50 rounded-lg p-8
        border border-[#00FF95]/30
        cursor-pointer transition-all duration-300
        hover:scale-105 hover:border-[#00FF95]/60
        hover:shadow-[0_0_20px_rgba(0,255,149,0.3)]
        active:scale-95
        ${isComingSoon ? 'opacity-60 cursor-not-allowed' : ''}
        ${className}
      `}
      style={{
        boxShadow: '0 0 15px rgba(0, 255, 149, 0.1)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 hover:opacity-100"
        style={{
          background: 'linear-gradient(135deg, rgba(0,255,149,0.1) 0%, rgba(0,255,149,0.05) 100%)',
          boxShadow: 'inset 0 0 20px rgba(0,255,149,0.1)',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full min-h-[120px]">
        <h3 
          className="text-xl font-bold text-center leading-tight"
          style={{ 
            color: '#00FF95',
            textShadow: '0 0 10px rgba(0, 255, 149, 0.5)',
            fontSize: '20px'
          }}
        >
          {title}
        </h3>
        
        {isComingSoon && (
          <p 
            className="mt-2 text-sm opacity-70"
            style={{ color: '#A0A0A0' }}
          >
            Coming Soon
          </p>
        )}
      </div>
    </div>
  );
}
