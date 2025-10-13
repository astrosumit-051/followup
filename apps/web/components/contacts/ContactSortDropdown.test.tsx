import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, jest } from "@jest/globals";
import { ContactSortDropdown } from "./ContactSortDropdown";
import type { ContactSortField, SortOrder } from "@/lib/graphql/contacts";

describe("ContactSortDropdown", () => {
  const mockOnSortChange = jest.fn();

  const defaultProps = {
    sortBy: "NAME" as ContactSortField,
    sortOrder: "asc" as SortOrder,
    onSortChange: mockOnSortChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders sort label", () => {
    render(<ContactSortDropdown {...defaultProps} />);

    expect(screen.getByText("Sort by:")).toBeInTheDocument();
  });

  it("renders sort dropdown", () => {
    render(<ContactSortDropdown {...defaultProps} />);

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("shows current sort selection", () => {
    render(<ContactSortDropdown {...defaultProps} />);

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("NAME:asc");
  });

  it("displays all sort options", () => {
    render(<ContactSortDropdown {...defaultProps} />);

    expect(
      screen.getByRole("option", { name: "Name (A-Z)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Name (Z-A)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Recently Added" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Oldest First" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Recently Contacted" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Least Recently Contacted" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Priority (High to Low)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Priority (Low to High)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Company (A-Z)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Company (Z-A)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Industry (A-Z)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Industry (Z-A)" }),
    ).toBeInTheDocument();
  });

  it("calls onSortChange when sort is changed", async () => {
    const user = userEvent.setup();

    render(<ContactSortDropdown {...defaultProps} />);

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "NAME:desc");

    expect(mockOnSortChange).toHaveBeenCalledWith("NAME", "desc");
  });

  it("handles priority sort ascending", async () => {
    const user = userEvent.setup();

    render(<ContactSortDropdown {...defaultProps} />);

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "PRIORITY:asc");

    expect(mockOnSortChange).toHaveBeenCalledWith("PRIORITY", "asc");
  });

  it("handles priority sort descending", async () => {
    const user = userEvent.setup();

    render(<ContactSortDropdown {...defaultProps} />);

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "PRIORITY:desc");

    expect(mockOnSortChange).toHaveBeenCalledWith("PRIORITY", "desc");
  });

  it("handles created date sort ascending", async () => {
    const user = userEvent.setup();

    render(<ContactSortDropdown {...defaultProps} />);

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "CREATED_AT:asc");

    expect(mockOnSortChange).toHaveBeenCalledWith("CREATED_AT", "asc");
  });

  it("handles created date sort descending", async () => {
    const user = userEvent.setup();

    render(<ContactSortDropdown {...defaultProps} />);

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "CREATED_AT:desc");

    expect(mockOnSortChange).toHaveBeenCalledWith("CREATED_AT", "desc");
  });

  it("handles last contacted sort ascending", async () => {
    const user = userEvent.setup();

    render(<ContactSortDropdown {...defaultProps} />);

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "LAST_CONTACTED_AT:asc");

    expect(mockOnSortChange).toHaveBeenCalledWith("LAST_CONTACTED_AT", "asc");
  });

  it("handles last contacted sort descending", async () => {
    const user = userEvent.setup();

    render(<ContactSortDropdown {...defaultProps} />);

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "LAST_CONTACTED_AT:desc");

    expect(mockOnSortChange).toHaveBeenCalledWith("LAST_CONTACTED_AT", "desc");
  });

  it("handles company sort ascending", async () => {
    const user = userEvent.setup();

    render(<ContactSortDropdown {...defaultProps} />);

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "COMPANY:asc");

    expect(mockOnSortChange).toHaveBeenCalledWith("COMPANY", "asc");
  });

  it("handles company sort descending", async () => {
    const user = userEvent.setup();

    render(<ContactSortDropdown {...defaultProps} />);

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "COMPANY:desc");

    expect(mockOnSortChange).toHaveBeenCalledWith("COMPANY", "desc");
  });

  it("handles industry sort ascending", async () => {
    const user = userEvent.setup();

    render(<ContactSortDropdown {...defaultProps} />);

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "INDUSTRY:asc");

    expect(mockOnSortChange).toHaveBeenCalledWith("INDUSTRY", "asc");
  });

  it("handles industry sort descending", async () => {
    const user = userEvent.setup();

    render(<ContactSortDropdown {...defaultProps} />);

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "INDUSTRY:desc");

    expect(mockOnSortChange).toHaveBeenCalledWith("INDUSTRY", "desc");
  });

  it("displays correct selection for different sort fields", () => {
    const { rerender } = render(<ContactSortDropdown {...defaultProps} />);

    let select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("NAME:asc");

    rerender(
      <ContactSortDropdown
        sortBy="PRIORITY"
        sortOrder="desc"
        onSortChange={mockOnSortChange}
      />,
    );

    select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("PRIORITY:desc");

    rerender(
      <ContactSortDropdown
        sortBy="CREATED_AT"
        sortOrder="desc"
        onSortChange={mockOnSortChange}
      />,
    );

    select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("CREATED_AT:desc");
  });

  it("has accessible label", () => {
    render(<ContactSortDropdown {...defaultProps} />);

    const select = screen.getByLabelText("Sort by:");
    expect(select).toBeInTheDocument();
  });
});
