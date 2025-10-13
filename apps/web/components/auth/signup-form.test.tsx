import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { SignupForm } from './signup-form';

expect.extend(toHaveNoViolations);

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

// Mock Supabase client
const mockSignUp = jest.fn();
const mockSignInWithOAuth = jest.fn();
jest.mock('@/lib/supabase/client', () => ({
  createBrowserClient: () => ({
    auth: {
      signUp: mockSignUp,
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}));

describe('SignupForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Render', () => {
    it('renders signup form with all elements', () => {
      render(<SignupForm />);

      expect(screen.getByText('Create your account')).toBeInTheDocument();
      expect(screen.getByLabelText('Email address')).toBeInTheDocument();
      expect(screen.getByLabelText(/^Password$/)).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign up with google/i })).toBeInTheDocument();
    });

    it('renders sign in link', () => {
      render(<SignupForm />);

      const signInLink = screen.getByRole('link', { name: /sign in/i });
      expect(signInLink).toBeInTheDocument();
      expect(signInLink).toHaveAttribute('href', '/login');
    });

    it('renders inputs with correct types and attributes', () => {
      render(<SignupForm />);

      const emailInput = screen.getByLabelText('Email address');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      expect(emailInput).toHaveAttribute('required');

      const passwordInput = screen.getByLabelText(/^Password$/);
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('autoComplete', 'new-password');
      expect(passwordInput).toHaveAttribute('required');

      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('autoComplete', 'new-password');
      expect(confirmPasswordInput).toHaveAttribute('required');
    });
  });

  describe('Password Strength Indicator', () => {
    it('shows password strength indicator when password is entered', async () => {
      const user = userEvent.setup();
      render(<SignupForm />);

      const passwordInput = screen.getByLabelText(/^Password$/);
      await user.type(passwordInput, 'weak');

      expect(screen.getByText('Password strength:')).toBeInTheDocument();
      expect(screen.getByText('Weak')).toBeInTheDocument();
    });

    it('shows medium strength for moderately strong password', async () => {
      const user = userEvent.setup();
      render(<SignupForm />);

      const passwordInput = screen.getByLabelText(/^Password$/);
      await user.type(passwordInput, 'Password123');

      await waitFor(() => {
        expect(screen.getByText('Medium')).toBeInTheDocument();
      });
    });

    it('shows strong strength for strong password', async () => {
      const user = userEvent.setup();
      render(<SignupForm />);

      const passwordInput = screen.getByLabelText(/^Password$/);
      await user.type(passwordInput, 'StrongP@ssw0rd!');

      await waitFor(() => {
        expect(screen.getByText('Strong')).toBeInTheDocument();
      });
    });

    it('shows password requirements hint', async () => {
      const user = userEvent.setup();
      render(<SignupForm />);

      const passwordInput = screen.getByLabelText(/^Password$/);
      await user.type(passwordInput, 'test');

      expect(screen.getByText(/Use 8\+ characters with a mix of letters, numbers & symbols/)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows error when passwords do not match', async () => {
      const user = userEvent.setup();
      render(<SignupForm />);

      await user.type(screen.getByLabelText('Email address'), 'test@example.com');
      await user.type(screen.getByLabelText(/^Password$/), 'Password123!');
      await user.type(screen.getByLabelText('Confirm Password'), 'DifferentPassword');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });

    it('shows error when password is too short', async () => {
      const user = userEvent.setup();
      render(<SignupForm />);

      await user.type(screen.getByLabelText('Email address'), 'test@example.com');
      await user.type(screen.getByLabelText(/^Password$/), 'short');
      await user.type(screen.getByLabelText('Confirm Password'), 'short');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
      });
    });

    it('handles successful signup', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: {
          user: { id: '123', email: 'test@example.com', identities: [{ id: '1' }] },
          session: null,
        },
        error: null,
      });

      const user = userEvent.setup();
      render(<SignupForm />);

      await user.type(screen.getByLabelText('Email address'), 'test@example.com');
      await user.type(screen.getByLabelText(/^Password$/), 'StrongP@ssw0rd!');
      await user.type(screen.getByLabelText('Confirm Password'), 'StrongP@ssw0rd!');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'StrongP@ssw0rd!',
          options: {
            emailRedirectTo: expect.stringContaining('/auth/callback'),
          },
        });
        expect(mockPush).toHaveBeenCalledWith('/auth/confirm-email');
      });
    });

    it('displays error when email already exists', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: {
          user: { id: '123', email: 'test@example.com', identities: [] },
          session: null,
        },
        error: null,
      });

      const user = userEvent.setup();
      render(<SignupForm />);

      await user.type(screen.getByLabelText('Email address'), 'test@example.com');
      await user.type(screen.getByLabelText(/^Password$/), 'StrongP@ssw0rd!');
      await user.type(screen.getByLabelText('Confirm Password'), 'StrongP@ssw0rd!');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText('An account with this email already exists')).toBeInTheDocument();
      });
    });

    it('displays error message on failed signup', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Invalid email format' },
      });

      const user = userEvent.setup();
      render(<SignupForm />);

      await user.type(screen.getByLabelText('Email address'), 'invalid-email');
      await user.type(screen.getByLabelText(/^Password$/), 'Password123!');
      await user.type(screen.getByLabelText('Confirm Password'), 'Password123!');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });
    });
  });

  describe('Google OAuth', () => {
    it('handles Google sign-up', async () => {
      mockSignInWithOAuth.mockResolvedValueOnce({
        data: {},
        error: null,
      });

      const user = userEvent.setup();
      render(<SignupForm />);

      await user.click(screen.getByRole('button', { name: /sign up with google/i }));

      await waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalledWith({
          provider: 'google',
          options: {
            redirectTo: expect.stringContaining('/auth/callback'),
          },
        });
      });
    });

    it('displays error message on failed Google signup', async () => {
      mockSignInWithOAuth.mockResolvedValueOnce({
        data: {},
        error: { message: 'Google authentication failed' },
      });

      const user = userEvent.setup();
      render(<SignupForm />);

      await user.click(screen.getByRole('button', { name: /sign up with google/i }));

      await waitFor(() => {
        expect(screen.getByText('Google authentication failed')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('disables inputs and buttons during submission', async () => {
      mockSignUp.mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve({
          data: { user: { id: '123', identities: [{ id: '1' }] }, session: null },
          error: null,
        }), 100))
      );

      const user = userEvent.setup();
      render(<SignupForm />);

      await user.type(screen.getByLabelText('Email address'), 'test@example.com');
      await user.type(screen.getByLabelText(/^Password$/), 'Password123!');
      await user.type(screen.getByLabelText('Confirm Password'), 'Password123!');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      // Check loading state
      expect(screen.getByText('Creating account...')).toBeInTheDocument();
      expect(screen.getByLabelText('Email address')).toBeDisabled();
      expect(screen.getByLabelText(/^Password$/)).toBeDisabled();
      expect(screen.getByLabelText('Confirm Password')).toBeDisabled();
      expect(submitButton).toBeDisabled();
      expect(screen.getByRole('button', { name: /sign up with google/i })).toBeDisabled();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/confirm-email');
      });
    });

    it('shows loading spinner during submission', async () => {
      mockSignUp.mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve({
          data: { user: { id: '123', identities: [{ id: '1' }] }, session: null },
          error: null,
        }), 100))
      );

      const user = userEvent.setup();
      render(<SignupForm />);

      await user.type(screen.getByLabelText('Email address'), 'test@example.com');
      await user.type(screen.getByLabelText(/^Password$/), 'Password123!');
      await user.type(screen.getByLabelText('Confirm Password'), 'Password123!');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      // Check for Loader2 icon (animated spinner)
      const submitButton = screen.getByRole('button', { name: /creating account/i });
      expect(submitButton).toContainHTML('animate-spin');
    });
  });

  describe('Keyboard Navigation', () => {
    it('allows form submission with Enter key', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: {
          user: { id: '123', email: 'test@example.com', identities: [{ id: '1' }] },
          session: null,
        },
        error: null,
      });

      const user = userEvent.setup();
      render(<SignupForm />);

      await user.type(screen.getByLabelText('Email address'), 'test@example.com');
      await user.type(screen.getByLabelText(/^Password$/), 'Password123!');
      await user.type(screen.getByLabelText('Confirm Password'), 'Password123!');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalled();
      });
    });

    it('allows tabbing between form fields', async () => {
      const user = userEvent.setup();
      render(<SignupForm />);

      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText(/^Password$/);
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      emailInput.focus();
      expect(emailInput).toHaveFocus();

      await user.tab();
      expect(passwordInput).toHaveFocus();

      await user.tab();
      expect(confirmPasswordInput).toHaveFocus();

      await user.tab();
      expect(submitButton).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('has accessible form labels', () => {
      render(<SignupForm />);

      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText(/^Password$/);
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');

      expect(emailInput).toHaveAccessibleName('Email address');
      expect(passwordInput).toHaveAccessibleName('Password');
      expect(confirmPasswordInput).toHaveAccessibleName('Confirm Password');
    });

    it('should have no accessibility violations', async () => {
      const { container } = render(<SignupForm />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with error state', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });

      const user = userEvent.setup();
      const { container } = render(<SignupForm />);

      await user.type(screen.getByLabelText('Email address'), 'test@example.com');
      await user.type(screen.getByLabelText(/^Password$/), 'Password123!');
      await user.type(screen.getByLabelText('Confirm Password'), 'Password123!');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with password strength indicator', async () => {
      const user = userEvent.setup();
      const { container } = render(<SignupForm />);

      await user.type(screen.getByLabelText(/^Password$/), 'StrongP@ssw0rd!');

      await waitFor(() => {
        expect(screen.getByText('Strong')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
