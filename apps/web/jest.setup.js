import "@testing-library/jest-dom";

// Suppress console errors for React act() warnings caused by Next.js Link internals
// These warnings are expected when testing Next.js components
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Warning: An update to") ||
        args[0].includes("Not wrapped in act"))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock environment variables for tests
// Note: Each test file mocks Supabase client independently
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mock.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "mock-anon-key";

// Mock window.location for auth redirects
delete global.window.location;
global.window.location = {
  origin: "http://localhost:3000",
  href: "http://localhost:3000",
  protocol: "http:",
  host: "localhost:3000",
  hostname: "localhost",
  port: "3000",
  pathname: "/",
  search: "",
  hash: "",
};

// Create mockable navigation functions
global.mockPush = jest.fn();
global.mockReplace = jest.fn();
global.mockRefresh = jest.fn();
global.mockSearchParamsGet = jest.fn(() => null);

// Mock Next.js navigation hooks
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: global.mockPush,
      replace: global.mockReplace,
      refresh: global.mockRefresh,
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

// Create mockable Supabase auth functions
global.mockSignInWithPassword = jest.fn();
global.mockSignInWithOAuth = jest.fn();
global.mockSignUp = jest.fn();

// Mock Supabase client
jest.mock("@/lib/supabase/client", () => ({
  createBrowserClient: () => ({
    auth: {
      signInWithPassword: global.mockSignInWithPassword,
      signInWithOAuth: global.mockSignInWithOAuth,
      signUp: global.mockSignUp,
    },
  }),
}));
