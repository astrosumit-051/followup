import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Plus } from "lucide-react";

/**
 * Dashboard Page
 *
 * Protected route that requires authentication.
 * Middleware will redirect unauthenticated users to /login.
 */
export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8">
      {/* Header with theme toggle */}
      <div className="flex justify-end mb-8">
        <ThemeToggle />
      </div>

      <div className="flex flex-col items-center justify-center flex-1">
        <div className="max-w-4xl w-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2 text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome to your Cordiq dashboard!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Get started by adding contacts or viewing your network.
                </p>

                <Separator />

                <div className="space-y-3">
                  <Button asChild className="w-full">
                    <Link href="/contacts/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Quick Add Contact
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="w-full">
                    <Link href="/contacts">View All Contacts</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Card */}
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You are successfully authenticated. Your session is
                  automatically refreshed.
                </p>

                <Separator />

                <LogoutButton className="w-full">Sign Out</LogoutButton>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Cordiq helps you manage your professional network with
                AI-powered features.
              </p>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="font-medium text-sm">1. Add Contacts</div>
                  <p className="text-xs text-muted-foreground">
                    Start building your network by adding professional contacts.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="font-medium text-sm">2. Organize</div>
                  <p className="text-xs text-muted-foreground">
                    Use priorities, tags, and filters to stay organized.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="font-medium text-sm">3. Engage</div>
                  <p className="text-xs text-muted-foreground">
                    Set reminders and track interactions to maintain
                    relationships.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              More features coming soon including AI email generation and
              analytics.
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
