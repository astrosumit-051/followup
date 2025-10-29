import { Metadata } from "next";
import { ComposePage } from "@/components/email/ComposePage";

export const metadata: Metadata = {
  title: "Compose Email | Cordiq",
  description: "Compose professional emails with AI assistance",
};

/**
 * Email Composition Page
 *
 * Protected route for composing and sending professional emails.
 * Supports:
 * - Deep linking with contactId and type (followup | cold)
 * - AI template generation
 * - Draft auto-save
 * - Attachment uploads to S3
 * - Email signature management
 *
 * Examples:
 * - /compose (blank email)
 * - /compose?contactId=abc123&type=followup
 * - /compose?contactId=xyz789&type=cold
 */
export default function ComposeEmailPage() {
  return <ComposePage />;
}
