import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, jest } from "@jest/globals";
import { ContactListEmpty } from "./ContactListEmpty";

describe("ContactListEmpty", () => {
  it("renders default empty state message", () => {
    render(<ContactListEmpty />);

    expect(screen.getByText("No contacts found")).toBeInTheDocument();
  });

  it("renders custom message when provided", () => {
    render(<ContactListEmpty message="No search results" />);

    expect(screen.getByText("No search results")).toBeInTheDocument();
  });

  it("renders empty state icon", () => {
    const { container } = render(<ContactListEmpty />);

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("renders action button when actionText and onAction are provided", () => {
    const mockOnAction = jest.fn();

    render(
      <ContactListEmpty actionText="Add Contact" onAction={mockOnAction} />,
    );

    expect(
      screen.getByRole("button", { name: "Add Contact" }),
    ).toBeInTheDocument();
  });

  it("calls onAction when action button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnAction = jest.fn();

    render(
      <ContactListEmpty actionText="Create New" onAction={mockOnAction} />,
    );

    const button = screen.getByRole("button", { name: "Create New" });
    await user.click(button);

    expect(mockOnAction).toHaveBeenCalledTimes(1);
  });

  it("does not render action button when actionText is missing", () => {
    const mockOnAction = jest.fn();

    render(<ContactListEmpty onAction={mockOnAction} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("does not render action button when onAction is missing", () => {
    render(<ContactListEmpty actionText="Add Contact" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows helpful context for new users when action button is present", () => {
    const mockOnAction = jest.fn();

    render(
      <ContactListEmpty actionText="Get Started" onAction={mockOnAction} />,
    );

    expect(
      screen.getByText(/Get started by adding your first contact/),
    ).toBeInTheDocument();
  });

  it("shows different context when no action button", () => {
    render(<ContactListEmpty />);

    expect(
      screen.getByText(/Try adjusting your search or filter criteria/),
    ).toBeInTheDocument();
  });

  it("renders with all props", () => {
    const mockOnAction = jest.fn();

    render(
      <ContactListEmpty
        message="Welcome to your network"
        actionText="Add Your First Contact"
        onAction={mockOnAction}
      />,
    );

    expect(screen.getByText("Welcome to your network")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add Your First Contact" }),
    ).toBeInTheDocument();
  });
});
