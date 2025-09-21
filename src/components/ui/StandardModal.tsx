'use client';

import { ReactNode } from 'react';
import { COLORS } from '@/shared/constants/colors';
import WagmiButton from './WagmiButton';

interface StandardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
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
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl'
};

const themeColors = {
  green: COLORS.theme.green,
  orange: COLORS.theme.orange,
  blue: COLORS.theme.blue,
  purple: COLORS.theme.purple,
  red: COLORS.theme.red
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300">
      {/* Frosted Glass Backdrop */}
      <div 
        className="absolute inset-0 transition-all duration-300 animate-in fade-in"
        style={{
          background: COLORS.modal.overlay,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          // Enhanced frosted glass effect
          backgroundImage: COLORS.modal.glass,
        }}
        onClick={handleBackdropClick}
      />
      
      {/* Modal Content */}
      <div 
        className={`relative w-full ${sizeClasses[size]} max-h-[95vh] sm:max-h-[90vh] flex flex-col rounded-xl sm:rounded-2xl transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-4 ${className}`}
        style={{
          backgroundColor: COLORS.modal.content,
          borderRadius: '16px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px ${colors.border}, 0 0 15px ${colors.shadow}, 0 0 30px ${colors.glow}, 0 0 50px ${colors.outerGlow}`,
          border: `1px solid ${colors.border}`,
          // Enhanced frosted glass effect for modal content
          backgroundImage: COLORS.modal.glass,
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 sm:p-6 border-b flex-shrink-0" 
          style={{ 
            borderColor: COLORS.modal.border,
            backgroundImage: COLORS.modal.glass,
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
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
            <WagmiButton
              variant="icon"
              theme="gray"
              size="sm"
              onClick={onClose}
              title="Close modal"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              }
            />
          )}
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
