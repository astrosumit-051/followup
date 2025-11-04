"use client";

import React, { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, UserPlus, Edit, Trash2, Save, CheckCircle, MessageSquare, ExternalLink } from "lucide-react";
import { useActivities } from "@/lib/hooks/useDashboard";
import { ActivityType } from "@/lib/graphql/dashboard";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import { useInView } from "react-intersection-observer";
import Link from "next/link";

/**
 * Activity Card Component
 *
 * Displays recent platform activities with infinite scroll
 * Features:
 * - Scrollable activity feed (shadcn ScrollArea)
 * - Pagination with lazy loading (limit 10 initially)
 * - Activity type icons (envelope for EMAIL_SENT, person for CONTACT_ADDED, etc.)
 * - Relative timestamps with date-fns (2 hours ago, Yesterday at 3:40pm)
 * - Infinite scroll with react-intersection-observer
 * - View More link navigation to full activity history page
 * - Real-time polling updates (30-second intervals)
 */
export function ActivityCard() {
  const { data: activitiesData, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useActivities({
    first: 10,
  });

  const { ref, inView } = useInView({
    threshold: 0,
  });

  // Trigger lazy loading when scrolled to bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const activities = activitiesData?.pages.flatMap((page) => page.edges.map((edge) => edge.node)) || [];

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case ActivityType.EMAIL_SENT:
        return <Mail className="w-4 h-4 text-blue-600" />;
      case ActivityType.EMAIL_RECEIVED:
        return <Mail className="w-4 h-4 text-green-600" />;
      case ActivityType.CONTACT_ADDED:
        return <UserPlus className="w-4 h-4 text-purple-600" />;
      case ActivityType.CONTACT_UPDATED:
        return <Edit className="w-4 h-4 text-orange-600" />;
      case ActivityType.CONTACT_DELETED:
        return <Trash2 className="w-4 h-4 text-red-600" />;
      case ActivityType.DRAFT_SAVED:
        return <Save className="w-4 h-4 text-gray-600" />;
      case ActivityType.TODO_COMPLETED:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case ActivityType.CALL:
        return <MessageSquare className="w-4 h-4 text-indigo-600" />;
      case ActivityType.MEETING:
        return <MessageSquare className="w-4 h-4 text-pink-600" />;
      case ActivityType.NOTE:
        return <MessageSquare className="w-4 h-4 text-yellow-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);

    if (isToday(date)) {
      return formatDistanceToNow(date, { addSuffix: true });
    }

    if (isYesterday(date)) {
      return `Yesterday at ${format(date, "h:mm a")}`;
    }

    // More than 1 day ago
    const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo < 7) {
      return `${daysAgo} days ago at ${format(date, "h:mm a")}`;
    }

    return format(date, "MMM dd, yyyy 'at' h:mm a");
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          <CardDescription>Your latest platform activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-600">
            Failed to load activities. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="activity-card" className="rounded-card shadow-card hover:shadow-card-hover transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
            <CardDescription>
              {activities.length > 0 ? `${activities.length} recent activities` : "No activities yet"}
            </CardDescription>
          </div>
          <Link href="/activity">
            <Button variant="ghost" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              No activities yet
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Your activity feed will appear here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div
                  key={activity.id}
                  ref={index === activities.length - 1 ? ref : undefined}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                    {getActivityIcon(activity.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-[#E0E0E0] break-words">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                      {formatTimestamp(activity.occurredAt)}
                    </p>

                    {/* Metadata (if available) */}
                    {activity.metadata && typeof activity.metadata === "object" && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Object.entries(activity.metadata).map(([key, value]) => (
                          <span
                            key={key}
                            className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          >
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading indicator for pagination */}
              {isFetchingNextPage && (
                <div className="flex items-center justify-center py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-gray-100"></div>
                    Loading more...
                  </div>
                </div>
              )}

              {/* End of list indicator */}
              {!hasNextPage && activities.length > 0 && (
                <div className="text-center py-4 text-xs text-gray-400">
                  All activities displayed
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
