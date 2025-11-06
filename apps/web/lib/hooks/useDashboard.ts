/**
 * Dashboard Hooks - Stub Implementation
 *
 * This is a temporary stub implementation for Phase 4 dashboard features.
 * These hooks provide minimal functionality to allow the dashboard to build
 * while Phase 4 features are under development.
 *
 * Phase 4 will include:
 * - Real-time dashboard metrics
 * - Contact growth analytics
 * - Activity feed
 * - Notifications and reminders
 * - Todo management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ============================================================================
// Types
// ============================================================================

export interface DashboardMetrics {
  totalContacts: number;
  emailsSent: number;
  openRate: number;
  responseRate: number;
}

export interface Activity {
  id: string;
  type: "contact_added" | "email_sent" | "email_opened";
  description: string;
  timestamp: Date;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  contactId?: string;
}

export type DateRangeFilter = "WEEKLY" | "MONTHLY" | "YEARLY";

export interface ContactGrowthData {
  date: string;
  count: number;
}

// ============================================================================
// Dashboard Metrics Hook (for SnapshotCard)
// ============================================================================

export function useDashboardData() {
  return useQuery({
    queryKey: ["dashboard", "metrics"],
    queryFn: async (): Promise<DashboardMetrics> => {
      // Stub implementation - returns mock data
      // Phase 4 will implement real API calls
      return {
        totalContacts: 0,
        emailsSent: 0,
        openRate: 0,
        responseRate: 0,
      };
    },
    staleTime: 30000, // 30 seconds
  });
}

// ============================================================================
// Quick Add Contact Hook (for QuickAddModal)
// ============================================================================

export function useQuickAddContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      email?: string;
      phone?: string;
      company?: string;
    }) => {
      // Stub implementation - does nothing
      // Phase 4 will implement real API calls
      console.log("Quick add contact (stub):", data);
      return { id: "stub-id", ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "metrics"] });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

// ============================================================================
// Contact Growth Data Hook (for GrowthCard)
// ============================================================================

export function useContactGrowthData(dateRange: DateRangeFilter) {
  return useQuery({
    queryKey: ["dashboard", "growth", dateRange],
    queryFn: async (): Promise<ContactGrowthData[]> => {
      // Stub implementation - returns empty data
      // Phase 4 will implement real API calls
      return [];
    },
    staleTime: 60000, // 1 minute
  });
}

// ============================================================================
// Activities Hook (for ActivityCard)
// ============================================================================

export function useActivities() {
  return useQuery({
    queryKey: ["dashboard", "activities"],
    queryFn: async (): Promise<Activity[]> => {
      // Stub implementation - returns empty data
      // Phase 4 will implement real API calls
      return [];
    },
    staleTime: 30000, // 30 seconds
  });
}

// ============================================================================
// Reminders Hooks (for NotificationsCard and TodoCard)
// ============================================================================

export function useReminders() {
  return useQuery({
    queryKey: ["dashboard", "reminders"],
    queryFn: async (): Promise<Reminder[]> => {
      // Stub implementation - returns empty data
      // Phase 4 will implement real API calls
      return [];
    },
    staleTime: 30000, // 30 seconds
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      dueDate: Date;
      contactId?: string;
    }) => {
      // Stub implementation - does nothing
      // Phase 4 will implement real API calls
      console.log("Create reminder (stub):", data);
      return { id: "stub-id", completed: false, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "reminders"] });
    },
  });
}

export function useCompleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reminderId: string) => {
      // Stub implementation - does nothing
      // Phase 4 will implement real API calls
      console.log("Complete reminder (stub):", reminderId);
      return { id: reminderId, completed: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "reminders"] });
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reminderId: string) => {
      // Stub implementation - does nothing
      // Phase 4 will implement real API calls
      console.log("Delete reminder (stub):", reminderId);
      return { id: reminderId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "reminders"] });
    },
  });
}
