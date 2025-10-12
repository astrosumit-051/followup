'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ContactDeleteDialogProps {
  /**
   * Whether the dialog is open
   */
  isOpen: boolean;

  /**
   * Contact name to display in confirmation
   */
  contactName: string;

  /**
   * Loading state during deletion
   */
  isDeleting?: boolean;

  /**
   * Confirm delete handler
   */
  onConfirm: () => void | Promise<void>;

  /**
   * Cancel handler
   */
  onCancel: () => void;
}

/**
 * ContactDeleteDialog Component
 *
 * Confirmation dialog for deleting a contact using shadcn/ui AlertDialog.
 * Prevents accidental deletions with explicit confirmation.
 *
 * Features:
 * - Modal overlay with backdrop (via AlertDialog)
 * - Contact name display for clarity
 * - Warning message about permanent action
 * - Loading state during deletion
 * - Keyboard navigation (Escape to cancel) - built into AlertDialog
 * - Accessible ARIA attributes - built into AlertDialog
 * - Focus trap - built into AlertDialog
 * - Dark mode support via design tokens
 *
 * @example
 * ```tsx
 * const [isDialogOpen, setIsDialogOpen] = useState(false);
 * const [isDeleting, setIsDeleting] = useState(false);
 *
 * <ContactDeleteDialog
 *   isOpen={isDialogOpen}
 *   contactName={contact.name}
 *   isDeleting={isDeleting}
 *   onConfirm={async () => {
 *     setIsDeleting(true);
 *     await deleteContact(contact.id);
 *     setIsDeleting(false);
 *     setIsDialogOpen(false);
 *   }}
 *   onCancel={() => setIsDialogOpen(false)}
 * />
 * ```
 */
export function ContactDeleteDialog({
  isOpen,
  contactName,
  isDeleting = false,
  onConfirm,
  onCancel,
}: ContactDeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Contact</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-semibold text-foreground">
              {contactName}
            </span>
            ? This action cannot be undone and will permanently remove this
            contact from your network.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Deleting...
              </>
            ) : (
              'Confirm'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
