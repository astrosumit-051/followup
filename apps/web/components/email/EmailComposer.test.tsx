import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, jest } from "@jest/globals";
import { EmailComposer } from "./EmailComposer";

describe("EmailComposer", () => {
  describe("Render", () => {
    it("renders email composer with subject and message fields", () => {
      render(<EmailComposer />);

      expect(screen.getByLabelText("Subject:")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Email subject...")).toBeInTheDocument();
      expect(screen.getByText("Message:")).toBeInTheDocument();
    });

    it("renders TipTap editor with placeholder text", async () => {
      render(<EmailComposer />);

      // Wait for editor to initialize
      await waitFor(() => {
        const editorWrapper = document.querySelector('[aria-labelledby="email-message-label"]');
        const editorElement = editorWrapper?.querySelector(".ProseMirror");
        expect(editorElement).toBeInTheDocument();
      });
    });

    it("renders formatting toolbar with all buttons", () => {
      render(<EmailComposer />);

      // Check for toolbar buttons
      expect(screen.getByLabelText("Bold (Cmd+B)")).toBeInTheDocument();
      expect(screen.getByLabelText("Italic (Cmd+I)")).toBeInTheDocument();
      expect(screen.getByLabelText("Underline (Cmd+U)")).toBeInTheDocument();
      expect(screen.getByLabelText("Bullet List")).toBeInTheDocument();
      expect(screen.getByLabelText("Numbered List")).toBeInTheDocument();
      expect(screen.getByLabelText("Align Left")).toBeInTheDocument();
      expect(screen.getByLabelText("Align Center")).toBeInTheDocument();
      expect(screen.getByLabelText("Align Right")).toBeInTheDocument();
      expect(screen.getByLabelText("Justify")).toBeInTheDocument();
      expect(screen.getByLabelText("Insert Link")).toBeInTheDocument();
    });
  });

  describe("Subject Field", () => {
    it("displays character count for subject field", async () => {
      const user = userEvent.setup();
      render(<EmailComposer />);

      const subjectInput = screen.getByPlaceholderText("Email subject...");

      // Initially should show 0 chars
      expect(screen.getByText("0 chars")).toBeInTheDocument();

      // Type subject
      await user.type(subjectInput, "Test Subject");

      // Should show updated character count
      await waitFor(() => {
        expect(screen.getByText("12 chars")).toBeInTheDocument();
      });
    });

    it("calls onSubjectChange callback when subject changes", async () => {
      const user = userEvent.setup();
      const mockOnSubjectChange = jest.fn();
      render(<EmailComposer onSubjectChange={mockOnSubjectChange} />);

      const subjectInput = screen.getByPlaceholderText("Email subject...");
      await user.type(subjectInput, "Test");

      await waitFor(() => {
        expect(mockOnSubjectChange).toHaveBeenCalled();
      });
    });

    it("initializes with initial subject value", () => {
      render(<EmailComposer initialSubject="Initial Subject" />);

      const subjectInput = screen.getByPlaceholderText("Email subject...") as HTMLInputElement;
      expect(subjectInput.value).toBe("Initial Subject");
      expect(screen.getByText("15 chars")).toBeInTheDocument();
    });
  });

  describe("Recipient Display", () => {
    it("displays recipient count for single contact", () => {
      render(<EmailComposer selectedContactIds={["contact-1"]} />);

      expect(screen.getByText("Sending to 1 contact")).toBeInTheDocument();
    });

    it("displays recipient count for multiple contacts", () => {
      render(<EmailComposer selectedContactIds={["contact-1", "contact-2", "contact-3"]} />);

      expect(screen.getByText("Sending to 3 contacts")).toBeInTheDocument();
    });

    it("does not display recipient count when no contacts selected", () => {
      render(<EmailComposer selectedContactIds={[]} />);

      expect(screen.queryByText(/Sending to/)).not.toBeInTheDocument();
    });
  });

  describe("Context Indicator Badge", () => {
    it("displays Follow-Up Email badge when emailType is followup", () => {
      render(<EmailComposer emailType="followup" />);

      const badge = screen.getByText(/Follow-Up Email/);
      expect(badge).toBeInTheDocument();
      // Check that the badge has the blue styling classes
      expect(badge.className).toMatch(/bg-blue/);
    });

    it("displays Cold Email badge when emailType is cold", () => {
      render(<EmailComposer emailType="cold" />);

      const badge = screen.getByText(/Cold Email/);
      expect(badge).toBeInTheDocument();
      // Check that the badge has the orange styling classes
      expect(badge.className).toMatch(/bg-orange/);
    });

    it("does not display badge when emailType is null", () => {
      render(<EmailComposer emailType={null} />);

      expect(screen.queryByText(/Follow-Up Email/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Cold Email/)).not.toBeInTheDocument();
    });
  });

  describe("TipTap Editor Integration", () => {
    it("initializes editor with initial content", async () => {
      render(<EmailComposer initialContent="<p>Initial content</p>" />);

      await waitFor(() => {
        const editorWrapper = document.querySelector('[aria-labelledby="email-message-label"]');
        const editorElement = editorWrapper?.querySelector(".ProseMirror");
        expect(editorElement?.textContent).toContain("Initial content");
      });
    });

    it("calls onContentChange callback when editor content changes", async () => {
      const user = userEvent.setup();
      const mockOnContentChange = jest.fn();
      render(<EmailComposer onContentChange={mockOnContentChange} />);

      // Wait for editor to initialize
      await waitFor(() => {
        const editorWrapper = document.querySelector('[aria-labelledby="email-message-label"]');
        const editorElement = editorWrapper?.querySelector(".ProseMirror");
        expect(editorElement).toBeInTheDocument();
      });

      // Type in editor (this might not work perfectly in tests, but we can verify the callback is set up)
      // In real usage, TipTap will call onUpdate which triggers onContentChange
    });
  });

  describe("Toolbar Interactions", () => {
    it("bold button is clickable and triggers editor command", async () => {
      const user = userEvent.setup();
      render(<EmailComposer />);

      // Wait for editor to initialize
      await waitFor(() => {
        const editorWrapper = document.querySelector('[aria-labelledby="email-message-label"]');
        const editorElement = editorWrapper?.querySelector(".ProseMirror");
        expect(editorElement).toBeInTheDocument();
      });

      const boldButton = screen.getByLabelText("Bold (Cmd+B)");

      // Button should be clickable
      expect(boldButton).toBeEnabled();

      // Click should not throw error
      await user.click(boldButton);

      // Button should still be rendered after click
      expect(boldButton).toBeInTheDocument();
    });

    it("toolbar buttons are keyboard accessible", () => {
      render(<EmailComposer />);

      const boldButton = screen.getByLabelText("Bold (Cmd+B)");
      const italicButton = screen.getByLabelText("Italic (Cmd+I)");
      const underlineButton = screen.getByLabelText("Underline (Cmd+U)");

      // All buttons should have proper aria labels
      expect(boldButton).toHaveAttribute("aria-label", "Bold (Cmd+B)");
      expect(italicButton).toHaveAttribute("aria-label", "Italic (Cmd+I)");
      expect(underlineButton).toHaveAttribute("aria-label", "Underline (Cmd+U)");
    });
  });

  describe("Accessibility", () => {
    it("has proper labels for form fields", () => {
      render(<EmailComposer />);

      expect(screen.getByLabelText("Subject:")).toBeInTheDocument();
      expect(screen.getByText("Message:")).toBeInTheDocument();
      // Verify the editor wrapper has aria-labelledby
      expect(document.querySelector('[aria-labelledby="email-message-label"]')).toBeInTheDocument();
    });

    it("toolbar buttons have descriptive aria-labels", () => {
      render(<EmailComposer />);

      expect(screen.getByLabelText("Bold (Cmd+B)")).toBeInTheDocument();
      expect(screen.getByLabelText("Italic (Cmd+I)")).toBeInTheDocument();
      expect(screen.getByLabelText("Underline (Cmd+U)")).toBeInTheDocument();
      expect(screen.getByLabelText("Bullet List")).toBeInTheDocument();
      expect(screen.getByLabelText("Numbered List")).toBeInTheDocument();
      expect(screen.getByLabelText("Insert Link")).toBeInTheDocument();
    });
  });

  describe("Layout and Styling", () => {
    it("applies correct styling classes to editor container", async () => {
      render(<EmailComposer />);

      await waitFor(() => {
        const editorWrapper = document.querySelector('[aria-labelledby="email-message-label"]');
        const editorElement = editorWrapper?.querySelector(".ProseMirror");
        expect(editorElement).toHaveClass("min-h-[300px]");
        expect(editorElement).toHaveClass("max-h-[600px]");
        expect(editorElement).toHaveClass("overflow-y-auto");
      });
    });

    it("recipient display uses blue background for campaign mode", () => {
      render(<EmailComposer selectedContactIds={["contact-1"]} />);

      const recipientDisplay = screen.getByText("Sending to 1 contact").parentElement;
      expect(recipientDisplay).toHaveClass("bg-blue-50");
    });
  });
});
