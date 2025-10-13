'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
            <svg
              className="h-8 w-8 text-amber-600 dark:text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Unauthorized Access
          </h1>

          <div className="mt-4 space-y-2">
            <p className="text-base text-gray-600 dark:text-gray-400">
              You need to be signed in to access this page.
            </p>

            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/10 p-4">
              <p className="text-sm text-amber-800 dark:text-amber-400">
                Your session may have expired or you don&apos;t have permission to view this content.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <Link
              href="/login"
              className="block w-full rounded-md bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm
                         hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                         focus-visible:outline-blue-600 transition-colors"
            >
              Sign In
            </Link>

            <button
              onClick={() => router.back()}
              className="block w-full rounded-md bg-white dark:bg-gray-800 px-4 py-3 text-center text-sm font-semibold
                         text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700
                         hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>

            <Link
              href="/"
              className="block w-full text-center text-sm font-medium text-gray-600 dark:text-gray-400
                         hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Go to Homepage
            </Link>
          </div>

          <div className="mt-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Need help?{' '}
              <a
                href="mailto:support@relationhub.com"
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
              >
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
