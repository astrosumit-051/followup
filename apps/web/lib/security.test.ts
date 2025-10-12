import { describe, it, expect } from '@jest/globals';
import { validateRedirectOrigin, validatePasswordStrength, calculatePasswordStrength } from './security';

describe('Security Utilities', () => {
  describe('validateRedirectOrigin', () => {
    it('should accept allowed localhost origins', () => {
      expect(validateRedirectOrigin('http://localhost:3000')).toBe('http://localhost:3000');
      expect(validateRedirectOrigin('http://127.0.0.1:3000')).toBe('http://127.0.0.1:3000');
    });

    it('should reject untrusted origins and return fallback', () => {
      const result = validateRedirectOrigin('https://malicious.com');
      expect(result).toBe('http://localhost:3000'); // Fallback to first allowed origin
    });

    it('should reject origins with different ports', () => {
      const result = validateRedirectOrigin('http://localhost:4000');
      expect(result).toBe('http://localhost:3000');
    });
  });

  describe('validatePasswordStrength', () => {
    it('should reject passwords under 8 characters', () => {
      const result = validatePasswordStrength('Short1!');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('8 characters');
    });

    it('should reject passwords with less than 3 character types', () => {
      const result = validatePasswordStrength('lowercase123'); // only lowercase + numbers
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('at least 3 of');
    });

    it('should reject common password patterns', () => {
      const result = validatePasswordStrength('password123ABC!');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('common patterns');
    });

    it('should accept strong passwords', () => {
      const result = validatePasswordStrength('MyStr0ng!Pass');
      expect(result.valid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should accept passwords with all character types', () => {
      const result = validatePasswordStrength('MyGood9!Pass');
      expect(result.valid).toBe(true);
    });

    it('should reject "12345678" despite length', () => {
      const result = validatePasswordStrength('12345678');
      expect(result.valid).toBe(false);
    });

    it('should reject "qwerty123ABC" despite variety', () => {
      const result = validatePasswordStrength('qwerty123ABC');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('common patterns');
    });
  });

  describe('calculatePasswordStrength', () => {
    it('should return 0 for empty password', () => {
      expect(calculatePasswordStrength('')).toBe(0);
    });

    it('should return low score for weak passwords', () => {
      const score = calculatePasswordStrength('12345678');
      expect(score).toBeLessThanOrEqual(45); // Numbers only, 8+ chars = 25 + 20 = 45
    });

    it('should return medium score for moderate passwords', () => {
      const score = calculatePasswordStrength('Abc123456');
      expect(score).toBeGreaterThanOrEqual(40);
      expect(score).toBeLessThan(70);
    });

    it('should return high score for strong passwords', () => {
      const score = calculatePasswordStrength('MyStr0ng!Pass@123');
      expect(score).toBeGreaterThanOrEqual(70);
    });

    it('should return maximum 100', () => {
      const score = calculatePasswordStrength('VeryStr0ng!P@ssw0rd#With$Symbols');
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should reward password length', () => {
      const short = calculatePasswordStrength('Abc1!');
      const medium = calculatePasswordStrength('Abc123!@');
      const long = calculatePasswordStrength('Abc123!@#LongPass');

      expect(medium).toBeGreaterThan(short);
      expect(long).toBeGreaterThan(medium);
    });

    it('should reward character variety', () => {
      const onlyLower = calculatePasswordStrength('abcdefgh');
      const withUpper = calculatePasswordStrength('Abcdefgh');
      const withNumbers = calculatePasswordStrength('Abcd1234');
      const withSpecial = calculatePasswordStrength('Abcd123!');

      expect(withUpper).toBeGreaterThan(onlyLower);
      expect(withNumbers).toBeGreaterThan(withUpper);
      expect(withSpecial).toBeGreaterThan(withNumbers);
    });
  });
});
