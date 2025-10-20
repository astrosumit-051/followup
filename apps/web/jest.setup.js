import "@testing-library/jest-dom";

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

// Create mockable navigation functions
global.mockPush = jest.fn();
global.mockReplace = jest.fn();
global.mockSearchParamsGet = jest.fn(() => null);

// Mock Next.js navigation hooks
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: global.mockPush,
      replace: global.mockReplace,
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: "/",
      query: {},
    };
  },
  useSearchParams() {
    return {
      get: global.mockSearchParamsGet,
    };
  },
  usePathname() {
    return "/";
  },
}));
