/**
 * Type utilities and guards to help reduce 'any' usage
 */

// ============= TYPE GUARDS =============
export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value);
};

export const isBoolean = (value: unknown): value is boolean => {
  return typeof value === 'boolean';
};

export const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const isArray = (value: unknown): value is unknown[] => {
  return Array.isArray(value);
};

export const isDefined = <T>(value: T | undefined | null): value is T => {
  return value !== undefined && value !== null;
};

// ============= FORM VALUE HANDLERS =============
export const safeStringValue = (value: unknown, fallback = ''): string => {
  return isString(value) ? value : fallback;
};

export const safeNumberValue = (value: unknown, fallback = 0): number => {
  if (isNumber(value)) return value;
  if (isString(value)) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
};

export const safeBooleanValue = (value: unknown, fallback = false): boolean => {
  if (isBoolean(value)) return value;
  if (isString(value)) return value === 'true';
  return fallback;
};

// ============= ARRAY AND OBJECT UTILITIES =============
export const safeArrayAccess = <T>(
  array: unknown,
  index: number,
  fallback?: T
): T | undefined => {
  if (!isArray(array) || index < 0 || index >= array.length) {
    return fallback;
  }
  return array[index] as T;
};

export const safeObjectAccess = <T>(
  obj: unknown,
  key: string,
  fallback?: T
): T | undefined => {
  if (!isObject(obj) || !(key in obj)) {
    return fallback;
  }
  return obj[key] as T;
};

// ============= EVENT HANDLER UTILITIES =============
export const createTypedEventHandler = <T>(
  handler: (value: T) => void,
  valueExtractor: (event: unknown) => T
) => {
  return (event: unknown) => {
    try {
      const value = valueExtractor(event);
      handler(value);
    } catch (error) {
      console.warn('Error in typed event handler:', error);
    }
  };
};

// ============= API RESPONSE UTILITIES =============
export const isApiError = (value: unknown): value is { error: string } => {
  return isObject(value) && 'error' in value && isString(value.error);
};

export const extractApiData = <T>(response: unknown, fallback?: T): T | undefined => {
  if (isObject(response) && 'data' in response) {
    return response.data as T;
  }
  return fallback;
};

// ============= VALIDATION HELPERS =============
export const validateRequired = (value: unknown, fieldName: string): string => {
  if (!isDefined(value) || (isString(value) && value.trim() === '')) {
    return `${fieldName} és obligatori`;
  }
  return '';
};

export const validateEmail = (value: unknown): string => {
  if (!isString(value)) return 'Email ha de ser text';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value) ? '' : 'Format d\'email invàlid';
};

export const validateLength = (
  value: unknown,
  min: number,
  max?: number,
  fieldName = 'Camp'
): string => {
  if (!isString(value)) return `${fieldName} ha de ser text`;
  
  if (value.length < min) {
    return `${fieldName} ha de tenir almenys ${min} caràcters`;
  }
  
  if (max && value.length > max) {
    return `${fieldName} no pot tenir més de ${max} caràcters`;
  }
  
  return '';
};