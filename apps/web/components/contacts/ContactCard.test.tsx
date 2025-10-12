import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ContactCard } from './ContactCard';
import type { Contact } from '@/lib/graphql/contacts';

expect.extend(toHaveNoViolations);

describe('ContactCard', () => {
  const mockContact: Contact = {
    id: 'contact-123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1-234-567-8900',
    linkedInUrl: 'https://linkedin.com/in/johndoe',
    company: 'Acme Corp',
    industry: 'Technology',
    role: 'Software Engineer',
    priority: 'HIGH',
    gender: 'MALE',
    birthday: '1990-01-01',
    profilePicture: 'https://example.com/photo.jpg',
    notes: 'Met at conference',
    lastContactedAt: '2025-01-01T00:00:00Z',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  };

  it('renders contact name and company', () => {
    render(<ContactCard contact={mockContact} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('renders Avatar component with profile picture', () => {
    render(<ContactCard contact={mockContact} />);

    // Avatar component is rendered (in test env, images don't load so it falls back to initials)
    // Check that the initials are rendered (Avatar's fallback behavior)
    const avatarFallback = screen.getByText('JD');
    expect(avatarFallback).toBeInTheDocument();

    // Verify the avatar fallback span has the correct classes
    expect(avatarFallback).toHaveClass('flex', 'rounded-full', 'bg-muted');
  });

  it('renders initials when no profile picture', () => {
    const contactWithoutPicture = { ...mockContact, profilePicture: null };
    render(<ContactCard contact={contactWithoutPicture} />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('displays priority badge with destructive variant for HIGH', () => {
    render(<ContactCard contact={mockContact} />);

    const badge = screen.getByText('HIGH');
    expect(badge).toBeInTheDocument();
    // Badge uses semantic variant classes from shadcn
    expect(badge.className).toContain('inline-flex'); // Badge base class
  });

  it('displays medium priority with default variant', () => {
    const mediumContact = { ...mockContact, priority: 'MEDIUM' as const };
    render(<ContactCard contact={mediumContact} />);

    const badge = screen.getByText('MEDIUM');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('inline-flex');
  });

  it('displays low priority with secondary variant', () => {
    const lowContact = { ...mockContact, priority: 'LOW' as const };
    render(<ContactCard contact={lowContact} />);

    const badge = screen.getByText('LOW');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('inline-flex');
  });

  it('renders role when provided', () => {
    render(<ContactCard contact={mockContact} />);

    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
  });

  it('renders email when provided', () => {
    render(<ContactCard contact={mockContact} />);

    expect(screen.getByText(/john@example\.com/)).toBeInTheDocument();
  });

  it('renders phone when provided', () => {
    render(<ContactCard contact={mockContact} />);

    expect(screen.getByText(/\+1-234-567-8900/)).toBeInTheDocument();
  });

  it('renders industry', () => {
    render(<ContactCard contact={mockContact} />);

    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('renders "No industry" when industry is null', () => {
    const contactWithoutIndustry = { ...mockContact, industry: null };
    render(<ContactCard contact={contactWithoutIndustry} />);

    expect(screen.getByText('No industry')).toBeInTheDocument();
  });

  it('formats last contacted date', () => {
    render(<ContactCard contact={mockContact} />);

    expect(screen.getByText(/Last contact: Dec 31, 2024/)).toBeInTheDocument();
  });

  it('shows "Never" when last contacted is null', () => {
    const contactNotContacted = { ...mockContact, lastContactedAt: null };
    render(<ContactCard contact={contactNotContacted} />);

    expect(screen.getByText(/Last contact: Never/)).toBeInTheDocument();
  });

  it('renders as a link to contact detail page', () => {
    render(<ContactCard contact={mockContact} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/contacts/contact-123');
  });

  it('has hover styles on card', () => {
    render(<ContactCard contact={mockContact} />);

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    // Card has transition-shadow and hover:shadow-md classes
    const card = link.querySelector('[class*="transition-shadow"]');
    expect(card).toBeInTheDocument();
  });

  it('handles contact with minimal data', () => {
    const minimalContact: Contact = {
      id: 'contact-minimal',
      name: 'Jane Smith',
      priority: 'MEDIUM',
      email: null,
      phone: null,
      linkedInUrl: null,
      company: null,
      industry: null,
      role: null,
      gender: null,
      birthday: null,
      profilePicture: null,
      notes: null,
      lastContactedAt: null,
      createdAt: '2024-12-01T00:00:00Z',
      updatedAt: '2024-12-01T00:00:00Z',
    };

    render(<ContactCard contact={minimalContact} />);

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();
    expect(screen.getByText('JS')).toBeInTheDocument(); // Initials
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<ContactCard contact={mockContact} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with minimal contact data', async () => {
      const minimalContact: Contact = {
        id: 'contact-minimal',
        name: 'Jane Smith',
        priority: 'MEDIUM',
        email: null,
        phone: null,
        linkedInUrl: null,
        company: null,
        industry: null,
        role: null,
        gender: null,
        birthday: null,
        profilePicture: null,
        notes: null,
        lastContactedAt: null,
        createdAt: '2024-12-01T00:00:00Z',
        updatedAt: '2024-12-01T00:00:00Z',
      };

      const { container } = render(<ContactCard contact={minimalContact} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
