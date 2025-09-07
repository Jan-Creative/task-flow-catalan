/**
 * Type-safe form hook to replace untyped form handling
 */

import { useState, useCallback } from 'react';
import { validateRequired, validateEmail, validateLength } from '@/utils/typeUtils';

export interface FormField<T = string> {
  value: T;
  error: string;
  touched: boolean;
  validators: Array<(value: T) => string>;
}

export interface FormConfig<T extends Record<string, unknown>> {
  initialValues: T;
  validators?: Partial<Record<keyof T, Array<(value: unknown) => string>>>;
  onSubmit: (values: T) => void | Promise<void>;
}

export interface FormState<T extends Record<string, unknown>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

export const useTypedForm = <T extends Record<string, unknown>>(
  config: FormConfig<T>
) => {
  const [state, setState] = useState<FormState<T>>({
    values: config.initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true
  });

  const validateField = useCallback((field: keyof T, value: unknown): string => {
    const validators = config.validators?.[field] || [];
    
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    
    return '';
  }, [config.validators]);

  const validateForm = useCallback((): boolean => {
    const errors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    for (const field in state.values) {
      const error = validateField(field, state.values[field]);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    }

    setState(prev => ({ ...prev, errors, isValid }));
    return isValid;
  }, [state.values, validateField]);

  const setValue = useCallback(<K extends keyof T>(
    field: K,
    value: T[K]
  ) => {
    setState(prev => {
      const newValues = { ...prev.values, [field]: value };
      const error = validateField(field, value);
      
      return {
        ...prev,
        values: newValues,
        errors: { ...prev.errors, [field]: error },
        touched: { ...prev.touched, [field]: true },
        isValid: error === '' && Object.entries(prev.errors).every(([key, err]) => 
          key === String(field) ? !error : !err
        )
      };
    });
  }, [validateField]);

  const setError = useCallback((field: keyof T, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
      isValid: false
    }));
  }, []);

  const resetForm = useCallback(() => {
    setState({
      values: { ...config.initialValues },
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true
    });
  }, [config.initialValues]);

  const updateInitialValues = useCallback((newValues: Partial<T>) => {
    setState(prev => {
      const updatedValues = { ...prev.values, ...newValues };
      return {
        ...prev,
        values: updatedValues,
        errors: {},
        touched: {},
        isValid: true
      };
    });
  }, []);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      await config.onSubmit(state.values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [config.onSubmit, state.values, validateForm]);

  return {
    ...state,
    setValue,
    setError,
    resetForm,
    updateInitialValues,
    handleSubmit,
    validateForm,
    // Helper for getting field props
    getFieldProps: <K extends keyof T>(field: K) => ({
      value: state.values[field],
      error: state.errors[field],
      onChange: (value: T[K]) => setValue(field, value),
      onBlur: () => setState(prev => ({ 
        ...prev, 
        touched: { ...prev.touched, [field]: true } 
      }))
    })
  };
};

// ============= COMMON VALIDATORS =============
export const createRequiredValidator = (fieldName: string) => 
  (value: unknown) => validateRequired(value, fieldName);

export const createEmailValidator = () => 
  (value: unknown) => validateEmail(value);

export const createLengthValidator = (min: number, max?: number, fieldName = 'Camp') => 
  (value: unknown) => validateLength(value, min, max, fieldName);

export const createMinValidator = (min: number, fieldName = 'Camp') => 
  (value: unknown) => {
    const num = typeof value === 'number' ? value : parseFloat(String(value));
    return isNaN(num) || num < min ? `${fieldName} ha de ser almenys ${min}` : '';
  };

export const createMaxValidator = (max: number, fieldName = 'Camp') => 
  (value: unknown) => {
    const num = typeof value === 'number' ? value : parseFloat(String(value));
    return isNaN(num) || num > max ? `${fieldName} no pot ser més de ${max}` : '';
  };