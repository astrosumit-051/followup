"use client";

import { LoginForm } from "@/components/auth/login-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEffect } from "react";

export default function LoginPage() {
  useEffect(() => {
    document.title = "Login | Cordiq";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">

      {/* Theme Toggle - Fixed to top-right corner */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <LoginForm />
    </div>
  );
}
