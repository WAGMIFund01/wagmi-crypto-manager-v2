import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EnhancedPerformanceCharts from '../charts/EnhancedPerformanceCharts';

// Mock performance data for Personal Portfolio
const mockPersonalPortfolioData = [
  {
    month: '2024-01',
    endingAUM: 1000000,
    personalMoM: 5.2,
    personalCumulative: 5.2,
    totalMoM: 3.1,
    totalCumulative: 3.1,
    total3MoM: 2.8,
    total3Cumulative: 2.8,
    investment: 500000
  },
  {
    month: '2024-02',
    endingAUM: 1050000,
    personalMoM: 4.8,
    personalCumulative: 10.2,
    totalMoM: 2.9,
    totalCumulative: 6.1,
    total3MoM: 2.5,
    total3Cumulative: 5.4,
    investment: 520000
  }
];

// Mock performance data for WAGMI Fund
const mockWagmiPerformanceData = [
  {
    month: '2024-01',
    endingAUM: 2000000,
    wagmiMoM: 6.1,
    wagmiCumulative: 6.1,
    totalMoM: 3.1,
    totalCumulative: 3.1,
    total3MoM: 2.8,
    total3Cumulative: 2.8
  },
  {
    month: '2024-02',
    endingAUM: 2100000,
    wagmiMoM: 5.5,
    wagmiCumulative: 12.0,
    totalMoM: 2.9,
    totalCumulative: 6.1,
    total3MoM: 2.5,
    total3Cumulative: 5.4
  }
];

describe('EnhancedPerformanceCharts Legend Labels', () => {
  describe('Personal Portfolio Module', () => {
    it('should display correct legend labels for MoM Return chart', () => {
      render(<EnhancedPerformanceCharts data={mockPersonalPortfolioData} dataSource="personal-portfolio" />);
      
      // Click on MoM Return button
      const momButton = screen.getByText('MoM Return');
      fireEvent.click(momButton);
      
      // Check legend labels
      expect(screen.getByText('Personal Portfolio')).toBeInTheDocument();
      expect(screen.getByText('Total Benchmark (Total Crypto)')).toBeInTheDocument();
      expect(screen.getByText('Total 3 Benchmark (Total Crypto ex BTC, ETH)')).toBeInTheDocument();
    });

    it('should display correct legend labels for Cumulative Return chart', () => {
      render(<EnhancedPerformanceCharts data={mockPersonalPortfolioData} dataSource="personal-portfolio" />);
      
      // Click on Cumulative Return button
      const cumulativeButton = screen.getByText('Cumulative Return');
      fireEvent.click(cumulativeButton);
      
      // Check legend labels
      expect(screen.getByText('Personal Portfolio')).toBeInTheDocument();
      expect(screen.getByText('Total Benchmark (Total Crypto)')).toBeInTheDocument();
      expect(screen.getByText('Total 3 Benchmark (Total Crypto ex BTC, ETH)')).toBeInTheDocument();
    });

    it('should display correct legend labels for Net Investment chart', () => {
      render(<EnhancedPerformanceCharts data={mockPersonalPortfolioData} dataSource="personal-portfolio" />);
      
      // Click on Net Investment button
      const investmentButton = screen.getByText('Net Investment');
      fireEvent.click(investmentButton);
      
      // Check legend labels
      expect(screen.getByText('Personal Portfolio Net Investment')).toBeInTheDocument();
      expect(screen.getByText('Net Investment')).toBeInTheDocument();
    });
  });

  describe('WAGMI Fund Module', () => {
    it('should display correct legend labels for MoM Return chart', () => {
      render(<EnhancedPerformanceCharts data={mockWagmiPerformanceData} dataSource="wagmi-fund" />);
      
      // Click on MoM Return button
      const momButton = screen.getByText('MoM Return');
      fireEvent.click(momButton);
      
      // Check legend labels
      expect(screen.getByText('WAGMI Fund MoM')).toBeInTheDocument();
      expect(screen.getByText('Total Benchmark (Total Crypto)')).toBeInTheDocument();
      expect(screen.getByText('Total 3 Benchmark (Total Crypto ex BTC, ETH)')).toBeInTheDocument();
    });

    it('should display correct legend labels for Cumulative Return chart', () => {
      render(<EnhancedPerformanceCharts data={mockWagmiPerformanceData} dataSource="wagmi-fund" />);
      
      // Click on Cumulative Return button
      const cumulativeButton = screen.getByText('Cumulative Return');
      fireEvent.click(cumulativeButton);
      
      // Check legend labels
      expect(screen.getByText('WAGMI Fund Cumulative')).toBeInTheDocument();
      expect(screen.getByText('Total Benchmark (Total Crypto)')).toBeInTheDocument();
      expect(screen.getByText('Total 3 Benchmark (Total Crypto ex BTC, ETH)')).toBeInTheDocument();
    });
  });

  describe('Legend Consistency', () => {
    it('should maintain consistent legend labels across chart mode switches', () => {
      render(<EnhancedPerformanceCharts data={mockPersonalPortfolioData} dataSource="personal-portfolio" />);
      
      // Test MoM Return
      fireEvent.click(screen.getByText('MoM Return'));
      expect(screen.getByText('Personal Portfolio')).toBeInTheDocument();
      expect(screen.getByText('Total Benchmark (Total Crypto)')).toBeInTheDocument();
      
      // Switch to Cumulative Return
      fireEvent.click(screen.getByText('Cumulative Return'));
      expect(screen.getByText('Personal Portfolio')).toBeInTheDocument();
      expect(screen.getByText('Total Benchmark (Total Crypto)')).toBeInTheDocument();
      
      // Switch back to MoM Return
      fireEvent.click(screen.getByText('MoM Return'));
      expect(screen.getByText('Personal Portfolio')).toBeInTheDocument();
      expect(screen.getByText('Total Benchmark (Total Crypto)')).toBeInTheDocument();
    });

    it('should not show old legend labels', () => {
      render(<EnhancedPerformanceCharts data={mockPersonalPortfolioData} dataSource="personal-portfolio" />);
      
      // Click on MoM Return
      fireEvent.click(screen.getByText('MoM Return'));
      
      // Ensure old labels are not present
      expect(screen.queryByText('Personal Portfolio MoM')).not.toBeInTheDocument();
      expect(screen.queryByText('Total MoM')).not.toBeInTheDocument();
      expect(screen.queryByText('Total 3-Month MoM')).not.toBeInTheDocument();
    });
  });
});
