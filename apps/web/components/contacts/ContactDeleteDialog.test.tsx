import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

import { ContactDeleteDialog } from './ContactDeleteDialog';

expect.extend(toHaveNoViolations);

describe('ContactDeleteDialog', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    isOpen: true,
    contactName: 'John Doe',
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Render', () => {
    it('does not show dialog content when isOpen is false', () => {
      render(<ContactDeleteDialog {...defaultProps} isOpen={false} />);

      // AlertDialog renders a hidden div, so we check that the dialog role is not present
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders dialog when isOpen is true', () => {
      render(<ContactDeleteDialog {...defaultProps} />);

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('displays contact name in confirmation message', () => {
      render(<ContactDeleteDialog {...defaultProps} />);

      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    });

    it('displays warning message about permanent action', () => {
      render(<ContactDeleteDialog {...defaultProps} />);

      expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument();
    });

    it('renders confirm button', () => {
      render(<ContactDeleteDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });

    it('renders cancel button', () => {
      render(<ContactDeleteDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('has modal dialog role', () => {
      render(<ContactDeleteDialog {...defaultProps} />);

      // AlertDialog renders with alertdialog role
      const dialog = screen.getByRole('alertdialog');
      expect(dialog).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();

      render(<ContactDeleteDialog {...defaultProps} />);

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      await user.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(<ContactDeleteDialog {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('does not close when dialog content is clicked', async () => {
      const user = userEvent.setup();

      render(<ContactDeleteDialog {...defaultProps} />);

      const dialog = screen.getByRole('alertdialog');
      await user.click(dialog);

      expect(mockOnCancel).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('shows "Deleting..." text when isDeleting is true', () => {
      render(<ContactDeleteDialog {...defaultProps} isDeleting={true} />);

      expect(screen.getByText('Deleting...')).toBeInTheDocument();
    });

    it('shows loading spinner when isDeleting is true', () => {
      render(<ContactDeleteDialog {...defaultProps} isDeleting={true} />);

      // Loading spinner is within the delete button
      const deleteButton = screen.getByRole('button', { name: /Deleting/ });
      expect(deleteButton).toContainHTML('animate-spin');
    });

    it('disables delete button when isDeleting is true', () => {
      render(<ContactDeleteDialog {...defaultProps} isDeleting={true} />);

      const deleteButton = screen.getByRole('button', { name: /Deleting/ });
      expect(deleteButton).toBeDisabled();
    });

    it('disables cancel button when isDeleting is true', () => {
      render(<ContactDeleteDialog {...defaultProps} isDeleting={true} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      expect(cancelButton).toBeDisabled();
    });

    it('shows "Confirm" text when not deleting', () => {
      render(<ContactDeleteDialog {...defaultProps} isDeleting={false} />);

      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('closes dialog when Escape key is pressed', async () => {
      const user = userEvent.setup();

      render(<ContactDeleteDialog {...defaultProps} />);

      // AlertDialog handles Escape internally, trigger via user.keyboard
      await user.keyboard('{Escape}');

      // AlertDialog's onOpenChange will call onCancel
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has accessible title', () => {
      render(<ContactDeleteDialog {...defaultProps} />);

      expect(screen.getByText('Delete Contact')).toBeInTheDocument();
    });

    it('has alertdialog role', () => {
      render(<ContactDeleteDialog {...defaultProps} />);

      // AlertDialog renders with alertdialog role
      const dialog = screen.getByRole('alertdialog');
      expect(dialog).toBeInTheDocument();
    });

    it('has aria-labelledby and aria-describedby', () => {
      render(<ContactDeleteDialog {...defaultProps} />);

      const dialog = screen.getByRole('alertdialog');

      // AlertDialog automatically sets up aria-labelledby and aria-describedby
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-describedby');
    });

    it('should have no accessibility violations', async () => {
      const { container } = render(<ContactDeleteDialog {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Different Contact Names', () => {
    it('handles long contact names', () => {
      render(
        <ContactDeleteDialog
          {...defaultProps}
          contactName="John Jacob Jingleheimer Schmidt IV"
        />
      );

      expect(screen.getByText(/John Jacob Jingleheimer Schmidt IV/)).toBeInTheDocument();
    });

    it('handles contact names with special characters', () => {
      render(
        <ContactDeleteDialog
          {...defaultProps}
          contactName="O'Brien-Smith & Associates"
        />
      );

      expect(screen.getByText(/O'Brien-Smith & Associates/)).toBeInTheDocument();
    });

    it('handles single word names', () => {
      render(<ContactDeleteDialog {...defaultProps} contactName="Madonna" />);

      expect(screen.getByText(/Madonna/)).toBeInTheDocument();
    });
  });
});
