"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { ContactSidebar } from "./ContactSidebar";
import { EmailComposer } from "./EmailComposer";

type ComposePageProps = Record<string, never>;

/**
 * Email Composition Page Component
 *
 * Features:
 * - CSS Grid layout: 30% sidebar + 70% composer (desktop)
 * - Responsive: Single column on mobile (<768px)
 * - Deep linking support: ?contactId={id}&type={followup|cold}
 * - Breadcrumb navigation
 * - Contact pre-selection
 */
export function ComposePage({}: ComposePageProps) {
  const searchParams = useSearchParams();
  const contactId = searchParams.get("contactId");
  const emailType = searchParams.get("type") as "followup" | "cold" | null;

  const [selectedContactName, setSelectedContactName] = useState<string | null>(
    null
  );

  // TODO: Fetch contact name if contactId is provided
  useEffect(() => {
    if (contactId) {
      // This will be implemented with GraphQL query
      // For now, using placeholder
      setSelectedContactName("Loading contact...");
    }
  }, [contactId]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground
                         transition-colors flex items-center"
            >
              <Home className="w-4 h-4 mr-1" />
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">Compose</span>
            {selectedContactName && (
              <>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{selectedContactName}</span>
              </>
            )}
          </nav>
          {emailType && (
            <div className="mt-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                           ${
                             emailType === "followup"
                               ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                               : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                           }`}
              >
                {emailType === "followup" ? "Follow-Up Email" : "Cold Email"} •
                First Contact
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area - CSS Grid Layout */}
      <div className="flex-1 container mx-auto p-4 md:p-6">
        <div
          className="grid grid-cols-1 md:grid-cols-[30%_70%] gap-6
                     h-full min-h-[calc(100vh-12rem)]"
        >
          {/* Left Sidebar - Contact Selection (30%) */}
          <div className="order-2 md:order-1 h-auto md:h-full">
            <ContactSidebar />
          </div>

          {/* Right Composer Area (70%) */}
          <div
            className="bg-card border border-border rounded-lg p-6
                       order-1 md:order-2
                       h-auto md:h-full flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Compose Email</h2>
              <div className="flex items-center space-x-2">
                {/* Placeholder for action buttons */}
                <span className="text-xs text-muted-foreground">
                  Draft auto-save enabled
                </span>
              </div>
            </div>

            {/* Email Composer with TipTap Editor */}
            <div className="flex-1">
              <EmailComposer
                emailType={emailType}
                selectedContactIds={contactId ? [contactId] : []}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
