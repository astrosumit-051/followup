import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

import { ContactDeleteDialog } from './ContactDeleteDialog';

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
    it('renders nothing when isOpen is false', () => {
      const { container } = render(
        <ContactDeleteDialog {...defaultProps} isOpen={false} />
      );

      expect(container).toBeEmptyDOMElement();
    });

    it('renders dialog when isOpen is true', () => {
      render(<ContactDeleteDialog {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('displays contact name in confirmation message', () => {
      render(<ContactDeleteDialog {...defaultProps} />);

      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    });

    it('shows warning icon', () => {
      const { container } = render(<ContactDeleteDialog {...defaultProps} />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('displays warning message about permanent action', () => {
      render(<ContactDeleteDialog {...defaultProps} />);

      expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument();
    });

    it('renders delete button', () => {
      render(<ContactDeleteDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });

    it('renders cancel button', () => {
      render(<ContactDeleteDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('has modal dialog attributes', () => {
      render(<ContactDeleteDialog {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
  });

  describe('Interactions', () => {
    it('calls onConfirm when delete button is clicked', async () => {
      const user = userEvent.setup();

      render(<ContactDeleteDialog {...defaultProps} />);

      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      await user.click(deleteButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(<ContactDeleteDialog {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it.skip('calls onCancel when backdrop is clicked', async () => {
      const user = userEvent.setup();

      render(<ContactDeleteDialog {...defaultProps} />);

      const backdrop = screen.getByRole('dialog').parentElement;
      if (backdrop) {
        fireEvent.click(backdrop!);
        expect(mockOnCancel).toHaveBeenCalledTimes(1);
      }
    });

    it('does not close when dialog content is clicked', async () => {
      const user = userEvent.setup();

      render(<ContactDeleteDialog {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
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

    it('shows "Delete" text when not deleting', () => {
      render(<ContactDeleteDialog {...defaultProps} isDeleting={false} />);

      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('closes dialog when Escape key is pressed', async () => {
      const user = userEvent.setup();

      render(<ContactDeleteDialog {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('does not close on Escape when isDeleting is true', async () => {
      const user = userEvent.setup();

      render(<ContactDeleteDialog {...defaultProps} isDeleting={true} />);

      const dialog = screen.getByRole('dialog');
      fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });

      expect(mockOnCancel).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has accessible title', () => {
      render(<ContactDeleteDialog {...defaultProps} />);

      expect(screen.getByText('Delete Contact')).toBeInTheDocument();
    });

    it('has modal role', () => {
      render(<ContactDeleteDialog {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('has aria-labelledby pointing to title', () => {
      render(<ContactDeleteDialog {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');

      const title = screen.getByText('Delete Contact');
      expect(title).toHaveAttribute('id', 'modal-title');
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
