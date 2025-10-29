"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function AuthCodeErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 space-y-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>

            <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
              Authentication Error
            </h1>

            <div className="mt-4 space-y-2">
              <p className="text-base text-muted-foreground">
                There was a problem completing your sign-in request.
              </p>

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-left">
                  <p className="text-sm font-medium text-destructive">
                    Error: {error}
                  </p>
                  {errorDescription && (
                    <p className="mt-2 text-sm text-destructive">
                      {errorDescription}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-8 space-y-4">
              <Button asChild className="w-full">
                <Link href="/login">Try Signing In Again</Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="/">Go to Homepage</Link>
              </Button>
            </div>

            <div className="mt-8">
              <p className="text-sm text-muted-foreground">
                If this problem persists, please{" "}
                <a
                  href="mailto:support@cordiq.com"
                  className="font-medium text-primary hover:underline"
                >
                  contact support
                </a>
                .
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
