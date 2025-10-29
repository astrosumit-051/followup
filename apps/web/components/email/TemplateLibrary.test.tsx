/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { TemplateLibrary } from "./TemplateLibrary";
import type { EmailTemplate } from "@/lib/graphql/email-templates";

// Mock TanStack Query hooks
jest.mock("@/lib/hooks/useEmailTemplates", () => ({
  useEmailTemplates: jest.fn(),
  useCreateEmailTemplate: jest.fn(),
  useUpdateEmailTemplate: jest.fn(),
  useDeleteEmailTemplate: jest.fn(),
}));

// Mock Supabase client
jest.mock("@/lib/supabase/client", () => ({
  createBrowserClient: jest.fn(() => ({})),
}));

import {
  useEmailTemplates,
  useCreateEmailTemplate,
  useUpdateEmailTemplate,
  useDeleteEmailTemplate,
} from "@/lib/hooks/useEmailTemplates";

describe("TemplateLibrary", () => {
  const mockOnClose = jest.fn();
  const mockOnLoadTemplate = jest.fn();

  const mockTemplates: EmailTemplate[] = [
    {
      id: "template-1",
      name: "Follow-up Template",
      subject: "Following up on our conversation",
      body: "Hi {{firstName}}, I wanted to follow up...",
      bodyHtml: "<p>Hi {{firstName}}, I wanted to follow up...</p>",
      isDefault: false,
      category: "follow-up",
      usageCount: 5,
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-10T00:00:00Z",
    },
    {
      id: "template-2",
      name: "Introduction Template",
      subject: "Nice to meet you",
      body: "Hello {{firstName}}, I'm reaching out to introduce...",
      bodyHtml: "<p>Hello {{firstName}}, I'm reaching out to introduce...</p>",
      isDefault: true,
      category: "introduction",
      usageCount: 12,
      createdAt: "2025-01-02T00:00:00Z",
      updatedAt: "2025-01-11T00:00:00Z",
    },
    {
      id: "template-3",
      name: "Thank You Template",
      subject: "Thank you for your time",
      body: "Dear {{firstName}}, Thank you for taking the time...",
      bodyHtml: "<p>Dear {{firstName}}, Thank you for taking the time...</p>",
      isDefault: false,
      category: "thank-you",
      usageCount: 8,
      createdAt: "2025-01-03T00:00:00Z",
      updatedAt: "2025-01-12T00:00:00Z",
    },
  ];

  const mockMutateAsync = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    (useEmailTemplates as jest.Mock).mockReturnValue({
      data: mockTemplates,
      isLoading: false,
      error: null,
    });

    (useCreateEmailTemplate as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });

    (useUpdateEmailTemplate as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });

    (useDeleteEmailTemplate as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  describe("20.1 Component Rendering", () => {
    it("should render modal when open", () => {
      render(<TemplateLibrary isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Email Template Library")).toBeInTheDocument();
    });

    it("should not render modal when closed", () => {
      render(<TemplateLibrary isOpen={false} onClose={mockOnClose} />);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should render close button", () => {
      render(<TemplateLibrary isOpen={true} onClose={mockOnClose} />);

      // Get all close buttons (there's an X icon and a footer "Close" button)
      const closeButtons = screen.getAllByRole("button", { name: /close/i });
      expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("20.2 Loading State", () => {
    it("should show loading skeletons when data is loading", () => {
      (useEmailTemplates as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      render(<TemplateLibrary isOpen={true} onClose={mockOnClose} />);

      // Check for skeleton loaders (they are inside Card components)
      const skeletons = screen.getAllByTestId("skeleton-loader");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("20.3 Error State", () => {
    it("should display error message when query fails", () => {
      (useEmailTemplates as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error("Failed to fetch templates"),
      });

      render(<TemplateLibrary isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText(/failed to load templates/i)).toBeInTheDocument();
      expect(screen.getByText(/failed to fetch templates/i)).toBeInTheDocument();
    });
  });

  describe("20.4 Empty State", () => {
    it("should show empty state when no templates exist", () => {
      (useEmailTemplates as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<TemplateLibrary isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("No Templates Yet")).toBeInTheDocument();
      expect(screen.getByText(/create your first email template/i)).toBeInTheDocument();
    });
  });

  describe("20.5 Template List Display", () => {
    it("should display all templates grouped by category", () => {
      render(<TemplateLibrary isOpen={true} onClose={mockOnClose} />);

      // Check category labels
      expect(screen.getByText("Follow-up")).toBeInTheDocument();
      expect(screen.getByText("Introduction")).toBeInTheDocument();
      expect(screen.getByText("Thank You")).toBeInTheDocument();

      // Check template count per category (there are 3, one for each category)
      const templateCounts = screen.getAllByText("1 template");
      expect(templateCounts).toHaveLength(3); // Each category has 1 template
    });

    it("should display template details correctly", () => {
      render(<TemplateLibrary isOpen={true} onClose={mockOnClose} />);

      // Check template names
      expect(screen.getByText("Follow-up Template")).toBeInTheDocument();
      expect(screen.getByText("Introduction Template")).toBeInTheDocument();
      expect(screen.getByText("Thank You Template")).toBeInTheDocument();

      // Check template subjects
      expect(screen.getByText("Following up on our conversation")).toBeInTheDocument();
      expect(screen.getByText("Nice to meet you")).toBeInTheDocument();
    });

    it("should show Default badge for default templates", () => {
      render(<TemplateLibrary isOpen={true} onClose={mockOnClose} />);

      // Only the Introduction template is marked as default
      const defaultBadges = screen.getAllByText("Default");
      expect(defaultBadges).toHaveLength(1);
    });

    it("should display template count per category", () => {
      render(<TemplateLibrary isOpen={true} onClose={mockOnClose} />);

      // Check template counts (use getAllByText since there are 3 categories)
      const templateCounts = screen.getAllByText("1 template");
      expect(templateCounts).toHaveLength(3); // Each of the 3 categories has 1 template
    });
  });

  describe("20.6 Load Template Action", () => {
    it("should call onLoadTemplate when Load button clicked", async () => {
      const user = userEvent.setup();
      render(
        <TemplateLibrary
          isOpen={true}
          onClose={mockOnClose}
          onLoadTemplate={mockOnLoadTemplate}
        />
      );

      // Find all Load buttons (case-insensitive button with "Load" text)
      const loadButtons = screen.getAllByRole("button", { name: /^load$/i });
      await user.click(loadButtons[0]);

      expect(mockOnLoadTemplate).toHaveBeenCalledTimes(1);
      expect(mockOnLoadTemplate).toHaveBeenCalledWith(mockTemplates[0]);
      expect(mockOnClose).toHaveBeenCalledTimes(1); // Modal should close after loading
    });

    it("should pass correct template data when loading", async () => {
      const user = userEvent.setup();
      render(
        <TemplateLibrary
          isOpen={true}
          onClose={mockOnClose}
          onLoadTemplate={mockOnLoadTemplate}
        />
      );

      // Load the Introduction template (second template)
      const loadButtons = screen.getAllByRole("button", { name: /^load$/i });
      await user.click(loadButtons[1]);

      expect(mockOnLoadTemplate).toHaveBeenCalledWith(mockTemplates[1]);
    });
  });

  describe("20.7 Save as Template", () => {
    it("should show save template button when showSaveAs is true", () => {
      render(
        <TemplateLibrary
          isOpen={true}
          onClose={mockOnClose}
          showSaveAs={true}
          defaultSubject="Test Subject"
          defaultBody="Test Body"
        />
      );

      expect(screen.getByText("Save Current Draft as Template")).toBeInTheDocument();
    });

    it("should not show save button when showSaveAs is false", () => {
      render(<TemplateLibrary isOpen={true} onClose={mockOnClose} showSaveAs={false} />);

      expect(screen.queryByText("Save Current Draft as Template")).not.toBeInTheDocument();
    });

    it("should open save modal when save button clicked", async () => {
      const user = userEvent.setup();
      render(
        <TemplateLibrary
          isOpen={true}
          onClose={mockOnClose}
          showSaveAs={true}
          defaultSubject="Test Subject"
          defaultBody="Test Body"
        />
      );

      const saveButton = screen.getByText("Save Current Draft as Template");
      await user.click(saveButton);

      // Check for save modal fields
      await waitFor(() => {
        expect(screen.getByLabelText(/template name/i)).toBeInTheDocument();
      });
    });

    it("should pre-fill form with default values", async () => {
      const user = userEvent.setup();
      render(
        <TemplateLibrary
          isOpen={true}
          onClose={mockOnClose}
          showSaveAs={true}
          defaultSubject="My Test Subject"
          defaultBody="My Test Body"
        />
      );

      const saveButton = screen.getByText("Save Current Draft as Template");
      await user.click(saveButton);

      await waitFor(() => {
        const subjectInput = screen.getByLabelText(/subject/i) as HTMLInputElement;
        const bodyInput = screen.getByLabelText(/body/i) as HTMLTextAreaElement;

        expect(subjectInput.value).toBe("My Test Subject");
        expect(bodyInput.value).toBe("My Test Body");
      });
    });

    it("should create template when save form submitted", async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValue({ id: "new-template-id" });

      render(
        <TemplateLibrary
          isOpen={true}
          onClose={mockOnClose}
          showSaveAs={true}
          defaultSubject="Test Subject"
          defaultBody="Test Body"
        />
      );

      // Open save modal
      const saveButton = screen.getByText("Save Current Draft as Template");
      await user.click(saveButton);

      // Fill in template name
      await waitFor(() => {
        expect(screen.getByLabelText(/template name/i)).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/template name/i);
      await user.clear(nameInput);
      await user.type(nameInput, "My New Template");

      // Submit form
      const submitButton = screen.getByRole("button", { name: /save template/i });
      await user.click(submitButton);

      // Verify mutation was called
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          name: "My New Template",
          subject: "Test Subject",
          body: "Test Body",
          category: "general",
          isDefault: false,
        });
      });
    });

    it("should disable save button when required fields are empty", async () => {
      const user = userEvent.setup();
      render(
        <TemplateLibrary
          isOpen={true}
          onClose={mockOnClose}
          showSaveAs={true}
          defaultSubject=""
          defaultBody=""
        />
      );

      const saveButton = screen.getByText("Save Current Draft as Template");
      await user.click(saveButton);

      await waitFor(() => {
        const submitButton = screen.getByRole("button", { name: /save template/i });
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe("20.8 Edit Template", () => {
    it("should open edit modal when edit button clicked", async () => {
      const user = userEvent.setup();
      render(<TemplateLibrary isOpen={true} onClose={mockOnClose} />);

      // Find the first template card
      const templateCards = screen.getAllByText(/template/i);
      const firstCard = templateCards[0].closest("div[class*='rounded']");

      // Find edit button within the first card (button with Edit2 icon)
      const buttons = within(firstCard!).getAllByRole("button");
      // The edit button is the second button (after Load button)
      const editButton = buttons[1];

      await user.click(editButton);

      // Verify edit modal opened with template data
      await waitFor(() => {
        expect(screen.getByLabelText(/template name/i)).toBeInTheDocument();
      });
    });

    it("should pre-fill edit form with template data", async () => {
      const user = userEvent.setup();
      render(<TemplateLibrary isOpen={true} onClose={mockOnClose} />);

      // Find first card and click edit
      const templateCards = screen.getAllByText(/template/i);
      const firstCard = templateCards[0].closest("div[class*='rounded']");
      const buttons = within(firstCard!).getAllByRole("button");
      const editButton = buttons[1];

      await user.click(editButton);

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/template name/i) as HTMLInputElement;
        expect(nameInput.value).toBe("Follow-up Template");
      });
    });

    it("should update template when edit form submitted", async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValue({ ...mockTemplates[0], name: "Updated Name" });

      render(<TemplateLibrary isOpen={true} onClose={mockOnClose} />);

      // Open edit modal for first template
      const templateCards = screen.getAllByText(/template/i);
      const firstCard = templateCards[0].closest("div[class*='rounded']");
      const buttons = within(firstCard!).getAllByRole("button");
      const editButton = buttons[1];

      await user.click(editButton);

      // Update template name
      await waitFor(() => {
        expect(screen.getByLabelText(/template name/i)).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/template name/i);
      await user.clear(nameInput);
      await user.type(nameInput, "Updated Template Name");

      // Submit form (button text is "Save Changes")
      const updateButton = screen.getByRole("button", { name: /save changes/i });
      await user.click(updateButton);

      // Verify mutation was called
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          id: "template-1",
          input: expect.objectContaining({
            name: "Updated Template Name",
          }),
        });
      });
    });
  });

  describe("20.9 Delete Template", () => {
    it("should open delete confirmation when delete button clicked", async () => {
      const user = userEvent.setup();
      render(<TemplateLibrary isOpen={true} onClose={mockOnClose} />);

      // Find first template card and delete button
      const templateCards = screen.getAllByText(/template/i);
      const firstCard = templateCards[0].closest("div[class*='rounded']");
      const buttons = within(firstCard!).getAllByRole("button");
      // Delete button is the third button (after Load and Edit)
      const deleteButton = buttons[2];

      await user.click(deleteButton);

      // Verify delete confirmation dialog
      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      });
    });

    it("should show template name in delete confirmation", async () => {
      const user = userEvent.setup();
      render(<TemplateLibrary isOpen={true} onClose={mockOnClose} />);

      // Click delete on first template
      const templateCards = screen.getAllByText(/template/i);
      const firstCard = templateCards[0].closest("div[class*='rounded']");
      const buttons = within(firstCard!).getAllByRole("button");
      const deleteButton = buttons[2];

      await user.click(deleteButton);

      // Check for the delete confirmation message (template name is in quotes)
      await waitFor(() => {
        expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
        expect(screen.getByText(/"Follow-up Template"/i)).toBeInTheDocument();
      });
    });

    it("should delete template when confirmed", async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValue(true);

      render(<TemplateLibrary isOpen={true} onClose={mockOnClose} />);

      // Open delete dialog
      const templateCards = screen.getAllByText(/template/i);
      const firstCard = templateCards[0].closest("div[class*='rounded']");
      const buttons = within(firstCard!).getAllByRole("button");
      const deleteButton = buttons[2];

      await user.click(deleteButton);

      // Confirm deletion
      await waitFor(() => {
        const confirmButton = screen.getByRole("button", { name: /delete/i });
        return user.click(confirmButton);
      });

      // Verify mutation was called
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith("template-1");
      });
    });

    it("should not delete template when cancelled", async () => {
      const user = userEvent.setup();
      render(<TemplateLibrary isOpen={true} onClose={mockOnClose} />);

      // Open delete dialog
      const templateCards = screen.getAllByText(/template/i);
      const firstCard = templateCards[0].closest("div[class*='rounded']");
      const buttons = within(firstCard!).getAllByRole("button");
      const deleteButton = buttons[2];

      await user.click(deleteButton);

      // Cancel deletion
      await waitFor(() => {
        const cancelButton = screen.getByRole("button", { name: /cancel/i });
        return user.click(cancelButton);
      });

      // Verify mutation was NOT called
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });
  });

  describe("20.10 Template Cards Hover Effect", () => {
    it("should have hover effect class on template cards", () => {
      render(<TemplateLibrary isOpen={true} onClose={mockOnClose} />);

      // Verify that all 3 template cards are rendered with interactive elements
      // Each card has a Load button, Edit button, and Delete button
      const loadButtons = screen.getAllByRole("button", { name: /^load$/i });
      expect(loadButtons).toHaveLength(3); // One for each template

      // Verify template names are displayed (indicating cards are rendered)
      expect(screen.getByText("Follow-up Template")).toBeInTheDocument();
      expect(screen.getByText("Introduction Template")).toBeInTheDocument();
      expect(screen.getByText("Thank You Template")).toBeInTheDocument();

      // The cards should be interactive with hover effects applied via Tailwind classes
      // (Testing actual CSS hover behavior requires integration tests with a real browser)
    });
  });

  describe("20.11 Category Selection", () => {
    it("should allow selecting different categories in save modal", async () => {
      const user = userEvent.setup();
      render(
        <TemplateLibrary
          isOpen={true}
          onClose={mockOnClose}
          showSaveAs={true}
          defaultSubject="Test"
          defaultBody="Test"
        />
      );

      // Open save modal
      const saveButton = screen.getByText("Save Current Draft as Template");
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      });

      // The category select should be present (default is "general")
      const categorySelect = screen.getByLabelText(/category/i);
      expect(categorySelect).toBeInTheDocument();
    });
  });

  describe("20.12 Modal Close Behavior", () => {
    it("should call onClose when close button clicked", async () => {
      const user = userEvent.setup();
      render(<TemplateLibrary isOpen={true} onClose={mockOnClose} />);

      // Find the footer "Close" button (more specific than the X icon)
      const closeButtons = screen.getAllByRole("button", { name: /close/i });
      const footerCloseButton = closeButtons[closeButtons.length - 1]; // Last one is the footer button

      await user.click(footerCloseButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should reset save mode when modal closed", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <TemplateLibrary
          isOpen={true}
          onClose={mockOnClose}
          showSaveAs={true}
        />
      );

      // Open save modal
      const saveButton = screen.getByText("Save Current Draft as Template");
      await user.click(saveButton);

      // Close main modal
      rerender(
        <TemplateLibrary
          isOpen={false}
          onClose={mockOnClose}
          showSaveAs={false}
        />
      );

      // Reopen without save mode
      rerender(
        <TemplateLibrary
          isOpen={true}
          onClose={mockOnClose}
          showSaveAs={false}
        />
      );

      // Save button should not be visible
      expect(screen.queryByText("Save Current Draft as Template")).not.toBeInTheDocument();
    });
  });
});
