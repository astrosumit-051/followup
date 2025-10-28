import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { LoginForm } from "./login-form";

expect.extend(toHaveNoViolations);

// Mock Next.js Link
jest.mock("next/link", () => {
  const MockLink = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = "MockLink";
  return MockLink;
});

describe("LoginForm", () => {
  beforeEach(() => {
    // Clear all global mocks before each test
    global.mockPush.mockClear();
    global.mockRefresh.mockClear();
    global.mockSignInWithPassword.mockClear();
    global.mockSignInWithOAuth.mockClear();
  });

  describe("Render", () => {
    it("renders login form with all elements", () => {
      render(<LoginForm />);

      expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
      expect(screen.getByLabelText("Email address")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign in$/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign in with google/i }),
      ).toBeInTheDocument();
    });

    it("renders sign up link", () => {
      render(<LoginForm />);

      const signUpLink = screen.getByRole("link", { name: /sign up/i });
      expect(signUpLink).toBeInTheDocument();
      expect(signUpLink).toHaveAttribute("href", "/signup");
    });

    it("renders inputs with correct types and attributes", () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email address");
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("autoComplete", "email");
      expect(emailInput).toHaveAttribute("required");

      const passwordInput = screen.getByLabelText("Password");
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toHaveAttribute("autoComplete", "current-password");
      expect(passwordInput).toHaveAttribute("required");
    });
  });

  describe("Form Submission", () => {
    it("handles successful email/password login", async () => {
      global.mockSignInWithPassword.mockResolvedValueOnce({
        data: {
          session: { access_token: "mock-token" },
          user: { email: "test@example.com" },
        },
        error: null,
      });

      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(
        screen.getByLabelText("Email address"),
        "test@example.com",
      );
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.click(screen.getByRole("button", { name: /sign in$/i }));

      await waitFor(() => {
        expect(global.mockSignInWithPassword).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
        });
        expect(global.mockPush).toHaveBeenCalledWith("/dashboard");
        expect(global.mockRefresh).toHaveBeenCalled();
      });
    });

    it("displays error message on failed login", async () => {
      global.mockSignInWithPassword.mockResolvedValueOnce({
        data: { session: null, user: null },
        error: { message: "Invalid email or password" },
      });

      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(
        screen.getByLabelText("Email address"),
        "test@example.com",
      );
      await user.type(screen.getByLabelText("Password"), "wrongpassword");
      await user.click(screen.getByRole("button", { name: /sign in$/i }));

      await waitFor(() => {
        expect(
          screen.getByText("Invalid email or password"),
        ).toBeInTheDocument();
      });
    });

    it("trims email input before submission", async () => {
      global.mockSignInWithPassword.mockResolvedValueOnce({
        data: {
          session: { access_token: "mock-token" },
          user: { email: "test@example.com" },
        },
        error: null,
      });

      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(
        screen.getByLabelText("Email address"),
        "  test@example.com  ",
      );
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.click(screen.getByRole("button", { name: /sign in$/i }));

      await waitFor(() => {
        expect(global.mockSignInWithPassword).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
        });
      });
    });
  });

  describe("Google OAuth", () => {
    it("handles Google sign-in", async () => {
      global.mockSignInWithOAuth.mockResolvedValueOnce({
        data: {},
        error: null,
      });

      const user = userEvent.setup();
      render(<LoginForm />);

      await user.click(
        screen.getByRole("button", { name: /sign in with google/i }),
      );

      await waitFor(() => {
        expect(global.mockSignInWithOAuth).toHaveBeenCalledWith({
          provider: "google",
          options: {
            redirectTo: expect.stringContaining("/auth/callback"),
          },
        });
      });
    });

    it("displays error message on failed Google login", async () => {
      global.mockSignInWithOAuth.mockResolvedValueOnce({
        data: {},
        error: { message: "Google authentication failed" },
      });

      const user = userEvent.setup();
      render(<LoginForm />);

      await user.click(
        screen.getByRole("button", { name: /sign in with google/i }),
      );

      await waitFor(() => {
        expect(
          screen.getByText("Google authentication failed"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Loading State", () => {
    it("disables inputs and buttons during submission", async () => {
      global.mockSignInWithPassword.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: { session: { access_token: "token" }, user: {} },
                  error: null,
                }),
              100,
            ),
          ),
      );

      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(
        screen.getByLabelText("Email address"),
        "test@example.com",
      );
      await user.type(screen.getByLabelText("Password"), "password123");

      const submitButton = screen.getByRole("button", { name: /sign in$/i });
      await user.click(submitButton);

      // Check loading state
      expect(screen.getByText("Signing in...")).toBeInTheDocument();
      expect(screen.getByLabelText("Email address")).toBeDisabled();
      expect(screen.getByLabelText("Password")).toBeDisabled();
      expect(submitButton).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /sign in with google/i }),
      ).toBeDisabled();

      await waitFor(() => {
        expect(global.mockPush).toHaveBeenCalledWith("/dashboard");
      });
    });

    it("shows loading spinner during submission", async () => {
      global.mockSignInWithPassword.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: { session: { access_token: "token" }, user: {} },
                  error: null,
                }),
              100,
            ),
          ),
      );

      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(
        screen.getByLabelText("Email address"),
        "test@example.com",
      );
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.click(screen.getByRole("button", { name: /sign in$/i }));

      // Check for Loader2 icon (animated spinner)
      const submitButton = screen.getByRole("button", { name: /signing in/i });
      expect(submitButton).toContainHTML("animate-spin");
    });
  });

  describe("Keyboard Navigation", () => {
    it("allows form submission with Enter key", async () => {
      global.mockSignInWithPassword.mockResolvedValueOnce({
        data: {
          session: { access_token: "mock-token" },
          user: { email: "test@example.com" },
        },
        error: null,
      });

      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(
        screen.getByLabelText("Email address"),
        "test@example.com",
      );
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(global.mockSignInWithPassword).toHaveBeenCalled();
      });
    });

    it("allows tabbing between form fields", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email address");
      const forgotPasswordLink = screen.getByRole("link", {
        name: /forgot password/i,
      });
      const passwordInput = screen.getByLabelText("Password");
      const signInButton = screen.getByRole("button", { name: /sign in$/i });

      emailInput.focus();
      expect(emailInput).toHaveFocus();

      // Tab to Forgot password link (comes before password input in DOM)
      await user.tab();
      expect(forgotPasswordLink).toHaveFocus();

      // Tab to password input
      await user.tab();
      expect(passwordInput).toHaveFocus();

      // Tab to sign in button (skipping eye icon button which has tabIndex=-1)
      await user.tab();
      expect(signInButton).toHaveFocus();
    });
  });

  describe("Accessibility", () => {
    it("has accessible form labels", () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email address");
      const passwordInput = screen.getByLabelText("Password");

      expect(emailInput).toHaveAccessibleName("Email address");
      expect(passwordInput).toHaveAccessibleName("Password");
    });

    it("should have no accessibility violations", async () => {
      const { container } = render(<LoginForm />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations with error state", async () => {
      global.mockSignInWithPassword.mockResolvedValueOnce({
        data: { session: null, user: null },
        error: { message: "Invalid credentials" },
      });

      const user = userEvent.setup();
      const { container } = render(<LoginForm />);

      await user.type(
        screen.getByLabelText("Email address"),
        "test@example.com",
      );
      await user.type(screen.getByLabelText("Password"), "wrong");
      await user.click(screen.getByRole("button", { name: /sign in$/i }));

      await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Error Handling", () => {
    it("clears previous error when starting new login attempt", async () => {
      global.mockSignInWithPassword
        .mockResolvedValueOnce({
          data: { session: null, user: null },
          error: { message: "First error" },
        })
        .mockResolvedValueOnce({
          data: {
            session: { access_token: "token" },
            user: { email: "test@example.com" },
          },
          error: null,
        });

      const user = userEvent.setup();
      render(<LoginForm />);

      // First failed attempt
      await user.type(
        screen.getByLabelText("Email address"),
        "test@example.com",
      );
      await user.type(screen.getByLabelText("Password"), "wrong");
      await user.click(screen.getByRole("button", { name: /sign in$/i }));

      await waitFor(() => {
        expect(screen.getByText("First error")).toBeInTheDocument();
      });

      // Second successful attempt
      await user.clear(screen.getByLabelText("Password"));
      await user.type(screen.getByLabelText("Password"), "correct");
      await user.click(screen.getByRole("button", { name: /sign in$/i }));

      await waitFor(() => {
        expect(screen.queryByText("First error")).not.toBeInTheDocument();
      });
    });
  });
});
