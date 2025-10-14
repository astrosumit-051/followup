import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

/**
 * Dashboard Loading State
 *
 * This file is automatically used by Next.js to show a loading state
 * while the dashboard page is being rendered or data is being fetched.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming
 */
export default function Loading() {
  return <DashboardSkeleton />;
}
