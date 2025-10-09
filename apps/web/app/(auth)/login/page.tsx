'use client';

import { LoginForm } from '@/components/auth/login-form';
import { useEffect } from 'react';

export default function LoginPage() {
  useEffect(() => {
    document.title = 'Login | RelationHub';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4
                    sm:px-6
                    lg:px-8">
      <LoginForm />
    </div>
  );
}
