"use client";

import { SignupForm } from "@/components/auth/signup-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEffect } from "react";

export default function SignUpPage() {
  useEffect(() => {
    document.title = "Sign Up | RelationHub";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">

      {/* Theme Toggle - Fixed to top-right corner */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <SignupForm />
    </div>
  );
}
