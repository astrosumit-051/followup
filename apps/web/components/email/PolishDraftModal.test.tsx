/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { PolishDraftModal } from "./PolishDraftModal";

// Mock fetch for GraphQL requests
global.fetch = jest.fn();

describe("PolishDraftModal", () => {
  const mockOnClose = jest.fn();
  const mockOnSelectVersion = jest.fn();
  const mockRoughDraft = "This is a rough draft email that needs polishing.";

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  describe("17.1 Component Rendering", () => {
    it("should render modal when open", () => {
      render(
        <PolishDraftModal
          isOpen={true}
          roughDraft={mockRoughDraft}
          onClose={mockOnClose}
          onSelectVersion={mockOnSelectVersion}
        />
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText(/Polish Your Draft/i)).toBeInTheDocument();
    });

    it("should not render modal when closed", () => {
      render(
        <PolishDraftModal
          isOpen={false}
          roughDraft={mockRoughDraft}
          onClose={mockOnClose}
          onSelectVersion={mockOnSelectVersion}
        />
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("17.4 Modal Layout", () => {
    it("should have 90% viewport width with max 1400px", () => {
      render(
        <PolishDraftModal
          isOpen={true}
          roughDraft={mockRoughDraft}
          onClose={mockOnClose}
          onSelectVersion={mockOnSelectVersion}
        />
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveClass("max-w-[1400px]");
      expect(dialog).toHaveClass("w-[90vw]");
    });
  });

  describe("17.5 Four-Style Grid Layout", () => {
    it("should display 2x2 grid for desktop", async () => {
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            polishDraft: {
              formal: {
                content: "Formal polished content",
                wordCount: 100,
                wordCountDiff: -10,
              },
              casual: {
                content: "Casual polished content",
                wordCount: 95,
                wordCountDiff: -15,
              },
              elaborate: {
                content: "Elaborate polished content with more details",
                wordCount: 150,
                wordCountDiff: 25,
              },
              concise: {
                content: "Brief content",
                wordCount: 50,
                wordCountDiff: -50,
              },
            },
          },
        }),
      });

      render(
        <PolishDraftModal
          isOpen={true}
          roughDraft={mockRoughDraft}
          onClose={mockOnClose}
          onSelectVersion={mockOnSelectVersion}
        />
      );

      // Wait for API call to complete
      await waitFor(() => {
        expect(screen.getByText("Formal polished content")).toBeInTheDocument();
      });

      // Check for all 4 style cards by their unique content
      expect(screen.getByText("Formal polished content")).toBeInTheDocument();
      expect(screen.getByText("Casual polished content")).toBeInTheDocument();
      expect(screen.getByText("Elaborate polished content with more details")).toBeInTheDocument();
      expect(screen.getByText("Brief content")).toBeInTheDocument();

      // Check for 2x2 grid layout
      const gridContainer = screen.getByTestId("polish-draft-grid");
      expect(gridContainer).toHaveClass("grid-cols-1");
      expect(gridContainer).toHaveClass("md:grid-cols-2");
    });

    it("should display all four polished versions", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            polishDraft: {
              formal: {
                content: "Formal version",
                wordCount: 100,
                wordCountDiff: -10,
              },
              casual: {
                content: "Casual version",
                wordCount: 95,
                wordCountDiff: -15,
              },
              elaborate: {
                content: "Elaborate version",
                wordCount: 150,
                wordCountDiff: 25,
              },
              concise: {
                content: "Concise version",
                wordCount: 50,
                wordCountDiff: -50,
              },
            },
          },
        }),
      });

      render(
        <PolishDraftModal
          isOpen={true}
          roughDraft={mockRoughDraft}
          onClose={mockOnClose}
          onSelectVersion={mockOnSelectVersion}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("Formal version")).toBeInTheDocument();
      });

      expect(screen.getByText("Casual version")).toBeInTheDocument();
      expect(screen.getByText("Elaborate version")).toBeInTheDocument();
      expect(screen.getByText("Concise version")).toBeInTheDocument();
    });
  });

  describe("17.7 Word Count Display", () => {
    it("should display word count for each version", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            polishDraft: {
              formal: {
                content: "Formal content",
                wordCount: 100,
                wordCountDiff: -10,
              },
              casual: {
                content: "Casual content",
                wordCount: 95,
                wordCountDiff: -15,
              },
              elaborate: {
                content: "Elaborate content",
                wordCount: 150,
                wordCountDiff: 25,
              },
              concise: {
                content: "Concise content",
                wordCount: 50,
                wordCountDiff: -50,
              },
            },
          },
        }),
      });

      render(
        <PolishDraftModal
          isOpen={true}
          roughDraft={mockRoughDraft}
          onClose={mockOnClose}
          onSelectVersion={mockOnSelectVersion}
        />
      );

      await waitFor(() => {
        const wordCounts = screen.getAllByText(/\d+ words/i);
        expect(wordCounts.length).toBeGreaterThanOrEqual(4);
      });

      // Check for specific word counts
      expect(screen.getByText("100 words")).toBeInTheDocument();
      expect(screen.getByText("95 words")).toBeInTheDocument();
      expect(screen.getByText("150 words")).toBeInTheDocument();
      expect(screen.getByText("50 words")).toBeInTheDocument();
    });

    it("should display word count difference percentage", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            polishDraft: {
              formal: {
                content: "Formal content",
                wordCount: 100,
                wordCountDiff: -10,
              },
              casual: {
                content: "Casual content",
                wordCount: 95,
                wordCountDiff: -15,
              },
              elaborate: {
                content: "Elaborate content",
                wordCount: 150,
                wordCountDiff: 25,
              },
              concise: {
                content: "Concise content",
                wordCount: 50,
                wordCountDiff: -50,
              },
            },
          },
        }),
      });

      render(
        <PolishDraftModal
          isOpen={true}
          roughDraft={mockRoughDraft}
          onClose={mockOnClose}
          onSelectVersion={mockOnSelectVersion}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/-10%/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/-15%/i)).toBeInTheDocument();
      expect(screen.getByText(/\+25%/i)).toBeInTheDocument();
      expect(screen.getByText(/-50%/i)).toBeInTheDocument();
    });
  });

  describe("17.8 Loading State", () => {
    it("should display loading skeletons for all 4 cards", () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves to keep loading state
      );

      render(
        <PolishDraftModal
          isOpen={true}
          roughDraft={mockRoughDraft}
          onClose={mockOnClose}
          onSelectVersion={mockOnSelectVersion}
        />
      );

      // Should show 4 loading skeletons (one for each style)
      const skeletons = screen.getAllByTestId("polish-draft-skeleton");
      expect(skeletons).toHaveLength(4);
    });

    it("should show loading indicator during AI refinement", () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      render(
        <PolishDraftModal
          isOpen={true}
          roughDraft={mockRoughDraft}
          onClose={mockOnClose}
          onSelectVersion={mockOnSelectVersion}
        />
      );

      expect(screen.getByText(/Polishing your draft/i)).toBeInTheDocument();
    });
  });

  describe("17.9 Use This Version Button", () => {
    it("should display Use This Version button on each card", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            polishDraft: {
              formal: {
                content: "Formal content",
                wordCount: 100,
                wordCountDiff: -10,
              },
              casual: {
                content: "Casual content",
                wordCount: 95,
                wordCountDiff: -15,
              },
              elaborate: {
                content: "Elaborate content",
                wordCount: 150,
                wordCountDiff: 25,
              },
              concise: {
                content: "Concise content",
                wordCount: 50,
                wordCountDiff: -50,
              },
            },
          },
        }),
      });

      render(
        <PolishDraftModal
          isOpen={true}
          roughDraft={mockRoughDraft}
          onClose={mockOnClose}
          onSelectVersion={mockOnSelectVersion}
        />
      );

      await waitFor(() => {
        const useButtons = screen.getAllByText(/Use This Version/i);
        expect(useButtons).toHaveLength(4);
      });
    });

    it("should call onSelectVersion when Use This Version is clicked", async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            polishDraft: {
              formal: {
                content: "Formal content",
                wordCount: 100,
                wordCountDiff: -10,
              },
              casual: {
                content: "Casual content",
                wordCount: 95,
                wordCountDiff: -15,
              },
              elaborate: {
                content: "Elaborate content",
                wordCount: 150,
                wordCountDiff: 25,
              },
              concise: {
                content: "Concise content",
                wordCount: 50,
                wordCountDiff: -50,
              },
            },
          },
        }),
      });

      render(
        <PolishDraftModal
          isOpen={true}
          roughDraft={mockRoughDraft}
          onClose={mockOnClose}
          onSelectVersion={mockOnSelectVersion}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("Formal content")).toBeInTheDocument();
      });

      const useButtons = screen.getAllByText(/Use This Version/i);
      await user.click(useButtons[0]);

      expect(mockOnSelectVersion).toHaveBeenCalledWith("Formal content");
    });
  });

  describe("17.10 Error Handling", () => {
    it("should display error message when API fails", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("API Error")
      );

      render(
        <PolishDraftModal
          isOpen={true}
          roughDraft={mockRoughDraft}
          onClose={mockOnClose}
          onSelectVersion={mockOnSelectVersion}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Failed to polish draft/i)).toBeInTheDocument();
      });
    });

    it("should show Try Again button on error", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("API Error")
      );

      render(
        <PolishDraftModal
          isOpen={true}
          roughDraft={mockRoughDraft}
          onClose={mockOnClose}
          onSelectVersion={mockOnSelectVersion}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Try Again/i)).toBeInTheDocument();
      });
    });

    it("should retry when Try Again is clicked", async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error("API Error"))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              polishDraft: {
                formal: {
                  content: "Formal content",
                  wordCount: 100,
                  wordCountDiff: -10,
                },
                casual: {
                  content: "Casual content",
                  wordCount: 95,
                  wordCountDiff: -15,
                },
                elaborate: {
                  content: "Elaborate content",
                  wordCount: 150,
                  wordCountDiff: 25,
                },
                concise: {
                  content: "Concise content",
                  wordCount: 50,
                  wordCountDiff: -50,
                },
              },
            },
          }),
        });

      render(
        <PolishDraftModal
          isOpen={true}
          roughDraft={mockRoughDraft}
          onClose={mockOnClose}
          onSelectVersion={mockOnSelectVersion}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Try Again/i)).toBeInTheDocument();
      });

      const tryAgainButton = screen.getByText(/Try Again/i);
      await user.click(tryAgainButton);

      await waitFor(() => {
        expect(screen.getByText("Formal content")).toBeInTheDocument();
      });
    });
  });

  describe("17.11 Modal Close", () => {
    it("should call onClose when Cancel is clicked", async () => {
      const user = userEvent.setup();

      render(
        <PolishDraftModal
          isOpen={true}
          roughDraft={mockRoughDraft}
          onClose={mockOnClose}
          onSelectVersion={mockOnSelectVersion}
        />
      );

      const cancelButton = screen.getByText(/Cancel/i);
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should close modal after version selection", async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            polishDraft: {
              formal: {
                content: "Formal content",
                wordCount: 100,
                wordCountDiff: -10,
              },
              casual: {
                content: "Casual content",
                wordCount: 95,
                wordCountDiff: -15,
              },
              elaborate: {
                content: "Elaborate content",
                wordCount: 150,
                wordCountDiff: 25,
              },
              concise: {
                content: "Concise content",
                wordCount: 50,
                wordCountDiff: -50,
              },
            },
          },
        }),
      });

      render(
        <PolishDraftModal
          isOpen={true}
          roughDraft={mockRoughDraft}
          onClose={mockOnClose}
          onSelectVersion={mockOnSelectVersion}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("Formal content")).toBeInTheDocument();
      });

      const useButtons = screen.getAllByText(/Use This Version/i);
      await user.click(useButtons[0]);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("17.12 GraphQL Integration", () => {
    it("should make GraphQL request with correct variables", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            polishDraft: {
              formal: {
                content: "Formal",
                wordCount: 100,
                wordCountDiff: -10,
              },
              casual: {
                content: "Casual",
                wordCount: 95,
                wordCountDiff: -15,
              },
              elaborate: {
                content: "Elaborate",
                wordCount: 150,
                wordCountDiff: 25,
              },
              concise: {
                content: "Concise",
                wordCount: 50,
                wordCountDiff: -50,
              },
            },
          },
        }),
      });

      render(
        <PolishDraftModal
          isOpen={true}
          roughDraft={mockRoughDraft}
          contextType="FOLLOW_UP"
          onClose={mockOnClose}
          onSelectVersion={mockOnSelectVersion}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.query).toContain("polishDraft");
      expect(requestBody.variables.input.roughDraft).toBe(mockRoughDraft);
      expect(requestBody.variables.input.contextType).toBe("FOLLOW_UP");
    });
  });
});
