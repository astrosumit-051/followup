# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-10-04-user-authentication/spec.md

> Created: 2025-10-04
> Version: 1.0.0

## Overview

The authentication system exposes both REST endpoints (for OAuth callbacks) and GraphQL queries/mutations (for user profile management). Authentication is handled primarily on the frontend via Supabase Auth SDK, with the backend providing protected API routes that validate Supabase JWT tokens.

## REST Endpoints

### GET /auth/callback

**Purpose:** OAuth callback handler for Google and LinkedIn authentication (PKCE flow).

**Authentication:** None (public endpoint, validates OAuth code)

**Parameters:**
- `code` (query, string, required): Authorization code from OAuth provider
- `next` (query, string, optional): Redirect path after successful authentication (default: `/`)

**Response:**
- **Success (302 Redirect):**
  - Redirects to `next` parameter path with session established
  - Sets httpOnly cookies: `supabase-auth-token`, `supabase-auth-refresh-token`

- **Error (302 Redirect):**
  - Redirects to `/auth/auth-code-error` with error details

**Example Request:**
```
GET /auth/callback?code=abc123xyz&next=/dashboard
```

**Implementation Notes:**
- Calls `supabase.auth.exchangeCodeForSession(code)` to validate OAuth code
- Handles `x-forwarded-host` header for production load balancer scenarios
- Validates `next` parameter is relative URL to prevent open redirect vulnerabilities

**Error Handling:**
- Invalid code → Redirect to error page with message
- Expired code → Redirect to login with "Session expired" notice
- Missing code → Redirect to login

---

### POST /auth/refresh (Optional - if manual refresh needed)

**Purpose:** Manually refresh access token using refresh token (fallback if automatic refresh fails).

**Authentication:** Requires valid refresh token in httpOnly cookie

**Request Body:** None (uses cookie)

**Response:**
- **Success (200 OK):**
  ```json
  {
    "accessToken": "eyJhbGc...",
    "expiresIn": 3600,
    "refreshToken": "new-refresh-token"
  }
  ```

- **Error (401 Unauthorized):**
  ```json
  {
    "statusCode": 401,
    "message": "Invalid refresh token"
  }
  ```

**Implementation Notes:**
- This endpoint is optional; Supabase SDK handles refresh automatically
- Only needed if custom refresh logic is required

---

## GraphQL API

### Queries

#### me

**Purpose:** Retrieve authenticated user's profile information.

**Authentication:** Required (JWT in Authorization header)

**Arguments:** None

**Returns:**
```graphql
type User {
  id: ID!
  supabaseId: String!
  email: String!
  name: String
  profilePicture: String
  provider: String
  lastLoginAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

**Example Query:**
```graphql
query GetCurrentUser {
  me {
    id
    email
    name
    profilePicture
    provider
    lastLoginAt
  }
}
```

**Example Response:**
```json
{
  "data": {
    "me": {
      "id": "clx123abc",
      "email": "john@example.com",
      "name": "John Doe",
      "profilePicture": "https://lh3.googleusercontent.com/...",
      "provider": "google",
      "lastLoginAt": "2025-10-04T10:30:00Z"
    }
  }
}
```

**Errors:**
- **401 Unauthorized:** Missing or invalid JWT token
- **404 Not Found:** User record not found in database (should never happen if auth is valid)

---

### Mutations

#### updateProfile

**Purpose:** Update authenticated user's profile information.

**Authentication:** Required (JWT in Authorization header)

**Arguments:**
```graphql
input UpdateProfileInput {
  name: String
  profilePicture: String
}
```

**Returns:**
```graphql
type User {
  id: ID!
  email: String!
  name: String
  profilePicture: String
  updatedAt: DateTime!
}
```

**Example Mutation:**
```graphql
mutation UpdateUserProfile($input: UpdateProfileInput!) {
  updateProfile(input: $input) {
    id
    name
    profilePicture
    updatedAt
  }
}
```

**Example Variables:**
```json
{
  "input": {
    "name": "John Smith",
    "profilePicture": "https://example.com/new-avatar.jpg"
  }
}
```

**Example Response:**
```json
{
  "data": {
    "updateProfile": {
      "id": "clx123abc",
      "name": "John Smith",
      "profilePicture": "https://example.com/new-avatar.jpg",
      "updatedAt": "2025-10-04T11:00:00Z"
    }
  }
}
```

**Errors:**
- **401 Unauthorized:** Missing or invalid JWT token
- **400 Bad Request:** Invalid input (e.g., name too long, invalid URL format)

**Business Logic:**
- Only `name` and `profilePicture` are updatable via this mutation
- Email changes require separate verification flow (future feature)
- Automatically updates `updatedAt` timestamp

---

#### syncUserFromSupabase (Internal)

**Purpose:** Create or update User record in PostgreSQL based on Supabase Auth user data.

**Authentication:** Internal use only (called by auth guard/middleware)

**Arguments:**
```typescript
{
  supabaseId: string;
  email: string;
  name?: string;
  profilePicture?: string;
  provider?: string;
}
```

**Returns:** User object

**Implementation Notes:**
- Called automatically on first login after successful authentication
- Uses `upsert` to handle both new user creation and existing user updates
- Updates `lastLoginAt` on every call
- Not exposed as public GraphQL mutation

---

## Authentication Guards & Middleware

### NestJS AuthGuard

**File:** `apps/api/src/auth/auth.guard.ts`

**Purpose:** Validate Supabase JWT token on protected routes.

**Implementation:**
```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      const payload = await this.supabaseService.verifyToken(token);
      request.user = await this.userService.findBySupabaseId(payload.sub);
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

**Token Validation Steps:**
1. Extract token from `Authorization: Bearer <token>` header
2. Verify JWT signature using Supabase JWT secret
3. Decode payload to get `sub` (supabaseId)
4. Look up User in PostgreSQL by `supabaseId`
5. Attach User object to request for use in resolvers

**Error Responses:**
- Missing token → `401 Unauthorized: Missing authentication token`
- Invalid token → `401 Unauthorized: Invalid or expired token`
- User not found → `401 Unauthorized: User account not found`

---

### GraphQL Context Authentication

**File:** `apps/api/src/app.module.ts`

**Purpose:** Attach authenticated user to GraphQL context for all resolvers.

**Implementation:**
```typescript
GraphQLModule.forRoot({
  autoSchemaFile: true,
  context: ({ req }) => ({ user: req.user }), // Populated by AuthGuard
})
```

**Usage in Resolvers:**
```typescript
@Query(() => User)
async me(@Context() context: { user: User }) {
  return context.user;
}
```

---

### @CurrentUser Decorator

**File:** `apps/api/src/auth/current-user.decorator.ts`

**Purpose:** Extract authenticated user from GraphQL context.

**Implementation:**
```typescript
export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().user;
  },
);
```

**Usage:**
```typescript
@Mutation(() => User)
async updateProfile(
  @CurrentUser() user: User,
  @Args('input') input: UpdateProfileInput,
) {
  return this.userService.updateProfile(user.id, input);
}
```

---

## Services

### UserService

**File:** `apps/api/src/user/user.service.ts`

**Methods:**

#### findBySupabaseId(supabaseId: string): Promise<User>

**Purpose:** Find user by Supabase Auth ID.

**Implementation:**
```typescript
async findBySupabaseId(supabaseId: string): Promise<User> {
  const user = await this.prisma.user.findUnique({
    where: { supabaseId },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  return user;
}
```

#### syncUserFromSupabase(supabaseUser: SupabaseUser): Promise<User>

**Purpose:** Create or update user based on Supabase Auth data.

**Implementation:**
```typescript
async syncUserFromSupabase(supabaseUser: any): Promise<User> {
  return this.prisma.user.upsert({
    where: { supabaseId: supabaseUser.id },
    update: {
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name,
      profilePicture: supabaseUser.user_metadata?.avatar_url,
      lastLoginAt: new Date(),
    },
    create: {
      supabaseId: supabaseUser.id,
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name,
      profilePicture: supabaseUser.user_metadata?.avatar_url,
      provider: supabaseUser.app_metadata?.provider,
      lastLoginAt: new Date(),
    },
  });
}
```

#### updateProfile(userId: string, input: UpdateProfileInput): Promise<User>

**Purpose:** Update user profile fields.

**Implementation:**
```typescript
async updateProfile(userId: string, input: UpdateProfileInput): Promise<User> {
  return this.prisma.user.update({
    where: { id: userId },
    data: {
      ...input,
      updatedAt: new Date(),
    },
  });
}
```

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 401 | Missing authentication token | No Authorization header provided |
| 401 | Invalid or expired token | JWT signature invalid or token expired |
| 401 | User account not found | Valid token but no User record in database |
| 404 | User not found | Queried user doesn't exist |
| 400 | Invalid input | Validation error on mutation input |
| 500 | Internal server error | Unexpected error during processing |

---

## Security Considerations

- **JWT Expiration:** Access tokens expire in 1 hour (configured in Supabase)
- **Refresh Tokens:** Refresh tokens expire in 30 days
- **Token Storage:** httpOnly cookies prevent XSS access to tokens
- **CSRF Protection:** Next.js middleware handles CSRF for authentication routes
- **Rate Limiting:** Apply rate limiting to `/auth/callback` to prevent abuse (defer to infrastructure)
- **Input Validation:** Use class-validator on all mutation inputs
