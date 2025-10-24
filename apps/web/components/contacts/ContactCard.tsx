import { useMemo } from "react";
import Link from "next/link";
import type { Contact } from "@/lib/graphql/contacts";
import { Card, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ContactCardProps {
  contact: Contact;
}

/**
 * ContactCard Component
 *
 * Displays a contact in card format for list views using shadcn/ui components.
 * Shows essential contact information with priority indicator.
 *
 * Features:
 * - Priority badge (HIGH/MEDIUM/LOW) with semantic color variants
 * - Profile picture with Avatar component or initials fallback
 * - Name, company, role display
 * - Email and phone (if available)
 * - Last contacted date
 * - Clickable card linking to contact detail page
 * - Dark mode support via design tokens
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
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [contact.name]);

  // Memoized date formatting for performance
  const formattedDate = useMemo(() => {
    if (!contact.lastContactedAt) return "Never";
    return new Date(contact.lastContactedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [contact.lastContactedAt]);

  // Get priority badge variant (shadcn semantic variants)
  const priorityVariant = useMemo(() => {
    switch (contact.priority) {
      case "HIGH":
        return "destructive" as const;
      case "MEDIUM":
        return "default" as const;
      case "LOW":
        return "secondary" as const;
      default:
        return "secondary" as const;
    }
  }, [contact.priority]);

  return (
    <Link
      href={`/contacts/${contact.id}`}
      data-testid={`contact-card-${contact.id}`}
    >
      <Card
        className="transition-shadow hover:shadow-md"
        data-testid="contact-card"
      >
        <CardHeader className="p-4 sm:p-6">
          <div
            className="flex flex-col space-y-3 mb-4
                          sm:flex-row sm:items-start sm:justify-between sm:space-y-0"
          >
            {/* Profile Picture / Initials and Name */}
            <div
              className="flex items-center space-x-3 flex-1 min-w-0
                            sm:space-x-4"
            >
              <Avatar className="w-12 h-12 flex-shrink-0">
                <AvatarImage
                  src={contact.profilePicture || ""}
                  alt={contact.name}
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>

              {/* Name and Company */}
              <div className="flex-1 min-w-0">
                <h3
                  className="text-base font-semibold line-clamp-1
                               sm:text-lg"
                >
                  {contact.name}
                </h3>
                {contact.company && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {contact.company}
                  </p>
                )}
              </div>
            </div>

            {/* Priority Badge */}
            <Badge
              variant={priorityVariant}
              className="self-start flex-shrink-0 sm:ml-2"
            >
              {contact.priority}
            </Badge>
          </div>

          {/* Role */}
          {contact.role && (
            <p className="text-sm mb-2 line-clamp-1">{contact.role}</p>
          )}

          {/* Contact Information */}
          <div className="space-y-1 mb-3">
            {contact.email && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                <span className="font-medium">Email:</span> {contact.email}
              </p>
            )}
            {contact.phone && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                <span className="font-medium">Phone:</span> {contact.phone}
              </p>
            )}
          </div>

          {/* Industry and Last Contacted */}
          <div
            className="flex flex-col space-y-1 text-xs text-muted-foreground pt-3 border-t
                          sm:flex-row sm:justify-between sm:items-center sm:space-y-0"
          >
            <span className="truncate">
              {contact.industry || "No industry"}
            </span>
            <span className="truncate">Last contact: {formattedDate}</span>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
