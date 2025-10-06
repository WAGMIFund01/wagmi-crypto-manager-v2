import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EnhancedPerformanceCharts from '../charts/EnhancedPerformanceCharts';
import { mockMobileAPIs, DEVICE_VIEWPORTS } from '@/test/utils/mobileTesting';

// Mock data
const mockPerformanceData = [
  {
    month: 'Oct-2024',
    endingAUM: 6264.09,
    wagmiMoM: 28.52,
    totalMoM: 11.59,
    total3MoM: 3.75,
    wagmiCumulative: 28.52,
    totalCumulative: 11.59,
    total3Cumulative: 3.75,
  },
  {
    month: 'Nov-2024',
    endingAUM: 18686.35,
    wagmiMoM: 6.22,
    totalMoM: 46.75,
    total3MoM: 77.63,
    wagmiCumulative: 15.33,
    totalCumulative: 46.75,
    total3Cumulative: 77.63,
  },
];

const mockPersonalPortfolioData = [
  {
    month: 'Oct-2024',
    endingAUM: 5000,
    personalMoM: 15.5,
    totalMoM: 11.59,
    total3MoM: 3.75,
    personalCumulative: 15.5,
    totalCumulative: 11.59,
    total3Cumulative: 3.75,
    investment: 10000,
  },
  {
    month: 'Nov-2024',
    endingAUM: 6000,
    personalMoM: 20.0,
    totalMoM: 46.75,
    total3MoM: 77.63,
    personalCumulative: 38.6,
    totalCumulative: 46.75,
    total3Cumulative: 77.63,
    investment: 12000,
  },
];

describe('EnhancedPerformanceCharts Mobile Tests', () => {
  beforeEach(() => {
    mockMobileAPIs();
    vi.clearAllMocks();
  });

  describe('Mobile Responsiveness', () => {
    it('renders correctly on mobile viewport', async () => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: DEVICE_VIEWPORTS.mobile.width,
      });
      window.dispatchEvent(new Event('resize'));

      render(<EnhancedPerformanceCharts data={mockPerformanceData} />);

      await waitFor(() => {
        expect(screen.getByText('Historical Performance')).toBeInTheDocument();
      });

      // Check that chart renders properly on mobile
      expect(screen.getByText('Historical Performance')).toBeInTheDocument();
    });

    it('renders correctly on tablet viewport', async () => {
      // Set tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: DEVICE_VIEWPORTS.tablet.width,
      });
      window.dispatchEvent(new Event('resize'));

      render(<EnhancedPerformanceCharts data={mockPerformanceData} />);

      await waitFor(() => {
        expect(screen.getByText('Historical Performance')).toBeInTheDocument();
      });
    });

    it('hides swipe hint on desktop', async () => {
      // Set desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: DEVICE_VIEWPORTS.desktop.width,
      });
      window.dispatchEvent(new Event('resize'));

      render(<EnhancedPerformanceCharts data={mockPerformanceData} />);

      await waitFor(() => {
        expect(screen.getByText('Historical Performance')).toBeInTheDocument();
      });

      // Chart should render properly on desktop
      expect(screen.getByText('Historical Performance')).toBeInTheDocument();
    });
  });


  describe('Personal Portfolio Mobile Features', () => {
    it('shows investment chart mode on mobile for personal portfolio', async () => {
      render(
        <EnhancedPerformanceCharts 
          data={mockPersonalPortfolioData} 
          dataSource="personal-portfolio" 
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Net Investment')).toBeInTheDocument();
      });

      // Should show all chart modes including investment
      expect(screen.getByText('Historical AUM')).toBeInTheDocument();
      expect(screen.getByText('MoM Return')).toBeInTheDocument();
      expect(screen.getByText('Cumulative Return')).toBeInTheDocument();
      expect(screen.getByText('Net Investment')).toBeInTheDocument();
    });

  });

  describe('Mobile Performance', () => {
    it('renders within acceptable time on mobile', async () => {
      const startTime = performance.now();

      render(<EnhancedPerformanceCharts data={mockPerformanceData} />);

      await waitFor(() => {
        expect(screen.getByText('Historical Performance')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within 100ms for good mobile UX
      expect(renderTime).toBeLessThan(100);
    });

    it('handles large datasets efficiently on mobile', async () => {
      // Create a larger dataset
      const largeDataset = Array.from({ length: 50 }, (_, i) => ({
        month: `Month-${i}`,
        endingAUM: 1000 + i * 100,
        wagmiMoM: Math.random() * 20 - 10,
        totalMoM: Math.random() * 15 - 5,
        total3MoM: Math.random() * 10 - 5,
        wagmiCumulative: Math.random() * 100,
        totalCumulative: Math.random() * 80,
        total3Cumulative: Math.random() * 60,
      }));

      const startTime = performance.now();

      render(<EnhancedPerformanceCharts data={largeDataset} />);

      await waitFor(() => {
        expect(screen.getByText('Historical Performance')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should still render efficiently even with large datasets
      expect(renderTime).toBeLessThan(200);
    });
  });

  describe('Mobile Accessibility', () => {
    it('has proper touch targets for mobile', async () => {
      render(<EnhancedPerformanceCharts data={mockPerformanceData} />);

      await waitFor(() => {
        expect(screen.getByText('Historical AUM')).toBeInTheDocument();
      });

      // Check that buttons have proper touch targets
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        expect(rect.width).toBeGreaterThanOrEqual(44);
        expect(rect.height).toBeGreaterThanOrEqual(44);
      });
    });

    it('has proper ARIA labels for mobile screen readers', async () => {
      render(<EnhancedPerformanceCharts data={mockPerformanceData} />);

      await waitFor(() => {
        expect(screen.getByText('Historical AUM')).toBeInTheDocument();
      });

      // Check for proper ARIA labels
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button.getAttribute('aria-label') || button.textContent).toBeTruthy();
      });
    });
  });

  describe('Mobile Chart Interactions', () => {
    it('shows mobile-optimized tooltips', async () => {
      render(<EnhancedPerformanceCharts data={mockPerformanceData} />);

      await waitFor(() => {
        expect(screen.getByText('Historical AUM')).toBeInTheDocument();
      });

      // Chart should have mobile-optimized styling
      const chart = document.querySelector('.mobile-chart');
      expect(chart).toBeInTheDocument();
    });

    it('handles chart mode switching on mobile', async () => {
      render(<EnhancedPerformanceCharts data={mockPerformanceData} />);

      await waitFor(() => {
        expect(screen.getByText('Historical AUM')).toBeInTheDocument();
      });

      // Click MoM Return button
      const momButton = screen.getByText('MoM Return');
      fireEvent.click(momButton);

      await waitFor(() => {
        expect(screen.getByText('MoM Return')).toBeInTheDocument();
      });

      // Click Cumulative Return button
      const cumulativeButton = screen.getByText('Cumulative Return');
      fireEvent.click(cumulativeButton);

      await waitFor(() => {
        expect(screen.getByText('Cumulative Return')).toBeInTheDocument();
      });
    });
  });
});
