// Chart-specific testing utilities
import { render, RenderOptions, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReactElement } from 'react';
import { MOBILE_VIEWPORTS, setViewport } from './mobileTesting';

// Chart performance testing utilities
export const chartPerformanceUtils = {
  // Measure chart rendering time
  measureRenderingTime: async (renderFn: () => void) => {
    const startTime = performance.now();
    renderFn();
    const endTime = performance.now();
    return endTime - startTime;
  },

  // Test chart with large dataset
  testLargeDataset: (data: any[], threshold: number = 1000) => {
    return {
      isLargeDataset: data.length > threshold,
      dataSize: data.length,
      shouldOptimize: data.length > threshold
    };
  },

  // Test chart memory usage (approximate)
  testMemoryUsage: () => {
    const beforeMemory = (performance as any).memory?.usedJSHeapSize || 0;
    return {
      beforeMemory,
      getMemoryDelta: () => {
        const afterMemory = (performance as any).memory?.usedJSHeapSize || 0;
        return afterMemory - beforeMemory;
      }
    };
  }
};

// Chart interaction testing utilities
export const chartInteractionUtils = {
  // Simulate touch events for mobile testing
  simulateTouch: (element: HTMLElement, type: 'start' | 'move' | 'end', x: number, y: number) => {
    // Mock Touch class for test environment
    if (typeof Touch === 'undefined') {
      (global as any).Touch = class Touch {
        identifier: number;
        target: EventTarget;
        clientX: number;
        clientY: number;
        pageX: number;
        pageY: number;
        
        constructor(options: any) {
          this.identifier = options.identifier;
          this.target = options.target;
          this.clientX = options.clientX;
          this.clientY = options.clientY;
          this.pageX = options.pageX;
          this.pageY = options.pageY;
        }
      };
    }

    const touchEvent = new TouchEvent(`touch${type}`, {
      touches: [new Touch({
        identifier: 1,
        target: element,
        clientX: x,
        clientY: y,
        pageX: x,
        pageY: y
      })]
    });
    element.dispatchEvent(touchEvent);
  },

  // Simulate swipe gesture
  simulateSwipe: (element: HTMLElement, startX: number, startY: number, endX: number, endY: number) => {
    chartInteractionUtils.simulateTouch(element, 'start', startX, startY);
    chartInteractionUtils.simulateTouch(element, 'move', endX, endY);
    chartInteractionUtils.simulateTouch(element, 'end', endX, endY);
  },

  // Simulate pinch-to-zoom
  simulatePinch: (element: HTMLElement, centerX: number, centerY: number, scale: number) => {
    const touch1 = new Touch({
      identifier: 1,
      target: element,
      clientX: centerX - 50,
      clientY: centerY,
      pageX: centerX - 50,
      pageY: centerY
    });
    const touch2 = new Touch({
      identifier: 2,
      target: element,
      clientX: centerX + 50,
      clientY: centerY,
      pageX: centerX + 50,
      pageY: centerY
    });

    const touchStart = new TouchEvent('touchstart', { touches: [touch1, touch2] });
    element.dispatchEvent(touchStart);

    // Simulate pinch movement
    const newTouch1 = new Touch({
      identifier: 1,
      target: element,
      clientX: centerX - 50 * scale,
      clientY: centerY,
      pageX: centerX - 50 * scale,
      pageY: centerY
    });
    const newTouch2 = new Touch({
      identifier: 2,
      target: element,
      clientX: centerX + 50 * scale,
      clientY: centerY,
      pageX: centerX + 50 * scale,
      pageY: centerY
    });

    const touchMove = new TouchEvent('touchmove', { touches: [newTouch1, newTouch2] });
    element.dispatchEvent(touchMove);

    const touchEnd = new TouchEvent('touchend', { touches: [] });
    element.dispatchEvent(touchEnd);
  }
};

// Chart export testing utilities
export const chartExportUtils = {
  // Mock canvas for export testing
  mockCanvas: () => {
    const mockCanvas = {
      toDataURL: vi.fn(() => 'data:image/png;base64,mock-image-data'),
      toBlob: vi.fn((callback) => callback(new Blob(['mock-data'], { type: 'image/png' }))),
      width: 800,
      height: 600,
      getContext: vi.fn(() => ({
        drawImage: vi.fn(),
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        rotate: vi.fn()
      }))
    };

    // Mock HTMLCanvasElement
    global.HTMLCanvasElement = vi.fn(() => mockCanvas) as any;
    global.HTMLCanvasElement.prototype = mockCanvas as any;

    return mockCanvas;
  },

  // Test export functionality
  testExport: async (exportFunction: () => Promise<string | Blob>) => {
    const mockCanvas = chartExportUtils.mockCanvas();
    const result = await exportFunction();
    
    return {
      success: !!result,
      canvasUsed: mockCanvas.toDataURL.mock.calls.length > 0,
      result
    };
  },

  // Test PNG export
  testPNGExport: async (container: HTMLElement) => {
    const mockCanvas = chartExportUtils.mockCanvas();
    
    // Mock html2canvas
    const mockHtml2Canvas = vi.fn().mockResolvedValue(mockCanvas);
    vi.doMock('html2canvas', () => mockHtml2Canvas);
    
    const exportButton = Array.from(container.querySelectorAll('button')).find(btn => btn.textContent?.includes('📊 PNG')) ||
                         container.querySelector('[data-testid="export-png"]');
    if (exportButton) {
      fireEvent.click(exportButton);
      await new Promise(resolve => setTimeout(resolve, 100));
      return true;
    }
    return false;
  },
  
  // Test PDF export
  testPDFExport: async (container: HTMLElement) => {
    const mockCanvas = chartExportUtils.mockCanvas();
    
    // Mock jsPDF
    const mockPDF = {
      addImage: vi.fn(),
      save: vi.fn()
    };
    vi.doMock('jspdf', () => ({ default: vi.fn().mockReturnValue(mockPDF) }));
    
    const exportButton = Array.from(container.querySelectorAll('button')).find(btn => btn.textContent?.includes('📄 PDF')) ||
                         container.querySelector('[data-testid="export-pdf"]');
    if (exportButton) {
      fireEvent.click(exportButton);
      await new Promise(resolve => setTimeout(resolve, 100));
      return true;
    }
    return false;
  },
  
  // Test CSV export
  testCSVExport: (container: HTMLElement) => {
    const exportButton = Array.from(container.querySelectorAll('button')).find(btn => btn.textContent?.includes('📈 CSV')) ||
                         container.querySelector('[data-testid="export-csv"]');
    if (exportButton) {
      fireEvent.click(exportButton);
      return true;
    }
    return false;
  },
  
  // Test all export buttons are present
  testExportButtons: (container: HTMLElement) => {
    const pngButton = Array.from(container.querySelectorAll('button')).find(btn => btn.textContent?.includes('📊 PNG'));
    const pdfButton = Array.from(container.querySelectorAll('button')).find(btn => btn.textContent?.includes('📄 PDF'));
    const csvButton = Array.from(container.querySelectorAll('button')).find(btn => btn.textContent?.includes('📈 CSV'));
    
    return {
      pngButton: !!pngButton,
      pdfButton: !!pdfButton,
      csvButton: !!csvButton,
      allPresent: !!(pngButton && pdfButton && csvButton)
    };
  },
  
  // Test complete export functionality
  testExportFunctionality: async (container: HTMLElement) => {
    const results = {
      png: false,
      pdf: false,
      csv: false
    };
    
    try {
      results.png = await chartExportUtils.testPNGExport(container);
      results.pdf = await chartExportUtils.testPDFExport(container);
      results.csv = chartExportUtils.testCSVExport(container);
    } catch (error) {
      console.error('Export testing error:', error);
    }
    
    return results;
  }
};

// Chart animation testing utilities
export const chartAnimationUtils = {
  // Test animation smoothness
  testAnimationSmoothness: async (animationElement: HTMLElement, duration: number = 300) => {
    const startTime = performance.now();
    
    // Trigger animation
    animationElement.style.transition = `all ${duration}ms ease-in-out`;
    animationElement.style.transform = 'scale(1.1)';
    
    await new Promise(resolve => setTimeout(resolve, duration + 50));
    
    const endTime = performance.now();
    const actualDuration = endTime - startTime;
    
    return {
      expectedDuration: duration,
      actualDuration,
      isSmooth: Math.abs(actualDuration - duration) < 50, // Within 50ms tolerance
      performance: actualDuration <= duration * 1.2 // Not more than 20% slower
    };
  },

  // Test transition between states
  testStateTransition: async (component: ReactElement, triggerFunction: () => void) => {
    const { rerender } = render(component);
    const startTime = performance.now();
    
    triggerFunction();
    rerender(component);
    
    await waitFor(() => {
      // Wait for any animations to complete
    }, { timeout: 1000 });
    
    const endTime = performance.now();
    
    return {
      transitionTime: endTime - startTime,
      isSmooth: endTime - startTime < 500 // Should complete within 500ms
    };
  }
};

// Chart data testing utilities
export const chartDataUtils = {
  // Generate test data for different scenarios
  generateTestData: {
    // Generate performance data for different time periods
    performanceData: (months: number) => {
      const data = [];
      const currentDate = new Date();
      
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const year = date.getFullYear();
        
        data.push({
          month: `${month}-${year}`,
          endingAUM: 1000000 + (Math.random() * 500000),
          wagmiMoM: (Math.random() * 20) - 10, // -10% to +10%
          wagmiCumulative: (Math.random() * 50) - 25, // -25% to +25%
          totalMoM: (Math.random() * 15) - 7.5,
          totalCumulative: (Math.random() * 40) - 20,
          total3MoM: (Math.random() * 12) - 6,
          total3Cumulative: (Math.random() * 35) - 17.5
        });
      }
      
      return data;
    },

    // Generate large dataset for performance testing
    largeDataset: (size: number) => {
      return Array.from({ length: size }, (_, i) => ({
        month: `Month-${i + 1}`,
        value: Math.random() * 1000,
        category: `Category-${(i % 5) + 1}`
      }));
    }
  },

  // Test data filtering
  testDataFiltering: (data: any[], filterFunction: (item: any) => boolean) => {
    const filteredData = data.filter(filterFunction);
    
    return {
      originalSize: data.length,
      filteredSize: filteredData.length,
      filterRatio: filteredData.length / data.length,
      isEmpty: filteredData.length === 0,
      hasData: filteredData.length > 0
    };
  }
};

// Chart accessibility testing utilities
export const chartAccessibilityUtils = {
  // Test chart accessibility
  testAccessibility: (container: HTMLElement) => {
    const charts = container.querySelectorAll('svg, [role="img"], [aria-label], [class*="recharts"]');
    const tooltips = container.querySelectorAll('[role="tooltip"]');
    const legends = container.querySelectorAll('[role="legend"], [aria-label*="legend"]');
    
    return {
      hasCharts: charts.length > 0,
      hasTooltips: tooltips.length > 0,
      hasLegends: legends.length > 0,
      isAccessible: charts.length > 0 && (tooltips.length > 0 || legends.length > 0),
      chartCount: charts.length,
      tooltipCount: tooltips.length,
      legendCount: legends.length
    };
  },

  // Test keyboard navigation
  testKeyboardNavigation: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [tabindex], input, select, textarea, [role="button"]'
    );
    
    return {
      focusableCount: focusableElements.length,
      hasFocusableElements: focusableElements.length > 0,
      canNavigate: focusableElements.length > 0
    };
  }
};

// Comprehensive chart testing suite
export const chartTestSuite = {
  // Test chart rendering
  testRendering: async (component: ReactElement, options?: RenderOptions) => {
    const { container } = render(component, options);
    const charts = container.querySelectorAll('svg, [class*="recharts"]');
    
    return {
      rendered: charts.length > 0,
      chartCount: charts.length,
      container
    };
  },

  // Test mobile responsiveness
  testMobileResponsiveness: async (component: ReactElement, viewport = MOBILE_VIEWPORTS.iphone12) => {
    setViewport(viewport.width, viewport.height);
    const { container } = render(component);
    
    const charts = container.querySelectorAll('svg, [class*="recharts"]');
    const isResponsive = Array.from(charts).every(chart => {
      const style = window.getComputedStyle(chart);
      return style.width === '100%' || style.maxWidth !== 'none';
    });
    
    return {
      viewport,
      chartCount: charts.length,
      isResponsive,
      charts
    };
  },

  // Test performance with large datasets
  testPerformance: async (component: ReactElement, dataSize: number) => {
    const memoryTest = chartPerformanceUtils.testMemoryUsage();
    const startTime = performance.now();
    
    const { container } = render(component);
    
    const endTime = performance.now();
    const memoryDelta = memoryTest.getMemoryDelta();
    
    return {
      renderTime: endTime - startTime,
      memoryDelta,
      dataSize,
      isPerformant: (endTime - startTime) < 1000 && memoryDelta < 10000000, // < 1s render, < 10MB memory
      container
    };
  },

  // Test interactions
  testInteractions: async (component: ReactElement) => {
    const { container } = render(component);
    const charts = container.querySelectorAll('svg, [class*="recharts"]');
    
    const interactionResults = [];
    
    for (const chart of charts) {
      // Test click interactions
      fireEvent.click(chart);
      
      // Test hover interactions
      fireEvent.mouseOver(chart);
      fireEvent.mouseOut(chart);
      
      interactionResults.push({
        element: chart,
        clickable: true,
        hoverable: true
      });
    }
    
    return {
      chartCount: charts.length,
      interactions: interactionResults,
      allInteractive: interactionResults.every(result => result.clickable && result.hoverable)
    };
  }
};

// Import vitest for mocking
import { vi } from 'vitest';
