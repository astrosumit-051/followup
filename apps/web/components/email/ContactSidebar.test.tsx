import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ContactSidebar } from "./ContactSidebar";

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

// Mock GraphQL hooks
const mockContacts = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    company: "Acme Corp",
    industry: "Technology",
    role: "CEO",
    priority: "HIGH",
    profilePicture: null,
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    company: "TechCo",
    industry: "Technology",
    role: "Engineer",
    priority: "MEDIUM",
    profilePicture: null,
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    company: "FinanceInc",
    industry: "Finance",
    role: "Designer",
    priority: "LOW",
    profilePicture: null,
  },
];

// Mock useContacts hook directly (same pattern as ComposePage.test.tsx)
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

describe("ContactSidebar", () => {
  beforeEach(() => {
    // Reset mocks before each test (match ComposePage.test.tsx exactly)
    global.mockSearchParamsGet.mockReset();
    global.mockSearchParamsGet.mockReturnValue(null);

    // Mock useContacts to return contact data (match ComposePage.test.tsx structure)
    mockUseContacts.mockReturnValue({
      data: {
        pages: [
          {
            nodes: mockContacts,
            edges: mockContacts.map((contact) => ({
              cursor: contact.id,
              node: {
                id: contact.id,
              },
            })),
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: "1",
              endCursor: "3",
            },
            totalCount: mockContacts.length,
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
    it("renders contact sidebar with basic elements", async () => {
      render(<ContactSidebar />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText("Select Contact")).toBeInTheDocument();
      });
      expect(
        screen.getByPlaceholderText("Search contacts...")
      ).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
    });

    it("renders contact list with avatar, name, company, priority badge", () => {
      render(<ContactSidebar />, { wrapper: Wrapper });

      const johnContact = screen.getByText("John Doe").closest("div");
      expect(within(johnContact!).getByText("Acme Corp")).toBeInTheDocument();
      expect(within(johnContact!).getByText("High")).toBeInTheDocument();
    });

    it("displays loading state when contacts are loading", async () => {
      // Mock useContacts to return loading state
      mockUseContacts.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        hasNextPage: false,
        fetchNextPage: jest.fn(),
        isFetchingNextPage: false,
      });

      render(<ContactSidebar />, { wrapper: Wrapper });

      // Wait a bit for the loading state to render
      await waitFor(() => {
        expect(screen.getByText("Loading contacts...")).toBeInTheDocument();
      });
    });

    it("displays error state when contacts fail to load", async () => {
      // Mock useContacts to return error state
      mockUseContacts.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error("Failed to load contacts"),
        hasNextPage: false,
        fetchNextPage: jest.fn(),
        isFetchingNextPage: false,
      });

      render(<ContactSidebar />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(/Failed to load contacts/i)).toBeInTheDocument();
      });
    });
  });

  describe("Search", () => {
    it("renders search input", () => {
      render(<ContactSidebar />, { wrapper: Wrapper });

      const searchInput = screen.getByPlaceholderText("Search contacts...");
      expect(searchInput).toBeInTheDocument();
    });

    it("filters contacts by name with debounce", async () => {
      const user = userEvent.setup();
      render(<ContactSidebar />, { wrapper: Wrapper });

      const searchInput = screen.getByPlaceholderText("Search contacts...");
      await user.type(searchInput, "John");

      // Should not filter immediately
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();

      // Wait for debounce (500ms)
      await waitFor(
        () => {
          expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
        },
        { timeout: 600 }
      );

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.queryByText("Bob Johnson")).not.toBeInTheDocument();
    });

    it("filters contacts by email", async () => {
      const user = userEvent.setup();
      render(<ContactSidebar />, { wrapper: Wrapper });

      const searchInput = screen.getByPlaceholderText("Search contacts...");
      await user.type(searchInput, "jane@");

      await waitFor(
        () => {
          expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
        },
        { timeout: 600 }
      );

      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    it("filters contacts by company", async () => {
      const user = userEvent.setup();
      render(<ContactSidebar />, { wrapper: Wrapper });

      const searchInput = screen.getByPlaceholderText("Search contacts...");
      await user.type(searchInput, "FinanceInc");

      await waitFor(
        () => {
          expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
        },
        { timeout: 600 }
      );

      expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
    });

    it("shows empty state when no contacts match search", async () => {
      const user = userEvent.setup();
      render(<ContactSidebar />, { wrapper: Wrapper });

      const searchInput = screen.getByPlaceholderText("Search contacts...");
      await user.type(searchInput, "NonexistentContact");

      await waitFor(
        () => {
          expect(
            screen.getByText(/No contacts found matching/i)
          ).toBeInTheDocument();
        },
        { timeout: 600 }
      );
    });
  });

  describe("Filters", () => {
    it("renders filter dropdowns", () => {
      render(<ContactSidebar />, { wrapper: Wrapper });

      expect(screen.getByText(/Company/i)).toBeInTheDocument();
      expect(screen.getByText(/Industry/i)).toBeInTheDocument();
      expect(screen.getByText(/Priority/i)).toBeInTheDocument();
    });

    it("filters by priority", async () => {
      const user = userEvent.setup();
      render(<ContactSidebar />, { wrapper: Wrapper });

      const priorityFilter = screen.getByText(/Priority/i).closest("button");
      await user.click(priorityFilter!);

      const highOption = await screen.findByRole("option", { name: /High/i });
      await user.click(highOption);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
        expect(screen.queryByText("Bob Johnson")).not.toBeInTheDocument();
      });
    });

    it("shows active filters indicator", async () => {
      const user = userEvent.setup();
      render(<ContactSidebar />, { wrapper: Wrapper });

      const priorityFilter = screen.getByText(/Priority/i).closest("button");
      await user.click(priorityFilter!);

      const highOption = await screen.findByRole("option", { name: /High/i });
      await user.click(highOption);

      await waitFor(() => {
        expect(screen.getByText("1 filter applied")).toBeInTheDocument();
      });
    });

    it("clears all filters when clear button clicked", async () => {
      const user = userEvent.setup();
      render(<ContactSidebar />, { wrapper: Wrapper });

      const priorityFilter = screen.getByText(/Priority/i).closest("button");
      await user.click(priorityFilter!);

      const highOption = await screen.findByRole("option", { name: /High/i });
      await user.click(highOption);

      await waitFor(() => {
        expect(screen.getByText("1 filter applied")).toBeInTheDocument();
      });

      const clearButton = screen.getByRole("button", {
        name: /clear filters/i,
      });
      await user.click(clearButton);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Jane Smith")).toBeInTheDocument();
        expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
      });
    });
  });

  describe("Multi-select for Campaign Mode", () => {
    it("renders checkboxes for each contact", () => {
      render(<ContactSidebar />, { wrapper: Wrapper });

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes).toHaveLength(mockContacts.length);
    });

    it("selects contact when checkbox clicked", async () => {
      const user = userEvent.setup();
      render(<ContactSidebar />, { wrapper: Wrapper });

      const firstCheckbox = screen.getAllByRole("checkbox")[0];
      await user.click(firstCheckbox);

      expect(firstCheckbox).toBeChecked();
      expect(screen.getByText("1 contact selected")).toBeInTheDocument();
    });

    it("shows selected counter with correct count", async () => {
      const user = userEvent.setup();
      render(<ContactSidebar />, { wrapper: Wrapper });

      const checkboxes = screen.getAllByRole("checkbox");
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);

      expect(screen.getByText("2 contacts selected")).toBeInTheDocument();
    });

    it("shows clear all button when contacts selected", async () => {
      const user = userEvent.setup();
      render(<ContactSidebar />, { wrapper: Wrapper });

      const firstCheckbox = screen.getAllByRole("checkbox")[0];
      await user.click(firstCheckbox);

      expect(
        screen.getByRole("button", { name: /clear all/i })
      ).toBeInTheDocument();
    });

    it("clears all selections when clear all clicked", async () => {
      const user = userEvent.setup();
      render(<ContactSidebar />, { wrapper: Wrapper });

      const checkboxes = screen.getAllByRole("checkbox");
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);

      const clearButton = screen.getByRole("button", { name: /clear all/i });
      await user.click(clearButton);

      await waitFor(() => {
        expect(screen.queryByText(/contacts selected/i)).not.toBeInTheDocument();
        expect(checkboxes[0]).not.toBeChecked();
        expect(checkboxes[1]).not.toBeChecked();
      });
    });

    it("shows error when more than 100 contacts selected", async () => {
      // Mock 101 contacts
      const manyContacts = Array.from({ length: 101 }, (_, i) => ({
        id: String(i + 1),
        name: `Contact ${i + 1}`,
        email: `contact${i + 1}@example.com`,
        company: "Company",
        industry: "Technology",
        role: "Engineer",
        priority: "MEDIUM",
        profilePicture: null,
      }));

      mockGetContacts.mockResolvedValue({
        edges: manyContacts.map((contact) => ({
          node: contact,
          cursor: contact.id,
        })),
        pageInfo: {
          hasNextPage: false,
          endCursor: "101",
        },
        totalCount: manyContacts.length,
      });

      const user = userEvent.setup();
      render(<ContactSidebar />, { wrapper: Wrapper });

      const checkboxes = screen.getAllByRole("checkbox");

      // Select 101 contacts
      for (let i = 0; i < 101; i++) {
        await user.click(checkboxes[i]);
      }

      await waitFor(() => {
        expect(
          screen.getByText(/Campaign limit is 100 contacts/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Contact Pre-selection from URL", () => {
    it("pre-selects contact when contactId in URL params", () => {
      global.mockSearchParamsGet.mockImplementation((param: string) => {
        if (param === "contactId") return "2";
        return null;
      });

      render(<ContactSidebar />, { wrapper: Wrapper });

      const janeContact = screen.getByText("Jane Smith").closest("div");
      expect(janeContact).toHaveClass("bg-blue-50"); // Highlighted as selected
    });

    it("scrolls to pre-selected contact", () => {
      global.mockSearchParamsGet.mockImplementation((param: string) => {
        if (param === "contactId") return "2";
        return null;
      });

      const scrollIntoViewMock = jest.fn();
      window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

      render(<ContactSidebar />, { wrapper: Wrapper });

      expect(scrollIntoViewMock).toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("has no accessibility violations (empty state)", async () => {
      const { container } = render(<ContactSidebar />, { wrapper: Wrapper });
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations (with contacts)", async () => {
      const { container } = render(<ContactSidebar />, { wrapper: Wrapper });
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has proper ARIA labels for search input", () => {
      render(<ContactSidebar />, { wrapper: Wrapper });

      const searchInput = screen.getByPlaceholderText("Search contacts...");
      expect(searchInput).toHaveAttribute("aria-label", "Search contacts");
    });

    it("has proper ARIA labels for filter dropdowns", () => {
      render(<ContactSidebar />, { wrapper: Wrapper });

      const priorityFilter = screen.getByText(/Priority/i).closest("button");
      expect(priorityFilter).toHaveAttribute("aria-haspopup", "listbox");
    });
  });

  describe("Responsive Design", () => {
    it("applies scrollable classes for contact list", () => {
      const { container } = render(<ContactSidebar />, { wrapper: Wrapper });

      const contactList = container.querySelector("[data-testid='contact-list']");
      expect(contactList).toHaveClass("overflow-y-auto");
    });
  });
});
