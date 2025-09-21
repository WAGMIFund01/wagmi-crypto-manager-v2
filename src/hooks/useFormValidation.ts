'use client';

import { useState, useCallback } from 'react';
import { 
  validateForm, 
  validateField, 
  ValidationRules, 
  ValidationResult,
  FieldError 
} from '@/shared/utils/validation';

export interface UseFormValidationOptions {
  rules: ValidationRules;
  initialData?: Record<string, any>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseFormValidationReturn {
  data: Record<string, any>;
  errors: { [key: string]: string };
  isValid: boolean;
  isDirty: boolean;
  setFieldValue: (field: string, value: any) => void;
  setFieldError: (field: string, error: string | null) => void;
  validateField: (field: string) => boolean;
  validateForm: () => ValidationResult;
  resetForm: () => void;
  setFormData: (data: Record<string, any>) => void;
  clearErrors: () => void;
  hasFieldError: (field: string) => boolean;
  getFieldError: (field: string) => string | null;
}

/**
 * Custom hook for form validation with real-time validation
 */
export function useFormValidation({
  rules,
  initialData = {},
  validateOnChange = true,
  validateOnBlur = true
}: UseFormValidationOptions): UseFormValidationReturn {
  const [data, setData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isDirty, setIsDirty] = useState(false);

  // Validate a single field
  const validateSingleField = useCallback((field: string): boolean => {
    const fieldRules = rules[field];
    if (!fieldRules) return true;

    const fieldValue = data[field];
    const fieldError = validateField(fieldValue, fieldRules);
    
    setErrors(prev => {
      const newErrors = { ...prev };
      if (fieldError) {
        newErrors[field] = fieldError;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });

    return !fieldError;
  }, [data, rules]);

  // Validate entire form
  const validateEntireForm = useCallback((): ValidationResult => {
    const result = validateForm(data, rules);
    setErrors(result.errors);
    return result;
  }, [data, rules]);

  // Set field value with optional validation
  const setFieldValue = useCallback((field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    if (validateOnChange) {
      // Small delay to avoid excessive validation during typing
      setTimeout(() => validateSingleField(field), 100);
    }
  }, [validateOnChange, validateSingleField]);

  // Set field error manually
  const setFieldError = useCallback((field: string, error: string | null) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
  }, []);

  // Validate field on blur
  const handleFieldBlur = useCallback((field: string) => {
    if (validateOnBlur) {
      validateSingleField(field);
    }
  }, [validateOnBlur, validateSingleField]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setData(initialData);
    setErrors({});
    setIsDirty(false);
  }, [initialData]);

  // Set entire form data
  const setFormData = useCallback((newData: Record<string, any>) => {
    setData(newData);
    setIsDirty(true);
    
    if (validateOnChange) {
      // Validate all fields when setting form data
      const result = validateForm(newData, rules);
      setErrors(result.errors);
    }
  }, [validateOnChange, rules]);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Check if field has error
  const hasFieldError = useCallback((field: string): boolean => {
    return field in errors;
  }, [errors]);

  // Get error message for field
  const getFieldError = useCallback((field: string): string | null => {
    return errors[field] || null;
  }, [errors]);

  // Calculate if form is valid
  const isValid = Object.keys(errors).length === 0;

  return {
    data,
    errors,
    isValid,
    isDirty,
    setFieldValue,
    setFieldError,
    validateField: validateSingleField,
    validateForm: validateEntireForm,
    resetForm,
    setFormData,
    clearErrors,
    hasFieldError,
    getFieldError
  };
}

/**
 * Hook for simple field validation (without form state management)
 */
export function useFieldValidation(rules: ValidationRules) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateField = useCallback((field: string, value: any): boolean => {
    const fieldRules = rules[field];
    if (!fieldRules) return true;

    const error = validateField(value, fieldRules);
    
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });

    return !error;
  }, [rules]);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateField,
    clearFieldError,
    clearAllErrors,
    hasFieldError: (field: string) => field in errors,
    getFieldError: (field: string) => errors[field] || null
  };
}
