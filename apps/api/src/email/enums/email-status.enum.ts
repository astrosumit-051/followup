/**
 * Email Status
 *
 * Represents the current state of an email:
 * - DRAFT: Email is being composed or edited
 * - SCHEDULED: Email is scheduled to be sent at a future time
 * - SENT: Email has been successfully sent
 * - FAILED: Email sending failed
 * - CANCELLED: Scheduled email was cancelled before sending
 */
export enum EmailStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  SENT = 'SENT',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}
