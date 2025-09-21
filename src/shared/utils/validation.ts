/**
 * Centralized validation utilities for consistent form validation across the app
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

export interface FieldError {
  field: string;
  message: string;
}

/**
 * Common validation patterns
 */
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  investorId: /^[A-Z0-9]+$/,
  quantity: /^\d*\.?\d{0,8}$/,
  positiveNumber: /^\d*\.?\d*$/,
  alphanumeric: /^[a-zA-Z0-9\s]+$/,
  noSpecialChars: /^[a-zA-Z0-9\s\-_]+$/
};

/**
 * Common validation messages
 */
export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be no more than ${max} characters`,
  pattern: 'Please enter a valid value',
  positiveNumber: 'Please enter a positive number',
  quantity: 'Please enter a valid quantity (up to 8 decimal places)',
  investorId: 'Investor ID must contain only letters and numbers',
  alphanumeric: 'Only letters, numbers, and spaces are allowed',
  noSpecialChars: 'Special characters are not allowed'
};

/**
 * Validate a single field against its rules
 */
export function validateField(value: any, rules: ValidationRule): string | null {
  // Handle empty values
  if (value === null || value === undefined || value === '') {
    if (rules.required) {
      return rules.message || VALIDATION_MESSAGES.required;
    }
    return null; // Empty value is valid if not required
  }

  const stringValue = String(value).trim();

  // Required validation
  if (rules.required && !stringValue) {
    return rules.message || VALIDATION_MESSAGES.required;
  }

  // Length validations
  if (rules.minLength && stringValue.length < rules.minLength) {
    return rules.message || VALIDATION_MESSAGES.minLength(rules.minLength);
  }

  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return rules.message || VALIDATION_MESSAGES.maxLength(rules.maxLength);
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return rules.message || VALIDATION_MESSAGES.pattern;
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
}

/**
 * Validate multiple fields against their rules
 */
export function validateForm(data: Record<string, any>, rules: ValidationRules): ValidationResult {
  const errors: { [key: string]: string } = {};

  Object.keys(rules).forEach(field => {
    const fieldRules = rules[field];
    const fieldValue = data[field];
    const error = validateField(fieldValue, fieldRules);
    
    if (error) {
      errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Common validation rules for different field types
 */
export const COMMON_RULES: ValidationRules = {
  // Asset fields
  assetName: {
    required: true,
    minLength: 1,
    maxLength: 100,
    pattern: VALIDATION_PATTERNS.alphanumeric
  },
  symbol: {
    required: true,
    minLength: 1,
    maxLength: 20,
    pattern: VALIDATION_PATTERNS.alphanumeric
  },
  quantity: {
    required: true,
    pattern: VALIDATION_PATTERNS.quantity,
    custom: (value) => {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) {
        return 'Please enter a valid quantity greater than 0';
      }
      return null;
    }
  },
  currentPrice: {
    required: true,
    pattern: VALIDATION_PATTERNS.positiveNumber,
    custom: (value) => {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) {
        return 'Please enter a valid price greater than 0';
      }
      return null;
    }
  },
  chain: {
    required: false,
    maxLength: 50,
    pattern: VALIDATION_PATTERNS.noSpecialChars
  },
  riskLevel: {
    required: false,
    maxLength: 20,
    pattern: VALIDATION_PATTERNS.alphanumeric
  },
  location: {
    required: false,
    maxLength: 50,
    pattern: VALIDATION_PATTERNS.noSpecialChars
  },
  coinType: {
    required: false,
    maxLength: 30,
    pattern: VALIDATION_PATTERNS.alphanumeric
  },
  thesis: {
    required: false,
    maxLength: 500
  },

  // Auth fields
  investorId: {
    required: true,
    minLength: 1,
    maxLength: 20,
    pattern: VALIDATION_PATTERNS.investorId,
    message: VALIDATION_MESSAGES.investorId
  },
  email: {
    required: true,
    pattern: VALIDATION_PATTERNS.email,
    message: VALIDATION_MESSAGES.email
  },
  password: {
    required: true,
    minLength: 8,
    maxLength: 100
  },

  // Search fields
  searchQuery: {
    required: false,
    maxLength: 100
  }
};

/**
 * Get validation rules for a specific form
 */
export function getFormRules(formType: 'addAsset' | 'editAsset' | 'investorLogin' | 'managerLogin'): ValidationRules {
  switch (formType) {
    case 'addAsset':
      return {
        quantity: COMMON_RULES.quantity,
        chain: COMMON_RULES.chain,
        riskLevel: COMMON_RULES.riskLevel,
        location: COMMON_RULES.location,
        coinType: COMMON_RULES.coinType,
        thesis: COMMON_RULES.thesis
      };
    
    case 'editAsset':
      return {
        quantity: COMMON_RULES.quantity,
        riskLevel: COMMON_RULES.riskLevel,
        location: COMMON_RULES.location,
        coinType: COMMON_RULES.coinType,
        thesis: COMMON_RULES.thesis
      };
    
    case 'investorLogin':
      return {
        investorId: COMMON_RULES.investorId
      };
    
    case 'managerLogin':
      return {
        email: COMMON_RULES.email,
        password: COMMON_RULES.password
      };
    
    default:
      return {};
  }
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: { [key: string]: string }): string[] {
  return Object.values(errors);
}

/**
 * Get the first validation error
 */
export function getFirstError(errors: { [key: string]: string }): string | null {
  const errorValues = Object.values(errors);
  return errorValues.length > 0 ? errorValues[0] : null;
}

/**
 * Check if a field has an error
 */
export function hasFieldError(field: string, errors: { [key: string]: string }): boolean {
  return field in errors;
}

/**
 * Get error message for a specific field
 */
export function getFieldError(field: string, errors: { [key: string]: string }): string | null {
  return errors[field] || null;
}
