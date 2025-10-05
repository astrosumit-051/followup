import { beforeEach } from 'vitest';

// Provide jest global for jest-mock-extended compatibility
globalThis.jest = {
  fn: () => {
    const mockFn = (...args: any[]) => mockFn.mock.results[mockFn.mock.calls.length - 1]?.value;
    mockFn.mock = { calls: [], results: [] };
    mockFn.mockReturnValue = (value: any) => {
      mockFn.mock.results.push({ type: 'return', value });
      return mockFn;
    };
    return mockFn;
  },
} as any;
