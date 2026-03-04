/**
 * Unit Tests for Sanitizer Utility
 * Tests all input sanitization and validation functions
 */

import {
  sanitizeString,
  sanitizeEmail,
  sanitizeNumber,
  sanitizeUUID,
  sanitizePhoneNumber,
  sanitizeURL,
  sanitizeObject,
  validateAndSanitize,
  escapeHtml,
  removeSQLWildcards
} from '../src/utils/sanitizer.js';

describe('Sanitizer Utility', () => {

  // ============ STRING SANITIZATION ============
  describe('sanitizeString', () => {
    test('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = sanitizeString(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
    });

    test('should remove null bytes', () => {
      const input = 'Hello\x00World';
      const result = sanitizeString(input);
      expect(result).toBe('HelloWorld');
    });

    test('should trim whitespace', () => {
      const input = '   Hello World   ';
      const result = sanitizeString(input);
      expect(result).toBe('Hello World');
    });

    test('should limit string length', () => {
      const input = 'a'.repeat(15000);
      const result = sanitizeString(input);
      expect(result.length).toBeLessThanOrEqual(10000);
    });

    test('should handle normal text', () => {
      const input = 'Hello World 123!';
      const result = sanitizeString(input);
      expect(result).toBe('Hello World 123!');
    });
  });

  // ============ EMAIL SANITIZATION ============
  describe('sanitizeEmail', () => {
    test('should validate correct email', () => {
      const result = sanitizeEmail('test@example.com');
      expect(result).toBe('test@example.com');
    });

    test('should convert to lowercase', () => {
      const result = sanitizeEmail('TEST@EXAMPLE.COM');
      expect(result).toBe('test@example.com');
    });

    test('should reject invalid email', () => {
      expect(sanitizeEmail('invalid-email')).toBe('');
      expect(sanitizeEmail('test@')).toBe('');
      expect(sanitizeEmail('@example.com')).toBe('');
    });

    test('should handle email injection attempts', () => {
      const result = sanitizeEmail('test@example.com\n\nbcc:attacker@evil.com');
      expect(result).toBe('');
    });
  });

  // ============ NUMBER SANITIZATION ============
  describe('sanitizeNumber', () => {
    test('should parse valid integer', () => {
      expect(sanitizeNumber('42')).toBe(42);
      expect(sanitizeNumber('-10')).toBe(-10);
    });

    test('should parse valid float', () => {
      expect(sanitizeNumber('3.14', { isFloat: true })).toBe(3.14);
    });

    test('should enforce min/max bounds', () => {
      expect(sanitizeNumber(5, { min: 1, max: 10 })).toBe(5);
      expect(sanitizeNumber(0, { min: 1, max: 10 })).toBe(1);
      expect(sanitizeNumber(15, { min: 1, max: 10 })).toBe(10);
    });

    test('should return null for invalid input', () => {
      expect(sanitizeNumber('abc')).toBeNull();
      expect(sanitizeNumber('12.34.56')).toBeNull();
    });
  });

  // ============ UUID SANITIZATION ============
  describe('sanitizeUUID', () => {
    test('should validate correct UUID', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const result = sanitizeUUID(uuid);
      expect(result).toBe(uuid);
    });

    test('should reject invalid UUID', () => {
      expect(sanitizeUUID('not-a-uuid')).toBeNull();
      expect(sanitizeUUID('550e84000')).toBeNull();
    });

    test('should be case insensitive', () => {
      const uuid = '550E8400-E29B-41D4-A716-446655440000';
      const result = sanitizeUUID(uuid);
      expect(result).toBe(uuid.toLowerCase());
    });
  });

  // ============ PHONE SANITIZATION ============
  describe('sanitizePhoneNumber', () => {
    test('should clean phone numbers', () => {
      expect(sanitizePhoneNumber('+1 (555) 123-4567')).toBe('+1(555)123-4567');
    });

    test('should remove non-phone characters', () => {
      expect(sanitizePhoneNumber('555-123-4567<script>')).toBe('555-123-4567');
    });

    test('should limit length', () => {
      const result = sanitizePhoneNumber('123456789012345678901234567890');
      expect(result.length).toBeLessThanOrEqual(20);
    });
  });

  // ============ URL SANITIZATION ============
  describe('sanitizeURL', () => {
    test('should validate HTTPS URLs', () => {
      const url = 'https://example.com/path';
      expect(sanitizeURL(url)).toBe(url);
    });

    test('should validate HTTP URLs', () => {
      const url = 'http://example.com';
      expect(sanitizeURL(url)).toBe(url);
    });

    test('should reject dangerous protocols', () => {
      expect(sanitizeURL('javascript:alert(1)')).toBeNull();
      expect(sanitizeURL('data:text/html,<script>alert(1)</script>')).toBeNull();
      expect(sanitizeURL('file:///etc/passwd')).toBeNull();
    });

    test('should reject invalid URLs', () => {
      expect(sanitizeURL('not a url')).toBeNull();
    });
  });

  // ============ OBJECT SANITIZATION ============
  describe('sanitizeObject', () => {
    test('should sanitize all string properties', () => {
      const obj = {
        name: '<script>alert(1)</script>John',
        age: 25,
        email: 'john@example.com'
      };
      const result = sanitizeObject(obj);
      expect(result.name).not.toContain('<script>');
      expect(result.age).toBe(25);
    });

    test('should filter allowed keys', () => {
      const obj = { name: 'John', password: 'secret', age: 25 };
      const result = sanitizeObject(obj, ['name', 'age']);
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('age');
      expect(result).not.toHaveProperty('password');
    });

    test('should handle nested objects', () => {
      const obj = {
        user: {
          name: '<b>John</b>',
          contact: {
            email: 'john@example.com'
          }
        }
      };
      const result = sanitizeObject(obj);
      expect(result.user.name).not.toContain('<b>');
    });
  });

  // ============ VALIDATION & SANITIZATION ============
  describe('validateAndSanitize', () => {
    const schema = {
      email: {
        type: 'email',
        required: true,
        maxLength: 255
      },
      password: {
        type: 'string',
        required: true,
        minLength: 8
      },
      age: {
        type: 'number',
        required: false,
        options: { min: 18, max: 100 }
      }
    };

    test('should validate and sanitize valid data', () => {
      const body = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        age: '25'
      };
      const { isValid, data, errors } = validateAndSanitize(body, schema);
      expect(isValid).toBe(true);
      expect(errors).toEqual({});
      expect(data.age).toBe(25);
    });

    test('should reject invalid email', () => {
      const body = {
        email: 'invalid-email',
        password: 'SecurePass123!'
      };
      const { isValid, errors } = validateAndSanitize(body, schema);
      expect(isValid).toBe(false);
      expect(errors).toHaveProperty('email');
    });

    test('should reject missing required fields', () => {
      const body = { age: 25 };
      const { isValid, errors } = validateAndSanitize(body, schema);
      expect(isValid).toBe(false);
      expect(errors).toHaveProperty('email');
      expect(errors).toHaveProperty('password');
    });

    test('should enforce min/max length', () => {
      const body = {
        email: 'test@example.com',
        password: 'short'
      };
      const { isValid, errors } = validateAndSanitize(body, schema);
      expect(isValid).toBe(false);
      expect(errors).toHaveProperty('password');
    });

    test('should allow optional fields', () => {
      const body = {
        email: 'test@example.com',
        password: 'SecurePass123!'
      };
      const { isValid, data } = validateAndSanitize(body, schema);
      expect(isValid).toBe(true);
      expect(data.age).toBeNull();
    });
  });

  // ============ HTML ESCAPING ============
  describe('escapeHtml', () => {
    test('should escape HTML entities', () => {
      expect(escapeHtml('<script>alert(1)</script>')).toBe(
        '&lt;script&gt;alert(1)&lt;/script&gt;'
      );
    });

    test('should escape quotes', () => {
      expect(escapeHtml('He said "hello"')).toContain('&quot;');
    });

    test('should escape ampersands', () => {
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });
  });

  // ============ SQL WILDCARD REMOVAL ============
  describe('removeSQLWildcards', () => {
    test('should remove SQL wildcard characters', () => {
      expect(removeSQLWildcards('test%query_')).toBe('testquery');
      expect(removeSQLWildcards('50%')).toBe('50');
    });

    test('should handle backslashes', () => {
      expect(removeSQLWildcards('test\\')).toBe('test');
    });

    test('should preserve normal text', () => {
      expect(removeSQLWildcards('normal text')).toBe('normal text');
    });
  });
});
