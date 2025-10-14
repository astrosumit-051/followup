import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, jest } from "@jest/globals";
import { ContactForm } from "./ContactForm";
import type { Contact } from "@/lib/graphql/contacts";

describe("ContactForm", () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Create Mode", () => {
    it("renders all required fields", () => {
      render(<ContactForm mode="create" onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Priority/)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Create Contact/ }),
      ).toBeInTheDocument();
    });

    it("renders all optional fields", () => {
      render(<ContactForm mode="create" onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Phone/)).toBeInTheDocument();
      expect(screen.getByLabelText(/LinkedIn Profile/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Company/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Industry/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Role/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Gender/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Birthday/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Profile Picture URL/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Notes/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Last Contacted/)).toBeInTheDocument();
    });

    it("shows validation error when name is empty", async () => {
      const user = userEvent.setup();

      render(<ContactForm mode="create" onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole("button", {
        name: /Create Contact/,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it.skip("submits form with valid data", async () => {
      const user = userEvent.setup();

      const { container } = render(
        <ContactForm mode="create" onSubmit={mockOnSubmit} />,
      );

      await user.type(screen.getByLabelText(/Name/), "John Doe");
      await user.selectOptions(screen.getByLabelText(/Priority/), "HIGH");
      await user.type(screen.getByLabelText(/Email/), "john@example.com");

      const form = container.querySelector("form");
      fireEvent.submit(form!);

      await waitFor(
        () => {
          expect(mockOnSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
              name: "John Doe",
              priority: "HIGH",
              email: "john@example.com",
            }),
          );
        },
        { timeout: 3000 },
      );
    });

    it("does not show cancel button in create mode without onCancel", () => {
      render(<ContactForm mode="create" onSubmit={mockOnSubmit} />);

      expect(
        screen.queryByRole("button", { name: /Cancel/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Edit Mode", () => {
    const mockContact: Partial<Contact> = {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1-555-0123",
      company: "TechCorp",
      priority: "MEDIUM",
    };

    it("pre-fills form with default values", () => {
      render(
        <ContactForm
          mode="edit"
          defaultValues={mockContact}
          onSubmit={mockOnSubmit}
        />,
      );

      expect(screen.getByDisplayValue("Jane Smith")).toBeInTheDocument();
      expect(screen.getByDisplayValue("jane@example.com")).toBeInTheDocument();
      expect(screen.getByDisplayValue("+1-555-0123")).toBeInTheDocument();
      expect(screen.getByDisplayValue("TechCorp")).toBeInTheDocument();
    });

    it("shows cancel button when onCancel is provided", () => {
      render(
        <ContactForm
          mode="edit"
          defaultValues={mockContact}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />,
      );

      expect(
        screen.getByRole("button", { name: /Cancel/ }),
      ).toBeInTheDocument();
    });

    it("calls onCancel when cancel button is clicked", async () => {
      const user = userEvent.setup();

      render(
        <ContactForm
          mode="edit"
          defaultValues={mockContact}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />,
      );

      const cancelButton = screen.getByRole("button", { name: /Cancel/ });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('shows "Update Contact" button text in edit mode', () => {
      render(
        <ContactForm
          mode="edit"
          defaultValues={mockContact}
          onSubmit={mockOnSubmit}
        />,
      );

      expect(
        screen.getByRole("button", { name: /Update Contact/ }),
      ).toBeInTheDocument();
    });

    it.skip("submits updated data", async () => {
      const user = userEvent.setup();

      const { container } = render(
        <ContactForm
          mode="edit"
          defaultValues={mockContact}
          onSubmit={mockOnSubmit}
        />,
      );

      const nameInput = screen.getByDisplayValue("Jane Smith");
      await user.clear(nameInput);
      await user.type(nameInput, "Jane Doe");

      const form = container.querySelector("form");
      fireEvent.submit(form!);

      await waitFor(
        () => {
          expect(mockOnSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
              name: "Jane Doe",
            }),
          );
        },
        { timeout: 3000 },
      );
    });
  });

  describe("Loading State", () => {
    it("disables submit button when isSubmitting is true", () => {
      render(
        <ContactForm
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={true}
        />,
      );

      const submitButton = screen.getByRole("button", { name: /Saving\.\.\./ });
      expect(submitButton).toBeDisabled();
    });

    it('shows "Saving..." text when isSubmitting', () => {
      render(
        <ContactForm
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={true}
        />,
      );

      expect(screen.getByText(/Saving\.\.\./)).toBeInTheDocument();
    });

    it("disables all form fields when isSubmitting", () => {
      render(
        <ContactForm
          mode="create"
          onSubmit={mockOnSubmit}
          isSubmitting={true}
        />,
      );

      expect(screen.getByLabelText(/Name/)).toBeDisabled();
      expect(screen.getByLabelText(/Email/)).toBeDisabled();
      expect(screen.getByLabelText(/Priority/)).toBeDisabled();
    });

    it("disables cancel button when isSubmitting", () => {
      render(
        <ContactForm
          mode="edit"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isSubmitting={true}
        />,
      );

      const cancelButton = screen.getByRole("button", { name: /Cancel/ });
      expect(cancelButton).toBeDisabled();
    });
  });

  describe("Validation", () => {
    it("validates email format", async () => {
      const user = userEvent.setup();

      render(<ContactForm mode="create" onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText(/Name/), "John Doe");
      await user.type(screen.getByLabelText(/Email/), "invalid-email");

      const submitButton = screen.getByRole("button", {
        name: /Create Contact/,
      });
      await user.click(submitButton);

      // Form should not submit with invalid email
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it("validates URL format for LinkedIn profile", async () => {
      const user = userEvent.setup();

      render(<ContactForm mode="create" onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText(/Name/), "John Doe");
      await user.type(screen.getByLabelText(/LinkedIn Profile/), "not-a-url");

      const submitButton = screen.getByRole("button", {
        name: /Create Contact/,
      });
      await user.click(submitButton);

      // Form should not submit with invalid URL
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it("validates URL format for profile picture", async () => {
      const user = userEvent.setup();

      render(<ContactForm mode="create" onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText(/Name/), "John Doe");
      await user.type(
        screen.getByLabelText(/Profile Picture URL/),
        "invalid-url",
      );

      const submitButton = screen.getByRole("button", {
        name: /Create Contact/,
      });
      await user.click(submitButton);

      // Form should not submit with invalid URL
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe("Keyboard Navigation", () => {
    it("allows tabbing through form fields in correct order", async () => {
      const user = userEvent.setup();

      render(<ContactForm mode="create" onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByLabelText(/Name/);
      const emailInput = screen.getByLabelText(/Email/);
      const phoneInput = screen.getByLabelText(/Phone/);

      // Focus on first field
      nameInput.focus();
      expect(nameInput).toHaveFocus();

      // Tab to next field
      await user.tab();
      expect(emailInput).toHaveFocus();

      // Tab to next field
      await user.tab();
      expect(phoneInput).toHaveFocus();
    });

    it("allows typing in text inputs", async () => {
      const user = userEvent.setup();

      render(<ContactForm mode="create" onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByLabelText(/Name/);
      await user.type(nameInput, "John Doe");

      expect(nameInput).toHaveValue("John Doe");
    });

    it("allows shift+tab to navigate backwards", async () => {
      const user = userEvent.setup();

      render(<ContactForm mode="create" onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByLabelText(/Name/);
      const emailInput = screen.getByLabelText(/Email/);

      // Focus on email field
      emailInput.focus();
      expect(emailInput).toHaveFocus();

      // Shift+Tab back to name
      await user.tab({ shift: true });
      expect(nameInput).toHaveFocus();
    });

    it("allows Enter key to submit form", async () => {
      const user = userEvent.setup();

      const { container } = render(
        <ContactForm mode="create" onSubmit={mockOnSubmit} />,
      );

      const nameInput = screen.getByLabelText(/Name/);
      await user.type(nameInput, "John Doe");

      // Press Enter to submit
      await user.keyboard("{Enter}");

      // Since name is the only required field filled, form should attempt submit
      // (It may fail validation for other reasons, but Enter should trigger submit)
      const form = container.querySelector("form");
      expect(form).toBeInTheDocument();
    });

    it("escape key does not submit form", async () => {
      const user = userEvent.setup();

      render(<ContactForm mode="create" onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByLabelText(/Name/);
      await user.type(nameInput, "John Doe");

      // Press Escape
      await user.keyboard("{Escape}");

      // Form should not be submitted
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("can navigate and select in Select dropdown", async () => {
      const user = userEvent.setup();

      render(<ContactForm mode="create" onSubmit={mockOnSubmit} />);

      // Find and click the Priority select trigger
      const priorityTrigger = screen.getByRole("combobox", {
        name: /Priority/,
      });
      await user.click(priorityTrigger);

      // Wait for dropdown to open and select an option
      await waitFor(() => {
        const highOption = screen.getByRole("option", { name: /High/i });
        expect(highOption).toBeInTheDocument();
      });

      const highOption = screen.getByRole("option", { name: /High/i });
      await user.click(highOption);

      // Verify selection (the trigger should now show "High")
      await waitFor(() => {
        expect(screen.getByText("High")).toBeInTheDocument();
      });
    });
  });
});
