import { render, screen, waitFor } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ComposePage } from "./ComposePage";

expect.extend(toHaveNoViolations);

// Create QueryClient for tests
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// Wrapper component with QueryClient
const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Mock useContacts hook
const mockUseContacts = jest.fn();
jest.mock("@/lib/hooks/useContacts", () => ({
  useContacts: () => mockUseContacts(),
}));

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

describe("ComposePage", () => {
  beforeEach(() => {
    // Reset mocks before each test
    global.mockSearchParamsGet.mockReset();
    global.mockSearchParamsGet.mockReturnValue(null);

    // Mock useContacts to return empty data
    mockUseContacts.mockReturnValue({
      data: {
        pages: [
          {
            edges: [],
            pageInfo: {
              hasNextPage: false,
              endCursor: null,
            },
            totalCount: 0,
          },
        ],
        pageParams: [undefined],
      },
      isLoading: false,
      error: null,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      isFetchingNextPage: false,
    });
  });

  describe("Render", () => {
    it("renders compose page with basic elements", async () => {
      global.mockSearchParamsGet.mockReturnValue(null);

      render(<ComposePage />, { wrapper: Wrapper });

      expect(screen.getByText("Compose Email")).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByText("Select Contact")).toBeInTheDocument();
      });
      expect(screen.getByLabelText("To:")).toBeInTheDocument();
      expect(screen.getByLabelText("Subject:")).toBeInTheDocument();
      expect(screen.getByLabelText("Message:")).toBeInTheDocument();
    });

    it("renders breadcrumb navigation with Dashboard link", () => {
      global.mockSearchParamsGet.mockReturnValue(null);

      render(<ComposePage />, { wrapper: Wrapper });

      const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
      expect(dashboardLink).toBeInTheDocument();
      expect(dashboardLink).toHaveAttribute("href", "/dashboard");
      expect(screen.getByText("Compose")).toBeInTheDocument();
    });

    it("renders auto-save indicator", () => {
      global.mockSearchParamsGet.mockReturnValue(null);

      render(<ComposePage />, { wrapper: Wrapper });

      expect(screen.getByText("Draft auto-save enabled")).toBeInTheDocument();
    });
  });

  describe("Deep Linking", () => {
    it("displays contact ID when contactId param is provided", () => {
      global.mockSearchParamsGet.mockImplementation((param: string) => {
        if (param === "contactId") return "abc123";
        return null;
      });

      render(<ComposePage />, { wrapper: Wrapper });

      expect(screen.getByText(/Contact ID: abc123/)).toBeInTheDocument();
    });

    it("displays 'select a contact' message when no contactId provided", () => {
      global.mockSearchParamsGet.mockReturnValue(null);

      render(<ComposePage />, { wrapper: Wrapper });

      expect(
        screen.getByText("Select a contact from the sidebar"),
      ).toBeInTheDocument();
    });

    it("displays Follow-Up Email badge when type is followup", () => {
      global.mockSearchParamsGet.mockImplementation((param: string) => {
        if (param === "type") return "followup";
        return null;
      });

      render(<ComposePage />, { wrapper: Wrapper });

      expect(screen.getByText(/Follow-Up Email/)).toBeInTheDocument();
    });

    it("displays Cold Email badge when type is cold", () => {
      global.mockSearchParamsGet.mockImplementation((param: string) => {
        if (param === "type") return "cold";
        return null;
      });

      render(<ComposePage />, { wrapper: Wrapper });

      expect(screen.getByText(/Cold Email/)).toBeInTheDocument();
    });

    it("does not display email type badge when type param is not provided", () => {
      global.mockSearchParamsGet.mockReturnValue(null);

      render(<ComposePage />, { wrapper: Wrapper });

      expect(screen.queryByText(/Follow-Up Email/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Cold Email/)).not.toBeInTheDocument();
    });

    it("uses correct badge styling for followup type", () => {
      global.mockSearchParamsGet.mockImplementation((param: string) => {
        if (param === "type") return "followup";
        return null;
      });

      const { container } = render(<ComposePage />, { wrapper: Wrapper });

      const followupText = screen.getByText(/Follow-Up Email/);
      expect(followupText).toBeInTheDocument();
      expect(followupText.className).toMatch(/bg-blue/);
    });

    it("uses correct badge styling for cold type", () => {
      global.mockSearchParamsGet.mockImplementation((param: string) => {
        if (param === "type") return "cold";
        return null;
      });

      const { container } = render(<ComposePage />, { wrapper: Wrapper });

      const coldText = screen.getByText(/Cold Email/);
      expect(coldText).toBeInTheDocument();
      expect(coldText.className).toMatch(/bg-orange/);
    });
  });

  describe("Layout", () => {
    it("renders grid layout with sidebar and composer", () => {
      global.mockSearchParamsGet.mockReturnValue(null);

      const { container } = render(<ComposePage />, { wrapper: Wrapper });

      // Check for grid layout classes
      const gridContainer = container.querySelector(".grid");
      expect(gridContainer).toBeInTheDocument();
    });

    it("renders sidebar with ContactSidebar component", async () => {
      global.mockSearchParamsGet.mockReturnValue(null);

      render(<ComposePage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText("Select Contact")).toBeInTheDocument();
      });
      expect(
        screen.getByPlaceholderText("Search contacts...")
      ).toBeInTheDocument();
    });

    it("renders composer area with placeholder", () => {
      global.mockSearchParamsGet.mockReturnValue(null);

      render(<ComposePage />, { wrapper: Wrapper });

      expect(
        screen.getByText("TipTap rich text editor will be implemented here."),
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has no accessibility violations (no params)", async () => {
      global.mockSearchParamsGet.mockReturnValue(null);

      const { container } = render(<ComposePage />, { wrapper: Wrapper });
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations (with contactId)", async () => {
      global.mockSearchParamsGet.mockImplementation((param: string) => {
        if (param === "contactId") return "test123";
        return null;
      });

      const { container } = render(<ComposePage />, { wrapper: Wrapper });
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations (with followup type)", async () => {
      global.mockSearchParamsGet.mockImplementation((param: string) => {
        if (param === "type") return "followup";
        return null;
      });

      const { container } = render(<ComposePage />, { wrapper: Wrapper });
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has proper form labels", () => {
      global.mockSearchParamsGet.mockReturnValue(null);

      render(<ComposePage />, { wrapper: Wrapper });

      expect(screen.getByLabelText("To:")).toBeInTheDocument();
      expect(screen.getByLabelText("Subject:")).toBeInTheDocument();
      expect(screen.getByLabelText("Message:")).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("applies responsive grid classes", () => {
      global.mockSearchParamsGet.mockReturnValue(null);

      const { container } = render(<ComposePage />, { wrapper: Wrapper });

      const gridContainer = container.querySelector(".grid");
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer?.className).toMatch(/grid-cols-1/);
      expect(gridContainer?.className).toMatch(/md:grid-cols-/);
    });

    it("applies responsive order classes for mobile", () => {
      global.mockSearchParamsGet.mockReturnValue(null);

      const { container } = render(<ComposePage />, { wrapper: Wrapper });

      const orderElements = container.querySelectorAll("[class*='order-']");
      expect(orderElements.length).toBeGreaterThan(0);
    });
  });
});
