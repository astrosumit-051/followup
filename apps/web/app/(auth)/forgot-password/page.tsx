"use client";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEffect } from "react";

export default function ForgotPasswordPage() {
  useEffect(() => {
    document.title = "Forgot Password | RelationHub";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">

      {/* Theme Toggle - Fixed to top-right corner */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <ForgotPasswordForm />
    </div>
  );
}
