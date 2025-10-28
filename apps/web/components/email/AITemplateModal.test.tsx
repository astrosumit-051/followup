/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { AITemplateModal } from "./AITemplateModal";

// Mock fetch for GraphQL requests
global.fetch = jest.fn();

describe("AITemplateModal", () => {
  const mockOnClose = jest.fn();
  const mockOnSelectTemplate = jest.fn();
  const mockContactId = "contact-123";

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  describe("16.1 Component Rendering", () => {
    it("should render modal when open", () => {
      render(
        <AITemplateModal
          isOpen={true}
          contactId={mockContactId}
          onClose={mockOnClose}
          onSelectTemplate={mockOnSelectTemplate}
        />
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(
        screen.getByText(/Generate AI Email Templates/i)
      ).toBeInTheDocument();
    });

    it("should not render modal when closed", () => {
      render(
        <AITemplateModal
          isOpen={false}
          contactId={mockContactId}
          onClose={mockOnClose}
          onSelectTemplate={mockOnSelectTemplate}
        />
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("16.4 Modal Layout", () => {
    it("should have 80% viewport width with max 1200px", () => {
      render(
        <AITemplateModal
          isOpen={true}
          contactId={mockContactId}
          onClose={mockOnClose}
          onSelectTemplate={mockOnSelectTemplate}
        />
      );

      const dialog = screen.getByRole("dialog");
      const computedStyle = window.getComputedStyle(dialog);

      // Check that the modal has the correct width constraints
      expect(dialog).toHaveClass("max-w-[1200px]");
      expect(dialog).toHaveClass("w-[80vw]");
    });
  });

  describe("16.5 Two-Column Grid Layout", () => {
    it("should display two-column grid for templates", async () => {
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            generateEmailTemplate: {
              formal: {
                subject: "Formal Subject",
                body: "Formal body content",
              },
              casual: {
                subject: "Casual Subject",
                body: "Casual body content",
              },
            },
          },
        }),
      });

      render(
        <AITemplateModal
          isOpen={true}
          contactId={mockContactId}
          onClose={mockOnClose}
          onSelectTemplate={mockOnSelectTemplate}
        />
      );

      await waitFor(() => {
        // Check for template cards by finding the action buttons (2 each: desktop + mobile)
        expect(screen.getAllByRole('button', { name: /Use Template A/i })).toHaveLength(2);
        expect(screen.getAllByRole('button', { name: /Use Template B/i })).toHaveLength(2);
      });

      // Check for grid layout
      const templateGrid = screen.getByTestId("template-grid");
      expect(templateGrid).toHaveClass("grid");
      expect(templateGrid).toHaveClass("grid-cols-2");
    });
  });

  describe("16.8 Template Cards with Badges", () => {
    it("should display formal template with blue badge", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            generateEmailTemplate: {
              formal: {
                subject: "Formal Subject",
                body: "Formal body content",
              },
              casual: {
                subject: "Casual Subject",
                body: "Casual body content",
              },
            },
          },
        }),
      });

      render(
        <AITemplateModal
          isOpen={true}
          contactId={mockContactId}
          onClose={mockOnClose}
          onSelectTemplate={mockOnSelectTemplate}
        />
      );

      await waitFor(() => {
        const formalBadges = screen.getAllByText(/^Formal$/);
        expect(formalBadges).toHaveLength(2); // Desktop + Mobile
        expect(formalBadges[0]).toHaveClass("bg-blue-100");
      });
    });

    it("should display casual template with green badge", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            generateEmailTemplate: {
              formal: {
                subject: "Formal Subject",
                body: "Formal body content",
              },
              casual: {
                subject: "Casual Subject",
                body: "Casual body content",
              },
            },
          },
        }),
      });

      render(
        <AITemplateModal
          isOpen={true}
          contactId={mockContactId}
          onClose={mockOnClose}
          onSelectTemplate={mockOnSelectTemplate}
        />
      );

      await waitFor(() => {
        const casualBadges = screen.getAllByText(/^Casual$/);
        expect(casualBadges).toHaveLength(2); // Desktop + Mobile
        expect(casualBadges[0]).toHaveClass("bg-green-100");
      });
    });

    it("should display subject and body preview for both templates", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            generateEmailTemplate: {
              formal: {
                subject: "Formal Subject Line",
                body: "This is the formal body content",
              },
              casual: {
                subject: "Casual Subject Line",
                body: "This is the casual body content",
              },
            },
          },
        }),
      });

      render(
        <AITemplateModal
          isOpen={true}
          contactId={mockContactId}
          onClose={mockOnClose}
          onSelectTemplate={mockOnSelectTemplate}
        />
      );

      await waitFor(() => {
        expect(screen.getAllByText("Formal Subject Line")).toHaveLength(2); // Desktop + Mobile
        expect(
          screen.getAllByText("This is the formal body content")
        ).toHaveLength(2);
        expect(screen.getAllByText("Casual Subject Line")).toHaveLength(2);
        expect(
          screen.getAllByText("This is the casual body content")
        ).toHaveLength(2);
      });
    });
  });

  describe("16.9 Loading Skeletons", () => {
    it("should show loading skeletons during AI generation", () => {
      // Mock a slow API response
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    data: {
                      generateEmailTemplate: {
                        formal: {
                          subject: "Formal Subject",
                          body: "Formal body",
                        },
                        casual: {
                          subject: "Casual Subject",
                          body: "Casual body",
                        },
                      },
                    },
                  }),
                }),
              100
            )
          )
      );

      render(
        <AITemplateModal
          isOpen={true}
          contactId={mockContactId}
          onClose={mockOnClose}
          onSelectTemplate={mockOnSelectTemplate}
        />
      );

      // Check for loading skeletons
      expect(screen.getByTestId("template-skeleton-a")).toBeInTheDocument();
      expect(screen.getByTestId("template-skeleton-b")).toBeInTheDocument();
    });

    it("should hide loading skeletons after AI generation completes", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            generateEmailTemplate: {
              formal: {
                subject: "Formal Subject",
                body: "Formal body",
              },
              casual: {
                subject: "Casual Subject",
                body: "Casual body",
              },
            },
          },
        }),
      });

      render(
        <AITemplateModal
          isOpen={true}
          contactId={mockContactId}
          onClose={mockOnClose}
          onSelectTemplate={mockOnSelectTemplate}
        />
      );

      await waitFor(() => {
        expect(
          screen.queryByTestId("template-skeleton-a")
        ).not.toBeInTheDocument();
        expect(
          screen.queryByTestId("template-skeleton-b")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("16.10 Action Buttons", () => {
    it('should display "Use Template A" button', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            generateEmailTemplate: {
              formal: {
                subject: "Formal Subject",
                body: "Formal body",
              },
              casual: {
                subject: "Casual Subject",
                body: "Casual body",
              },
            },
          },
        }),
      });

      render(
        <AITemplateModal
          isOpen={true}
          contactId={mockContactId}
          onClose={mockOnClose}
          onSelectTemplate={mockOnSelectTemplate}
        />
      );

      await waitFor(() => {
        expect(screen.getAllByText(/Use Template A/i)).toHaveLength(2); // Desktop + Mobile
      });
    });

    it('should display "Use Template B" button', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            generateEmailTemplate: {
              formal: {
                subject: "Formal Subject",
                body: "Formal body",
              },
              casual: {
                subject: "Casual Subject",
                body: "Casual body",
              },
            },
          },
        }),
      });

      render(
        <AITemplateModal
          isOpen={true}
          contactId={mockContactId}
          onClose={mockOnClose}
          onSelectTemplate={mockOnSelectTemplate}
        />
      );

      await waitFor(() => {
        expect(screen.getAllByText(/Use Template B/i)).toHaveLength(2); // Desktop + Mobile
      });
    });

    it("should call onSelectTemplate with formal template when Use Template A is clicked", async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            generateEmailTemplate: {
              formal: {
                subject: "Formal Subject",
                body: "Formal body",
              },
              casual: {
                subject: "Casual Subject",
                body: "Casual body",
              },
            },
          },
        }),
      });

      render(
        <AITemplateModal
          isOpen={true}
          contactId={mockContactId}
          onClose={mockOnClose}
          onSelectTemplate={mockOnSelectTemplate}
        />
      );

      await waitFor(() => {
        expect(screen.getAllByText(/Use Template A/i)).toHaveLength(2);
      });

      // Click the first button (desktop version)
      const buttons = screen.getAllByText(/Use Template A/i);
      await user.click(buttons[0]);

      expect(mockOnSelectTemplate).toHaveBeenCalledWith({
        subject: "Formal Subject",
        body: "Formal body",
      });
    });

    it("should call onSelectTemplate with casual template when Use Template B is clicked", async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            generateEmailTemplate: {
              formal: {
                subject: "Formal Subject",
                body: "Formal body",
              },
              casual: {
                subject: "Casual Subject",
                body: "Casual body",
              },
            },
          },
        }),
      });

      render(
        <AITemplateModal
          isOpen={true}
          contactId={mockContactId}
          onClose={mockOnClose}
          onSelectTemplate={mockOnSelectTemplate}
        />
      );

      await waitFor(() => {
        expect(screen.getAllByText(/Use Template B/i)).toHaveLength(2);
      });

      // Click the first button (desktop version)
      const buttons = screen.getAllByText(/Use Template B/i);
      await user.click(buttons[0]);

      expect(mockOnSelectTemplate).toHaveBeenCalledWith({
        subject: "Casual Subject",
        body: "Casual body",
      });
    });
  });

  describe("16.11 Regenerate Button", () => {
    it('should display "Regenerate Both Templates" button', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            generateEmailTemplate: {
              formal: {
                subject: "Formal Subject",
                body: "Formal body",
              },
              casual: {
                subject: "Casual Subject",
                body: "Casual body",
              },
            },
          },
        }),
      });

      render(
        <AITemplateModal
          isOpen={true}
          contactId={mockContactId}
          onClose={mockOnClose}
          onSelectTemplate={mockOnSelectTemplate}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByText(/Regenerate Both Templates/i)
        ).toBeInTheDocument();
      });
    });

    it("should regenerate templates when button is clicked", async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              generateEmailTemplate: {
                formal: {
                  subject: "Formal Subject 1",
                  body: "Formal body 1",
                },
                casual: {
                  subject: "Casual Subject 1",
                  body: "Casual body 1",
                },
              },
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              generateEmailTemplate: {
                formal: {
                  subject: "Formal Subject 2",
                  body: "Formal body 2",
                },
                casual: {
                  subject: "Casual Subject 2",
                  body: "Casual body 2",
                },
              },
            },
          }),
        });

      render(
        <AITemplateModal
          isOpen={true}
          contactId={mockContactId}
          onClose={mockOnClose}
          onSelectTemplate={mockOnSelectTemplate}
        />
      );

      await waitFor(() => {
        expect(screen.getAllByText("Formal Subject 1")).toHaveLength(2); // Desktop + Mobile
      });

      await user.click(screen.getByText(/Regenerate Both Templates/i));

      await waitFor(() => {
        expect(screen.getAllByText("Formal Subject 2")).toHaveLength(2);
      });

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("16.12 Error Handling", () => {
    it("should display error message when AI generation fails", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("API Error")
      );

      render(
        <AITemplateModal
          isOpen={true}
          contactId={mockContactId}
          onClose={mockOnClose}
          onSelectTemplate={mockOnSelectTemplate}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByText(/Failed to generate templates/i)
        ).toBeInTheDocument();
      });
    });

    it('should display "Try Again" button on error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("API Error")
      );

      render(
        <AITemplateModal
          isOpen={true}
          contactId={mockContactId}
          onClose={mockOnClose}
          onSelectTemplate={mockOnSelectTemplate}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Try Again/i)).toBeInTheDocument();
      });
    });

    it("should retry generation when Try Again is clicked", async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error("API Error"))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              generateEmailTemplate: {
                formal: {
                  subject: "Formal Subject",
                  body: "Formal body",
                },
                casual: {
                  subject: "Casual Subject",
                  body: "Casual body",
                },
              },
            },
          }),
        });

      render(
        <AITemplateModal
          isOpen={true}
          contactId={mockContactId}
          onClose={mockOnClose}
          onSelectTemplate={mockOnSelectTemplate}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Try Again/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/Try Again/i));

      await waitFor(() => {
        expect(screen.getAllByText("Formal Subject")).toHaveLength(2); // Desktop + Mobile
      });

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("16.13 Modal Close", () => {
    it('should call onClose when "Cancel" button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <AITemplateModal
          isOpen={true}
          contactId={mockContactId}
          onClose={mockOnClose}
          onSelectTemplate={mockOnSelectTemplate}
        />
      );

      await user.click(screen.getByText(/Cancel/i));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should call onClose when template is selected", async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            generateEmailTemplate: {
              formal: {
                subject: "Formal Subject",
                body: "Formal body",
              },
              casual: {
                subject: "Casual Subject",
                body: "Casual body",
              },
            },
          },
        }),
      });

      render(
        <AITemplateModal
          isOpen={true}
          contactId={mockContactId}
          onClose={mockOnClose}
          onSelectTemplate={mockOnSelectTemplate}
        />
      );

      await waitFor(() => {
        expect(screen.getAllByText(/Use Template A/i)).toHaveLength(2);
      });

      // Click the first button (desktop version)
      const buttons = screen.getAllByText(/Use Template A/i);
      await user.click(buttons[0]);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("GraphQL API Integration", () => {
    it("should make GraphQL request with correct variables", async () => {
      const mockContext = "Professional networking";
      const mockEmailType = "followup";

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            generateEmailTemplate: {
              formal: {
                subject: "Formal Subject",
                body: "Formal body",
              },
              casual: {
                subject: "Casual Subject",
                body: "Casual body",
              },
            },
          },
        }),
      });

      render(
        <AITemplateModal
          isOpen={true}
          contactId={mockContactId}
          context={mockContext}
          emailType={mockEmailType}
          onClose={mockOnClose}
          onSelectTemplate={mockOnSelectTemplate}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.variables).toMatchObject({
        contactId: mockContactId,
        context: mockContext,
        includeHistory: true, // followup type should include history
      });
    });

    it("should set includeHistory to false for cold emails", async () => {
      const mockContext = "New business opportunity";
      const mockEmailType = "cold";

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            generateEmailTemplate: {
              formal: {
                subject: "Formal Subject",
                body: "Formal body",
              },
              casual: {
                subject: "Casual Subject",
                body: "Casual body",
              },
            },
          },
        }),
      });

      render(
        <AITemplateModal
          isOpen={true}
          contactId={mockContactId}
          context={mockContext}
          emailType={mockEmailType}
          onClose={mockOnClose}
          onSelectTemplate={mockOnSelectTemplate}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.variables).toMatchObject({
        contactId: mockContactId,
        context: mockContext,
        includeHistory: false, // cold type should NOT include history
      });
    });
  });
});
