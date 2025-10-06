import { createServerClient } from './server';
import { cookies } from 'next/headers';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

describe('createServerClient', () => {
  const originalEnv = process.env;
  const mockCookieStore = {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    jest.clearAllMocks();
    (cookies as jest.Mock).mockReturnValue(mockCookieStore);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should create a server Supabase client with environment variables', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    const client = createServerClient();

    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
    expect(cookies).toHaveBeenCalled();
  });

  it('should throw error if NEXT_PUBLIC_SUPABASE_URL is missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    expect(() => createServerClient()).toThrow(
      'Missing required Supabase environment variables',
    );
  });

  it('should throw error if NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(() => createServerClient()).toThrow(
      'Missing required Supabase environment variables',
    );
  });

  it('should handle cookie get operation', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    mockCookieStore.get.mockReturnValue({ value: 'test-cookie-value' });

    createServerClient();

    // Cookie operations will be called during client initialization
    expect(cookies).toHaveBeenCalled();
  });

  it('should handle cookie set operation', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    createServerClient();

    // Verify cookies() was called (cookie operations handled by Supabase SSR)
    expect(cookies).toHaveBeenCalled();
  });

  it('should create new instance on each call (no singleton for server)', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    const client1 = createServerClient();
    const client2 = createServerClient();

    // Server clients should be fresh instances (different from browser)
    expect(client1).not.toBe(client2);
  });
});
