import { describe, it, expect } from 'vitest'
import { maskSensitiveData, formatCurrency, formatPercentage } from '../maskSensitiveData'

describe('maskSensitiveData', () => {
  it('should return original value when privacy mode is disabled', () => {
    expect(maskSensitiveData('12345', false)).toBe('12345')
    expect(maskSensitiveData(12345, false)).toBe('12345')
    expect(maskSensitiveData('$1,234.56', false)).toBe('$1,234.56')
  })

  it('should mask value when privacy mode is enabled', () => {
    expect(maskSensitiveData('12345', true)).toBe('•••••')
    expect(maskSensitiveData(12345, true)).toBe('•••••')
    expect(maskSensitiveData('$1,234.56', true)).toBe('•••••')
  })

  it('should handle empty strings', () => {
    expect(maskSensitiveData('', false)).toBe('')
    expect(maskSensitiveData('', true)).toBe('•••••')
  })

  it('should handle zero values', () => {
    expect(maskSensitiveData(0, false)).toBe('0')
    expect(maskSensitiveData(0, true)).toBe('•••••')
  })
})

describe('formatCurrency', () => {
  it('should format currency correctly when privacy mode is disabled', () => {
    expect(formatCurrency(1234.56, false)).toBe('$1,234.56')
    expect(formatCurrency(1000000, false)).toBe('$1,000,000.00')
    expect(formatCurrency(0, false)).toBe('$0.00')
    expect(formatCurrency(0.5, false)).toBe('$0.50')
  })

  it('should mask currency when privacy mode is enabled', () => {
    expect(formatCurrency(1234.56, true)).toBe('•••••')
    expect(formatCurrency(1000000, true)).toBe('•••••')
    expect(formatCurrency(0, true)).toBe('•••••')
  })

  it('should default to privacy mode disabled', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })

  it('should handle negative values', () => {
    expect(formatCurrency(-1234.56, false)).toBe('$-1,234.56')
    expect(formatCurrency(-1234.56, true)).toBe('•••••')
  })
})

describe('formatPercentage', () => {
  it('should format percentage correctly when privacy mode is disabled', () => {
    expect(formatPercentage(12.34, false)).toBe('12.3%')
    expect(formatPercentage(0, false)).toBe('0.0%')
    expect(formatPercentage(100, false)).toBe('100.0%')
  })

  it('should mask percentage when privacy mode is enabled', () => {
    expect(formatPercentage(12.34, true)).toBe('•••••')
    expect(formatPercentage(0, true)).toBe('•••••')
    expect(formatPercentage(100, true)).toBe('•••••')
  })

  it('should show sign when requested', () => {
    expect(formatPercentage(12.34, false, true)).toBe('+12.3%')
    expect(formatPercentage(-12.34, false, true)).toBe('-12.3%')
    expect(formatPercentage(0, false, true)).toBe('+0.0%')
  })

  it('should not show sign by default', () => {
    expect(formatPercentage(12.34, false, false)).toBe('12.3%')
    expect(formatPercentage(-12.34, false, false)).toBe('-12.3%')
  })

  it('should default to privacy mode disabled and no sign', () => {
    expect(formatPercentage(12.34)).toBe('12.3%')
  })

  it('should handle edge cases', () => {
    expect(formatPercentage(0.1, false)).toBe('0.1%')
    expect(formatPercentage(99.99, false)).toBe('100.0%')
    expect(formatPercentage(-0.1, false)).toBe('-0.1%')
  })
})
