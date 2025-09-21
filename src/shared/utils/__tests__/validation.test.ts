import { describe, it, expect } from 'vitest'
import { validateField, validateForm, getFormRules, ValidationRule } from '../validation'

describe('validateField', () => {
  it('should validate required fields', () => {
    const rules: ValidationRule = {
      required: true,
      message: 'This field is required'
    }

    expect(validateField('', rules)).toBe('This field is required')
    expect(validateField(null, rules)).toBe('This field is required')
    expect(validateField(undefined, rules)).toBe('This field is required')
    expect(validateField('valid', rules)).toBeNull()
  })

  it('should validate string length', () => {
    const rules: ValidationRule = {
      minLength: 3,
      maxLength: 10,
      message: 'Must be between 3 and 10 characters'
    }

    expect(validateField('ab', rules)).toBe('Must be between 3 and 10 characters')
    expect(validateField('abcdefghijk', rules)).toBe('Must be between 3 and 10 characters')
    expect(validateField('valid', rules)).toBeNull()
  })

  it('should validate patterns', () => {
    const rules: ValidationRule = {
      pattern: /^[A-Z]+$/,
      message: 'Must be uppercase letters only'
    }

    expect(validateField('hello', rules)).toBe('Must be uppercase letters only')
    expect(validateField('HELLO', rules)).toBeNull()
  })

  it('should validate custom validators', () => {
    const rules: ValidationRule = {
      custom: (value: any) => value === 'special' ? null : 'Must be "special"'
    }

    expect(validateField('hello', rules)).toBe('Must be "special"')
    expect(validateField('special', rules)).toBeNull()
  })

  it('should return first error found', () => {
    const rules: ValidationRule = {
      required: true,
      minLength: 5,
      message: 'Required and must be at least 5 characters'
    }

    expect(validateField('ab', rules)).toBe('Required and must be at least 5 characters')
  })
})

describe('validateForm', () => {
  it('should validate all fields and return errors', () => {
    const data = {
      name: '',
      age: 15,
      email: 'invalid-email'
    }

    const rules = {
      name: { required: true, message: 'Name is required' },
      age: { 
        custom: (value: any) => {
          const num = parseInt(value);
          if (num < 18) return 'Must be 18 or older';
          if (num > 100) return 'Must be 100 or younger';
          return null;
        }
      },
      email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
    }

    const result = validateForm(data, rules)

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual({
      name: 'Name is required',
      age: 'Must be 18 or older',
      email: 'Invalid email'
    })
  })

  it('should return valid when no errors', () => {
    const data = {
      name: 'John Doe',
      age: 25,
      email: 'john@example.com'
    }

    const rules = {
      name: { required: true, message: 'Name is required' },
      age: { 
        custom: (value: any) => {
          const num = parseInt(value);
          if (num < 18) return 'Must be 18 or older';
          if (num > 100) return 'Must be 100 or younger';
          return null;
        }
      },
      email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
    }

    const result = validateForm(data, rules)

    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
  })
})

describe('getFormRules', () => {
  it('should return addAsset form rules', () => {
    const rules = getFormRules('addAsset')

    expect(rules.quantity).toBeDefined()
    expect(rules.quantity.required).toBe(true)
    expect(rules.thesis).toBeDefined()
    expect(rules.thesis.maxLength).toBe(500)
  })

  it('should return editAsset form rules', () => {
    const rules = getFormRules('editAsset')

    expect(rules.quantity).toBeDefined()
    expect(rules.quantity.required).toBe(true)
    expect(rules.thesis).toBeDefined()
    expect(rules.thesis.maxLength).toBe(500)
  })

  it('should return investorLogin form rules', () => {
    const rules = getFormRules('investorLogin')

    expect(rules.investorId).toBeDefined()
    expect(rules.investorId.required).toBe(true)
    expect(rules.investorId.minLength).toBe(1)
  })

  it('should return empty rules for unknown form', () => {
    const rules = getFormRules('unknown' as any)
    expect(rules).toEqual({})
  })
})
