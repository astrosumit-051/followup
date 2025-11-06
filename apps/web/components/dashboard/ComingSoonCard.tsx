"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, TrendingUp, Activity, CheckSquare, Clock } from "lucide-react";

/**
 * Coming Soon Card Component
 *
 * Displays a placeholder card for Phase 4 dashboard features that are not yet implemented.
 * Shows a professional "Coming Soon" message with icon and description.
 *
 * Used for:
 * - Growth Trends (charts)
 * - Notifications (action items)
 * - Recent Activity (feed)
 * - Todo List
 *
 * Props:
 * - title: Card title
 * - description: Brief description of the feature
 * - icon: Icon name (bell, trending-up, activity, check-square)
 */

interface ComingSoonCardProps {
  title: string;
  description: string;
  icon?: "bell" | "trending-up" | "activity" | "check-square";
}

export function ComingSoonCard({ title, description, icon = "bell" }: ComingSoonCardProps) {
  const iconMap = {
    bell: Bell,
    "trending-up": TrendingUp,
    activity: Activity,
    "check-square": CheckSquare,
  };

  const IconComponent = iconMap[icon] || Bell;

  return (
    <Card className="h-full bg-white dark:bg-[#1E1E1E] border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-[#E0E0E0]">
              {title}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Phase 4 Feature
            </CardDescription>
          </div>
          <div className="rounded-full bg-gray-100 dark:bg-[#2A2A2A] p-3">
            <IconComponent className="w-6 h-6 text-gray-400 dark:text-gray-500" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="rounded-full bg-[#A8E6A3]/10 dark:bg-[#A8E6A3]/5 p-4 mb-4">
            <Clock className="w-12 h-12 text-[#A8E6A3] dark:text-[#8BC68B]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#E0E0E0] mb-2">
            Coming Soon
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
            {description}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
            This feature will be available in Phase 4
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
