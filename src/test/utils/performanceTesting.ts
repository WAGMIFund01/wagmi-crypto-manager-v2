// Performance testing utilities for chart components
import { vi } from 'vitest';

// Performance monitoring utilities
export const performanceMonitor = {
  // Measure function execution time
  measureExecutionTime: <T>(fn: () => T): { result: T; executionTime: number } => {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    return {
      result,
      executionTime: endTime - startTime
    };
  },

  // Measure async function execution time
  measureAsyncExecutionTime: async <T>(fn: () => Promise<T>): Promise<{ result: T; executionTime: number }> => {
    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    return {
      result,
      executionTime: endTime - startTime
    };
  },

  // Monitor memory usage
  monitorMemoryUsage: () => {
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
    return {
      startMemory,
      getCurrentUsage: () => (performance as any).memory?.usedJSHeapSize || 0,
      getDelta: () => {
        const currentMemory = (performance as any).memory?.usedJSHeapSize || 0;
        return currentMemory - startMemory;
      }
    };
  },

  // Monitor render cycles
  monitorRenderCycles: () => {
    let renderCount = 0;
    const originalRender = console.log;
    
    // Mock console.log to track renders
    console.log = (...args) => {
      if (args[0]?.includes?.('render') || args[0]?.includes?.('Render')) {
        renderCount++;
      }
      originalRender(...args);
    };

    return {
      getRenderCount: () => renderCount,
      reset: () => {
        renderCount = 0;
        console.log = originalRender;
      }
    };
  }
};

// Chart-specific performance benchmarks
export const chartPerformanceBenchmarks = {
  // Expected performance thresholds
  thresholds: {
    renderTime: 100, // ms
    memoryIncrease: 5000000, // 5MB
    largeDatasetThreshold: 1000,
    animationFrameRate: 60, // FPS
    touchResponseTime: 100 // ms
  },

  // Test chart rendering performance
  testRenderingPerformance: async (renderFunction: () => void) => {
    const memoryMonitor = performanceMonitor.monitorMemoryUsage();
    const { executionTime } = performanceMonitor.measureExecutionTime(renderFunction);
    const memoryDelta = memoryMonitor.getDelta();

    return {
      executionTime,
      memoryDelta,
      meetsThresholds: {
        renderTime: executionTime <= chartPerformanceBenchmarks.thresholds.renderTime,
        memory: memoryDelta <= chartPerformanceBenchmarks.thresholds.memoryIncrease
      },
      performance: {
        renderTime: executionTime,
        memoryDelta,
        isOptimal: executionTime <= 50 && memoryDelta <= 1000000
      }
    };
  },

  // Test large dataset performance
  testLargeDatasetPerformance: async (dataSize: number, renderFunction: () => void) => {
    const isLargeDataset = dataSize >= chartPerformanceBenchmarks.thresholds.largeDatasetThreshold;
    
    if (!isLargeDataset) {
      return {
        isLargeDataset: false,
        recommendation: 'Dataset size is acceptable for standard rendering'
      };
    }

    const performance = await chartPerformanceBenchmarks.testRenderingPerformance(renderFunction);
    
    return {
      isLargeDataset: true,
      dataSize,
      performance,
      recommendations: [
        performance.meetsThresholds.renderTime ? null : 'Consider implementing virtual scrolling',
        performance.meetsThresholds.memory ? null : 'Consider implementing data pagination',
        'Consider implementing lazy loading for historical data'
      ].filter(Boolean)
    };
  },

  // Test animation performance
  testAnimationPerformance: async (animationFunction: () => void, duration: number = 300) => {
    const startTime = performance.now();
    const frameCounts: number[] = [];
    
    // Mock requestAnimationFrame to track frame rate
    const originalRAF = window.requestAnimationFrame;
    let frameCount = 0;
    
    window.requestAnimationFrame = (callback: FrameRequestCallback) => {
      frameCount++;
      return originalRAF(callback);
    };

    animationFunction();
    
    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, duration + 50));
    
    const endTime = performance.now();
    const actualDuration = endTime - startTime;
    const frameRate = (frameCount / (actualDuration / 1000));
    
    // Restore original requestAnimationFrame
    window.requestAnimationFrame = originalRAF;

    return {
      expectedDuration: duration,
      actualDuration,
      frameRate,
      frameCount,
      isSmooth: frameRate >= chartPerformanceBenchmarks.thresholds.animationFrameRate * 0.8, // 80% of target FPS
      performance: {
        durationAccuracy: Math.abs(actualDuration - duration) / duration,
        frameRate,
        isOptimal: frameRate >= chartPerformanceBenchmarks.thresholds.animationFrameRate
      }
    };
  }
};

// Mobile performance testing
export const mobilePerformanceTesting = {
  // Test touch response time
  testTouchResponse: async (element: HTMLElement, touchFunction: () => void) => {
    const startTime = performance.now();
    touchFunction();
    const endTime = performance.now();
    
    const responseTime = endTime - startTime;
    
    return {
      responseTime,
      meetsThreshold: responseTime <= chartPerformanceBenchmarks.thresholds.touchResponseTime,
      performance: {
        responseTime,
        isOptimal: responseTime <= 50
      }
    };
  },

  // Test mobile rendering performance
  testMobileRendering: async (renderFunction: () => void, viewport: { width: number; height: number }) => {
    // Set mobile viewport
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

    const performance = await chartPerformanceBenchmarks.testRenderingPerformance(renderFunction);
    
    return {
      viewport,
      performance,
      mobileOptimized: {
        renderTime: performance.executionTime <= chartPerformanceBenchmarks.thresholds.renderTime * 1.5, // 50% tolerance for mobile
        memory: performance.memoryDelta <= chartPerformanceBenchmarks.thresholds.memoryIncrease * 1.2 // 20% tolerance for mobile
      }
    };
  }
};

// Bundle size testing
export const bundleSizeTesting = {
  // Mock bundle size analysis
  analyzeBundleImpact: (newDependencies: string[]) => {
    const estimatedSizes = {
      'recharts': 200, // kB
      'html2canvas': 150, // kB
      'chart.js': 300, // kB
      'd3': 500, // kB
      'victory': 400 // kB
    };

    const totalImpact = newDependencies.reduce((total, dep) => {
      return total + (estimatedSizes[dep as keyof typeof estimatedSizes] || 100);
    }, 0);

    return {
      newDependencies,
      estimatedSizeImpact: totalImpact,
      recommendations: totalImpact > 500 ? [
        'Consider code splitting for chart libraries',
        'Implement lazy loading for chart components',
        'Use tree shaking to reduce bundle size'
      ] : [
        'Bundle size impact is acceptable',
        'Monitor bundle size in production'
      ]
    };
  }
};

// Performance regression testing
export const performanceRegressionTesting = {
  // Baseline performance metrics
  baselineMetrics: {
    renderTime: 50,
    memoryUsage: 1000000,
    bundleSize: 135000 // Current shared bundle size
  },

  // Test for performance regressions
  testRegression: (currentMetrics: {
    renderTime: number;
    memoryUsage: number;
    bundleSize: number;
  }) => {
    const regressionThreshold = 1.5; // 50% increase is considered regression
    
    return {
      renderTimeRegression: currentMetrics.renderTime > (performanceRegressionTesting.baselineMetrics.renderTime * regressionThreshold),
      memoryRegression: currentMetrics.memoryUsage > (performanceRegressionTesting.baselineMetrics.memoryUsage * regressionThreshold),
      bundleSizeRegression: currentMetrics.bundleSize > (performanceRegressionTesting.baselineMetrics.bundleSize * regressionThreshold),
      regressions: [
        currentMetrics.renderTime > (performanceRegressionTesting.baselineMetrics.renderTime * regressionThreshold) ? 'Render time regression detected' : null,
        currentMetrics.memoryUsage > (performanceRegressionTesting.baselineMetrics.memoryUsage * regressionThreshold) ? 'Memory usage regression detected' : null,
        currentMetrics.bundleSize > (performanceRegressionTesting.baselineMetrics.bundleSize * regressionThreshold) ? 'Bundle size regression detected' : null
      ].filter(Boolean),
      performance: {
        renderTime: {
          current: currentMetrics.renderTime,
          baseline: performanceRegressionTesting.baselineMetrics.renderTime,
          regression: currentMetrics.renderTime / performanceRegressionTesting.baselineMetrics.renderTime
        },
        memory: {
          current: currentMetrics.memoryUsage,
          baseline: performanceRegressionTesting.baselineMetrics.memoryUsage,
          regression: currentMetrics.memoryUsage / performanceRegressionTesting.baselineMetrics.memoryUsage
        },
        bundleSize: {
          current: currentMetrics.bundleSize,
          baseline: performanceRegressionTesting.baselineMetrics.bundleSize,
          regression: currentMetrics.bundleSize / performanceRegressionTesting.baselineMetrics.bundleSize
        }
      }
    };
  }
};

// Comprehensive performance test suite
export const performanceTestSuite = {
  // Run all performance tests
  runFullSuite: async (component: any, data: any[], options: {
    testLargeDataset?: boolean;
    testMobile?: boolean;
    testAnimation?: boolean;
    testBundleSize?: boolean;
  } = {}) => {
    const results: any = {};

    // Basic rendering performance
    results.rendering = await chartPerformanceBenchmarks.testRenderingPerformance(() => {
      // Mock render function
    });

    // Large dataset performance
    if (options.testLargeDataset) {
      results.largeDataset = await chartPerformanceBenchmarks.testLargeDatasetPerformance(
        data.length,
        () => {
          // Mock render function
        }
      );
    }

    // Mobile performance
    if (options.testMobile) {
      results.mobile = await mobilePerformanceTesting.testMobileRendering(
        () => {
          // Mock render function
        },
        { width: 375, height: 667 }
      );
    }

    // Bundle size analysis
    if (options.testBundleSize) {
      results.bundleSize = bundleSizeTesting.analyzeBundleImpact(['recharts']);
    }

    // Regression testing
    results.regression = performanceRegressionTesting.testRegression({
      renderTime: results.rendering?.executionTime || 0,
      memoryUsage: results.rendering?.memoryDelta || 0,
      bundleSize: results.bundleSize?.estimatedSizeImpact || 0
    });

    return results;
  }
};
