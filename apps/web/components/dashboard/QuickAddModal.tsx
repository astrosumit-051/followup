"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuickAddContact } from "@/lib/hooks/useDashboard";

/**
 * Quick Add Modal Props
 */
interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Form validation errors
 */
interface FormErrors {
  firstName?: string;
  email?: string;
  linkedInUrl?: string;
}

/**
 * Quick Add Modal Component
 *
 * Modal for quickly adding a new contact with minimal required fields
 * Features:
 * - Real-time validation with error messages
 * - Optimistic UI updates (increment contact count instantly)
 * - Success/error toast notifications
 * - Keyboard shortcuts (Enter to submit, Escape to close)
 * - Accessible form with proper labels
 */
export function QuickAddModal({ isOpen, onClose }: QuickAddModalProps) {
  const { toast } = useToast();
  const { mutate: createContact, isPending } = useQuickAddContact();

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    linkedInUrl: "",
    notes: "",
  });

  // Validation errors
  const [errors, setErrors] = useState<FormErrors>({});

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        linkedInUrl: "",
        notes: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  /**
   * Validate form fields
   */
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // First name is required
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    // Email is required
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      // Email format validation
      newErrors.email = "Invalid email format";
    }

    // LinkedIn URL validation (if provided)
    if (
      formData.linkedInUrl &&
      !/^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[\w-]+\/?$/.test(formData.linkedInUrl)
    ) {
      newErrors.linkedInUrl = "Invalid LinkedIn URL format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Combine first and last name
    const fullName = [formData.firstName, formData.lastName]
      .filter(Boolean)
      .join(" ");

    createContact(
      {
        name: fullName,
        email: formData.email, // Email is now required
        notes: formData.notes || undefined,
        linkedInUrl: formData.linkedInUrl || undefined,
      },
      {
        onSuccess: () => {
          toast({
            title: "Contact added successfully",
            description: `${fullName} has been added to your contacts.`,
          });
          onClose();
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to add contact",
            variant: "destructive",
          });
        },
      }
    );
  };

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter (if not in textarea)
    if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
      e.preventDefault();
      handleSubmit(e);
    }

    // Close on Escape
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            Quick Add Contact
          </DialogTitle>
          <DialogDescription>
            Add a new contact to your network. First name and email are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name (Required) */}
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium">
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="John"
              value={formData.firstName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, firstName: e.target.value }))
              }
              className={errors.firstName ? "border-red-500" : ""}
              autoFocus
            />
            {errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium">
              Last Name
            </Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Doe"
              value={formData.lastName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, lastName: e.target.value }))
              }
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john.doe@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              onBlur={() => {
                // Validate email format on blur
                if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                  setErrors((prev) => ({ ...prev, email: "Invalid email format" }));
                } else if (errors.email === "Invalid email format") {
                  // Clear the error if email is now valid
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* LinkedIn URL */}
          <div className="space-y-2">
            <Label htmlFor="linkedInUrl" className="text-sm font-medium">
              LinkedIn URL
            </Label>
            <Input
              id="linkedInUrl"
              name="linkedInUrl"
              placeholder="https://www.linkedin.com/in/johndoe"
              value={formData.linkedInUrl}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, linkedInUrl: e.target.value }))
              }
              className={errors.linkedInUrl ? "border-red-500" : ""}
            />
            {errors.linkedInUrl && (
              <p className="text-sm text-red-500">{errors.linkedInUrl}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes
            </Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Add any notes about this contact..."
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#0A0A0A] hover:bg-[#1A1A1A] text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
