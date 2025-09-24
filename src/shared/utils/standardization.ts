/**
 * Standardization utilities for consistent styling across the app
 * This ensures all components follow the same patterns and use centralized constants
 */

import { COLORS } from '@/shared/constants/colors';

// Standard spacing scale
export const SPACING = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
} as const;

// Standard border radius scale
export const BORDER_RADIUS = {
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  '3xl': '2rem',    // 32px
} as const;

// Standard shadow definitions
export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  glow: {
    green: '0 0 20px rgba(0, 255, 149, 0.3)',
    orange: '0 0 20px rgba(255, 107, 53, 0.3)',
    blue: '0 0 20px rgba(59, 130, 246, 0.3)',
    red: '0 0 20px rgba(239, 68, 68, 0.3)',
    gray: '0 0 20px rgba(107, 114, 128, 0.3)',
  }
} as const;

// Standard typography scale
export const TYPOGRAPHY = {
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  }
} as const;

// Standard breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Standard component styles
export const COMPONENT_STYLES = {
  // Standard card styles
  card: {
    base: 'relative transition-all duration-300',
    default: 'bg-gray-800 border border-gray-700',
    kpi: 'bg-gray-900 border border-gray-800',
    container: 'bg-gray-900 border border-gray-800',
  },
  
  // Standard button styles
  button: {
    base: 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
    primary: 'text-white shadow-lg',
    outline: 'bg-transparent border',
    ghost: 'bg-transparent',
  },
  
  // Standard input styles
  input: {
    base: 'w-full px-3 py-2 border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
    default: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500',
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
  },
  
  // Standard modal styles
  modal: {
    overlay: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50',
    content: 'bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto',
  },
  
  // Standard table styles
  table: {
    container: 'overflow-x-auto',
    table: 'min-w-full divide-y divide-gray-700',
    header: 'bg-gray-800',
    row: 'hover:bg-gray-800/50 transition-colors',
    cell: 'px-6 py-4 whitespace-nowrap text-sm',
  },
} as const;

// Standard responsive utilities
export const RESPONSIVE = {
  // Standard grid patterns
  grid: {
    '1': 'grid grid-cols-1',
    '2': 'grid grid-cols-1 md:grid-cols-2',
    '3': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    '4': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  },
  
  // Standard flex patterns
  flex: {
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    start: 'flex items-center justify-start',
    end: 'flex items-center justify-end',
    col: 'flex flex-col',
    row: 'flex flex-row',
  },
  
  // Standard spacing patterns
  spacing: {
    section: 'py-8 md:py-12',
    container: 'px-4 sm:px-6 lg:px-8',
    card: 'p-4 md:p-6',
    button: 'px-4 py-2',
  },
} as const;

// Standard animation utilities
export const ANIMATIONS = {
  fadeIn: 'animate-in fade-in duration-300',
  slideIn: 'animate-in slide-in-from-bottom-4 duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-200',
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
} as const;

// Helper functions for consistent styling
export const getStandardCardStyle = (variant: 'default' | 'kpi' | 'container' = 'default') => {
  return `${COMPONENT_STYLES.card.base} ${COMPONENT_STYLES.card[variant]}`;
};

export const getStandardButtonStyle = (variant: 'primary' | 'outline' | 'ghost' = 'primary') => {
  return `${COMPONENT_STYLES.button.base} ${COMPONENT_STYLES.button[variant]}`;
};

export const getStandardInputStyle = (hasError = false) => {
  return `${COMPONENT_STYLES.input.base} ${hasError ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.default}`;
};

export const getStandardModalStyle = () => {
  return {
    overlay: COMPONENT_STYLES.modal.overlay,
    content: COMPONENT_STYLES.modal.content,
  };
};

export const getStandardTableStyle = () => {
  return {
    container: COMPONENT_STYLES.table.container,
    table: COMPONENT_STYLES.table.table,
    header: COMPONENT_STYLES.table.header,
    row: COMPONENT_STYLES.table.row,
    cell: COMPONENT_STYLES.table.cell,
  };
};

// Standard color utilities
export const getThemeColor = (theme: keyof typeof COLORS.theme, property: keyof typeof COLORS.theme.green) => {
  return COLORS.theme[theme][property];
};

export const getSemanticColor = (type: 'success' | 'error' | 'warning' | 'info') => {
  return COLORS.semantic[type];
};

// Standard responsive helpers
export const getResponsiveGrid = (columns: 1 | 2 | 3 | 4) => {
  return RESPONSIVE.grid[columns.toString() as keyof typeof RESPONSIVE.grid];
};

export const getResponsiveFlex = (direction: 'center' | 'between' | 'start' | 'end' | 'col' | 'row') => {
  return RESPONSIVE.flex[direction];
};

// Standard spacing helpers
export const getSpacing = (size: keyof typeof SPACING) => {
  return SPACING[size];
};

export const getBorderRadius = (size: keyof typeof BORDER_RADIUS) => {
  return BORDER_RADIUS[size];
};

export const getShadow = (size: keyof typeof SHADOWS) => {
  return SHADOWS[size];
};

export const getGlowShadow = (color: keyof typeof SHADOWS.glow) => {
  return SHADOWS.glow[color];
};
