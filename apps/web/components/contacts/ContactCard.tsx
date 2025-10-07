import { useMemo } from 'react';
import Link from 'next/link';
import type { Contact } from '@/lib/graphql/contacts';

interface ContactCardProps {
  contact: Contact;
}

/**
 * ContactCard Component
 *
 * Displays a contact in card format for list views.
 * Shows essential contact information with priority indicator.
 *
 * Features:
 * - Priority badge (HIGH/MEDIUM/LOW) with color coding
 * - Profile picture or initials fallback
 * - Name, company, role display
 * - Email and phone (if available)
 * - Last contacted date
 * - Clickable card linking to contact detail page
 *
 * @example
 * ```tsx
 * <ContactCard contact={contactData} />
 * ```
 */
export function ContactCard({ contact }: ContactCardProps) {
  // Generate initials from name
  const initials = useMemo(() => {
    return contact.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [contact.name]);

  // Memoized date formatting for performance
  const formattedDate = useMemo(() => {
    if (!contact.lastContactedAt) return 'Never';
    return new Date(contact.lastContactedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [contact.lastContactedAt]);

  // Get priority badge color
  const priorityColor = useMemo(() => {
    switch (contact.priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, [contact.priority]);

  return (
    <Link
      href={`/contacts/${contact.id}`}
      className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm
                 hover:shadow-md transition-shadow duration-200
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <div className="flex items-start justify-between mb-4">
        {/* Profile Picture / Initials */}
        <div className="flex items-center space-x-4">
          {contact.profilePicture ? (
            <img
              src={contact.profilePicture}
              alt={contact.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {initials}
              </span>
            </div>
          )}

          {/* Name and Company */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {contact.name}
            </h3>
            {contact.company && (
              <p className="text-sm text-gray-600 line-clamp-1">{contact.company}</p>
            )}
          </div>
        </div>

        {/* Priority Badge */}
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColor}`}
        >
          {contact.priority}
        </span>
      </div>

      {/* Role */}
      {contact.role && (
        <p className="text-sm text-gray-700 mb-2 line-clamp-1">{contact.role}</p>
      )}

      {/* Contact Information */}
      <div className="space-y-1 mb-3">
        {contact.email && (
          <p className="text-sm text-gray-600 line-clamp-1">
            <span className="font-medium">Email:</span> {contact.email}
          </p>
        )}
        {contact.phone && (
          <p className="text-sm text-gray-600 line-clamp-1">
            <span className="font-medium">Phone:</span> {contact.phone}
          </p>
        )}
      </div>

      {/* Industry and Last Contacted */}
      <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-100">
        <span>{contact.industry || 'No industry'}</span>
        <span>Last contact: {formattedDate}</span>
      </div>
    </Link>
  );
}
