# Server-Side Password Validation Setup

## Overview

This document describes how to implement server-side password validation using Supabase Edge Functions to prevent weak passwords from being created through API manipulation.

## Why Server-Side Validation is Required

Client-side validation (currently implemented in `apps/web/lib/security.ts`) can be bypassed by:
- Disabling JavaScript
- Directly calling the Supabase API from browser console
- Intercepting and modifying network requests
- Using Supabase client library outside the UI

## Implementation Options

### Option 1: Supabase Edge Function (Recommended)

Create a Supabase Auth Hook that validates passwords before account creation.

#### Step 1: Create Edge Function

Create file: `supabase/functions/validate-password/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

interface PasswordValidation {
  valid: boolean;
  reason?: string;
}

function validatePasswordStrength(password: string): PasswordValidation {
  if (password.length < 8) {
    return { valid: false, reason: 'Password must be at least 8 characters' };
  }

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  const characterTypes = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  if (characterTypes < 3) {
    return {
      valid: false,
      reason: 'Password must contain at least 3 of: lowercase, uppercase, number, special character'
    };
  }

  // Check against common weak passwords
  const commonPasswords = [
    'password', '12345678', 'qwerty', 'abc123', 'letmein',
    'welcome', 'monkey', '1234567890', 'admin', 'user', 'test'
  ];

  const lowerPassword = password.toLowerCase();
  for (const pattern of commonPasswords) {
    if (lowerPassword.includes(pattern)) {
      return {
        valid: false,
        reason: 'Password contains common patterns and is too weak'
      };
    }
  }

  return { valid: true };
}

serve(async (req) => {
  try {
    const { type, user, password } = await req.json();

    // Only validate on signup
    if (type !== 'SIGNUP') {
      return new Response(JSON.stringify({ decision: 'allow' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate password strength
    const validation = validatePasswordStrength(password);

    if (!validation.valid) {
      return new Response(
        JSON.stringify({
          decision: 'reject',
          message: validation.reason || 'Password does not meet security requirements'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ decision: 'allow' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Password validation error:', error);
    return new Response(
      JSON.stringify({ decision: 'reject', message: 'Internal validation error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

#### Step 2: Deploy Edge Function

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
supabase functions deploy validate-password
```

#### Step 3: Configure Auth Hook

1. Go to Supabase Dashboard → Authentication → Auth Hooks
2. Create a new hook:
   - **Hook Type**: Pre-signup
   - **Function**: validate-password
   - **Enabled**: Yes

#### Step 4: Test the Hook

```bash
# Test with weak password (should fail)
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/auth/v1/signup' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "12345678"}'

# Test with strong password (should succeed)
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/auth/v1/signup' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "StrongP@ss123!"}'
```

### Option 2: NestJS Backend Validation (Alternative)

If you prefer to handle validation in your NestJS backend:

#### Step 1: Create Signup Endpoint

```typescript
// apps/api/src/auth/auth.controller.ts
import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: { email: string; password: string }) {
    // Validate password strength
    const validation = this.authService.validatePasswordStrength(signupDto.password);

    if (!validation.valid) {
      throw new BadRequestException(validation.reason);
    }

    // Create user via Supabase Admin API (bypasses hooks)
    return this.authService.createUser(signupDto.email, signupDto.password);
  }
}
```

#### Step 2: Update Frontend

```typescript
// apps/web/components/auth/signup-form.tsx
// Instead of calling supabase.auth.signUp() directly:
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: email.trim(), password })
});
```

## Security Considerations

1. **Never trust client-side validation** - Always validate on the server
2. **Keep password rules in sync** - Update both client and server validation when rules change
3. **Log validation failures** - Monitor for bypass attempts
4. **Rate limit signup attempts** - Prevent brute-force account creation
5. **Consider password breach databases** - Check against HaveIBeenPwned API

## Testing

### Unit Tests

Test the validation function with various passwords:

```typescript
describe('Password Validation', () => {
  it('should reject passwords under 8 characters', () => {
    expect(validatePasswordStrength('Short1!')).toHaveProperty('valid', false);
  });

  it('should reject common passwords', () => {
    expect(validatePasswordStrength('password123')).toHaveProperty('valid', false);
  });

  it('should accept strong passwords', () => {
    expect(validatePasswordStrength('MyStr0ng!Pass')).toHaveProperty('valid', true);
  });
});
```

### Integration Tests

Test the full signup flow:

```bash
# Attempt signup with weak password (should fail)
pnpm test:e2e --grep="signup with weak password"

# Attempt signup with strong password (should succeed)
pnpm test:e2e --grep="signup with strong password"
```

## Monitoring

Monitor password validation failures in Supabase Edge Function logs:

1. Go to Supabase Dashboard → Edge Functions → validate-password
2. View logs for rejection patterns
3. Set up alerts for high rejection rates (possible attack)

## Rollout Plan

1. **Phase 1**: Deploy Edge Function in monitoring mode (log but don't reject)
2. **Phase 2**: Enable rejection for new accounts only
3. **Phase 3**: Add password strength checks for existing users on password change
4. **Phase 4**: Require password updates for users with weak passwords

## Additional Resources

- [Supabase Auth Hooks Documentation](https://supabase.com/docs/guides/auth/auth-hooks)
- [OWASP Password Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)

## Current Status

✅ Client-side validation implemented in `apps/web/lib/security.ts`
⏳ Server-side validation pending deployment (see steps above)
⏳ Edge Function code ready for deployment
⏳ Auth Hook configuration pending

**Priority**: HIGH - Implement before production launch to prevent weak password creation.
