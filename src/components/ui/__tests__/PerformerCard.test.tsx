import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PerformerCard } from '../PerformerCard'

const mockPerformers = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    returnPercentage: 5.43,
    value: 50000
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    returnPercentage: 3.21,
    value: 3000
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    returnPercentage: 2.15,
    value: 100
  }
]

const mockFormatPercentage = (value: number) => `${value.toFixed(2)}%`
const mockFormatCurrency = (value: number) => `$${value.toLocaleString()}`

describe('PerformerCard', () => {
  describe('Top Performers', () => {
    it('renders top performers with correct styling', () => {
      render(
        <PerformerCard
          title="Top Performers (24h)"
          performers={mockPerformers}
          type="top"
          formatPercentage={mockFormatPercentage}
          formatCurrency={mockFormatCurrency}
        />
      )

      expect(screen.getByText('Top Performers (24h)')).toBeInTheDocument()
      expect(screen.getByText('BTC')).toBeInTheDocument()
      expect(screen.getByText('Bitcoin')).toBeInTheDocument()
      expect(screen.getByText('5.43%')).toBeInTheDocument()
      expect(screen.getByText('$50,000')).toBeInTheDocument()
    })

    it('displays ranks for top performers', () => {
      const { container } = render(
        <PerformerCard
          title="Top Performers"
          performers={mockPerformers}
          type="top"
          formatPercentage={mockFormatPercentage}
          formatCurrency={mockFormatCurrency}
        />
      )

      const ranks = container.querySelectorAll('.bg-green-600')
      expect(ranks).toHaveLength(3)
      expect(ranks[0]).toHaveTextContent('1')
      expect(ranks[1]).toHaveTextContent('2')
      expect(ranks[2]).toHaveTextContent('3')
    })

    it('applies green color to returns', () => {
      const { container } = render(
        <PerformerCard
          title="Top Performers"
          performers={mockPerformers}
          type="top"
          formatPercentage={mockFormatPercentage}
          formatCurrency={mockFormatCurrency}
        />
      )

      const returns = container.querySelectorAll('.text-green-400')
      expect(returns.length).toBeGreaterThan(0)
    })
  })

  describe('Worst Performers', () => {
    it('renders worst performers with correct styling', () => {
      const worstPerformers = [
        { symbol: 'DOGE', name: 'Dogecoin', returnPercentage: -2.5, value: 0.08 },
        { symbol: 'SHIB', name: 'Shiba Inu', returnPercentage: -3.2, value: 0.00001 }
      ]

      render(
        <PerformerCard
          title="Worst Performers (24h)"
          performers={worstPerformers}
          type="worst"
          formatPercentage={mockFormatPercentage}
          formatCurrency={mockFormatCurrency}
        />
      )

      expect(screen.getByText('Worst Performers (24h)')).toBeInTheDocument()
      expect(screen.getByText('DOGE')).toBeInTheDocument()
      expect(screen.getByText('Dogecoin')).toBeInTheDocument()
    })

    it('displays ranks for worst performers', () => {
      const { container } = render(
        <PerformerCard
          title="Worst Performers"
          performers={mockPerformers}
          type="worst"
          formatPercentage={mockFormatPercentage}
          formatCurrency={mockFormatCurrency}
        />
      )

      const ranks = container.querySelectorAll('.bg-red-600')
      expect(ranks).toHaveLength(3)
    })

    it('applies red color to returns', () => {
      const { container } = render(
        <PerformerCard
          title="Worst Performers"
          performers={mockPerformers}
          type="worst"
          formatPercentage={mockFormatPercentage}
          formatCurrency={mockFormatCurrency}
        />
      )

      const returns = container.querySelectorAll('.text-red-400')
      expect(returns.length).toBeGreaterThan(0)
    })
  })

  describe('Format Functions', () => {
    it('uses custom format functions correctly', () => {
      const customFormatPercentage = vi.fn((val) => `${val}% gain`)
      const customFormatCurrency = vi.fn((val) => `€${val}`)

      render(
        <PerformerCard
          title="Custom Formatting"
          performers={mockPerformers}
          type="top"
          formatPercentage={customFormatPercentage}
          formatCurrency={customFormatCurrency}
        />
      )

      expect(customFormatPercentage).toHaveBeenCalled()
      expect(customFormatCurrency).toHaveBeenCalled()
    })
  })

  describe('Empty State', () => {
    it('renders with no performers', () => {
      const { container } = render(
        <PerformerCard
          title="No Performers"
          performers={[]}
          type="top"
          formatPercentage={mockFormatPercentage}
          formatCurrency={mockFormatCurrency}
        />
      )

      expect(screen.getByText('No Performers')).toBeInTheDocument()
      const items = container.querySelectorAll('.bg-gray-800\\/50')
      expect(items).toHaveLength(0)
    })
  })

  describe('Accessibility', () => {
    it('maintains proper heading structure', () => {
      render(
        <PerformerCard
          title="Accessible Card"
          performers={mockPerformers}
          type="top"
          formatPercentage={mockFormatPercentage}
          formatCurrency={mockFormatCurrency}
        />
      )

      const title = screen.getByText('Accessible Card')
      expect(title.tagName.toLowerCase()).toBe('h3')
    })

    it('provides semantic information for performers', () => {
      render(
        <PerformerCard
          title="Semantic Test"
          performers={mockPerformers.slice(0, 1)}
          type="top"
          formatPercentage={mockFormatPercentage}
          formatCurrency={mockFormatCurrency}
        />
      )

      // Symbol and name should be in separate elements
      expect(screen.getByText('BTC')).toBeInTheDocument()
      expect(screen.getByText('Bitcoin')).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive classes', () => {
      const { container } = render(
        <PerformerCard
          title="Responsive Test"
          performers={mockPerformers}
          type="top"
          formatPercentage={mockFormatPercentage}
          formatCurrency={mockFormatCurrency}
        />
      )

      const card = container.querySelector('.p-2')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Custom className', () => {
    it('applies custom className prop', () => {
      const { container } = render(
        <PerformerCard
          title="Custom Class Test"
          performers={mockPerformers}
          type="top"
          formatPercentage={mockFormatPercentage}
          formatCurrency={mockFormatCurrency}
          className="custom-performer-card"
        />
      )

      expect(container.querySelector('.custom-performer-card')).toBeInTheDocument()
    })
  })

  describe('Memoization', () => {
    it('is memoized (displayName is set)', () => {
      expect(PerformerCard.displayName).toBe('PerformerCard')
    })
  })
})

