"use client";

import React, { useState, useMemo } from "react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Edit2,
  Trash2,
  FileText,
  Plus,
  Loader2,
  Mail
} from "lucide-react";
import {
  useEmailTemplates,
  useCreateEmailTemplate,
  useUpdateEmailTemplate,
  useDeleteEmailTemplate,
} from "@/lib/hooks/useEmailTemplates";
import type {
  EmailTemplate,
  CreateEmailTemplateInput,
  UpdateEmailTemplateInput
} from "@/lib/graphql/email-templates";

/**
 * Template Library Props
 */
interface TemplateLibraryProps {
  /** Whether the library dialog is open */
  isOpen: boolean;
  /** Callback when dialog closes */
  onClose: () => void;
  /** Callback when a template is loaded into composer */
  onLoadTemplate?: (template: EmailTemplate) => void;
  /** Show "Save as Template" functionality */
  showSaveAs?: boolean;
  /** Pre-filled subject for save template modal */
  defaultSubject?: string;
  /** Pre-filled body for save template modal */
  defaultBody?: string;
}

/**
 * Template category options
 */
const TEMPLATE_CATEGORIES = [
  "follow-up",
  "introduction",
  "thank-you",
  "general",
] as const;

type TemplateCategory = typeof TEMPLATE_CATEGORIES[number];

/**
 * Category display config
 */
const CATEGORY_CONFIG: Record<TemplateCategory, { label: string; color: string }> = {
  "follow-up": { label: "Follow-up", color: "bg-blue-600 text-white" },
  "introduction": { label: "Introduction", color: "bg-purple-600 text-white" },
  "thank-you": { label: "Thank You", color: "bg-green-600 text-white" },
  "general": { label: "General", color: "bg-gray-600 text-white" },
};

/**
 * Template Library Component
 *
 * Provides UI for managing email templates:
 * - List templates grouped by category
 * - Preview template cards with hover effect
 * - Create, update, delete templates
 * - Load templates into composer
 */
export function TemplateLibrary({
  isOpen,
  onClose,
  onLoadTemplate,
  showSaveAs = false,
  defaultSubject = "",
  defaultBody = "",
}: TemplateLibraryProps) {
  // Query templates
  const { data: templates, isLoading, error } = useEmailTemplates();

  // Mutations
  const createTemplate = useCreateEmailTemplate();
  const updateTemplate = useUpdateEmailTemplate();
  const deleteTemplate = useDeleteEmailTemplate();

  // Modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    subject: defaultSubject,
    body: defaultBody,
    category: "general" as TemplateCategory,
  });

  // Group templates by category
  const templatesByCategory = useMemo(() => {
    if (!templates) return {};

    return templates.reduce((acc, template) => {
      const category = (template.category || "general") as TemplateCategory;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(template);
      return acc;
    }, {} as Record<TemplateCategory, EmailTemplate[]>);
  }, [templates]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      subject: defaultSubject,
      body: defaultBody,
      category: "general",
    });
  };

  // Handle save template
  const handleSaveTemplate = async () => {
    try {
      const input: CreateEmailTemplateInput = {
        name: formData.name,
        subject: formData.subject,
        body: formData.body,
        category: formData.category,
        isDefault: false,
      };

      await createTemplate.mutateAsync(input);
      setShowSaveModal(false);
      resetForm();
    } catch (err) {
      console.error("Failed to save template:", err);
    }
  };

  // Handle edit template
  const handleEditTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      const input: UpdateEmailTemplateInput = {
        name: formData.name,
        subject: formData.subject,
        body: formData.body,
        category: formData.category,
      };

      await updateTemplate.mutateAsync({
        id: selectedTemplate.id,
        input,
      });

      setShowEditModal(false);
      setSelectedTemplate(null);
      resetForm();
    } catch (err) {
      console.error("Failed to update template:", err);
    }
  };

  // Handle delete template
  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      await deleteTemplate.mutateAsync(selectedTemplate.id);
      setShowDeleteDialog(false);
      setSelectedTemplate(null);
    } catch (err) {
      console.error("Failed to delete template:", err);
    }
  };

  // Handle load template
  const handleLoadTemplate = (template: EmailTemplate) => {
    onLoadTemplate?.(template);
    onClose();
  };

  // Open edit modal
  const openEditModal = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      category: (template.category || "general") as TemplateCategory,
    });
    setShowEditModal(true);
  };

  // Open delete dialog
  const openDeleteDialog = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowDeleteDialog(true);
  };

  return (
    <>
      {/* Main Template Library Dialog */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Template Library</DialogTitle>
            <DialogDescription>
              Manage your email templates. Load, edit, or delete templates.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Save as Template Button (optional) */}
            {showSaveAs && (
              <>
                <Button
                  onClick={() => setShowSaveModal(true)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Save Current Draft as Template
                </Button>
                <Separator />
              </>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-1/3" data-testid="skeleton-loader" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" data-testid="skeleton-loader" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex items-center gap-3 p-4 border border-red-200 bg-red-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-800">
                  Failed to load templates: {error.message}
                </p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && (!templates || templates.length === 0) && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Templates Yet
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Create your first email template to get started
                </p>
                {showSaveAs && (
                  <Button onClick={() => setShowSaveModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                )}
              </div>
            )}

            {/* Templates List (Grouped by Category) */}
            {!isLoading && !error && templates && templates.length > 0 && (
              <div className="space-y-6">
                {TEMPLATE_CATEGORIES.map((category) => {
                  const categoryTemplates = templatesByCategory[category];
                  if (!categoryTemplates || categoryTemplates.length === 0) {
                    return null;
                  }

                  const config = CATEGORY_CONFIG[category];

                  return (
                    <div key={category}>
                      <div className="flex items-center gap-3 mb-4">
                        <Badge className={config.color}>
                          {config.label}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {categoryTemplates.length} {categoryTemplates.length === 1 ? "template" : "templates"}
                        </span>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        {categoryTemplates.map((template) => (
                          <Card
                            key={template.id}
                            className="hover:shadow-lg transition-shadow cursor-pointer"
                          >
                            <CardHeader>
                              <CardTitle className="text-base flex items-center justify-between">
                                <span className="truncate">{template.name}</span>
                                {template.isDefault && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    Default
                                  </Badge>
                                )}
                              </CardTitle>
                              <CardDescription className="truncate">
                                {template.subject}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                                {template.body}
                              </p>

                              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                <span>Used {template.usageCount} times</span>
                                <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleLoadTemplate(template)}
                                  className="flex-1"
                                >
                                  <Mail className="w-3 h-3 mr-1" />
                                  Load
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEditModal(template)}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openDeleteDialog(template)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Template Modal */}
      <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Create a reusable email template
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name *</Label>
              <Input
                id="template-name"
                placeholder="e.g., Follow-up Email"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as TemplateCategory })}
              >
                <SelectTrigger id="template-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_CONFIG[cat].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-subject">Subject *</Label>
              <Input
                id="template-subject"
                placeholder="Email subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-body">Body *</Label>
              <Textarea
                id="template-body"
                placeholder="Email body..."
                rows={6}
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSaveModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTemplate}
              disabled={!formData.name || !formData.subject || !formData.body || createTemplate.isPending}
            >
              {createTemplate.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update template details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-template-name">Template Name *</Label>
              <Input
                id="edit-template-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-template-category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as TemplateCategory })}
              >
                <SelectTrigger id="edit-template-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_CONFIG[cat].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-template-subject">Subject *</Label>
              <Input
                id="edit-template-subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-template-body">Body *</Label>
              <Textarea
                id="edit-template-body"
                rows={6}
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setSelectedTemplate(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditTemplate}
              disabled={!formData.name || !formData.subject || !formData.body || updateTemplate.isPending}
            >
              {updateTemplate.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedTemplate?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedTemplate(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteTemplate.isPending}
            >
              {deleteTemplate.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
