/**
 * Dashboard GraphQL Types - Stub Implementation
 *
 * This is a temporary stub for Phase 4 dashboard features.
 * Real GraphQL types will be generated from schema when Phase 4 is developed.
 */

// Activity types for the activity feed
export enum ActivityType {
  EMAIL_SENT = "EMAIL_SENT",
  EMAIL_RECEIVED = "EMAIL_RECEIVED",
  CONTACT_ADDED = "CONTACT_ADDED",
  CONTACT_UPDATED = "CONTACT_UPDATED",
  CONTACT_DELETED = "CONTACT_DELETED",
  NOTE_ADDED = "NOTE_ADDED",
  REMINDER_CREATED = "REMINDER_CREATED",
  REMINDER_COMPLETED = "REMINDER_COMPLETED",
}

// Stub interface for Activity
export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// Stub interface for Dashboard Metrics
export interface DashboardMetrics {
  totalContacts: number;
  emailsSent: number;
  openRate: number;
  responseRate: number;
}
