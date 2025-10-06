/**
 * Enhanced Testing Configuration
 * Comprehensive testing framework for the crypto investment manager app
 */

export interface TestConfig {
  // Chart-specific testing
  charts: {
    performance: {
      renderTime: number; // ms
      memoryThreshold: number; // bytes
      dataSizeThreshold: number; // number of data points
    };
    export: {
      timeout: number; // ms
      qualityThreshold: number; // 0-1
      formats: string[];
    };
    mobile: {
      viewports: Array<{ width: number; height: number; name: string }>;
      touchThreshold: number; // ms
    };
  };
  
  // Integration testing
  integration: {
    apiTimeout: number; // ms
    retryAttempts: number;
    dataValidation: {
      requiredFields: string[];
      typeValidation: boolean;
    };
  };
  
  // Performance testing
  performance: {
    bundleSize: {
      maxSize: number; // bytes
      warningThreshold: number; // bytes
    };
    runtime: {
      maxMemoryUsage: number; // bytes
      maxRenderTime: number; // ms
    };
  };
  
  // Accessibility testing
  accessibility: {
    wcagLevel: 'A' | 'AA' | 'AAA';
    requiredRoles: string[];
    keyboardNavigation: boolean;
    screenReader: boolean;
  };
  
  // E2E testing
  e2e: {
    userFlows: string[];
    dataCleanup: boolean;
    screenshotOnFailure: boolean;
  };
}

export const ENHANCED_TEST_CONFIG: TestConfig = {
  charts: {
    performance: {
      renderTime: 100, // 100ms max render time
      memoryThreshold: 50 * 1024 * 1024, // 50MB
      dataSizeThreshold: 1000 // 1000 data points
    },
    export: {
      timeout: 10000, // 10 seconds
      qualityThreshold: 0.8,
      formats: ['png', 'pdf', 'csv']
    },
    mobile: {
      viewports: [
        { width: 375, height: 667, name: 'iPhone SE' },
        { width: 414, height: 896, name: 'iPhone 11' },
        { width: 768, height: 1024, name: 'iPad' },
        { width: 1024, height: 768, name: 'iPad Landscape' }
      ],
      touchThreshold: 300 // 300ms for touch interactions
    }
  },
  
  integration: {
    apiTimeout: 5000, // 5 seconds
    retryAttempts: 3,
    dataValidation: {
      requiredFields: ['month', 'endingAUM', 'wagmiMoM', 'totalMoM'],
      typeValidation: true
    }
  },
  
  performance: {
    bundleSize: {
      maxSize: 2 * 1024 * 1024, // 2MB
      warningThreshold: 1.5 * 1024 * 1024 // 1.5MB
    },
    runtime: {
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB
      maxRenderTime: 200 // 200ms
    }
  },
  
  accessibility: {
    wcagLevel: 'AA',
    requiredRoles: ['button', 'img', 'heading', 'region'],
    keyboardNavigation: true,
    screenReader: true
  },
  
  e2e: {
    userFlows: [
      'login-to-dashboard',
      'view-performance-charts',
      'export-chart-data',
      'switch-chart-modes',
      'mobile-chart-interaction'
    ],
    dataCleanup: true,
    screenshotOnFailure: true
  }
};

// Test data generators
export const generateTestData = {
  performanceData: (count: number = 12) => {
    const data = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - count);
    
    for (let i = 0; i < count; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      data.push({
        month: `${month.split(' ')[0]}-${date.getFullYear()}`,
        endingAUM: Math.random() * 1000000 + 500000,
        wagmiMoM: (Math.random() - 0.5) * 20,
        totalMoM: (Math.random() - 0.5) * 15,
        total3MoM: (Math.random() - 0.5) * 10,
        wagmiCumulative: (Math.random() - 0.5) * 100,
        totalCumulative: (Math.random() - 0.5) * 80,
        total3Cumulative: (Math.random() - 0.5) * 60
      });
    }
    return data;
  },
  
  personalPortfolioData: (count: number = 12) => {
    const data = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - count);
    
    for (let i = 0; i < count; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      data.push({
        month: `${month.split(' ')[0]}-${date.getFullYear()}`,
        endingAUM: Math.random() * 500000 + 100000,
        personalMoM: (Math.random() - 0.5) * 25,
        totalMoM: (Math.random() - 0.5) * 20,
        total3MoM: (Math.random() - 0.5) * 15,
        personalCumulative: (Math.random() - 0.5) * 120,
        totalCumulative: (Math.random() - 0.5) * 100,
        total3Cumulative: (Math.random() - 0.5) * 80
      });
    }
    return data;
  }
};

// Test utilities
export const testUtilities = {
  // Wait for element with timeout
  waitForElement: async (selector: string, timeout: number = 5000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const element = document.querySelector(selector);
      if (element) return element;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error(`Element ${selector} not found within ${timeout}ms`);
  },
  
  // Simulate user interaction
  simulateUserInteraction: {
    click: (element: HTMLElement) => {
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      element.dispatchEvent(event);
    },
    
    hover: (element: HTMLElement) => {
      const event = new MouseEvent('mouseover', { bubbles: true, cancelable: true });
      element.dispatchEvent(event);
    },
    
    touch: (element: HTMLElement, x: number, y: number) => {
      const touch = new Touch({
        identifier: 1,
        target: element,
        clientX: x,
        clientY: y,
        pageX: x,
        pageY: y,
        screenX: x,
        screenY: y
      });
      
      const touchEvent = new TouchEvent('touchstart', {
        touches: [touch],
        bubbles: true,
        cancelable: true
      });
      
      element.dispatchEvent(touchEvent);
    }
  },
  
  // Performance monitoring
  measurePerformance: async (fn: () => Promise<void> | void) => {
    const startTime = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    await fn();
    
    const endTime = performance.now();
    const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    return {
      executionTime: endTime - startTime,
      memoryDelta: endMemory - startMemory,
      timestamp: new Date().toISOString()
    };
  },
  
  // Accessibility helpers
  accessibility: {
    checkAriaLabels: (container: HTMLElement) => {
      const elements = container.querySelectorAll('[role]');
      const issues: Array<{ element: string; role: string | null; issue: string }> = [];
      
      elements.forEach(element => {
        const role = element.getAttribute('role');
        const ariaLabel = element.getAttribute('aria-label');
        const ariaLabelledBy = element.getAttribute('aria-labelledby');
        
        if (!ariaLabel && !ariaLabelledBy && !element.textContent?.trim()) {
          issues.push({
            element: element.tagName,
            role,
            issue: 'Missing accessible name'
          });
        }
      });
      
      return issues;
    },
    
    checkKeyboardNavigation: (container: HTMLElement) => {
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      return Array.from(focusableElements).map(element => ({
        element: element.tagName,
        tabIndex: element.getAttribute('tabindex'),
        hasFocus: document.activeElement === element
      }));
    }
  }
};

export default ENHANCED_TEST_CONFIG;
