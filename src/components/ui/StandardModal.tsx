'use client';

import { ReactNode } from 'react';

interface StandardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  theme?: 'green' | 'orange' | 'blue' | 'purple' | 'red';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl'
};

const themeColors = {
  green: {
    accent: '#FF6600',
    border: 'rgba(0, 255, 149, 0.1)',
    shadow: 'rgba(0, 255, 149, 0.1)',
    glow: 'rgba(0, 255, 149, 0.05)',
    outerGlow: 'rgba(0, 255, 149, 0.02)'
  },
  orange: {
    accent: '#FF6B35',
    border: 'rgba(255, 107, 53, 0.1)',
    shadow: 'rgba(255, 107, 53, 0.1)',
    glow: 'rgba(255, 107, 53, 0.05)',
    outerGlow: 'rgba(255, 107, 53, 0.02)'
  },
  blue: {
    accent: '#3B82F6',
    border: 'rgba(59, 130, 246, 0.1)',
    shadow: 'rgba(59, 130, 246, 0.1)',
    glow: 'rgba(59, 130, 246, 0.05)',
    outerGlow: 'rgba(59, 130, 246, 0.02)'
  },
  purple: {
    accent: '#8B5CF6',
    border: 'rgba(139, 92, 246, 0.1)',
    shadow: 'rgba(139, 92, 246, 0.1)',
    glow: 'rgba(139, 92, 246, 0.05)',
    outerGlow: 'rgba(139, 92, 246, 0.02)'
  },
  red: {
    accent: '#EF4444',
    border: 'rgba(239, 68, 68, 0.1)',
    shadow: 'rgba(239, 68, 68, 0.1)',
    glow: 'rgba(239, 68, 68, 0.05)',
    outerGlow: 'rgba(239, 68, 68, 0.02)'
  }
};

export default function StandardModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  theme = 'green',
  showCloseButton = true,
  closeOnBackdropClick = true,
  className = ''
}: StandardModalProps) {
  if (!isOpen) return null;

  const colors = themeColors[theme];

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Frosted Glass Backdrop */}
      <div 
        className="absolute inset-0 transition-all duration-300 animate-in fade-in"
        style={{
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
        onClick={handleBackdropClick}
      />
      
      {/* Modal Content */}
      <div 
        className={`relative w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden rounded-2xl transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-4 ${className}`}
        style={{
          backgroundColor: '#1A1F1A',
          borderRadius: '16px',
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 15px ${colors.shadow}, 0 0 30px ${colors.glow}, 0 0 50px ${colors.outerGlow}`,
          border: `1px solid ${colors.border}`
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#333' }}>
          <h2 
            className="text-xl font-semibold"
            style={{ 
              color: colors.accent,
              textShadow: `0 0 20px ${colors.glow}, 0 0 40px ${colors.outerGlow}`
            }}
          >
            {title}
          </h2>
          
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded-md hover:bg-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
