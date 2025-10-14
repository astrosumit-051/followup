import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, jest } from "@jest/globals";
import { ContactFilters } from "./ContactFilters";

describe("ContactFilters", () => {
  const mockOnFiltersChange = jest.fn();

  const defaultProps = {
    filters: {},
    onFiltersChange: mockOnFiltersChange,
    companies: ["Acme Corp", "TechStart", "InnovateCo"],
    industries: ["Technology", "Finance", "Healthcare"],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Render", () => {
    it("renders filters header", () => {
      render(<ContactFilters {...defaultProps} />);

      expect(screen.getByText("Filters")).toBeInTheDocument();
    });

    it('shows "Show filters" button when collapsed', () => {
      render(<ContactFilters {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /Show filters/ }),
      ).toBeInTheDocument();
    });

    it("hides filter controls when collapsed", () => {
      render(<ContactFilters {...defaultProps} />);

      expect(screen.queryByLabelText(/Priority/)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Company/)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Industry/)).not.toBeInTheDocument();
    });

    it("shows filter controls when expanded", async () => {
      const user = userEvent.setup();

      render(<ContactFilters {...defaultProps} />);

      const showButton = screen.getByRole("button", { name: /Show filters/ });
      await user.click(showButton);

      expect(screen.getByLabelText(/Priority/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Company/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Industry/)).toBeInTheDocument();
    });

    it('toggles "Hide filters" text when expanded', async () => {
      const user = userEvent.setup();

      render(<ContactFilters {...defaultProps} />);

      const showButton = screen.getByRole("button", { name: /Show filters/ });
      await user.click(showButton);

      expect(
        screen.getByRole("button", { name: /Hide filters/ }),
      ).toBeInTheDocument();
    });
  });

  describe("Active Filters", () => {
    it("shows active filter count when filters are applied", () => {
      render(
        <ContactFilters
          {...defaultProps}
          filters={{ priority: "HIGH", company: "Acme Corp" }}
        />,
      );

      expect(screen.getByText("2 active")).toBeInTheDocument();
    });

    it("does not show active count when no filters", () => {
      render(<ContactFilters {...defaultProps} />);

      expect(screen.queryByText(/active/)).not.toBeInTheDocument();
    });

    it('shows "Clear all" button when filters are active', () => {
      render(
        <ContactFilters {...defaultProps} filters={{ priority: "HIGH" }} />,
      );

      expect(
        screen.getByRole("button", { name: /Clear all/ }),
      ).toBeInTheDocument();
    });

    it('does not show "Clear all" when no filters', () => {
      render(<ContactFilters {...defaultProps} />);

      expect(
        screen.queryByRole("button", { name: /Clear all/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Filter Interactions", () => {
    it("calls onFiltersChange when priority is selected", async () => {
      const user = userEvent.setup();

      render(<ContactFilters {...defaultProps} />);

      // Expand filters
      await user.click(screen.getByRole("button", { name: /Show filters/ }));

      // Select priority
      const prioritySelect = screen.getByLabelText(/Priority/);
      await user.selectOptions(prioritySelect, "HIGH");

      expect(mockOnFiltersChange).toHaveBeenCalledWith({ priority: "HIGH" });
    });

    it("calls onFiltersChange when company is selected", async () => {
      const user = userEvent.setup();

      render(<ContactFilters {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /Show filters/ }));

      const companySelect = screen.getByLabelText(/Company/);
      await user.selectOptions(companySelect, "Acme Corp");

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        company: "Acme Corp",
      });
    });

    it("calls onFiltersChange when industry is selected", async () => {
      const user = userEvent.setup();

      render(<ContactFilters {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /Show filters/ }));

      const industrySelect = screen.getByLabelText(/Industry/);
      await user.selectOptions(industrySelect, "Technology");

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        industry: "Technology",
      });
    });

    it("preserves existing filters when adding new filter", async () => {
      const user = userEvent.setup();

      render(
        <ContactFilters {...defaultProps} filters={{ priority: "HIGH" }} />,
      );

      await user.click(screen.getByRole("button", { name: /Show filters/ }));

      const companySelect = screen.getByLabelText(/Company/);
      await user.selectOptions(companySelect, "Acme Corp");

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        priority: "HIGH",
        company: "Acme Corp",
      });
    });

    it('clears all filters when "Clear all" is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ContactFilters
          {...defaultProps}
          filters={{ priority: "HIGH", company: "Acme Corp" }}
        />,
      );

      const clearButton = screen.getByRole("button", { name: /Clear all/ });
      await user.click(clearButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({});
    });

    it("removes individual filter from summary when X is clicked", async () => {
      const user = userEvent.setup();

      render(
        <ContactFilters
          {...defaultProps}
          filters={{ priority: "HIGH", company: "Acme Corp" }}
        />,
      );

      // Find the remove button for priority filter
      const removeButtons = screen.getAllByRole("button", {
        name: /Remove .* filter/,
      });
      await user.click(removeButtons[0]);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        company: "Acme Corp",
      });
    });
  });

  describe("Active Filter Summary (Collapsed)", () => {
    it("shows active filter badges when collapsed", () => {
      render(
        <ContactFilters
          {...defaultProps}
          filters={{ priority: "HIGH", company: "Acme Corp" }}
        />,
      );

      expect(screen.getByText(/Priority: HIGH/)).toBeInTheDocument();
      expect(screen.getByText(/Company: Acme Corp/)).toBeInTheDocument();
    });

    it("does not show badges when expanded", async () => {
      const user = userEvent.setup();

      render(
        <ContactFilters {...defaultProps} filters={{ priority: "HIGH" }} />,
      );

      expect(screen.getByText(/Priority: HIGH/)).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /Show filters/ }));

      expect(screen.queryByText(/Priority: HIGH/)).not.toBeInTheDocument();
    });
  });

  describe("Dropdown Options", () => {
    it("renders company options from props", async () => {
      const user = userEvent.setup();

      render(<ContactFilters {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /Show filters/ }));

      const companySelect = screen.getByLabelText(/Company/);
      expect(companySelect).toContainHTML(
        '<option value="">All companies</option>',
      );
      expect(companySelect).toContainHTML(
        '<option value="Acme Corp">Acme Corp</option>',
      );
      expect(companySelect).toContainHTML(
        '<option value="TechStart">TechStart</option>',
      );
      expect(companySelect).toContainHTML(
        '<option value="InnovateCo">InnovateCo</option>',
      );
    });

    it("renders industry options from props", async () => {
      const user = userEvent.setup();

      render(<ContactFilters {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /Show filters/ }));

      const industrySelect = screen.getByLabelText(/Industry/);
      expect(industrySelect).toContainHTML(
        '<option value="">All industries</option>',
      );
      expect(industrySelect).toContainHTML(
        '<option value="Technology">Technology</option>',
      );
      expect(industrySelect).toContainHTML(
        '<option value="Finance">Finance</option>',
      );
      expect(industrySelect).toContainHTML(
        '<option value="Healthcare">Healthcare</option>',
      );
    });

    it("handles empty company and industry arrays", async () => {
      const user = userEvent.setup();

      render(
        <ContactFilters
          filters={{}}
          onFiltersChange={mockOnFiltersChange}
          companies={[]}
          industries={[]}
        />,
      );

      await user.click(screen.getByRole("button", { name: /Show filters/ }));

      const companySelect = screen.getByLabelText(/Company/);
      const industrySelect = screen.getByLabelText(/Industry/);

      expect(companySelect).toContainHTML(
        '<option value="">All companies</option>',
      );
      expect(industrySelect).toContainHTML(
        '<option value="">All industries</option>',
      );
    });
  });
});
