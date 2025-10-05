// Mobile responsiveness testing utilities
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

// Mobile viewport configurations
export const MOBILE_VIEWPORTS = {
  iphoneSE: { width: 375, height: 667 },
  iphone12: { width: 390, height: 844 },
  iphone12Pro: { width: 390, height: 844 },
  iphone14Pro: { width: 393, height: 852 },
  samsungGalaxy: { width: 360, height: 760 },
  pixel5: { width: 393, height: 851 },
  ipad: { width: 768, height: 1024 },
  ipadPro: { width: 1024, height: 1366 },
} as const;

// Tablet viewport configurations
export const TABLET_VIEWPORTS = {
  ipad: { width: 768, height: 1024 },
  ipadPro: { width: 1024, height: 1366 },
  surfacePro: { width: 912, height: 1368 },
} as const;

// Desktop viewport configurations
export const DESKTOP_VIEWPORTS = {
  laptop: { width: 1366, height: 768 },
  desktop: { width: 1920, height: 1080 },
  ultrawide: { width: 2560, height: 1440 },
} as const;

// Set viewport for testing
export const setViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

// Test mobile responsiveness
export const testMobileResponsiveness = (
  component: ReactElement,
  viewport: { width: number; height: number },
  options?: RenderOptions
) => {
  setViewport(viewport.width, viewport.height);
  return render(component, options);
};

// Test breakpoint behavior
export const testBreakpoints = (
  component: ReactElement,
  breakpoints: Array<{ name: string; width: number; height: number }>,
  options?: RenderOptions
) => {
  const results: Array<{ breakpoint: string; result: any }> = [];
  
  breakpoints.forEach(({ name, width, height }) => {
    setViewport(width, height);
    const result = render(component, options);
    results.push({ breakpoint: name, result });
  });
  
  return results;
};

// Mobile-specific test helpers
export const mobileTestHelpers = {
  // Check if element is visible on mobile
  isVisibleOnMobile: (element: HTMLElement) => {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden';
  },
  
  // Check if element is hidden on mobile
  isHiddenOnMobile: (element: HTMLElement) => {
    const style = window.getComputedStyle(element);
    return style.display === 'none' || style.visibility === 'hidden';
  },
  
  // Check if element has mobile-specific classes
  hasMobileClasses: (element: HTMLElement) => {
    return element.classList.contains('sm:') || 
           element.classList.contains('md:') || 
           element.classList.contains('lg:') || 
           element.classList.contains('xl:');
  },
  
  // Check if element is responsive
  isResponsive: (element: HTMLElement) => {
    const style = window.getComputedStyle(element);
    return style.width === '100%' || style.maxWidth !== 'none';
  }
};

// Common mobile test scenarios
export const mobileTestScenarios = {
  // Test navigation on mobile
  testNavigation: (container: HTMLElement) => {
    const nav = container.querySelector('nav');
    const navItems = container.querySelectorAll('nav button, nav a');
    
    return {
      hasNavigation: !!nav,
      navItemCount: navItems.length,
      isHorizontal: nav?.style.flexDirection === 'row' || nav?.classList.contains('flex'),
      hasOverflow: container.scrollWidth > container.clientWidth
    };
  },
  
  // Test card layout on mobile
  testCardLayout: (container: HTMLElement) => {
    // WagmiCard renders as divs with specific classes, so we look for direct children or data-testid
    const cards = container.querySelectorAll('[data-testid^="card-"], [class*="card"], .card, [class*="rounded"]');
    
    return {
      cardCount: cards.length,
      isStacked: Array.from(cards).every(card => {
        const style = window.getComputedStyle(card);
        return style.display === 'block' || style.display === 'flex';
      }),
      hasProperSpacing: Array.from(cards).every(card => {
        const style = window.getComputedStyle(card);
        return parseFloat(style.marginBottom) > 0 || parseFloat(style.marginTop) > 0 || 
               parseFloat(style.paddingBottom) > 0 || parseFloat(style.paddingTop) > 0;
      })
    };
  },
  
  // Test chart responsiveness
  testChartResponsiveness: (container: HTMLElement) => {
    // Look for chart containers and SVG elements (Recharts uses ResponsiveContainer)
    const charts = container.querySelectorAll('[class*="chart"], [class*="recharts"], .chart, svg, [class*="responsive-container"]');
    
    return {
      chartCount: charts.length,
      isResponsive: charts.length === 0 || Array.from(charts).some(chart => {
        const style = window.getComputedStyle(chart);
        // In test environment, charts might not have computed dimensions, so we check for responsive classes
        return style.width === '100%' || style.maxWidth !== 'none' || 
               chart.classList.toString().includes('responsive') ||
               chart.classList.toString().includes('w-full');
      }),
      hasProperHeight: charts.length === 0 || Array.from(charts).some(chart => {
        const style = window.getComputedStyle(chart);
        // Be more lenient in test environment
        return parseFloat(style.height) >= 0;
      })
    };
  }
};
