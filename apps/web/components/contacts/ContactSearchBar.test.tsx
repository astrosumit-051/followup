import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, jest } from '@jest/globals';
import { ContactSearchBar } from './ContactSearchBar';

describe('ContactSearchBar', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input with default placeholder', () => {
    render(<ContactSearchBar value="" onChange={mockOnChange} />);

    expect(screen.getByPlaceholderText('Search contacts...')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(
      <ContactSearchBar
        value=""
        onChange={mockOnChange}
        placeholder="Find someone..."
      />
    );

    expect(screen.getByPlaceholderText('Find someone...')).toBeInTheDocument();
  });

  it('displays current value', () => {
    render(<ContactSearchBar value="John Doe" onChange={mockOnChange} />);

    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
  });

  it('shows search icon', () => {
    const { container } = render(<ContactSearchBar value="" onChange={mockOnChange} />);

    const searchIcon = container.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
  });

  describe('Debouncing', () => {
    it('debounces onChange calls with default delay (300ms)', async () => {
      const user = userEvent.setup();

      render(<ContactSearchBar value="" onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Search contacts...');

      // Type quickly
      await user.type(input, 'John');

      // Should not call onChange immediately
      expect(mockOnChange).not.toHaveBeenCalled();

      // Wait for debounce delay
      await waitFor(
        () => {
          expect(mockOnChange).toHaveBeenCalledWith('John');
        },
        { timeout: 500 }
      );
    });

    it('uses custom debounce delay', async () => {
      const user = userEvent.setup();

      render(
        <ContactSearchBar
          value=""
          onChange={mockOnChange}
          debounceMs={100}
        />
      );

      const input = screen.getByPlaceholderText('Search contacts...');
      await user.type(input, 'Test');

      // Wait for custom debounce delay
      await waitFor(
        () => {
          expect(mockOnChange).toHaveBeenCalledWith('Test');
        },
        { timeout: 200 }
      );
    });

    it('cancels previous debounce timer when typing continues', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });

      render(<ContactSearchBar value="" onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Search contacts...');

      // Start typing
      await user.type(input, 'J');

      // Advance time partially (not enough to trigger)
      jest.advanceTimersByTime(150);

      // Continue typing
      await user.type(input, 'o');

      // Advance time partially again
      jest.advanceTimersByTime(150);

      // Still should not have called onChange
      expect(mockOnChange).not.toHaveBeenCalled();

      // Now advance enough time
      jest.advanceTimersByTime(200);

      // Should have been called once with final value
      expect(mockOnChange).toHaveBeenCalledTimes(1);
      expect(mockOnChange).toHaveBeenCalledWith('Jo');

      jest.useRealTimers();
    });
  });

  describe('Clear Button', () => {
    it('shows clear button when input has value', () => {
      render(<ContactSearchBar value="John" onChange={mockOnChange} />);

      const clearButton = screen.getByRole('button', { name: /Clear search/ });
      expect(clearButton).toBeInTheDocument();
    });

    it('does not show clear button when input is empty', () => {
      render(<ContactSearchBar value="" onChange={mockOnChange} />);

      expect(screen.queryByRole('button', { name: /Clear search/ })).not.toBeInTheDocument();
    });

    it('clears input when clear button is clicked', async () => {
      const user = userEvent.setup();

      render(<ContactSearchBar value="John Doe" onChange={mockOnChange} />);

      const clearButton = screen.getByRole('button', { name: /Clear search/ });
      await user.click(clearButton);

      expect(mockOnChange).toHaveBeenCalledWith('');
    });

    it('clears input value immediately without debounce', async () => {
      const user = userEvent.setup();

      render(<ContactSearchBar value="Test" onChange={mockOnChange} />);

      const clearButton = screen.getByRole('button', { name: /Clear search/ });
      await user.click(clearButton);

      // Should be called immediately, not after debounce
      expect(mockOnChange).toHaveBeenCalledWith('');
      expect(screen.getByDisplayValue('')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when isLoading is true', () => {
      render(<ContactSearchBar value="" onChange={mockOnChange} isLoading={true} />);

      const loadingSpinner = screen.getByLabelText('Loading');
      expect(loadingSpinner).toBeInTheDocument();
    });

    it('does not show loading spinner when isLoading is false', () => {
      render(<ContactSearchBar value="" onChange={mockOnChange} isLoading={false} />);

      expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument();
    });

    it('does not show clear button when loading', () => {
      render(
        <ContactSearchBar
          value="Test"
          onChange={mockOnChange}
          isLoading={true}
        />
      );

      expect(screen.queryByRole('button', { name: /Clear search/ })).not.toBeInTheDocument();
    });

    it('shows loading instead of clear button even with value', () => {
      render(
        <ContactSearchBar
          value="John"
          onChange={mockOnChange}
          isLoading={true}
        />
      );

      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Clear search/ })).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible label', () => {
      render(<ContactSearchBar value="" onChange={mockOnChange} />);

      const input = screen.getByLabelText('Search contacts');
      expect(input).toBeInTheDocument();
    });

    it('has accessible clear button label', () => {
      render(<ContactSearchBar value="Test" onChange={mockOnChange} />);

      const clearButton = screen.getByRole('button', { name: 'Clear search' });
      expect(clearButton).toBeInTheDocument();
    });

    it('has accessible loading label', () => {
      render(<ContactSearchBar value="" onChange={mockOnChange} isLoading={true} />);

      const loading = screen.getByLabelText('Loading');
      expect(loading).toBeInTheDocument();
    });
  });

  describe('Sync with Parent', () => {
    it('syncs input value when parent value changes', () => {
      const { rerender } = render(
        <ContactSearchBar value="Initial" onChange={mockOnChange} />
      );

      expect(screen.getByDisplayValue('Initial')).toBeInTheDocument();

      // Parent changes value
      rerender(<ContactSearchBar value="Updated" onChange={mockOnChange} />);

      expect(screen.getByDisplayValue('Updated')).toBeInTheDocument();
    });

    it('does not call onChange when syncing from parent', async () => {
      const { rerender } = render(
        <ContactSearchBar value="" onChange={mockOnChange} />
      );

      rerender(<ContactSearchBar value="New Value" onChange={mockOnChange} />);

      // Wait to ensure no debounced call
      await waitFor(
        () => {
          expect(mockOnChange).not.toHaveBeenCalled();
        },
        { timeout: 500 }
      );
    });
  });
});
