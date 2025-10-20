"use client";

import { useState } from "react";
import { Pen, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { TipTapEditor } from "@/components/email/TipTapEditor";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Signature Manager Component
 *
 * Features:
 * - Display list of email signatures with preview cards
 * - Create new signatures with TipTap editor
 * - Edit existing signatures
 * - Delete signatures with confirmation
 * - Set default flags (global, formal, casual)
 * - Enforce max 10 signatures limit
 * - Validation and error handling
 *
 * @param signatures - List of user's email signatures
 * @param onCreate - Callback to create new signature
 * @param onUpdate - Callback to update existing signature
 * @param onDelete - Callback to delete signature
 */

export interface EmailSignature {
  id: string;
  name: string;
  contentJson: Record<string, any>;
  contentHtml: string;
  isDefaultForFormal: boolean;
  isDefaultForCasual: boolean;
  isGlobalDefault: boolean;
}

interface SignatureFormData {
  name: string;
  contentJson: Record<string, any>;
  contentHtml: string;
  isDefaultForFormal: boolean;
  isDefaultForCasual: boolean;
  isGlobalDefault: boolean;
}

interface SignatureManagerProps {
  signatures: EmailSignature[];
  onCreate: (data: SignatureFormData) => Promise<void>;
  onUpdate: (
    id: string,
    data: Partial<SignatureFormData>
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const MAX_SIGNATURES = 10;

export function SignatureManager({
  signatures,
  onCreate,
  onUpdate,
  onDelete,
}: SignatureManagerProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSignature, setEditingSignature] = useState<EmailSignature | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingSignature, setDeletingSignature] = useState<EmailSignature | null>(
    null
  );

  const [formData, setFormData] = useState<SignatureFormData>({
    name: "",
    contentJson: { type: "doc", content: [] },
    contentHtml: "",
    isDefaultForFormal: false,
    isDefaultForCasual: false,
    isGlobalDefault: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    content?: string;
  }>({});

  /**
   * Reset form data
   */
  const resetForm = () => {
    setFormData({
      name: "",
      contentJson: { type: "doc", content: [] },
      contentHtml: "",
      isDefaultForFormal: false,
      isDefaultForCasual: false,
      isGlobalDefault: false,
    });
    setValidationErrors({});
    setError(null);
  };

  /**
   * Open create modal
   */
  const handleCreate = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  /**
   * Open edit modal
   */
  const handleEdit = (signature: EmailSignature) => {
    setEditingSignature(signature);
    setFormData({
      name: signature.name,
      contentJson: signature.contentJson,
      contentHtml: signature.contentHtml,
      isDefaultForFormal: signature.isDefaultForFormal,
      isDefaultForCasual: signature.isDefaultForCasual,
      isGlobalDefault: signature.isGlobalDefault,
    });
    setValidationErrors({});
    setError(null);
    setIsEditModalOpen(true);
  };

  /**
   * Open delete confirmation
   */
  const handleDeleteClick = (signature: EmailSignature) => {
    setDeletingSignature(signature);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const errors: { name?: string; content?: string } = {};

    if (!formData.name.trim()) {
      errors.name = "Signature name is required";
    }

    if (!formData.contentHtml || formData.contentHtml.trim() === "<p></p>") {
      errors.content = "Signature content is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle create signature submit
   */
  const handleCreateSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      await onCreate(formData);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create signature");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle update signature submit
   */
  const handleUpdateSubmit = async () => {
    if (!editingSignature || !validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      await onUpdate(editingSignature.id, formData);
      setIsEditModalOpen(false);
      setEditingSignature(null);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update signature");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle delete signature confirm
   */
  const handleDeleteConfirm = async () => {
    if (!deletingSignature) return;

    setIsLoading(true);
    setError(null);

    try {
      await onDelete(deletingSignature.id);
      setIsDeleteDialogOpen(false);
      setDeletingSignature(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete signature");
      setIsDeleteDialogOpen(false);
      setDeletingSignature(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get signature badge text
   */
  const getSignatureBadge = (signature: EmailSignature): string | null => {
    if (signature.isGlobalDefault) return "Global Default";
    if (signature.isDefaultForFormal) return "Default for Formal";
    if (signature.isDefaultForCasual) return "Default for Casual";
    return null;
  };

  const isMaxSignaturesReached = signatures.length >= MAX_SIGNATURES;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Email Signatures
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your email signatures for different contexts
          </p>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={isMaxSignaturesReached ? 0 : -1}>
                <Button
                  onClick={handleCreate}
                  disabled={isMaxSignaturesReached}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Signature
                </Button>
              </span>
            </TooltipTrigger>
            {isMaxSignaturesReached && (
              <TooltipContent>
                <p>Maximum 10 signatures allowed</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Signatures List */}
      {signatures.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
          <Pen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No signatures yet
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Create your first email signature to get started
          </p>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Signature
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {signatures.map((signature) => {
            const badge = getSignatureBadge(signature);

            return (
              <div
                key={signature.id}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {signature.name}
                    </h3>
                    {badge && (
                      <Badge variant="secondary" className="mt-1">
                        {badge}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(signature)}
                      aria-label={`Edit ${signature.name}`}
                    >
                      <Pen className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(signature)}
                      aria-label={`Delete ${signature.name}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </Button>
                  </div>
                </div>

                {/* Preview */}
                <div
                  className="text-sm text-gray-600 dark:text-gray-400 prose prose-sm max-w-none line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: signature.contentHtml }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog
        open={isCreateModalOpen || isEditModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
            setEditingSignature(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditModalOpen ? "Edit Signature" : "New Signature"}
            </DialogTitle>
            <DialogDescription>
              {isEditModalOpen
                ? "Update your email signature"
                : "Create a new email signature with rich formatting"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="signature-name">Signature Name</Label>
              <Input
                id="signature-name"
                placeholder="e.g., Formal, Casual, Sales Pitch"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                aria-label="Signature name"
              />
              {validationErrors.name && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {validationErrors.name}
                </p>
              )}
            </div>

            {/* Content Editor */}
            <div className="space-y-2">
              <Label>Signature Content</Label>
              <TipTapEditor
                content={formData.contentJson}
                onChange={(json, html) =>
                  setFormData((prev) => ({
                    ...prev,
                    contentJson: json,
                    contentHtml: html,
                  }))
                }
              />
              {validationErrors.content && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {validationErrors.content}
                </p>
              )}
            </div>

            {/* Default Flags */}
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <Label className="text-sm font-medium">Default Settings</Label>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="global-default"
                  checked={formData.isGlobalDefault}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      isGlobalDefault: checked as boolean,
                    }))
                  }
                />
                <Label
                  htmlFor="global-default"
                  className="text-sm font-normal cursor-pointer"
                >
                  Set as Global Default
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="formal-default"
                  checked={formData.isDefaultForFormal}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      isDefaultForFormal: checked as boolean,
                    }))
                  }
                />
                <Label
                  htmlFor="formal-default"
                  className="text-sm font-normal cursor-pointer"
                >
                  Set as Default for Formal emails
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="casual-default"
                  checked={formData.isDefaultForCasual}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      isDefaultForCasual: checked as boolean,
                    }))
                  }
                />
                <Label
                  htmlFor="casual-default"
                  className="text-sm font-normal cursor-pointer"
                >
                  Set as Default for Casual emails
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setEditingSignature(null);
                resetForm();
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={isEditModalOpen ? handleUpdateSubmit : handleCreateSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              signature "{deletingSignature?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Deleting..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
