import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CardHeader from '../CardHeader'
import { COLORS } from '@/shared/constants/colors'

describe('CardHeader', () => {
  it('renders with title only', () => {
    render(<CardHeader title="Test Title" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('renders with title and subtitle', () => {
    render(<CardHeader title="Test Title" subtitle="Test Subtitle" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
  })

  it('renders with action button', () => {
    render(
      <CardHeader 
        title="Test Title" 
        action={<button>Action Button</button>} 
      />
    )
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Action Button')).toBeInTheDocument()
  })

  it('applies default theme color', () => {
    const { container } = render(<CardHeader title="Default Theme" />)
    const title = container.querySelector('h3')
    expect(title).toHaveStyle({ color: COLORS.text.primary })
  })

  it('applies green theme color', () => {
    const { container } = render(<CardHeader title="Green Theme" theme="green" />)
    const title = container.querySelector('h3')
    const expectedColor = typeof COLORS.primary === 'string' 
      ? COLORS.primary 
      : COLORS.primary.green
    expect(title).toHaveStyle({ color: expectedColor })
  })

  it('applies gray theme color', () => {
    const { container } = render(<CardHeader title="Gray Theme" theme="gray" />)
    const title = container.querySelector('h3')
    expect(title).toHaveStyle({ color: COLORS.text.secondary })
  })

  it('applies custom className', () => {
    const { container } = render(
      <CardHeader title="Test" className="custom-class" />
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('truncates long titles', () => {
    const longTitle = 'This is a very long title that should be truncated'
    const { container } = render(<CardHeader title={longTitle} />)
    const title = container.querySelector('h3')
    expect(title).toHaveClass('truncate')
  })

  it('renders all elements together', () => {
    render(
      <CardHeader 
        title="Complete Header" 
        subtitle="With all props"
        action={<button>Click me</button>}
        theme="green"
        className="custom-styling"
      />
    )
    expect(screen.getByText('Complete Header')).toBeInTheDocument()
    expect(screen.getByText('With all props')).toBeInTheDocument()
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('does not render subtitle when empty', () => {
    const { container } = render(<CardHeader title="Title" subtitle="" />)
    expect(screen.getByText('Title')).toBeInTheDocument()
    // Empty subtitle should not render the paragraph element
    const subtitle = container.querySelector('p')
    expect(subtitle).not.toBeInTheDocument()
  })

  it('maintains accessibility structure', () => {
    const { container } = render(
      <CardHeader 
        title="Accessible Header" 
        subtitle="Subtitle text"
      />
    )
    const heading = container.querySelector('h3')
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveClass('text-lg', 'font-semibold')
  })
})

