/**
 * Authenticated User Interface
 *
 * Represents the user object extracted from JWT token by @CurrentUser() decorator.
 * This provides type safety for all authenticated GraphQL operations.
 */
export interface AuthenticatedUser {
  /**
   * User's unique identifier from database
   */
  id: string;

  /**
   * User's email address
   */
  email: string;

  /**
   * Optional user name
   */
  name?: string;

  /**
   * Optional profile picture URL
   */
  profilePicture?: string;

  /**
   * JWT token issued at timestamp
   */
  iat?: number;

  /**
   * JWT token expiration timestamp
   */
  exp?: number;
}
