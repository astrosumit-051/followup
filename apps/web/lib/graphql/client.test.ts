import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { SupabaseClient } from '@supabase/supabase-js';

// Import functions to test
import { graphqlRequest, graphqlMutation } from './client';

// Mock fetch
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Create mock Supabase client
const mockGetSession = jest.fn();
const mockSupabaseClient = {
  auth: {
    getSession: mockGetSession,
  },
} as unknown as SupabaseClient;

describe('GraphQL Client', () => {
  const mockAccessToken = 'mock-jwt-token';
  const mockSession = {
    access_token: mockAccessToken,
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: 'mock-refresh-token',
    user: {
      id: 'user-123',
      email: 'test@example.com',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default successful session mock
    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
  });

  describe('graphqlRequest', () => {
    it('should make successful GraphQL request with auth token', async () => {
      const mockQuery = 'query { test }';
      const mockVariables = { id: '123' };
      const mockResponse = { data: { test: 'value' } };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await graphqlRequest(mockQuery, mockVariables, mockSupabaseClient);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/graphql',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockAccessToken}`,
          },
          body: JSON.stringify({
            query: mockQuery,
            variables: mockVariables,
          }),
        }
      );

      expect(result).toEqual({ test: 'value' });
    });

    it('should throw error if user not authenticated', async () => {
      mockGetSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const mockQuery = 'query { test }';

      await expect(graphqlRequest(mockQuery, undefined, mockSupabaseClient)).rejects.toThrow('User not authenticated');
    });

    it('should throw error if session retrieval fails', async () => {
      mockGetSession.mockResolvedValueOnce({
        data: { session: null },
        error: new Error('Session error'),
      });

      const mockQuery = 'query { test }';

      await expect(graphqlRequest(mockQuery, undefined, mockSupabaseClient)).rejects.toThrow('User not authenticated');
    });

    it('should throw error if fetch fails', async () => {
      const mockQuery = 'query { test }';

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(graphqlRequest(mockQuery, undefined, mockSupabaseClient)).rejects.toThrow(
        'GraphQL request failed: Internal Server Error'
      );
    });

    it('should throw error if GraphQL response contains errors', async () => {
      const mockQuery = 'query { test }';
      const mockResponse = {
        errors: [{ message: 'GraphQL error message' }],
      };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await expect(graphqlRequest(mockQuery, undefined, mockSupabaseClient)).rejects.toThrow('GraphQL error message');
    });

    it('should handle query without variables', async () => {
      const mockQuery = 'query { test }';
      const mockResponse = { data: { test: 'value' } };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await graphqlRequest(mockQuery, undefined, mockSupabaseClient);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/graphql',
        expect.objectContaining({
          body: JSON.stringify({
            query: mockQuery,
            variables: undefined,
          }),
        })
      );

      expect(result).toEqual({ test: 'value' });
    });
  });

  describe('graphqlMutation', () => {
    it('should make successful GraphQL mutation', async () => {
      const mockMutation = 'mutation { createTest }';
      const mockVariables = { input: { name: 'test' } };
      const mockResponse = { data: { createTest: { id: '1', name: 'test' } } };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await graphqlMutation(mockMutation, mockVariables, mockSupabaseClient);

      expect(result).toEqual({ createTest: { id: '1', name: 'test' } });
    });

    it('should use same authentication as graphqlRequest', async () => {
      const mockMutation = 'mutation { test }';
      const mockResponse = { data: { test: 'value' } };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await graphqlMutation(mockMutation, undefined, mockSupabaseClient);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/graphql',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockAccessToken}`,
          }),
        })
      );
    });
  });
});
