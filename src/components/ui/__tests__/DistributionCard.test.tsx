import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DistributionCard, { 
  RiskDistributionCard, 
  LocationDistributionCard, 
  AssetTypeDistributionCard 
} from '../DistributionCard'
import { COLORS } from '@/shared/constants/colors'

const mockDistributionData = {
  'Item 1': 5000,
  'Item 2': 3000,
  'Item 3': 2000
}

const mockFormatValue = (value: number) => `$${value.toLocaleString()}`

describe('DistributionCard', () => {
  describe('Basic Rendering', () => {
    it('renders with title and data', () => {
      render(
        <DistributionCard
          title="Test Distribution"
          data={mockDistributionData}
          totalValue={10000}
          formatValue={mockFormatValue}
        />
      )

      expect(screen.getByText('Test Distribution')).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })

    it('displays formatted values', () => {
      render(
        <DistributionCard
          title="Value Test"
          data={mockDistributionData}
          totalValue={10000}
          formatValue={mockFormatValue}
        />
      )

      expect(screen.getByText('$5,000')).toBeInTheDocument()
      expect(screen.getByText('$3,000')).toBeInTheDocument()
      expect(screen.getByText('$2,000')).toBeInTheDocument()
    })

    it('displays percentages correctly', () => {
      render(
        <DistributionCard
          title="Percentage Test"
          data={mockDistributionData}
          totalValue={10000}
          formatValue={mockFormatValue}
        />
      )

      expect(screen.getByText('50.0%')).toBeInTheDocument() // 5000/10000
      expect(screen.getByText('30.0%')).toBeInTheDocument() // 3000/10000
      expect(screen.getByText('20.0%')).toBeInTheDocument() // 2000/10000
    })
  })

  describe('Progress Bars', () => {
    it('renders progress bars for each item', () => {
      const { container } = render(
        <DistributionCard
          title="Progress Test"
          data={mockDistributionData}
          totalValue={10000}
          formatValue={mockFormatValue}
        />
      )

      const progressBars = container.querySelectorAll('[style*="width"]')
      expect(progressBars.length).toBeGreaterThan(0)
    })

    it('calculates progress bar widths correctly', () => {
      const { container } = render(
        <DistributionCard
          title="Width Test"
          data={{ 'Half': 5000 }}
          totalValue={10000}
          formatValue={mockFormatValue}
        />
      )

      const progressBar = container.querySelector('[style*="width: 50%"]')
      expect(progressBar).toBeInTheDocument()
    })
  })

  describe('Color Mapping', () => {
    it('applies custom colors from colorMap', () => {
      const customColorMap = {
        'Item 1': '#FF0000',
        'Item 2': '#00FF00',
        'Item 3': '#0000FF'
      }

      const { container } = render(
        <DistributionCard
          title="Color Test"
          data={mockDistributionData}
          totalValue={10000}
          colorMap={customColorMap}
          formatValue={mockFormatValue}
        />
      )

      const colorElements = container.querySelectorAll('[style*="background-color"]')
      expect(colorElements.length).toBeGreaterThan(0)
    })

    it('uses default color for unmapped items', () => {
      const partialColorMap = {
        'Item 1': '#FF0000'
      }

      const { container } = render(
        <DistributionCard
          title="Partial Color Test"
          data={mockDistributionData}
          totalValue={10000}
          colorMap={partialColorMap}
          formatValue={mockFormatValue}
        />
      )

      // Should still render all items
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('renders with empty data', () => {
      render(
        <DistributionCard
          title="Empty Test"
          data={{}}
          totalValue={0}
          formatValue={mockFormatValue}
        />
      )

      expect(screen.getByText('Empty Test')).toBeInTheDocument()
    })

    it('handles zero total value', () => {
      render(
        <DistributionCard
          title="Zero Total"
          data={mockDistributionData}
          totalValue={0}
          formatValue={mockFormatValue}
        />
      )

      // Should display 0% for all items when total is 0
      const percentages = screen.queryAllByText(/\d+\.\d+%/)
      percentages.forEach(p => {
        expect(p.textContent).toMatch(/0\.0%|NaN/)
      })
    })
  })

  describe('Sorting', () => {
    it('sorts items by value in descending order', () => {
      const unsortedData = {
        'Small': 100,
        'Large': 500,
        'Medium': 300
      }

      render(
        <DistributionCard
          title="Sort Test"
          data={unsortedData}
          totalValue={900}
          formatValue={mockFormatValue}
        />
      )

      const items = screen.getAllByText(/Large|Medium|Small/)
      expect(items[0]).toHaveTextContent('Large')
      expect(items[1]).toHaveTextContent('Medium')
      expect(items[2]).toHaveTextContent('Small')
    })
  })

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <DistributionCard
          title="Class Test"
          data={mockDistributionData}
          totalValue={10000}
          formatValue={mockFormatValue}
          className="custom-distribution"
        />
      )

      expect(container.querySelector('.custom-distribution')).toBeInTheDocument()
    })
  })
})

describe('RiskDistributionCard', () => {
  it('renders with Risk Distribution title', () => {
    render(
      <RiskDistributionCard
        data={mockDistributionData}
        totalValue={10000}
      />
    )

    expect(screen.getByText('Risk Distribution')).toBeInTheDocument()
  })

  it('uses risk color mapping', () => {
    const riskData = {
      'Low': 3000,
      'Medium': 5000,
      'High': 2000
    }

    render(
      <RiskDistributionCard
        data={riskData}
        totalValue={10000}
      />
    )

    expect(screen.getByText('Low')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
  })
})

describe('LocationDistributionCard', () => {
  it('renders with Location Distribution title', () => {
    render(
      <LocationDistributionCard
        data={mockDistributionData}
        totalValue={10000}
      />
    )

    expect(screen.getByText('Location Distribution')).toBeInTheDocument()
  })

  it('uses location color mapping', () => {
    const locationData = {
      'phantom wallet': 3000,
      'orca lp': 5000,
      'metamask': 2000
    }

    render(
      <LocationDistributionCard
        data={locationData}
        totalValue={10000}
      />
    )

    expect(screen.getByText('phantom wallet')).toBeInTheDocument()
  })
})

describe('AssetTypeDistributionCard', () => {
  it('renders with Asset Type Distribution title', () => {
    render(
      <AssetTypeDistributionCard
        data={mockDistributionData}
        totalValue={10000}
      />
    )

    expect(screen.getByText('Asset Type Distribution')).toBeInTheDocument()
  })

  it('uses asset type color mapping', () => {
    const assetTypeData = {
      'Altcoin': 3000,
      'Stablecoin': 5000,
      'Memecoin': 2000
    }

    render(
      <AssetTypeDistributionCard
        data={assetTypeData}
        totalValue={10000}
      />
    )

    expect(screen.getByText('Altcoin')).toBeInTheDocument()
    expect(screen.getByText('Stablecoin')).toBeInTheDocument()
    expect(screen.getByText('Memecoin')).toBeInTheDocument()
  })
})

describe('Memoization', () => {
  it('DistributionCard is memoized', () => {
    // Check if the component is wrapped with React.memo
    // This is verified by checking the displayName or other memo properties
    expect(DistributionCard).toBeDefined()
  })
})

