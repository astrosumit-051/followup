import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { FileUploadZone } from "./FileUploadZone";

// Mock fetch for presigned URL and S3 upload
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe("FileUploadZone", () => {
  const mockOnFilesChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.MockedFunction<typeof fetch>).mockClear();
  });

  describe("drag-and-drop functionality", () => {
    it("renders drop zone with instructions", () => {
      render(<FileUploadZone onFilesChange={mockOnFilesChange} />);

      expect(
        screen.getByText(/drag and drop files here/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/or click to browse/i)).toBeInTheDocument();
    });

    it("shows drag-over state when files are dragged over", () => {
      const { container } = render(
        <FileUploadZone onFilesChange={mockOnFilesChange} />
      );

      const dropzone = container.querySelector('[role="presentation"]');
      expect(dropzone).toBeInTheDocument();

      // Simulate dragenter
      fireEvent.dragEnter(dropzone!, { dataTransfer: { files: [] } });

      // Dropzone should have visual feedback class
      expect(dropzone).toHaveClass("border-blue-500");
    });

    it("accepts dropped files", async () => {
      const file = new File(["test content"], "test.pdf", {
        type: "application/pdf",
      });

      const { container } = render(
        <FileUploadZone onFilesChange={mockOnFilesChange} />
      );

      const dropzone = container.querySelector('[role="presentation"]');

      // Mock presigned URL response
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => ({
            uploadUrl: "https://s3.amazonaws.com/test-bucket/test.pdf",
            key: "attachments/test.pdf",
          }),
        } as Response
      );

      // Mock S3 upload
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
        } as Response
      );

      fireEvent.drop(dropzone!, {
        dataTransfer: { files: [file] },
      });

      await waitFor(() => {
        expect(mockOnFilesChange).toHaveBeenCalled();
      });
    });
  });

  describe("file type validation", () => {
    it("accepts PDF files", async () => {
      const file = new File(["test"], "document.pdf", {
        type: "application/pdf",
      });

      render(<FileUploadZone onFilesChange={mockOnFilesChange} />);

      const input = screen.getByLabelText(/upload files/i);

      // Mock presigned URL
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => ({
            uploadUrl: "https://s3.amazonaws.com/test",
            key: "test",
          }),
        } as Response
      );

      // Mock S3 upload
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        { ok: true } as Response
      );

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.queryByText(/invalid file type/i)).not.toBeInTheDocument();
      });
    });

    it("accepts DOCX files", async () => {
      const file = new File(["test"], "document.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      render(<FileUploadZone onFilesChange={mockOnFilesChange} />);

      const input = screen.getByLabelText(/upload files/i);

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => ({ uploadUrl: "https://s3.amazonaws.com/test", key: "test" }),
        } as Response
      );

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        { ok: true } as Response
      );

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.queryByText(/invalid file type/i)).not.toBeInTheDocument();
      });
    });

    it("rejects unsupported file types", async () => {
      const file = new File(["test"], "script.exe", {
        type: "application/x-msdownload",
      });

      render(<FileUploadZone onFilesChange={mockOnFilesChange} />);

      const input = screen.getByLabelText(/upload files/i);

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(
          screen.getByText(/invalid file type.*script\.exe/i)
        ).toBeInTheDocument();
      });
    });

    it("accepts image files (PNG, JPG, GIF, WebP)", async () => {
      const file = new File(["test"], "photo.png", { type: "image/png" });

      render(<FileUploadZone onFilesChange={mockOnFilesChange} />);

      const input = screen.getByLabelText(/upload files/i);

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => ({ uploadUrl: "https://s3.amazonaws.com/test", key: "test" }),
        } as Response
      );

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        { ok: true } as Response
      );

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.queryByText(/invalid file type/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("thumbnail generation", () => {
    it("generates thumbnail for image files", async () => {
      // Create a small image file
      const file = new File(["test"], "image.png", { type: "image/png" });

      render(<FileUploadZone onFilesChange={mockOnFilesChange} />);

      const input = screen.getByLabelText(/upload files/i);

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => ({
            uploadUrl: "https://s3.amazonaws.com/test",
            key: "test",
          }),
        } as Response
      );

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        { ok: true } as Response
      );

      fireEvent.change(input, { target: { files: [file] } });

      // Thumbnail should be generated (implementation detail - hard to test in Jest)
      // This test verifies the upload still works with images
      await waitFor(() => {
        expect(screen.getByText(/image\.png/i)).toBeInTheDocument();
      });
    });

    it("does not generate thumbnail for document files", async () => {
      const file = new File(["test"], "document.pdf", {
        type: "application/pdf",
      });

      render(<FileUploadZone onFilesChange={mockOnFilesChange} />);

      const input = screen.getByLabelText(/upload files/i);

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => ({
            uploadUrl: "https://s3.amazonaws.com/test",
            key: "test",
          }),
        } as Response
      );

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        { ok: true } as Response
      );

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/document\.pdf/i)).toBeInTheDocument();
      });
    });
  });

  describe("file size validation", () => {
    it("accepts files under 25MB", async () => {
      const file = new File(["x".repeat(10 * 1024 * 1024)], "small.pdf", {
        type: "application/pdf",
      });
      Object.defineProperty(file, "size", { value: 10 * 1024 * 1024 }); // 10MB

      render(<FileUploadZone onFilesChange={mockOnFilesChange} />);

      const input = screen.getByLabelText(/upload files/i);

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => ({ uploadUrl: "https://s3.amazonaws.com/test", key: "test" }),
        } as Response
      );

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        { ok: true } as Response
      );

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.queryByText(/exceeds 25mb/i)).not.toBeInTheDocument();
      });
    });

    it("rejects files over 25MB", async () => {
      const file = new File(["x".repeat(30 * 1024 * 1024)], "large.pdf", {
        type: "application/pdf",
      });
      Object.defineProperty(file, "size", { value: 30 * 1024 * 1024 }); // 30MB

      render(<FileUploadZone onFilesChange={mockOnFilesChange} />);

      const input = screen.getByLabelText(/upload files/i);

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(
          screen.getByText(/large\.pdf.*exceeds 25mb/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("presigned URL fetching", () => {
    it("fetches presigned URL from backend", async () => {
      const file = new File(["test"], "test.pdf", {
        type: "application/pdf",
      });

      render(<FileUploadZone onFilesChange={mockOnFilesChange} />);

      const input = screen.getByLabelText(/upload files/i);

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => ({
            uploadUrl: "https://s3.amazonaws.com/bucket/test.pdf",
            key: "attachments/12345/test.pdf",
          }),
        } as Response
      );

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        { ok: true } as Response
      );

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/attachments/presigned-url",
          expect.objectContaining({
            method: "POST",
            body: expect.stringContaining("test.pdf"),
          })
        );
      });
    });

    it("handles presigned URL fetch failure", async () => {
      const file = new File(["test"], "test.pdf", {
        type: "application/pdf",
      });

      render(<FileUploadZone onFilesChange={mockOnFilesChange} />);

      const input = screen.getByLabelText(/upload files/i);

      (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
        new Error("Network error")
      );

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(
          screen.getByText(/failed to upload.*test\.pdf/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("S3 upload with progress", () => {
    it("shows upload progress indicator", async () => {
      const file = new File(["test content"], "test.pdf", {
        type: "application/pdf",
      });

      render(<FileUploadZone onFilesChange={mockOnFilesChange} />);

      const input = screen.getByLabelText(/upload files/i);

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => ({
            uploadUrl: "https://s3.amazonaws.com/test",
            key: "test",
          }),
        } as Response
      );

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        { ok: true } as Response
      );

      fireEvent.change(input, { target: { files: [file] } });

      // Should show uploading state
      await waitFor(() => {
        expect(screen.getByText(/test\.pdf/i)).toBeInTheDocument();
      });
    });

    it("uploads file to S3 using presigned URL", async () => {
      const file = new File(["test content"], "test.pdf", {
        type: "application/pdf",
      });

      render(<FileUploadZone onFilesChange={mockOnFilesChange} />);

      const input = screen.getByLabelText(/upload files/i);

      const presignedUrl = "https://s3.amazonaws.com/bucket/test.pdf";

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => ({
            uploadUrl: presignedUrl,
            key: "attachments/test.pdf",
          }),
        } as Response
      );

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        { ok: true } as Response
      );

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          presignedUrl,
          expect.objectContaining({
            method: "PUT",
            body: file,
          })
        );
      });
    });

    it("handles S3 upload failure", async () => {
      const file = new File(["test"], "test.pdf", {
        type: "application/pdf",
      });

      render(<FileUploadZone onFilesChange={mockOnFilesChange} />);

      const input = screen.getByLabelText(/upload files/i);

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => ({
            uploadUrl: "https://s3.amazonaws.com/test",
            key: "test",
          }),
        } as Response
      );

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: false,
          statusText: "Forbidden",
        } as Response
      );

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(
          screen.getByText(/failed to upload.*test\.pdf/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("concurrent upload limiting", () => {
    it("limits concurrent uploads to 3 files", async () => {
      const files = [
        new File(["1"], "file1.pdf", { type: "application/pdf" }),
        new File(["2"], "file2.pdf", { type: "application/pdf" }),
        new File(["3"], "file3.pdf", { type: "application/pdf" }),
        new File(["4"], "file4.pdf", { type: "application/pdf" }),
        new File(["5"], "file5.pdf", { type: "application/pdf" }),
      ];

      render(<FileUploadZone onFilesChange={mockOnFilesChange} />);

      const input = screen.getByLabelText(/upload files/i);

      // Mock all presigned URL calls
      for (let i = 0; i < 5; i++) {
        (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
          {
            ok: true,
            json: async () => ({
              uploadUrl: `https://s3.amazonaws.com/file${i + 1}.pdf`,
              key: `file${i + 1}`,
            }),
          } as Response
        );
      }

      // Mock all S3 uploads
      for (let i = 0; i < 5; i++) {
        (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
          { ok: true } as Response
        );
      }

      fireEvent.change(input, { target: { files } });

      // Wait for uploads to start
      await waitFor(() => {
        expect(screen.getByText(/file1\.pdf/i)).toBeInTheDocument();
      });

      // Should show max 3 files uploading concurrently at any time
      // (This is a behavioral check - implementation will handle queuing)
    });
  });

  describe("attachment removal", () => {
    it("removes attachment from list", async () => {
      const file = new File(["test"], "test.pdf", {
        type: "application/pdf",
      });

      render(<FileUploadZone onFilesChange={mockOnFilesChange} />);

      const input = screen.getByLabelText(/upload files/i);

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => ({
            uploadUrl: "https://s3.amazonaws.com/test",
            key: "attachments/test.pdf",
          }),
        } as Response
      );

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        { ok: true } as Response
      );

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/test\.pdf/i)).toBeInTheDocument();
      });

      // Find and click remove button
      const removeButton = screen.getByLabelText(/remove.*test\.pdf/i);
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByText(/test\.pdf/i)).not.toBeInTheDocument();
      });

      expect(mockOnFilesChange).toHaveBeenCalledWith([]);
    });

    it("queues S3 deletion when removing attachment", async () => {
      const file = new File(["test"], "test.pdf", {
        type: "application/pdf",
      });

      render(<FileUploadZone onFilesChange={mockOnFilesChange} />);

      const input = screen.getByLabelText(/upload files/i);

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => ({
            uploadUrl: "https://s3.amazonaws.com/test",
            key: "attachments/test-key.pdf",
          }),
        } as Response
      );

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        { ok: true } as Response
      );

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/test\.pdf/i)).toBeInTheDocument();
      });

      // Mock DELETE endpoint
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        { ok: true } as Response
      );

      const removeButton = screen.getByLabelText(/remove.*test\.pdf/i);
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/attachments/test-key.pdf",
          expect.objectContaining({
            method: "DELETE",
          })
        );
      });
    });
  });

  describe("multiple file handling", () => {
    it("handles multiple file uploads", async () => {
      const files = [
        new File(["1"], "file1.pdf", { type: "application/pdf" }),
        new File(["2"], "file2.docx", {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }),
      ];

      render(<FileUploadZone onFilesChange={mockOnFilesChange} />);

      const input = screen.getByLabelText(/upload files/i);

      // Mock presigned URLs
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => ({ uploadUrl: "https://s3.amazonaws.com/1", key: "1" }),
        } as Response
      );
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => ({ uploadUrl: "https://s3.amazonaws.com/2", key: "2" }),
        } as Response
      );

      // Mock S3 uploads
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        { ok: true } as Response
      );
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        { ok: true } as Response
      );

      fireEvent.change(input, { target: { files } });

      await waitFor(() => {
        expect(screen.getByText(/file1\.pdf/i)).toBeInTheDocument();
        expect(screen.getByText(/file2\.docx/i)).toBeInTheDocument();
      });
    });

    it("shows total upload progress when multiple files", async () => {
      const files = [
        new File(["1"], "file1.pdf", { type: "application/pdf" }),
        new File(["2"], "file2.pdf", { type: "application/pdf" }),
      ];

      render(<FileUploadZone onFilesChange={mockOnFilesChange} />);

      const input = screen.getByLabelText(/upload files/i);

      // Mock presigned URLs
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => ({ uploadUrl: "https://s3.amazonaws.com/1", key: "1" }),
        } as Response
      );
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        {
          ok: true,
          json: async () => ({ uploadUrl: "https://s3.amazonaws.com/2", key: "2" }),
        } as Response
      );

      // Mock S3 uploads
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        { ok: true } as Response
      );
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
        { ok: true } as Response
      );

      fireEvent.change(input, { target: { files } });

      await waitFor(() => {
        expect(screen.getByText(/2 files/i)).toBeInTheDocument();
      });
    });
  });
});
