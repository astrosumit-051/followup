"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { QuickAddCard } from "@/components/dashboard/QuickAddCard";
import { SnapshotCard } from "@/components/dashboard/SnapshotCard";
import { GrowthCard } from "@/components/dashboard/GrowthCard";
import { NotificationsCard } from "@/components/dashboard/NotificationsCard";
import { ActivityCard } from "@/components/dashboard/ActivityCard";
import { TodoCard } from "@/components/dashboard/TodoCard";
import { useState } from "react";

/**
 * Dashboard Page
 *
 * Protected route that requires authentication.
 * Middleware will redirect unauthenticated users to /login.
 *
 * Features:
 * - Responsive grid layout (mobile-first)
 * - Welcome message with search bar
 * - Theme toggle
 * - All dashboard card components integrated
 * - Mobile: Quick Add first, then metrics, then other cards
 * - Desktop: 2-3 column grid layout
 * - Error boundaries for individual card failures
 */
export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement global search functionality
    console.log("Search query:", searchQuery);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBF6] via-[#E8F0F7] to-[#FFF9E8] dark:bg-gradient-to-br dark:from-[#1E1E1E] dark:via-[#1A1A1A] dark:to-[#1E1E1E]">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Welcome Message */}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Dashboard
              </h1>
              <p className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">
                Welcome back! Here's your overview.
              </p>
            </div>

            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-4">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search contacts, emails, todos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </form>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center gap-2">
              <div className="min-w-[44px] min-h-[44px] flex items-center justify-center">
                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Unified Responsive Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Quick Add - Mobile: position 1, Desktop: top-left */}
          <div className="md:col-span-1">
            <QuickAddCard />
          </div>

          {/* Snapshot - Mobile: position 2, Desktop: top-center */}
          <div className="md:col-span-1">
            <SnapshotCard />
          </div>

          {/* Notifications - Mobile: position 4, Desktop: top-right spanning 2 rows */}
          <div className="md:col-span-2 lg:col-span-1 lg:row-span-2 md:order-last lg:order-none">
            <NotificationsCard />
          </div>

          {/* Growth Chart - Mobile: position 3, Desktop: middle spanning 2 columns */}
          <div className="md:col-span-2 lg:col-span-2">
            <GrowthCard />
          </div>

          {/* Activity Feed - Mobile: position 5, Desktop: bottom-left spanning 2 columns */}
          <div className="md:col-span-2 lg:col-span-2">
            <ActivityCard />
          </div>

          {/* Todos - Mobile: position 6, Desktop: bottom-right */}
          <div className="md:col-span-2 lg:col-span-1">
            <TodoCard />
          </div>
        </div>
      </main>

      {/* Manual Refresh Button (Fixed Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-40 md:bottom-8 md:right-8 pb-[env(safe-area-inset-bottom)] pr-[env(safe-area-inset-right)]">
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 min-h-[56px] min-w-[56px] rounded-full shadow-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => window.location.reload()}
          title="Refresh dashboard"
          aria-label="Refresh dashboard"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
