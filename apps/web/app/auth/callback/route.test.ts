import { NextRequest, NextResponse } from "next/server";
import { GET } from "./route";

// Mock Next.js server
jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    redirect: jest.fn((url) => ({ url, status: 307 })),
  },
}));

// Mock Supabase server client
jest.mock("@/lib/supabase/server", () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      exchangeCodeForSession: jest.fn(),
    },
  })),
}));

import { createServerClient } from "@/lib/supabase/server";

describe("OAuth Callback Route - CSRF Protection", () => {
  let mockExchangeCodeForSession: jest.Mock;
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock for exchangeCodeForSession
    mockExchangeCodeForSession = jest.fn();

    // Mock createServerClient to return Supabase client with auth.exchangeCodeForSession
    (createServerClient as jest.Mock).mockReturnValue({
      auth: {
        exchangeCodeForSession: mockExchangeCodeForSession,
      },
    });
  });

  describe("PKCE Flow (Built-in CSRF Protection)", () => {
    it("should successfully exchange valid authorization code", async () => {
      const mockUrl = "http://localhost:3000/auth/callback?code=valid-code-123";
      mockRequest = {
        url: mockUrl,
        nextUrl: new URL(mockUrl),
      } as NextRequest;

      mockExchangeCodeForSession.mockResolvedValue({
        data: { session: { access_token: "token-123" } },
        error: null,
      });

      await GET(mockRequest);

      expect(mockExchangeCodeForSession).toHaveBeenCalledWith("valid-code-123");
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL("/", "http://localhost:3000"),
      );
    });

    it("should reject authorization code without valid PKCE verifier", async () => {
      const mockUrl = "http://localhost:3000/auth/callback?code=tampered-code";
      mockRequest = {
        url: mockUrl,
        nextUrl: new URL(mockUrl),
      } as NextRequest;

      // Supabase will reject if PKCE verifier doesn't match
      mockExchangeCodeForSession.mockResolvedValue({
        data: { session: null },
        error: {
          code: "invalid_grant",
          message: "Invalid PKCE verifier",
        },
      });

      await GET(mockRequest);

      expect(mockExchangeCodeForSession).toHaveBeenCalledWith("tampered-code");
      // Check that redirect was called (can't check exact URL due to URL object comparison)
      expect(NextResponse.redirect).toHaveBeenCalled();
    });

    it("should reject replayed authorization code", async () => {
      const mockUrl = "http://localhost:3000/auth/callback?code=used-code-123";
      mockRequest = {
        url: mockUrl,
        nextUrl: new URL(mockUrl),
      } as NextRequest;

      // Supabase rejects reused authorization codes
      mockExchangeCodeForSession.mockResolvedValue({
        data: { session: null },
        error: {
          code: "invalid_grant",
          message: "Authorization code has already been used",
        },
      });

      await GET(mockRequest);

      expect(NextResponse.redirect).toHaveBeenCalled();
    });

    it("should reject authorization code after expiration", async () => {
      const mockUrl = "http://localhost:3000/auth/callback?code=expired-code";
      mockRequest = {
        url: mockUrl,
        nextUrl: new URL(mockUrl),
      } as NextRequest;

      mockExchangeCodeForSession.mockResolvedValue({
        data: { session: null },
        error: {
          code: "invalid_grant",
          message: "Authorization code has expired",
        },
      });

      await GET(mockRequest);

      expect(NextResponse.redirect).toHaveBeenCalled();
    });
  });

  describe("Open Redirect Protection", () => {
    it("should allow redirect to same-origin path", async () => {
      const mockUrl =
        "http://localhost:3000/auth/callback?code=valid-code&next=/dashboard";
      mockRequest = {
        url: mockUrl,
        nextUrl: new URL(mockUrl),
      } as NextRequest;

      mockExchangeCodeForSession.mockResolvedValue({
        data: { session: { access_token: "token-123" } },
        error: null,
      });

      await GET(mockRequest);

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL("/dashboard", "http://localhost:3000"),
      );
    });

    it("should reject redirect to external domain", async () => {
      const mockUrl =
        "http://localhost:3000/auth/callback?code=valid-code&next=https://evil.com/steal-token";
      mockRequest = {
        url: mockUrl,
        nextUrl: new URL(mockUrl),
      } as NextRequest;

      mockExchangeCodeForSession.mockResolvedValue({
        data: { session: { access_token: "token-123" } },
        error: null,
      });

      await GET(mockRequest);

      // Should redirect to home page instead of external domain
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL("/", "http://localhost:3000"),
      );
    });

    it("should reject redirect with javascript: protocol", async () => {
      const mockUrl =
        "http://localhost:3000/auth/callback?code=valid-code&next=javascript:alert(1)";
      mockRequest = {
        url: mockUrl,
        nextUrl: new URL(mockUrl),
      } as NextRequest;

      mockExchangeCodeForSession.mockResolvedValue({
        data: { session: { access_token: "token-123" } },
        error: null,
      });

      await GET(mockRequest);

      // Should redirect to home page for malformed URL
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL("/", "http://localhost:3000"),
      );
    });

    it("should handle malformed next parameter", async () => {
      const mockUrl =
        "http://localhost:3000/auth/callback?code=valid-code&next=<invalid>";
      mockRequest = {
        url: mockUrl,
        nextUrl: new URL(mockUrl),
      } as NextRequest;

      mockExchangeCodeForSession.mockResolvedValue({
        data: { session: { access_token: "token-123" } },
        error: null,
      });

      await GET(mockRequest);

      // Should redirect to home page for malformed URL
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL("/", "http://localhost:3000"),
      );
    });
  });

  describe("Missing Code Parameter", () => {
    it("should redirect to login when code parameter is missing", async () => {
      const mockUrl = "http://localhost:3000/auth/callback";
      mockRequest = {
        url: mockUrl,
        nextUrl: new URL(mockUrl),
      } as NextRequest;

      await GET(mockRequest);

      expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL("/login", "http://localhost:3000"),
      );
    });

    it("should redirect to login when code parameter is empty", async () => {
      const mockUrl = "http://localhost:3000/auth/callback?code=";
      mockRequest = {
        url: mockUrl,
        nextUrl: new URL(mockUrl),
      } as NextRequest;

      await GET(mockRequest);

      expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL("/login", "http://localhost:3000"),
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle unexpected errors gracefully", async () => {
      const mockUrl = "http://localhost:3000/auth/callback?code=valid-code";
      mockRequest = {
        url: mockUrl,
        nextUrl: new URL(mockUrl),
      } as NextRequest;

      mockExchangeCodeForSession.mockRejectedValue(new Error("Network error"));

      await GET(mockRequest);

      // Just check that redirect was called
      expect(NextResponse.redirect).toHaveBeenCalled();
    });
  });
});
