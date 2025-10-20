"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

/**
 * File Upload Zone Component for Email Attachments
 *
 * Features:
 * - Drag-and-drop file upload
 * - File type validation (PDF, DOC, DOCX, XLS, XLSX)
 * - File size validation (25MB max per file)
 * - Direct S3 upload via presigned URLs
 * - Upload progress indicators
 * - Concurrent upload limiting (max 3 files)
 * - Attachment removal with S3 cleanup
 *
 * @param onFilesChange - Callback with updated attachment list
 */

export interface Attachment {
  key: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadProgress: number;
  status: "uploading" | "completed" | "error";
  error?: string;
  thumbnail?: string; // Base64 data URL for image previews
}

interface FileUploadZoneProps {
  onFilesChange: (attachments: Attachment[]) => void;
  maxFileSize?: number; // In bytes (default: 25MB)
  maxConcurrentUploads?: number; // Default: 3
}

const ALLOWED_FILE_TYPES = {
  // Documents
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  // Images
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/gif": [".gif"],
  "image/webp": [".webp"],
};

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export function FileUploadZone({
  onFilesChange,
  maxFileSize = MAX_FILE_SIZE,
  maxConcurrentUploads = 3,
}: FileUploadZoneProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);
  const [activeUploads, setActiveUploads] = useState<number>(0);

  /**
   * Validate file type and size
   */
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
      return `Invalid file type: ${file.name}. Allowed: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, GIF, WebP`;
    }

    // Check file size
    if (file.size > maxFileSize) {
      return `${file.name} exceeds 25MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`;
    }

    return null;
  };

  /**
   * Generate thumbnail for image files
   */
  const generateThumbnail = async (file: File): Promise<string | null> => {
    // Only generate thumbnails for images
    if (!file.type.startsWith("image/")) {
      return null;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          // Create canvas for thumbnail
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            resolve(null);
            return;
          }

          // Calculate thumbnail dimensions (max 200x200, maintain aspect ratio)
          const maxSize = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw image to canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 data URL
          const thumbnailDataUrl = canvas.toDataURL("image/jpeg", 0.8);
          resolve(thumbnailDataUrl);
        };

        img.onerror = () => {
          resolve(null);
        };

        img.src = e.target?.result as string;
      };

      reader.onerror = () => {
        resolve(null);
      };

      reader.readAsDataURL(file);
    });
  };

  /**
   * Fetch presigned URL from backend
   */
  const fetchPresignedUrl = async (
    fileName: string,
    fileType: string
  ): Promise<{ uploadUrl: string; key: string }> => {
    const response = await fetch("/api/attachments/presigned-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName,
        fileType,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get presigned URL");
    }

    return response.json();
  };

  /**
   * Upload file to S3 using presigned URL
   */
  const uploadToS3 = async (
    file: File,
    uploadUrl: string,
    onProgress: (progress: number) => void
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          resolve();
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Network error during upload"));
      });

      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    });
  };

  /**
   * Process file upload
   */
  const processFileUpload = async (file: File) => {
    // Generate thumbnail for images
    const thumbnail = await generateThumbnail(file);

    const tempAttachment: Attachment = {
      key: "", // Will be set after presigned URL fetch
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadProgress: 0,
      status: "uploading",
      thumbnail: thumbnail || undefined,
    };

    // Add to attachments list
    setAttachments((prev) => {
      const updated = [...prev, tempAttachment];
      return updated;
    });

    try {
      // Step 1: Fetch presigned URL
      const { uploadUrl, key } = await fetchPresignedUrl(file.name, file.type);

      tempAttachment.key = key;

      // Step 2: Upload to S3
      await uploadToS3(file, uploadUrl, (progress) => {
        setAttachments((prev) =>
          prev.map((att) =>
            att.fileName === file.name && att.key === key
              ? { ...att, uploadProgress: progress }
              : att
          )
        );
      });

      // Step 3: Mark as completed
      setAttachments((prev) => {
        const updated = prev.map((att) =>
          att.fileName === file.name && att.key === key
            ? { ...att, status: "completed" as const, uploadProgress: 100 }
            : att
        );
        onFilesChange(updated);
        return updated;
      });
    } catch (error) {
      // Mark as error
      setAttachments((prev) => {
        const updated = prev.map((att) =>
          att.fileName === file.name
            ? {
                ...att,
                status: "error" as const,
                error:
                  error instanceof Error
                    ? error.message
                    : `Failed to upload ${file.name}`,
              }
            : att
        );
        onFilesChange(updated);
        return updated;
      });
    } finally {
      setActiveUploads((prev) => prev - 1);
    }
  };

  /**
   * Handle file drop/selection
   */
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const validFiles: File[] = [];
      const errors: string[] = [];

      acceptedFiles.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          errors.push(error);
        } else {
          validFiles.push(file);
        }
      });

      // Show errors
      if (errors.length > 0) {
        errors.forEach((error) => {
          setAttachments((prev) => [
            ...prev,
            {
              key: "",
              fileName: error.split(":")[1]?.trim() || "Unknown file",
              fileSize: 0,
              fileType: "",
              uploadProgress: 0,
              status: "error",
              error,
            },
          ]);
        });
      }

      // Add valid files to upload queue
      if (validFiles.length > 0) {
        setUploadQueue((prev) => [...prev, ...validFiles]);
      }
    },
    []
  );

  /**
   * Process upload queue when it changes or active uploads decrease
   */
  const processQueue = useCallback(() => {
    if (uploadQueue.length === 0 || activeUploads >= maxConcurrentUploads) {
      return;
    }

    const file = uploadQueue[0];
    setUploadQueue((prev) => prev.slice(1));
    setActiveUploads((prev) => prev + 1);

    processFileUpload(file);
  }, [uploadQueue, activeUploads, maxConcurrentUploads]);

  // Trigger queue processing
  useEffect(() => {
    processQueue();
  }, [uploadQueue, activeUploads, processQueue]);

  /**
   * Remove attachment
   */
  const removeAttachment = async (attachment: Attachment) => {
    // Remove from UI
    setAttachments((prev) => {
      const updated = prev.filter((att) => att.key !== attachment.key);
      onFilesChange(updated);
      return updated;
    });

    // Queue S3 deletion (fire and forget)
    if (attachment.key && attachment.status === "completed") {
      try {
        await fetch(`/api/attachments/${attachment.key}`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Failed to delete attachment from S3:", error);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_FILE_TYPES,
    multiple: true,
  });

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
              : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
          }`}
      >
        <input {...getInputProps()} aria-label="Upload files" />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isDragActive
            ? "Drop files here..."
            : "Drag and drop files here, or click to browse"}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          Allowed: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, GIF, WebP (max 25MB per file)
        </p>
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {attachments.length} {attachments.length === 1 ? "file" : "files"}
          </p>

          {attachments.map((attachment, index) => (
            <div
              key={`${attachment.key}-${index}`}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
            >
              {/* File Icon or Thumbnail */}
              {attachment.thumbnail ? (
                <img
                  src={attachment.thumbnail}
                  alt={attachment.fileName}
                  className="h-12 w-12 object-cover rounded flex-shrink-0"
                />
              ) : (
                <FileText className="h-5 w-5 text-gray-500 flex-shrink-0" />
              )}

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {attachment.fileName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>

                  {/* Status */}
                  {attachment.status === "uploading" && (
                    <>
                      <span className="text-xs text-gray-400">•</span>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        {attachment.uploadProgress}%
                      </p>
                    </>
                  )}

                  {attachment.status === "completed" && (
                    <>
                      <span className="text-xs text-gray-400">•</span>
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </>
                  )}

                  {attachment.status === "error" && (
                    <>
                      <span className="text-xs text-gray-400">•</span>
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <p className="text-xs text-red-600 dark:text-red-400">
                          {attachment.error}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Progress Bar */}
                {attachment.status === "uploading" && (
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 dark:bg-blue-400 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${attachment.uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Remove Button */}
              {(attachment.status === "completed" ||
                attachment.status === "error") && (
                <button
                  onClick={() => removeAttachment(attachment)}
                  aria-label={`Remove ${attachment.fileName}`}
                  className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>
              )}

              {attachment.status === "uploading" && (
                <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Queue Indicator */}
      {uploadQueue.length > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {uploadQueue.length} file{uploadQueue.length === 1 ? "" : "s"} in queue
        </p>
      )}
    </div>
  );
}
