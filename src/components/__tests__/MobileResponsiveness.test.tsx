import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { 
  MOBILE_VIEWPORTS, 
  TABLET_VIEWPORTS, 
  DESKTOP_VIEWPORTS,
  setViewport,
  mobileTestHelpers,
  mobileTestScenarios
} from '@/test/utils/mobileTesting';

// Import components to test
import UniversalNavbar from '@/components/UniversalNavbar';
import { WagmiCard } from '@/components/ui';
import PersonalPortfolioPerformanceCharts from '@/components/charts/PersonalPortfolioPerformanceCharts';
import { PersonalPortfolioPerformanceData } from '@/shared/types/performance';

// Mock data for testing
const mockPerformanceData: PersonalPortfolioPerformanceData[] = [
  {
    month: 'Oct-2024',
    endingAUM: 6264.09,
    personalMoM: 28.5,
    totalMoM: 11.59,
    total3MoM: 3.75,
    personalCumulative: 28.5,
    totalCumulative: 11.59,
    total3Cumulative: 3.75
  },
  {
    month: 'Nov-2024',
    endingAUM: 14478.56,
    personalMoM: 131.2,
    totalMoM: 40.69,
    total3MoM: 63.20,
    personalCumulative: 197.0,
    totalCumulative: 57.0,
    total3Cumulative: 69.2
  }
];

describe('Mobile Responsiveness Tests', () => {
  beforeEach(() => {
    // Reset viewport before each test
    setViewport(1920, 1080);
  });

  describe('UniversalNavbar Mobile Responsiveness', () => {
    it('should render navigation on mobile devices', () => {
      setViewport(MOBILE_VIEWPORTS.iphoneSE.width, MOBILE_VIEWPORTS.iphoneSE.height);
      
      render(
        <UniversalNavbar
          activeTab="portfolio"
          onTabChange={() => {}}
          dataSource="personal-portfolio"
          kpiData={{
            totalAUM: 100000,
            totalInvestors: 5,
            lastUpdated: '2024-01-01'
          }}
        />
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      
      const navItems = screen.getAllByRole('button');
      expect(navItems.length).toBeGreaterThan(0);
    });

    it('should handle tablet viewport correctly', () => {
      setViewport(TABLET_VIEWPORTS.ipad.width, TABLET_VIEWPORTS.ipad.height);
      
      render(
        <UniversalNavbar
          activeTab="portfolio"
          onTabChange={() => {}}
          dataSource="wagmi-fund"
          kpiData={{
            totalAUM: 100000,
            totalInvestors: 5,
            lastUpdated: '2024-01-01'
          }}
        />
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('should maintain functionality across all viewports', () => {
      const viewports = [
        { name: 'iPhone SE', ...MOBILE_VIEWPORTS.iphoneSE },
        { name: 'iPhone 12', ...MOBILE_VIEWPORTS.iphone12 },
        { name: 'iPad', ...TABLET_VIEWPORTS.ipad },
        { name: 'Desktop', ...DESKTOP_VIEWPORTS.desktop }
      ];

      viewports.forEach(({ name, width, height }) => {
        setViewport(width, height);
        
        const { unmount } = render(
          <UniversalNavbar
            activeTab="portfolio"
            onTabChange={() => {}}
            dataSource="personal-portfolio"
            kpiData={{
              totalAUM: 100000,
              totalInvestors: 5,
              lastUpdated: '2024-01-01'
            }}
          />
        );

        const nav = screen.getByRole('navigation');
        expect(nav).toBeInTheDocument();
        
        // Test navigation functionality
        const navItems = screen.getAllByRole('button');
        expect(navItems.length).toBeGreaterThan(0);
        
        unmount();
      });
    });
  });

  describe('WagmiCard Mobile Responsiveness', () => {
    it('should render cards properly on mobile', () => {
      setViewport(MOBILE_VIEWPORTS.iphoneSE.width, MOBILE_VIEWPORTS.iphoneSE.height);
      
      render(
        <WagmiCard variant="default" theme="green" size="lg">
          <div className="p-4">
            <h3 className="text-lg font-semibold">Test Card</h3>
            <p>This is a test card for mobile responsiveness testing.</p>
          </div>
        </WagmiCard>
      );

      const card = screen.getByText('Test Card').closest('[class*="card"]');
      expect(card).toBeInTheDocument();
      
      // Test mobile-specific properties
      if (card) {
        expect(mobileTestHelpers.isResponsive(card as HTMLElement)).toBe(true);
      }
    });

    it('should stack cards properly on mobile', () => {
      setViewport(MOBILE_VIEWPORTS.iphoneSE.width, MOBILE_VIEWPORTS.iphoneSE.height);
      
      render(
        <div className="space-y-4">
          <WagmiCard variant="default" theme="green" size="lg">
            <div className="p-4">Card 1</div>
          </WagmiCard>
          <WagmiCard variant="default" theme="green" size="lg">
            <div className="p-4">Card 2</div>
          </WagmiCard>
        </div>
      );

      const cards = screen.getAllByText(/Card \d/);
      expect(cards).toHaveLength(2);
      
      // Test card layout
      const container = cards[0].closest('div');
      if (container) {
        const layoutTest = mobileTestScenarios.testCardLayout(container as HTMLElement);
        expect(layoutTest.cardCount).toBe(2);
        expect(layoutTest.isStacked).toBe(true);
      }
    });
  });

  describe('Chart Mobile Responsiveness', () => {
    it('should render charts responsively on mobile', () => {
      setViewport(MOBILE_VIEWPORTS.iphoneSE.width, MOBILE_VIEWPORTS.iphoneSE.height);
      
      render(
        <PersonalPortfolioPerformanceCharts data={mockPerformanceData} />
      );

      // Check if charts are rendered
      const charts = document.querySelectorAll('svg, [class*="chart"]');
      expect(charts.length).toBeGreaterThan(0);
      
      // Test chart responsiveness
      if (charts.length > 0) {
        const container = charts[0].closest('div');
        if (container) {
          const chartTest = mobileTestScenarios.testChartResponsiveness(container as HTMLElement);
          expect(chartTest.chartCount).toBeGreaterThan(0);
          expect(chartTest.isResponsive).toBe(true);
        }
      }
    });

    it('should handle different mobile screen sizes', () => {
      const mobileSizes = [
        MOBILE_VIEWPORTS.iphoneSE,
        MOBILE_VIEWPORTS.iphone12,
        MOBILE_VIEWPORTS.samsungGalaxy
      ];

      mobileSizes.forEach(({ width, height }) => {
        setViewport(width, height);
        
        const { unmount } = render(
          <PersonalPortfolioPerformanceCharts data={mockPerformanceData} />
        );

        // Charts should be present and responsive
        const charts = document.querySelectorAll('svg, [class*="chart"]');
        expect(charts.length).toBeGreaterThan(0);
        
        unmount();
      });
    });
  });

  describe('Cross-Device Compatibility', () => {
    it('should work across all device types', () => {
      const allViewports = [
        ...Object.values(MOBILE_VIEWPORTS),
        ...Object.values(TABLET_VIEWPORTS),
        ...Object.values(DESKTOP_VIEWPORTS)
      ];

      allViewports.forEach(({ width, height }) => {
        setViewport(width, height);
        
        const { unmount } = render(
          <div>
            <UniversalNavbar
              activeTab="portfolio"
              onTabChange={() => {}}
              dataSource="personal-portfolio"
              kpiData={{
                totalAUM: 100000,
                totalInvestors: 5,
                lastUpdated: '2024-01-01'
              }}
            />
            <WagmiCard variant="default" theme="green" size="lg">
              <div className="p-4">Test Content</div>
            </WagmiCard>
          </div>
        );

        // Basic functionality should work on all devices
        expect(screen.getByRole('navigation')).toBeInTheDocument();
        expect(screen.getByText('Test Content')).toBeInTheDocument();
        
        unmount();
      });
    });
  });

  describe('Performance on Mobile', () => {
    it('should render quickly on mobile devices', () => {
      setViewport(MOBILE_VIEWPORTS.iphoneSE.width, MOBILE_VIEWPORTS.iphoneSE.height);
      
      const startTime = performance.now();
      
      render(
        <PersonalPortfolioPerformanceCharts data={mockPerformanceData} />
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time (100ms for mobile)
      expect(renderTime).toBeLessThan(100);
    });
  });
});
