"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 space-y-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
              <Lock className="h-8 w-8 text-amber-500" />
            </div>

            <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
              Unauthorized Access
            </h1>

            <div className="mt-4 space-y-2">
              <p className="text-base text-muted-foreground">
                You need to be signed in to access this page.
              </p>

              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
                <p className="text-sm text-amber-500">
                  Your session may have expired or you don&apos;t have
                  permission to view this content.
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <Button asChild className="w-full">
                <Link href="/login">Sign In</Link>
              </Button>

              <Button
                onClick={() => router.back()}
                variant="outline"
                className="w-full"
              >
                Go Back
              </Button>

              <Button asChild variant="ghost" className="w-full">
                <Link href="/">Go to Homepage</Link>
              </Button>
            </div>

            <div className="mt-8">
              <p className="text-sm text-muted-foreground">
                Need help?{" "}
                <a
                  href="mailto:support@cordiq.com"
                  className="font-medium text-primary hover:underline"
                >
                  Contact support
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
