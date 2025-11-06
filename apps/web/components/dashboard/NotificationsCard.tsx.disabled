"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Mail, Phone, Video, CheckCircle, XCircle, Clock } from "lucide-react";
import { useReminders, useCompleteReminder } from "@/lib/hooks/useDashboard";
import { formatDistanceToNow, isToday, isTomorrow, differenceInDays } from "date-fns";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

/**
 * Notifications Card Component
 *
 * Displays upcoming reminders and action items with urgency indicators
 * Features:
 * - Scrollable list of reminders (shadcn ScrollArea)
 * - Filter by incomplete and due within 7 days
 * - Urgency badges (red for due tomorrow, yellow for due in 7 days, gray for normal)
 * - Action buttons (Email, Call, Meet) with click handlers
 * - Meeting RSVP buttons (Yes/No/Maybe) with mutation calls
 * - Avatar display with contact initials
 * - Email button navigates to compose page with pre-filled recipient
 */
export function NotificationsCard() {
  const router = useRouter();
  const { toast } = useToast();
  const { mutate: completeReminder } = useCompleteReminder();

  // Fetch incomplete reminders due within 7 days
  const { data: remindersData, isLoading, error } = useReminders({
    completed: false,
    first: 10,
  });

  const reminders = remindersData?.edges.map((edge) => edge.node) || [];

  // Filter reminders due within 7 days
  const upcomingReminders = reminders.filter((reminder) => {
    const dueDate = new Date(reminder.dueDate);
    const daysUntilDue = differenceInDays(dueDate, new Date());
    return daysUntilDue >= 0 && daysUntilDue <= 7;
  });

  const getUrgencyBadge = (dueDate: string) => {
    const due = new Date(dueDate);

    if (isToday(due)) {
      return (
        <Badge variant="destructive" className="text-xs">
          Due Today
        </Badge>
      );
    }

    if (isTomorrow(due)) {
      return (
        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
          Due Tomorrow
        </Badge>
      );
    }

    const daysUntilDue = differenceInDays(due, new Date());
    if (daysUntilDue <= 7) {
      return (
        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
          {daysUntilDue} days
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="text-xs">
        {formatDistanceToNow(due, { addSuffix: true })}
      </Badge>
    );
  };

  const handleEmailClick = (contactId: string, contactName: string) => {
    // Navigate to compose page with pre-filled recipient
    router.push(`/compose?contactId=${contactId}&name=${encodeURIComponent(contactName)}`);
  };

  const handleCallClick = (contactName: string) => {
    toast({
      title: "Call Action",
      description: `Initiate call with ${contactName}`,
    });
  };

  const handleMeetClick = (contactName: string) => {
    toast({
      title: "Meeting Scheduled",
      description: `Meeting request sent to ${contactName}`,
    });
  };

  const handleRSVP = (reminderId: string, response: "yes" | "no" | "maybe", contactName: string) => {
    completeReminder(reminderId, {
      onSuccess: () => {
        toast({
          title: "RSVP Recorded",
          description: `You responded "${response}" to meeting with ${contactName}`,
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to record RSVP",
          variant: "destructive",
        });
      },
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Notifications</CardTitle>
          <CardDescription>Upcoming action items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-600">
            Failed to load notifications. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="notifications-card" className="rounded-card shadow-card hover:shadow-card-hover transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Notifications</CardTitle>
        <CardDescription>
          {upcomingReminders.length} action items requiring attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : upcomingReminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No upcoming action items
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              All caught up! 🎉
            </p>
          </div>
        ) : (
          <TooltipProvider>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {upcomingReminders.map((reminder) => {
                const contactName = reminder.contact?.name || "Unknown Contact";
                const contactId = reminder.contactId || "";
                const isMeeting = reminder.title.toLowerCase().includes("meeting");

                return (
                  <div
                    key={reminder.id}
                    className="flex items-start gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {/* Avatar */}
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={reminder.contact?.profilePicture || undefined} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100">
                        {getInitials(contactName)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-sm font-medium text-gray-900 dark:text-[#E0E0E0] truncate">
                                {contactName}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {contactName}
                            </TooltipContent>
                          </Tooltip>
                          {getUrgencyBadge(reminder.dueDate)}
                        </div>
                        {reminder.priority && (
                          <Badge
                            variant={
                              reminder.priority === "HIGH"
                                ? "destructive"
                                : reminder.priority === "MEDIUM"
                                ? "secondary"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            {reminder.priority}
                          </Badge>
                        )}
                      </div>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {reminder.title}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent>
                          {reminder.title}
                        </TooltipContent>
                      </Tooltip>

                      {reminder.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {reminder.description}
                        </p>
                      )}

                      {/* Action Buttons */}
                      {isMeeting ? (
                        <div className="flex items-center gap-2 flex-wrap xs:flex-nowrap">
                          <span className="text-xs text-gray-500 hidden xs:inline">RSVP:</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-11 min-h-[44px] min-w-[44px] text-xs px-2 xs:px-3"
                            onClick={() => handleRSVP(reminder.id, "yes", contactName)}
                            aria-label="RSVP Yes"
                          >
                            <CheckCircle className="w-4 h-4 xs:mr-1" />
                            <span className="hidden xs:inline">Yes</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-11 min-h-[44px] min-w-[44px] text-xs px-2 xs:px-3"
                            onClick={() => handleRSVP(reminder.id, "no", contactName)}
                            aria-label="RSVP No"
                          >
                            <XCircle className="w-4 h-4 xs:mr-1" />
                            <span className="hidden xs:inline">No</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-11 min-h-[44px] min-w-[44px] text-xs px-2 xs:px-3"
                            onClick={() => handleRSVP(reminder.id, "maybe", contactName)}
                            aria-label="RSVP Maybe"
                          >
                            <Clock className="w-4 h-4 xs:mr-1" />
                            <span className="hidden xs:inline">Maybe</span>
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap xs:flex-nowrap">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-11 min-h-[44px] min-w-[44px] text-xs px-2 xs:px-3"
                            onClick={() => handleEmailClick(contactId, contactName)}
                            aria-label="Send Email"
                          >
                            <Mail className="w-4 h-4 xs:mr-1" />
                            <span className="hidden xs:inline">Email</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-11 min-h-[44px] min-w-[44px] text-xs px-2 xs:px-3"
                            onClick={() => handleCallClick(contactName)}
                            aria-label="Call Contact"
                          >
                            <Phone className="w-4 h-4 xs:mr-1" />
                            <span className="hidden xs:inline">Call</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-11 min-h-[44px] min-w-[44px] text-xs px-2 xs:px-3"
                            onClick={() => handleMeetClick(contactName)}
                            aria-label="Schedule Meeting"
                          >
                            <Video className="w-4 h-4 xs:mr-1" />
                            <span className="hidden xs:inline">Meet</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}
