"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Calendar as CalendarIcon, TrendingUp, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { useContactGrowthData, DateRangeFilter } from "@/lib/hooks/useDashboard";

/**
 * Growth Card Component
 *
 * Displays contact growth trends over time with interactive date range filtering
 * Features:
 * - Line chart with area gradient using Recharts
 * - Date range filters (Weekly, Monthly, Yearly, Custom)
 * - Custom date picker with shadcn Calendar
 * - Responsive chart dimensions (300px min, 400px max height)
 * - Brand colors (mint green #A8E6A3 for line, gradient for area)
 * - Hover tooltips showing date and contact count
 */
export function GrowthCard() {
  const [dateRange, setDateRange] = useState<DateRangeFilter>("MONTHLY");
  const [isCustomPickerOpen, setIsCustomPickerOpen] = useState(false);
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined);

  const { data: growthData, isLoading, error } = useContactGrowthData(dateRange);

  const handleDateRangeChange = (range: DateRangeFilter) => {
    setDateRange(range);
    if (range !== "CUSTOM") {
      setCustomDate(undefined);
    }
  };

  const handleCustomDateSelect = (date: Date | undefined) => {
    setCustomDate(date);
    setIsCustomPickerOpen(false);
    // Note: Custom date range implementation would require additional backend support
    // For now, this sets the date but doesn't change the query
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Growth Trends</CardTitle>
          <CardDescription>Contact growth over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-600">
            Failed to load growth data. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="growth-card" className="rounded-card shadow-card hover:shadow-card-hover transition-shadow duration-200">
      <CardHeader>
        <div className="flex flex-col gap-4
                        md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Growth Trends</CardTitle>
            <CardDescription>Track your network expansion</CardDescription>
          </div>

          {/* Date Range Filter Buttons */}
          <div className="grid grid-cols-2 gap-2 w-full xs:w-auto
                          md:flex md:items-center">
            <Button
              variant={dateRange === "WEEKLY" ? "default" : "outline"}
              size="sm"
              className="min-h-[44px] text-xs sm:text-sm"
              onClick={() => handleDateRangeChange("WEEKLY")}
            >
              Weekly
            </Button>
            <Button
              variant={dateRange === "MONTHLY" ? "default" : "outline"}
              size="sm"
              className="min-h-[44px] text-xs sm:text-sm"
              onClick={() => handleDateRangeChange("MONTHLY")}
            >
              Monthly
            </Button>
            <Button
              variant={dateRange === "YEARLY" ? "default" : "outline"}
              size="sm"
              className="min-h-[44px] text-xs sm:text-sm"
              onClick={() => handleDateRangeChange("YEARLY")}
            >
              Yearly
            </Button>

            {/* Custom Date Picker */}
            <Popover open={isCustomPickerOpen} onOpenChange={setIsCustomPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={dateRange === "CUSTOM" ? "default" : "outline"}
                  size="sm"
                  className="min-h-[44px] text-xs sm:text-sm"
                  onClick={() => {
                    setDateRange("CUSTOM");
                    setIsCustomPickerOpen(true);
                  }}
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {customDate ? format(customDate, "MMM dd, yyyy") : "Custom"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={customDate}
                  onSelect={handleCustomDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading || !growthData ? (
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ) : !growthData.dataPoints || growthData.dataPoints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              No growth data available
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 mb-4">
              Add contacts to see growth trends
            </p>
            <Link href="/contacts?action=create">
              <Button
                size="sm"
                className="bg-[#0A0A0A] hover:bg-[#1A1A1A] text-white transition-all duration-200"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Chart */}
            <ResponsiveContainer width="100%" height={350} minHeight={300} maxHeight={400}>
              <AreaChart
                data={growthData.dataPoints}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorContacts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A8E6A3" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#A8E6A3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    if (dateRange === "WEEKLY") {
                      return format(date, "MMM dd");
                    } else if (dateRange === "MONTHLY") {
                      return format(date, "MMM yyyy");
                    } else {
                      return format(date, "yyyy");
                    }
                  }}
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "8px 12px",
                  }}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return format(date, "MMMM dd, yyyy");
                  }}
                  formatter={(value: number) => [
                    `${value.toLocaleString()} contacts`,
                    "Total Contacts",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="contactCount"
                  stroke="#A8E6A3"
                  strokeWidth={3}
                  fill="url(#colorContacts)"
                  activeDot={{ r: 6, fill: "#A8E6A3" }}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Summary Stats */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">Period: </span>
                {dateRange === "WEEKLY" && "Last 7 Days"}
                {dateRange === "MONTHLY" && "Last 12 Months"}
                {dateRange === "YEARLY" && "Last 5 Years"}
                {dateRange === "CUSTOM" && customDate
                  ? `Custom (${format(customDate, "MMM dd, yyyy")})`
                  : "Custom Range"}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">Total Growth: </span>
                {growthData?.dataPoints && growthData.dataPoints.length > 0 && (
                  <span className="text-green-600 font-semibold">
                    +
                    {(
                      growthData.dataPoints[growthData.dataPoints.length - 1]
                        .contactCount -
                      growthData.dataPoints[0].contactCount
                    ).toLocaleString()}{" "}
                    contacts
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
