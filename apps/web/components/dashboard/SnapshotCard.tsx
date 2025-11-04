"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown, Minus, Users, Mail, Eye } from "lucide-react";
import { useDashboardData } from "@/lib/hooks/useDashboard";

/**
 * Metric Card Component
 *
 * Reusable component for displaying a single KPI metric with trend arrow
 */
interface MetricCardProps {
  label: string;
  value: number | string;
  change?: number;
  suffix?: string;
  icon: React.ReactNode;
  tooltip?: string;
  testId?: string;
}

function MetricCard({ label, value, change, suffix = "", icon, tooltip, testId }: MetricCardProps) {
  // Determine trend direction and color
  const getTrendDisplay = () => {
    if (change === undefined || change === 0) {
      return {
        icon: <Minus className="w-4 h-4" />,
        color: "text-gray-500",
        bgColor: "bg-gray-100 dark:bg-gray-800",
      };
    }

    if (change > 0) {
      return {
        icon: <ArrowUp className="w-4 h-4" />,
        color: "text-green-600",
        bgColor: "bg-green-100 dark:bg-green-900",
      };
    }

    return {
      icon: <ArrowDown className="w-4 h-4" />,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900",
    };
  };

  const trend = getTrendDisplay();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
            {icon}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full ${trend.bgColor} ${trend.color}`}
            title={tooltip}
          >
            {trend.icon}
            <span className="text-xs font-semibold">
              {Math.abs(change).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1">
        <span
          className="text-4xl font-bold text-gray-900 dark:text-[#E0E0E0]"
          data-testid={testId}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {suffix && (
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Snapshot Card Component
 *
 * Displays three key metrics in a card:
 * - Total Contacts with month-over-month change
 * - Open Rate (email tracking - mocked for now)
 * - Response Rate (email tracking - mocked for now)
 *
 * Features:
 * - Trend arrows (green up, red down, gray neutral)
 * - Skeleton loading states
 * - Hover tooltips with metric context
 * - Responsive grid layout
 */
export function SnapshotCard() {
  const { data: metrics, isLoading, error } = useDashboardData();

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Snapshot</CardTitle>
          <CardDescription>Key metrics overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-600">
            Failed to load metrics. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="snapshot-card" className="rounded-card shadow-card hover:shadow-card-hover transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Snapshot</CardTitle>
        <CardDescription>Key metrics at a glance</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading || !metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-10 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Contacts */}
            <MetricCard
              label="Total Contacts"
              value={metrics.totalContacts}
              change={metrics.contactsChangePercent}
              icon={<Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
              tooltip={`${metrics.contactsChangePercent > 0 ? "+" : ""}${metrics.contactsChangePercent.toFixed(1)}% from last month`}
              testId="total-contacts-value"
            />

            {/* Open Rate */}
            <MetricCard
              label="Open Rate"
              value={(metrics.openRate * 100).toFixed(0)}
              suffix="%"
              icon={<Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
              tooltip="Percentage of emails opened (tracking coming in Phase 4)"
              testId="open-rate-value"
            />

            {/* Response Rate */}
            <MetricCard
              label="Response Rate"
              value={(metrics.responseRate * 100).toFixed(0)}
              suffix="%"
              icon={<Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
              tooltip="Percentage of emails that received replies (tracking coming in Phase 4)"
              testId="response-rate-value"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
