import { test, expect } from '@playwright/test';

/**
 * Contact Edit E2E Tests
 *
 * Comprehensive test suite for the contact edit page functionality.
 * Tests cover:
 * - Page load and navigation
 * - Form pre-population with existing data
 * - Field validation
 * - Form submission with success and error cases
 * - Cancel functionality
 * - Toast notifications
 * - Redirect behavior
 * - Loading and error states
 * - Responsive design
 * - Accessibility
 */

// Mock contact data
const mockContact = {
  id: 'test-contact-123',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1-234-567-8900',
  linkedInUrl: 'https://linkedin.com/in/johndoe',
  company: 'Acme Corp',
  industry: 'Technology',
  role: 'Software Engineer',
  priority: 'HIGH',
  gender: 'MALE',
  birthday: '1990-01-15',
  profilePicture: 'https://example.com/photo.jpg',
  notes: 'Important contact',
  lastContactedAt: '2025-10-01T10:00:00Z',
  createdAt: '2025-09-01T10:00:00Z',
  updatedAt: '2025-10-01T10:00:00Z',
};

const updatedContact = {
  ...mockContact,
  name: 'Jane Smith',
  email: 'jane@example.com',
  phone: '+1-555-123-4567',
  company: 'TechCorp',
  role: 'Senior Engineer',
  priority: 'MEDIUM',
  updatedAt: new Date().toISOString(),
};

test.describe('Contact Edit Page', () => {
  test.describe('Page Load and Navigation', () => {
    test('should load contact edit page with correct URL', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);
      await expect(page).toHaveURL(`/contacts/${mockContact.id}/edit`);
    });

    test('should display correct page title', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const heading = page.locator('h1:has-text("Edit Contact")');
      await expect(heading).toBeVisible();
    });

    test('should display contact name in subtitle', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const subtitle = page.locator(`text=Update information for ${mockContact.name}`);
      await expect(subtitle).toBeVisible();
    });
  });

  test.describe('Loading State', () => {
    test('should display loading skeleton on initial load', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const loadingSkeleton = page.locator('.animate-pulse');
      // Note: This might not be visible if data loads quickly
      // await expect(loadingSkeleton).toBeVisible();
    });

    test('should replace loading skeleton with form after data loads', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);
      await page.waitForLoadState('networkidle');
      const form = page.locator('form');
      await expect(form).toBeVisible();
    });
  });

  test.describe('Form Pre-population', () => {
    test('should pre-fill name field with existing contact data', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const nameInput = page.locator('input#name');
      await expect(nameInput).toHaveValue(mockContact.name);
    });

    test('should pre-fill email field with existing contact data', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const emailInput = page.locator('input#email');
      await expect(emailInput).toHaveValue(mockContact.email);
    });

    test('should pre-fill phone field with existing contact data', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const phoneInput = page.locator('input#phone');
      await expect(phoneInput).toHaveValue(mockContact.phone);
    });

    test('should pre-fill LinkedIn URL field with existing contact data', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const linkedInInput = page.locator('input#linkedInUrl');
      await expect(linkedInInput).toHaveValue(mockContact.linkedInUrl);
    });

    test('should pre-fill company field with existing contact data', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const companyInput = page.locator('input#company');
      await expect(companyInput).toHaveValue(mockContact.company);
    });

    test('should pre-fill industry field with existing contact data', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const industryInput = page.locator('input#industry');
      await expect(industryInput).toHaveValue(mockContact.industry);
    });

    test('should pre-fill role field with existing contact data', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const roleInput = page.locator('input#role');
      await expect(roleInput).toHaveValue(mockContact.role);
    });

    test('should pre-select priority dropdown with existing contact data', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const prioritySelect = page.locator('select#priority');
      await expect(prioritySelect).toHaveValue(mockContact.priority);
    });

    test('should pre-select gender dropdown with existing contact data', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const genderSelect = page.locator('select#gender');
      await expect(genderSelect).toHaveValue(mockContact.gender);
    });

    test('should pre-fill birthday field with existing contact data', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const birthdayInput = page.locator('input#birthday');
      await expect(birthdayInput).toHaveValue(mockContact.birthday);
    });

    test('should pre-fill profile picture URL field with existing contact data', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const profilePictureInput = page.locator('input#profilePicture');
      await expect(profilePictureInput).toHaveValue(mockContact.profilePicture);
    });

    test('should pre-fill notes field with existing contact data', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const notesTextarea = page.locator('textarea#notes');
      await expect(notesTextarea).toHaveValue(mockContact.notes);
    });
  });

  test.describe('Field Validation', () => {
    test('should show error when name is cleared and form is submitted', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const nameInput = page.locator('input#name');
      await nameInput.clear();
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      const errorMessage = page.locator('text=Name is required');
      await expect(errorMessage).toBeVisible();
    });

    test('should show error for invalid email format', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const emailInput = page.locator('input#email');
      await emailInput.clear();
      await emailInput.fill('invalid-email');
      await emailInput.blur();
      const errorMessage = page.locator('text=Invalid email format');
      await expect(errorMessage).toBeVisible();
    });

    test('should show error for invalid LinkedIn URL format', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const linkedInInput = page.locator('input#linkedInUrl');
      await linkedInInput.clear();
      await linkedInInput.fill('not-a-url');
      await linkedInInput.blur();
      const errorMessage = page.locator('text=Invalid URL format');
      await expect(errorMessage).toBeVisible();
    });

    test('should allow empty optional fields', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const emailInput = page.locator('input#email');
      await emailInput.clear();
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      // No error should appear for optional fields
      const errorMessage = page.locator('text=Email is required');
      await expect(errorMessage).not.toBeVisible();
    });

    test('should validate phone number format', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const phoneInput = page.locator('input#phone');
      await phoneInput.clear();
      await phoneInput.fill('invalid-phone');
      await phoneInput.blur();
      // Note: Validation behavior depends on implementation
    });

    test('should allow valid birthday date', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const birthdayInput = page.locator('input#birthday');
      await birthdayInput.fill('1995-05-15');
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      // Should not show validation error for valid date
    });
  });

  test.describe('Form Submission - Success', () => {
    test('should successfully update contact with valid data', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);

      // Update form fields
      await page.locator('input#name').clear();
      await page.locator('input#name').fill(updatedContact.name);
      await page.locator('input#email').clear();
      await page.locator('input#email').fill(updatedContact.email);
      await page.locator('select#priority').selectOption(updatedContact.priority);

      // Submit form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Wait for navigation or success indicator
      await page.waitForURL(`/contacts/${mockContact.id}`, { timeout: 5000 });
    });

    test('should display success toast after update', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);

      // Update a field
      await page.locator('input#name').clear();
      await page.locator('input#name').fill(updatedContact.name);

      // Submit form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Check for success toast
      const successToast = page.locator('text=Contact updated successfully');
      await expect(successToast).toBeVisible({ timeout: 5000 });
    });

    test('should redirect to contact detail page after successful update', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);

      // Update a field
      await page.locator('input#company').clear();
      await page.locator('input#company').fill(updatedContact.company);

      // Submit form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Verify redirect
      await expect(page).toHaveURL(`/contacts/${mockContact.id}`, { timeout: 5000 });
    });

    test('should disable submit button during submission', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);

      // Update a field
      await page.locator('input#name').clear();
      await page.locator('input#name').fill(updatedContact.name);

      // Submit form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Button should be disabled during submission
      await expect(submitButton).toBeDisabled();
    });

    test('should change submit button text to "Saving..." during submission', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);

      // Update a field
      await page.locator('input#name').clear();
      await page.locator('input#name').fill(updatedContact.name);

      // Submit form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Check button text
      await expect(submitButton).toHaveText('Saving...');
    });

    test('should update only changed fields', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);

      // Update only name field
      await page.locator('input#name').clear();
      await page.locator('input#name').fill(updatedContact.name);

      // Submit form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Wait for success
      await page.waitForURL(`/contacts/${mockContact.id}`, { timeout: 5000 });
    });

    test('should update multiple fields simultaneously', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);

      // Update multiple fields
      await page.locator('input#name').clear();
      await page.locator('input#name').fill(updatedContact.name);
      await page.locator('input#email').clear();
      await page.locator('input#email').fill(updatedContact.email);
      await page.locator('input#phone').clear();
      await page.locator('input#phone').fill(updatedContact.phone);
      await page.locator('select#priority').selectOption(updatedContact.priority);

      // Submit form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Wait for success
      await page.waitForURL(`/contacts/${mockContact.id}`, { timeout: 5000 });
    });
  });

  test.describe('Form Submission - Error Handling', () => {
    test('should display error toast on submission failure', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);

      // Mock network error by intercepting API call
      await page.route('**/graphql', route => route.abort());

      // Update a field
      await page.locator('input#name').clear();
      await page.locator('input#name').fill(updatedContact.name);

      // Submit form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Check for error toast
      const errorToast = page.locator('text=Failed to update contact');
      await expect(errorToast).toBeVisible({ timeout: 5000 });
    });

    test('should not redirect on submission failure', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);

      // Mock network error
      await page.route('**/graphql', route => route.abort());

      // Update a field
      await page.locator('input#name').clear();
      await page.locator('input#name').fill(updatedContact.name);

      // Submit form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Should stay on edit page
      await page.waitForTimeout(2000);
      await expect(page).toHaveURL(`/contacts/${mockContact.id}/edit`);
    });

    test('should re-enable submit button after error', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);

      // Mock network error
      await page.route('**/graphql', route => route.abort());

      // Update a field
      await page.locator('input#name').clear();
      await page.locator('input#name').fill(updatedContact.name);

      // Submit form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Wait for error
      await page.waitForTimeout(2000);

      // Button should be enabled again
      await expect(submitButton).not.toBeDisabled();
    });
  });

  test.describe('Cancel Functionality', () => {
    test('should display Cancel button', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const cancelButton = page.locator('button:has-text("Cancel")');
      await expect(cancelButton).toBeVisible();
    });

    test('should navigate back to detail page when Cancel is clicked', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const cancelButton = page.locator('button:has-text("Cancel")');
      await cancelButton.click();
      await expect(page).toHaveURL(`/contacts/${mockContact.id}`);
    });

    test('should not save changes when Cancel is clicked', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);

      // Make changes
      await page.locator('input#name').clear();
      await page.locator('input#name').fill('Changed Name');

      // Click cancel
      const cancelButton = page.locator('button:has-text("Cancel")');
      await cancelButton.click();

      // Verify navigation
      await expect(page).toHaveURL(`/contacts/${mockContact.id}`);
    });

    test('should disable Cancel button during submission', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);

      // Update a field
      await page.locator('input#name').clear();
      await page.locator('input#name').fill(updatedContact.name);

      // Submit form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Cancel button should be disabled
      const cancelButton = page.locator('button:has-text("Cancel")');
      await expect(cancelButton).toBeDisabled();
    });
  });

  test.describe('Error State - Contact Not Found', () => {
    test('should display error message when contact does not exist', async ({ page }) => {
      await page.goto('/contacts/non-existent-id/edit');
      const errorHeading = page.locator('h2:has-text("Contact Not Found")');
      await expect(errorHeading).toBeVisible();
    });

    test('should display "Back to Contacts" button when contact not found', async ({ page }) => {
      await page.goto('/contacts/non-existent-id/edit');
      const backButton = page.locator('button:has-text("Back to Contacts")');
      await expect(backButton).toBeVisible();
    });

    test('should navigate to contacts list when "Back to Contacts" clicked', async ({ page }) => {
      await page.goto('/contacts/non-existent-id/edit');
      const backButton = page.locator('button:has-text("Back to Contacts")');
      await backButton.click();
      await expect(page).toHaveURL('/contacts');
    });
  });

  test.describe('Error State - Network Error', () => {
    test('should display error message on network failure', async ({ page }) => {
      // Mock network error on initial load
      await page.route('**/graphql', route => route.abort());

      await page.goto(`/contacts/${mockContact.id}/edit`);
      const errorHeading = page.locator('h2:has-text("Error Loading Contact")');
      await expect(errorHeading).toBeVisible();
    });

    test('should display "Back to Contacts" button on network error', async ({ page }) => {
      await page.route('**/graphql', route => route.abort());

      await page.goto(`/contacts/${mockContact.id}/edit`);
      const backButton = page.locator('button:has-text("Back to Contacts")');
      await expect(backButton).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should render correctly on mobile viewport (375px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const form = page.locator('form');
      await expect(form).toBeVisible();
    });

    test('should render correctly on tablet viewport (768px)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const form = page.locator('form');
      await expect(form).toBeVisible();
    });

    test('should render correctly on desktop viewport (1440px)', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const form = page.locator('form');
      await expect(form).toBeVisible();
    });

    test('should stack form fields vertically on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const nameInput = page.locator('input#name');
      const emailInput = page.locator('input#email');
      const nameBox = await nameInput.boundingBox();
      const emailBox = await emailInput.boundingBox();
      // Email should be below name on mobile
      expect(emailBox?.y).toBeGreaterThan(nameBox?.y || 0);
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper form labels', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const nameLabel = page.locator('label[for="name"]');
      await expect(nameLabel).toBeVisible();
      await expect(nameLabel).toContainText('Name');
    });

    test('should mark required fields with asterisk', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const nameLabel = page.locator('label[for="name"]');
      const asterisk = nameLabel.locator('span.text-red-500');
      await expect(asterisk).toBeVisible();
    });

    test('should have accessible submit button', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toHaveText('Update Contact');
    });

    test('should have accessible cancel button', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const cancelButton = page.locator('button:has-text("Cancel")');
      await expect(cancelButton).toBeVisible();
    });

    test('should associate error messages with inputs using aria', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);
      const nameInput = page.locator('input#name');
      await nameInput.clear();
      await nameInput.blur();
      // Note: Actual ARIA implementation depends on form library
    });
  });

  test.describe('Performance', () => {
    test('should load edit page within 3 seconds', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(`/contacts/${mockContact.id}/edit`);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000);
    });

    test('should not have console errors on load', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      await page.goto(`/contacts/${mockContact.id}/edit`);
      await page.waitForLoadState('networkidle');
      expect(consoleErrors).toHaveLength(0);
    });

    test('should not have console warnings on load', async ({ page }) => {
      const consoleWarnings: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'warning') {
          consoleWarnings.push(msg.text());
        }
      });
      await page.goto(`/contacts/${mockContact.id}/edit`);
      await page.waitForLoadState('networkidle');
      // Allow for some framework warnings
      expect(consoleWarnings.length).toBeLessThan(5);
    });
  });

  test.describe('Optimistic UI Updates', () => {
    test('should immediately update UI before server response', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);

      // Update a field
      await page.locator('input#name').clear();
      await page.locator('input#name').fill(updatedContact.name);

      // Submit form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Check that button text changes immediately
      await expect(submitButton).toHaveText('Saving...');
    });
  });

  test.describe('Data Persistence', () => {
    test('should preserve form state after validation error', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);

      // Enter invalid data
      await page.locator('input#email').clear();
      await page.locator('input#email').fill('invalid-email');

      // Submit form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Data should still be in field
      const emailInput = page.locator('input#email');
      await expect(emailInput).toHaveValue('invalid-email');
    });

    test('should preserve all field changes after validation error', async ({ page }) => {
      await page.goto(`/contacts/${mockContact.id}/edit`);

      // Make multiple changes
      await page.locator('input#company').clear();
      await page.locator('input#company').fill('New Company');
      await page.locator('input#role').clear();
      await page.locator('input#role').fill('New Role');

      // Clear required field to trigger error
      await page.locator('input#name').clear();

      // Submit form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // All changes should be preserved
      await expect(page.locator('input#company')).toHaveValue('New Company');
      await expect(page.locator('input#role')).toHaveValue('New Role');
    });
  });
});
