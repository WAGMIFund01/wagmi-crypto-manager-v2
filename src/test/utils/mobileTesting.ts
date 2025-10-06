/**
 * Mobile Testing Utilities
 * 
 * Comprehensive testing utilities for mobile responsiveness,
 * touch interactions, and mobile-specific functionality.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, expect } from 'vitest';

// Mock viewport dimensions for different device types
export const DEVICE_VIEWPORTS = {
  mobile: { width: 375, height: 667 }, // iPhone SE
  mobileLarge: { width: 414, height: 896 }, // iPhone 11 Pro Max
  tablet: { width: 768, height: 1024 }, // iPad
  tabletLarge: { width: 1024, height: 1366 }, // iPad Pro
  desktop: { width: 1280, height: 720 }, // Desktop
  desktopLarge: { width: 1920, height: 1080 }, // Large Desktop
} as const;

// Mock touch events
export const createTouchEvent = (clientX: number, clientY: number = 0) => ({
  targetTouches: [{ clientX, clientY }],
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
});


// Test mobile breakpoints
export const testMobileBreakpoints = async (component: React.ReactElement) => {
  const results: Record<string, boolean> = {};
  
  for (const [device, viewport] of Object.entries(DEVICE_VIEWPORTS)) {
    // Mock window.innerWidth and innerHeight
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
      value: viewport.width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
      value: viewport.height,
  });
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
    
    // Render component
    const { unmount } = render(component);
    
    // Test if component renders without errors
    try {
      await waitFor(() => {
        expect(screen.getByRole('main') || screen.getByTestId('component')).toBeInTheDocument();
      });
      results[device] = true;
    } catch (error) {
      results[device] = false;
    }
    
    unmount();
  }
  
  return results;
};

// Test touch interactions
export const testTouchInteractions = async (
  component: React.ReactElement,
  touchTargetSelector: string,
  expectedBehavior: (element: HTMLElement) => void
) => {
  render(component);
  
  const touchTarget = screen.getByTestId(touchTargetSelector) || document.querySelector(touchTargetSelector);
  expect(touchTarget).toBeInTheDocument();
  
  // Test touch start
  const touchStartEvent = createTouchEvent(100, 100);
  fireEvent.touchStart(touchTarget as Element, touchStartEvent);
  
  // Test touch move
  const touchMoveEvent = createTouchEvent(150, 100);
  fireEvent.touchMove(touchTarget as Element, touchMoveEvent);
  
  // Test touch end
  const touchEndEvent = createTouchEvent(150, 100);
  fireEvent.touchEnd(touchTarget as Element, touchEndEvent);
  
  // Verify expected behavior
  await waitFor(() => {
    expectedBehavior(touchTarget as HTMLElement);
  });
};


// Test mobile navigation
export const testMobileNavigation = async (component: React.ReactElement) => {
  render(component);
  
  // Test mobile viewport
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: DEVICE_VIEWPORTS.mobile.width,
  });
  window.dispatchEvent(new Event('resize'));
  
  // Check if mobile navigation elements are present
  const mobileNav = screen.queryByRole('navigation');
  const mobileMenu = screen.queryByTestId('mobile-menu');
  const hamburgerButton = screen.queryByTestId('hamburger-button');
  
  return {
    hasMobileNav: !!mobileNav,
    hasMobileMenu: !!mobileMenu,
    hasHamburgerButton: !!hamburgerButton,
  };
};

// Test responsive table behavior
export const testResponsiveTable = async (component: React.ReactElement) => {
  const results: Record<string, boolean> = {};
  
  for (const [device, viewport] of Object.entries(DEVICE_VIEWPORTS)) {
    // Set viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: viewport.width,
    });
    window.dispatchEvent(new Event('resize'));
    
    render(component);
    
    // Check for table elements
    const table = screen.queryByRole('table');
    const mobileCards = screen.queryAllByTestId(/mobile-card/);
    const desktopTable = screen.queryByTestId('desktop-table');
    
    const isMobile = viewport.width < 768;
    
    if (isMobile) {
      // On mobile, should show cards instead of table
      results[device] = mobileCards.length > 0 && !desktopTable;
    } else {
      // On desktop, should show table
      results[device] = !!table || !!desktopTable;
    }
  }
  
  return results;
};

// Test chart mobile optimization
export const testChartMobileOptimization = async (component: React.ReactElement) => {
  render(component);
  
  // Test mobile viewport
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: DEVICE_VIEWPORTS.mobile.width,
  });
  window.dispatchEvent(new Event('resize'));
  
  // Check for mobile-optimized chart elements
  const chart = screen.queryByTestId('chart-container');
  const mobileControls = screen.queryByTestId('mobile-chart-controls');
  const swipeHint = screen.queryByText(/swipe/i);
  
  return {
    hasChart: !!chart,
    hasMobileControls: !!mobileControls,
    hasSwipeHint: !!swipeHint,
  };
};

// Test performance on mobile
export const testMobilePerformance = async (component: React.ReactElement) => {
  const startTime = performance.now();
  
  render(component);
  
  // Wait for component to fully render
  await waitFor(() => {
    expect(screen.getByRole('main') || screen.getByTestId('component')).toBeInTheDocument();
  });
  
  const endTime = performance.now();
  const renderTime = endTime - startTime;
  
  // Mobile should render within 100ms for good UX
    return {
    renderTime,
    isPerformant: renderTime < 100,
  };
};

// Test accessibility on mobile
export const testMobileAccessibility = async (component: React.ReactElement) => {
  render(component);
  
  // Test touch targets are at least 44px (Apple's recommendation)
  const touchTargets = screen.getAllByRole('button');
  const smallTargets = touchTargets.filter(target => {
    const rect = target.getBoundingClientRect();
    return rect.width < 44 || rect.height < 44;
  });
  
  // Test for proper ARIA labels
  const elementsWithoutLabels = screen.getAllByRole('button').filter(
    element => !element.getAttribute('aria-label') && !element.textContent
  );
    
    return {
    hasProperTouchTargets: smallTargets.length === 0,
    hasProperLabels: elementsWithoutLabels.length === 0,
    touchTargetCount: touchTargets.length,
    smallTargetCount: smallTargets.length,
  };
};

// Comprehensive mobile test suite
export const runMobileTestSuite = async (component: React.ReactElement) => {
  const results = {
    breakpoints: await testMobileBreakpoints(component),
    navigation: await testMobileNavigation(component),
    table: await testResponsiveTable(component),
    chart: await testChartMobileOptimization(component),
    performance: await testMobilePerformance(component),
    accessibility: await testMobileAccessibility(component),
  };
  
  return results;
};

// Mock mobile-specific APIs
export const mockMobileAPIs = () => {
  // Mock Touch API
  global.Touch = class Touch {
    constructor(init: TouchInit) {
      Object.assign(this, init);
    }
  } as any;
  
  // Mock DeviceOrientationEvent
  global.DeviceOrientationEvent = class DeviceOrientationEvent extends Event {
    alpha: number | null = null;
    beta: number | null = null;
    gamma: number | null = null;
    
    constructor(type: string, eventInitDict?: DeviceOrientationEventInit) {
      super(type, eventInitDict);
    }
  } as any;
  
  // Mock matchMedia for responsive queries
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

export default {
  DEVICE_VIEWPORTS,
  createTouchEvent,
  testMobileBreakpoints,
  testTouchInteractions,
  testMobileNavigation,
  testResponsiveTable,
  testChartMobileOptimization,
  testMobilePerformance,
  testMobileAccessibility,
  runMobileTestSuite,
  mockMobileAPIs,
};