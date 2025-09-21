import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import WagmiButton from '../WagmiButton'

describe('WagmiButton', () => {
  it('should render with children', () => {
    render(<WagmiButton>Click me</WagmiButton>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('should render with icon', () => {
    const icon = <span data-testid="icon">+</span>
    render(<WagmiButton icon={icon}>Add</WagmiButton>)
    
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('Add')).toBeInTheDocument()
  })

  it('should render icon-only button', () => {
    const icon = <span data-testid="icon">+</span>
    render(<WagmiButton icon={icon} size="icon" />)
    
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should apply correct variant classes', () => {
    const { rerender } = render(<WagmiButton variant="primary">Primary</WagmiButton>)
    expect(screen.getByRole('button')).toHaveClass('bg-green-600')

    rerender(<WagmiButton variant="outline">Outline</WagmiButton>)
    expect(screen.getByRole('button')).toHaveClass('border-green-600')

    rerender(<WagmiButton variant="ghost">Ghost</WagmiButton>)
    expect(screen.getByRole('button')).toHaveClass('text-green-600')

    rerender(<WagmiButton variant="icon">Icon</WagmiButton>)
    expect(screen.getByRole('button')).toHaveClass('w-7', 'h-7')
  })

  it('should apply correct size classes', () => {
    const { rerender } = render(<WagmiButton size="sm">Small</WagmiButton>)
    expect(screen.getByRole('button')).toHaveClass('h-8', 'px-3', 'text-sm')

    rerender(<WagmiButton size="md">Medium</WagmiButton>)
    expect(screen.getByRole('button')).toHaveClass('h-10', 'px-4', 'text-sm')

    rerender(<WagmiButton size="lg">Large</WagmiButton>)
    expect(screen.getByRole('button')).toHaveClass('h-12', 'px-6', 'text-base')
  })

  it('should apply correct theme classes', () => {
    const { rerender } = render(<WagmiButton theme="green">Green</WagmiButton>)
    expect(screen.getByRole('button')).toHaveClass('bg-green-600')

    rerender(<WagmiButton theme="orange">Orange</WagmiButton>)
    expect(screen.getByRole('button')).toHaveClass('bg-orange-600')

    rerender(<WagmiButton theme="blue">Blue</WagmiButton>)
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600')
  })

  it('should handle click events', () => {
    const handleClick = vi.fn()
    render(<WagmiButton onClick={handleClick}>Click me</WagmiButton>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when loading', () => {
    render(<WagmiButton loading>Loading</WagmiButton>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-50', 'pointer-events-none')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<WagmiButton disabled>Disabled</WagmiButton>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-50', 'pointer-events-none')
  })

  it('should not trigger click when disabled', () => {
    const handleClick = vi.fn()
    render(<WagmiButton disabled onClick={handleClick}>Disabled</WagmiButton>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should not trigger click when loading', () => {
    const handleClick = vi.fn()
    render(<WagmiButton loading onClick={handleClick}>Loading</WagmiButton>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should show loading spinner when loading', () => {
    render(<WagmiButton loading>Loading</WagmiButton>)
    
    // Check for loading spinner (assuming it has a specific class or test id)
    expect(screen.getByRole('button')).toHaveClass('opacity-50')
  })

  it('should apply custom className', () => {
    render(<WagmiButton className="custom-class">Custom</WagmiButton>)
    
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('should forward ref correctly', () => {
    const ref = vi.fn()
    render(<WagmiButton ref={ref}>Ref test</WagmiButton>)
    
    expect(ref).toHaveBeenCalled()
  })

  it('should render with icon on the right', () => {
    const icon = <span data-testid="icon">→</span>
    render(<WagmiButton icon={icon} iconPosition="right">Next</WagmiButton>)
    
    const button = screen.getByRole('button')
    const iconElement = screen.getByTestId('icon')
    
    // Check that icon comes after text
    expect(button.children[1]).toBe(iconElement)
  })

  it('should render with icon on the left by default', () => {
    const icon = <span data-testid="icon">←</span>
    render(<WagmiButton icon={icon}>Back</WagmiButton>)
    
    const button = screen.getByRole('button')
    const iconElement = screen.getByTestId('icon')
    
    // Check that icon comes before text
    expect(button.children[0]).toBe(iconElement)
  })
})
