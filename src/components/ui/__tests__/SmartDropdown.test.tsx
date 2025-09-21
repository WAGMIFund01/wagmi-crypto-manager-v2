import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SmartDropdown from '../SmartDropdown'

// Mock the usePortfolioFieldOptions hook
const mockUsePortfolioFieldOptions = vi.fn(() => ({
  options: ['Bitcoin', 'Ethereum', 'Solana'],
  loading: false,
  error: null
}))

vi.mock('@/hooks/usePortfolioFieldOptions', () => ({
  usePortfolioFieldOptions: mockUsePortfolioFieldOptions
}))

describe('SmartDropdown', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    placeholder: 'Select an option',
    field: 'chain' as const
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render with placeholder', () => {
    render(<SmartDropdown {...defaultProps} />)
    
    expect(screen.getByPlaceholderText('Select an option')).toBeInTheDocument()
  })

  it('should display current value', () => {
    render(<SmartDropdown {...defaultProps} value="Bitcoin" />)
    
    expect(screen.getByDisplayValue('Bitcoin')).toBeInTheDocument()
  })

  it('should show options when clicked', async () => {
    const user = userEvent.setup()
    render(<SmartDropdown {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Select an option')
    await user.click(input)
    
    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument()
      expect(screen.getByText('Ethereum')).toBeInTheDocument()
      expect(screen.getByText('Solana')).toBeInTheDocument()
    })
  })

  it('should filter options when typing', async () => {
    const user = userEvent.setup()
    render(<SmartDropdown {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Select an option')
    await user.click(input)
    await user.type(input, 'Bit')
    
    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument()
      expect(screen.queryByText('Ethereum')).not.toBeInTheDocument()
      expect(screen.queryByText('Solana')).not.toBeInTheDocument()
    })
  })

  it('should call onChange when option is selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SmartDropdown {...defaultProps} onChange={onChange} />)
    
    const input = screen.getByPlaceholderText('Select an option')
    await user.click(input)
    
    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument()
    })
    
    await user.click(screen.getByText('Bitcoin'))
    
    expect(onChange).toHaveBeenCalledWith('Bitcoin')
  })

  it('should allow custom input', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SmartDropdown {...defaultProps} onChange={onChange} />)
    
    const input = screen.getByPlaceholderText('Select an option')
    await user.type(input, 'Custom Value')
    
    expect(onChange).toHaveBeenCalledWith('Custom Value')
  })

  it('should show loading state', () => {
    mockUsePortfolioFieldOptions.mockReturnValue({
      options: [],
      loading: true,
      error: null
    })

    render(<SmartDropdown {...defaultProps} />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should show error state', () => {
    mockUsePortfolioFieldOptions.mockReturnValue({
      options: [],
      loading: false,
      error: 'Failed to load options'
    })

    render(<SmartDropdown {...defaultProps} />)
    
    expect(screen.getByText('Error loading options')).toBeInTheDocument()
  })

  it('should close dropdown when clicking outside', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <SmartDropdown {...defaultProps} />
        <div data-testid="outside">Outside element</div>
      </div>
    )
    
    const input = screen.getByPlaceholderText('Select an option')
    await user.click(input)
    
    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument()
    })
    
    await user.click(screen.getByTestId('outside'))
    
    await waitFor(() => {
      expect(screen.queryByText('Bitcoin')).not.toBeInTheDocument()
    })
  })

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<SmartDropdown {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Select an option')
    await user.click(input)
    
    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument()
    })
    
    // Arrow down to first option
    await user.keyboard('{ArrowDown}')
    expect(screen.getByText('Bitcoin')).toHaveClass('bg-green-100')
    
    // Arrow down to second option
    await user.keyboard('{ArrowDown}')
    expect(screen.getByText('Ethereum')).toHaveClass('bg-green-100')
    
    // Enter to select
    await user.keyboard('{Enter}')
    expect(defaultProps.onChange).toHaveBeenCalledWith('Ethereum')
  })

  it('should handle escape key to close', async () => {
    const user = userEvent.setup()
    render(<SmartDropdown {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Select an option')
    await user.click(input)
    
    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument()
    })
    
    await user.keyboard('{Escape}')
    
    await waitFor(() => {
      expect(screen.queryByText('Bitcoin')).not.toBeInTheDocument()
    })
  })

  it('should apply custom className', () => {
    render(<SmartDropdown {...defaultProps} className="custom-class" />)
    
    expect(screen.getByPlaceholderText('Select an option')).toHaveClass('custom-class')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<SmartDropdown {...defaultProps} disabled />)
    
    const input = screen.getByPlaceholderText('Select an option')
    expect(input).toBeDisabled()
  })

  it('should show no options message when no options available', () => {
    mockUsePortfolioFieldOptions.mockReturnValue({
      options: [],
      loading: false,
      error: null
    })

    render(<SmartDropdown {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('Select an option')
    fireEvent.click(input)
    
    expect(screen.getByText('No options available')).toBeInTheDocument()
  })
})
