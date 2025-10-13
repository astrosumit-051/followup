import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect } from "@jest/globals";
import DashboardPage from "./page";

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

// Mock LogoutButton component
jest.mock("@/components/auth/logout-button", () => ({
  LogoutButton: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <button className={className} aria-label="Sign out">
      {children}
    </button>
  ),
}));

// Mock ThemeToggle component
jest.mock("@/components/theme-toggle", () => ({
  ThemeToggle: () => <button aria-label="Toggle theme">Toggle Theme</button>,
}));

describe("DashboardPage", () => {
  describe("Render", () => {
    it("renders dashboard with welcome message", () => {
      render(<DashboardPage />);

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(
        screen.getByText("Welcome to your RelationHub dashboard!"),
      ).toBeInTheDocument();
    });

    it("renders Quick Actions card with shadcn Card components", () => {
      render(<DashboardPage />);

      expect(screen.getByText("Quick Actions")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Get started by adding contacts or viewing your network.",
        ),
      ).toBeInTheDocument();
    });

    it("renders Account card with shadcn Card components", () => {
      render(<DashboardPage />);

      expect(screen.getByText("Account")).toBeInTheDocument();
      expect(
        screen.getByText(/You are successfully authenticated/),
      ).toBeInTheDocument();
    });

    it("renders Getting Started card with shadcn Card components", () => {
      render(<DashboardPage />);

      expect(screen.getByText("Getting Started")).toBeInTheDocument();
      expect(
        screen.getByText(
          "RelationHub helps you manage your professional network with AI-powered features.",
        ),
      ).toBeInTheDocument();
    });

    it("displays all three getting started steps", () => {
      render(<DashboardPage />);

      expect(screen.getByText("1. Add Contacts")).toBeInTheDocument();
      expect(screen.getByText("2. Organize")).toBeInTheDocument();
      expect(screen.getByText("3. Engage")).toBeInTheDocument();
    });
  });

  describe("Navigation Links", () => {
    it("renders Quick Add Contact button with correct link", () => {
      render(<DashboardPage />);

      const quickAddButton = screen.getByRole("link", {
        name: /quick add contact/i,
      });
      expect(quickAddButton).toBeInTheDocument();
      expect(quickAddButton).toHaveAttribute("href", "/contacts/new");
    });

    it("renders View All Contacts button with correct link", () => {
      render(<DashboardPage />);

      const viewAllButton = screen.getByRole("link", {
        name: /view all contacts/i,
      });
      expect(viewAllButton).toBeInTheDocument();
      expect(viewAllButton).toHaveAttribute("href", "/contacts");
    });

    it("renders logout button", () => {
      render(<DashboardPage />);

      const logoutButton = screen.getByRole("button", { name: /sign out/i });
      expect(logoutButton).toBeInTheDocument();
    });

    it("renders theme toggle button", () => {
      render(<DashboardPage />);

      const themeToggle = screen.getByRole("button", { name: /toggle theme/i });
      expect(themeToggle).toBeInTheDocument();
    });
  });

  describe("Card Structure", () => {
    it("uses CardHeader and CardTitle for card structure", () => {
      render(<DashboardPage />);

      // Check for card headers (should have multiple cards)
      const cardTitles = screen.getAllByText(
        /Quick Actions|Account|Getting Started/,
      );
      expect(cardTitles).toHaveLength(3);
    });

    it("uses Separator components between sections", () => {
      const { container } = render(<DashboardPage />);

      // Separators are present in the DOM (rendered by shadcn Separator component)
      // They render as hr elements with specific styling
      const separators = container.querySelectorAll(
        'hr, [data-orientation="horizontal"]',
      );
      expect(separators.length).toBeGreaterThan(0);
    });

    it("uses CardFooter for additional information", () => {
      render(<DashboardPage />);

      expect(
        screen.getByText(
          /More features coming soon including AI email generation and analytics/,
        ),
      ).toBeInTheDocument();
    });
  });

  describe("Responsive Layout", () => {
    it("applies responsive padding classes", () => {
      const { container } = render(<DashboardPage />);

      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass("p-4", "md:p-8");
    });

    it("uses responsive grid layout for cards", () => {
      const { container } = render(<DashboardPage />);

      const grid = container.querySelector(".grid");
      expect(grid).toHaveClass("grid-cols-1", "md:grid-cols-2");
    });

    it("applies responsive grid for getting started steps", () => {
      const { container } = render(<DashboardPage />);

      const stepsGrid = container.querySelectorAll(".grid")[1]; // Second grid is for steps
      expect(stepsGrid).toHaveClass("grid-cols-1", "sm:grid-cols-3");
    });
  });

  describe("Accessibility", () => {
    it("has accessible headings hierarchy", () => {
      render(<DashboardPage />);

      const mainHeading = screen.getByRole("heading", {
        level: 1,
        name: /dashboard/i,
      });
      expect(mainHeading).toBeInTheDocument();
    });

    it("has accessible link text", () => {
      render(<DashboardPage />);

      const quickAddLink = screen.getByRole("link", {
        name: /quick add contact/i,
      });
      const viewAllLink = screen.getByRole("link", {
        name: /view all contacts/i,
      });

      expect(quickAddLink).toHaveAccessibleName("Quick Add Contact");
      expect(viewAllLink).toHaveAccessibleName("View All Contacts");
    });

    it("should have no accessibility violations", async () => {
      const { container } = render(<DashboardPage />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Design Tokens", () => {
    it("uses semantic color tokens for text", () => {
      render(<DashboardPage />);

      const heading = screen.getByText("Dashboard");
      expect(heading).toHaveClass("text-foreground");

      const description = screen.getByText(
        "Welcome to your RelationHub dashboard!",
      );
      expect(description).toHaveClass("text-muted-foreground");
    });

    it("uses proper text sizing classes", () => {
      render(<DashboardPage />);

      const mainHeading = screen.getByText("Dashboard");
      expect(mainHeading).toHaveClass("text-4xl");

      const stepHeadings = screen.getByText("1. Add Contacts");
      expect(stepHeadings).toHaveClass("text-sm");
    });
  });
});
