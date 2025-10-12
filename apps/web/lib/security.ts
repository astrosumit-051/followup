/**
 * Security utilities for authentication and validation
 */

/**
 * Allowed origins for OAuth redirects
 * Add your production and staging domains here
 */
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  // Add production domains:
  // 'https://yourdomain.com',
  // 'https://staging.yourdomain.com',
];

/**
 * Validates redirect origin against allowlist to prevent open redirect vulnerabilities
 * @param origin - The origin to validate (e.g., window.location.origin)
 * @returns Validated origin or fallback to first allowed origin
 */
export function validateRedirectOrigin(origin: string): string {
  if (ALLOWED_ORIGINS.includes(origin)) {
    return origin;
  }

  console.warn(`Attempted redirect to untrusted origin: ${origin}. Using fallback.`);

  // Fallback to first allowed origin (usually localhost in dev, production URL in prod)
  return ALLOWED_ORIGINS[0];
}

/**
 * Password strength validation (client-side check - must also be enforced server-side)
 * @param password - Password to validate
 * @returns Validation result with strength score and feedback
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  strength: number;
  reason?: string;
} {
  if (password.length < 8) {
    return { valid: false, strength: 0, reason: 'Password must be at least 8 characters' };
  }

  let strength = 0;

  // Length scoring
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 15;

  // Character variety scoring
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  if (hasLower && hasUpper) strength += 20;
  if (hasNumber) strength += 20;
  if (hasSpecial) strength += 20;

  strength = Math.min(strength, 100);

  // Require at least 3 character types for validity
  const characterTypes = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  if (characterTypes < 3) {
    return {
      valid: false,
      strength,
      reason: 'Password must contain at least 3 of: lowercase, uppercase, number, special character'
    };
  }

  // Check against common weak passwords
  const commonPatterns = [
    'password', '12345678', 'qwerty', 'abc123', 'letmein',
    'welcome', 'monkey', '1234567890', 'admin', 'user'
  ];

  const lowerPassword = password.toLowerCase();
  for (const pattern of commonPatterns) {
    if (lowerPassword.includes(pattern)) {
      return {
        valid: false,
        strength,
        reason: 'Password contains common patterns and is too weak'
      };
    }
  }

  return { valid: true, strength };
}

/**
 * Calculates password strength score (0-100) for UI display
 * @param password - Password to calculate strength for
 * @returns Strength score from 0 to 100
 */
export function calculatePasswordStrength(password: string): number {
  const result = validatePasswordStrength(password);
  return result.strength;
}
