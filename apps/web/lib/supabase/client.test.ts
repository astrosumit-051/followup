import { createBrowserClient } from "./client";

describe("createBrowserClient", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should create a browser Supabase client with environment variables", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

    const client = createBrowserClient();

    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
  });

  it("should throw error if NEXT_PUBLIC_SUPABASE_URL is missing", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

    expect(() => createBrowserClient()).toThrow(
      "Missing required Supabase environment variables",
    );
  });

  it("should throw error if NEXT_PUBLIC_SUPABASE_ANON_KEY is missing", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(() => createBrowserClient()).toThrow(
      "Missing required Supabase environment variables",
    );
  });

  it("should create singleton instance (same client on multiple calls)", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

    const client1 = createBrowserClient();
    const client2 = createBrowserClient();

    expect(client1).toBe(client2);
  });
});
