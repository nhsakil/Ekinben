/**
 * Integration Tests for Validation Middleware
 * Tests validation, sanitization, and error handling
 */

import request from 'supertest';
import app from '../src/app.js';

describe('Validation Middleware Integration', () => {

  // ============ AUTH VALIDATION ============
  describe('Auth Endpoint Validation', () => {
    test('should accept valid signup data', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe'
        });

      // Should not reject due to validation
      expect(response.status).not.toBe(400);
    });

    test('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'SecurePass123!',
          firstName: 'John'
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should reject weak password', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'weak',
          firstName: 'John'
        });

      expect(response.status).toBe(400);
    });

    test('should sanitize XSS attempts in name', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          firstName: '<script>alert(1)</script>John'
        });

      // Should be sanitized, not rejected
      expect(response.status).not.toBe(400);
      // Verify the script tag was removed
      if (response.status === 201) {
        expect(response.body.data.user.firstName).not.toContain('<script>');
      }
    });
  });

  // ============ PRODUCT SEARCH VALIDATION ============
  describe('Product Search Validation', () => {
    test('should accept valid search parameters', async () => {
      const response = await request(app)
        .get('/api/products/search')
        .query({
          search: 'laptop',
          category: 'electronics',
          minPrice: 100,
          maxPrice: 5000,
          page: 1,
          limit: 20,
          sort: 'price',
          order: 'asc'
        });

      expect(response.status).not.toBe(400);
    });

    test('should reject invalid price range', async () => {
      const response = await request(app)
        .get('/api/products/search')
        .query({
          minPrice: 'abc'
        });

      expect(response.status).toBe(400);
    });

    test('should reject invalid sort parameter', async () => {
      const response = await request(app)
        .get('/api/products/search')
        .query({
          sort: 'invalid_sort'
        });

      expect(response.status).toBe(400);
    });

    test('should accept valid page limits', async () => {
      const response = await request(app)
        .get('/api/products/search')
        .query({
          page: 1,
          limit: 50
        });

      expect(response.status).not.toBe(400);
    });

    test('should reject page limit over 100', async () => {
      const response = await request(app)
        .get('/api/products/search')
        .query({
          limit: 200
        });

      expect(response.status).toBe(400);
    });
  });

  // ============ XSS PROTECTION ============
  describe('XSS Protection', () => {
    test('should sanitize HTML in string fields', async () => {
      const response = await request(app)
        .post('/api/blog')
        .set('Authorization', 'Bearer admin-token')
        .send({
          title: '<b>Test</b> Blog Post',
          slug: 'test-blog-post',
          content: 'Valid content'
        });

      if (response.status === 201) {
        expect(response.body.data.title).not.toContain('<b>');
      }
    });

    test('should detect script injection attempts', async () => {
      const response = await request(app)
        .post('/api/blog')
        .set('Authorization', 'Bearer admin-token')
        .send({
          title: 'Normal Blog',
          slug: 'normal-blog',
          content: '<script>alert("xss")</script>Content'
        });

      // Should sanitize
      expect(response.status).not.toBe(400);
    });

    test('should remove event handlers', async () => {
      const response = await request(app)
        .post('/api/newsletter')
        .send({
          email: 'test@example.com',
          name: 'John<img src=x onerror=alert(1)>'
        });

      // Should sanitize
      if (response.status !== 400) {
        expect(response.body.data.name).not.toContain('onerror');
      }
    });
  });

  // ============ SQL INJECTION PROTECTION ============
  describe('SQL Injection Protection', () => {
    test('should detect SQL keywords in input', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          firstName: 'John" SELECT * FROM users; --'
        });

      expect(response.status).toBe(400);
    });

    test('should detect INSERT attempts', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'Test123!INSERT INTO users VALUES(...)',
          firstName: 'John'
        });

      expect(response.status).toBe(400);
    });

    test('should allow normal SQL-like words', async () => {
      const response = await request(app)
        .post('/api/blog')
        .set('Authorization', 'Bearer admin-token')
        .send({
          title: 'How to SELECT data from your database',
          slug: 'select-from-database',
          content: 'This is about database SELECTs'
        });

      // Should accept if not actual SQL injection
      expect(response.status).not.toBe(400);
    });
  });

  // ============ TYPE VALIDATION ============
  describe('Type Validation', () => {
    test('should reject non-UUID for UUID fields', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', 'Bearer user-token')
        .send({
          productId: 'not-a-uuid',
          rating: 5,
          comment: 'Great product!'
        });

      expect(response.status).toBe(400);
    });

    test('should reject non-number for number fields', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', 'Bearer user-token')
        .send({
          productId: '550e8400-e29b-41d4-a716-446655440000',
          rating: 'high',
          comment: 'Good'
        });

      expect(response.status).toBe(400);
    });

    test('should enforce min and max values', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', 'Bearer user-token')
        .send({
          productId: '550e8400-e29b-41d4-a716-446655440000',
          rating: 10,
          comment: 'Too high rating'
        });

      expect(response.status).toBe(400);
    });
  });

  // ============ REQUIRED FIELD VALIDATION ============
  describe('Required Field Validation', () => {
    test('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com'
          // password is missing
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toHaveProperty('password');
    });

    test('should reject null required fields', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: null,
          firstName: 'John'
        });

      expect(response.status).toBe(400);
    });

    test('should accept empty optional fields', async () => {
      const response = await request(app)
        .get('/api/products/search')
        .query({
          search: '',
          category: ''
        });

      expect(response.status).not.toBe(400);
    });
  });

  // ============ LENGTH VALIDATION ============
  describe('Length Validation', () => {
    test('should reject strings shorter than minLength', async () => {
      const response = await request(app)
        .post('/api/blog')
        .set('Authorization', 'Bearer admin-token')
        .send({
          title: 'ab',
          slug: 'test',
          content: 'short'
        });

      expect(response.status).toBe(400);
    });

    test('should reject strings longer than maxLength', async () => {
      const response = await request(app)
        .post('/api/blog')
        .set('Authorization', 'Bearer admin-token')
        .send({
          title: 'a'.repeat(300),
          slug: 'test-blog',
          content: 'Valid content'
        });

      expect(response.status).toBe(400);
    });
  });

  // ============ CUSTOM VALIDATION ============
  describe('Custom Validation Rules', () => {
    test('should validate enum values', async () => {
      const response = await request(app)
        .patch('/api/users/profile')
        .set('Authorization', 'Bearer user-token')
        .send({
          gender: 'InvalidGender'
        });

      expect(response.status).toBe(400);
    });

    test('should validate date format', async () => {
      const response = await request(app)
        .patch('/api/users/profile')
        .set('Authorization', 'Bearer user-token')
        .send({
          dateOfBirth: 'invalid-date'
        });

      expect(response.status).toBe(400);
    });

    test('should validate slug format', async () => {
      const response = await request(app)
        .post('/api/blog')
        .set('Authorization', 'Bearer admin-token')
        .send({
          title: 'Valid Title',
          slug: 'INVALID-SLUG-WITH-CAPS',
          content: 'Content'
        });

      expect(response.status).toBe(400);
    });
  });

  // ============ ERROR RESPONSES ============
  describe('Error Response Format', () => {
    test('should return validation error in correct format', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'invalid',
          password: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    test('should include detailed error messages', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toHaveProperty('message');
    });
  });
});
