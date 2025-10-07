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
      className="block p-4 bg-white border border-gray-200 rounded-lg shadow-sm
                 hover:shadow-md transition-shadow duration-200
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                 sm:p-6"
    >
      <div className="flex flex-col space-y-3 mb-4
                      sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        {/* Profile Picture / Initials and Name */}
        <div className="flex items-center space-x-3 flex-1 min-w-0
                        sm:space-x-4">
          {contact.profilePicture ? (
            <img
              src={contact.profilePicture}
              alt={contact.name}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {initials}
              </span>
            </div>
          )}

          {/* Name and Company */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 line-clamp-1
                           sm:text-lg">
              {contact.name}
            </h3>
            {contact.company && (
              <p className="text-sm text-gray-600 line-clamp-1">{contact.company}</p>
            )}
          </div>
        </div>

        {/* Priority Badge */}
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColor} self-start flex-shrink-0
                      sm:ml-2`}
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
      <div className="flex flex-col space-y-1 text-xs text-gray-500 pt-3 border-t border-gray-100
                      sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <span className="truncate">{contact.industry || 'No industry'}</span>
        <span className="truncate">Last contact: {formattedDate}</span>
      </div>
    </Link>
  );
}
