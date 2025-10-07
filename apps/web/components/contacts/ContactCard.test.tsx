import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { ContactCard } from './ContactCard';
import type { Contact } from '@/lib/graphql/contacts';

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

  it('renders profile picture when provided', () => {
    render(<ContactCard contact={mockContact} />);

    const img = screen.getByAltText('John Doe');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('renders initials when no profile picture', () => {
    const contactWithoutPicture = { ...mockContact, profilePicture: null };
    render(<ContactCard contact={contactWithoutPicture} />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('displays priority badge with correct color', () => {
    render(<ContactCard contact={mockContact} />);

    const badge = screen.getByText('HIGH');
    expect(badge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('displays medium priority with yellow color', () => {
    const mediumContact = { ...mockContact, priority: 'MEDIUM' as const };
    render(<ContactCard contact={mediumContact} />);

    const badge = screen.getByText('MEDIUM');
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('displays low priority with green color', () => {
    const lowContact = { ...mockContact, priority: 'LOW' as const };
    render(<ContactCard contact={lowContact} />);

    const badge = screen.getByText('LOW');
    expect(badge).toHaveClass('bg-green-100', 'text-green-800');
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

  it('has hover and focus styles', () => {
    render(<ContactCard contact={mockContact} />);

    const link = screen.getByRole('link');
    expect(link).toHaveClass('hover:shadow-md', 'focus:ring-2');
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
});
