import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Dashboard Loading Skeleton
 *
 * Provides visual feedback while dashboard data is loading.
 * Mimics the structure of the main dashboard cards.
 */
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8">
      {/* Header skeleton */}
      <div className="flex justify-end mb-8">
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>

      <div className="flex flex-col items-center justify-center flex-1">
        <div className="max-w-4xl w-full space-y-8">
          {/* Title skeleton */}
          <div className="text-center space-y-3">
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>

          {/* Two-column card grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Actions Card Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />

                <div className="h-px bg-border my-4" />

                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>

            {/* Account Card Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />

                <div className="h-px bg-border my-4" />

                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>

          {/* Getting Started Card Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />

              <div className="h-px bg-border my-4" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-3 w-64" />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

/**
 * Card Skeleton
 *
 * Reusable skeleton for individual dashboard cards.
 */
export function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
      </CardContent>
    </Card>
  );
}

/**
 * Contact Card Skeleton
 *
 * Skeleton for contact list items on dashboard.
 */
export function ContactCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}
