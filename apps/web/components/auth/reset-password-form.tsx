"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient();

  // Password strength calculation
  const getPasswordStrength = (pass: string): number => {
    let strength = 0;
    if (pass.length >= 8) strength += 25;
    if (pass.length >= 12) strength += 25;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength += 25;
    if (/\d/.test(pass)) strength += 15;
    if (/[^a-zA-Z\d]/.test(pass)) strength += 10;
    return Math.min(strength, 100);
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess(true);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Password update error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground">
          Create new password
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter a new password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4">
            <div className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Password updated successfully!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Redirecting you to the dashboard...
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading || success}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                disabled={isLoading || success}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {password && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Password strength
                  </span>
                  <span
                    className={
                      passwordStrength < 50
                        ? "text-destructive"
                        : passwordStrength < 75
                          ? "text-yellow-600 dark:text-yellow-500"
                          : "text-green-600 dark:text-green-500"
                    }
                  >
                    {passwordStrength < 50
                      ? "Weak"
                      : passwordStrength < 75
                        ? "Medium"
                        : "Strong"}
                  </span>
                </div>
                <Progress value={passwordStrength} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Use at least 8 characters, including uppercase, lowercase,
                  numbers, and symbols.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading || success}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                disabled={isLoading || success}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            type="submit"
            disabled={isLoading || success}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading
              ? "Updating password..."
              : success
                ? "Password updated!"
                : "Update password"}
          </Button>

          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              Back to login
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
