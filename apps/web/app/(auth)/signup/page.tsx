'use client';

import { SignupForm } from '@/components/auth/signup-form';
import { useEffect } from 'react';

export default function SignUpPage() {
  useEffect(() => {
    document.title = 'Sign Up | RelationHub';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <SignupForm />
    </div>
  );
}
