'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function AuthCodeErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <svg
              className="h-8 w-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Authentication Error
          </h1>

          <div className="mt-4 space-y-2">
            <p className="text-base text-gray-600 dark:text-gray-400">
              There was a problem completing your sign-in request.
            </p>

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/10 p-4 text-left">
                <p className="text-sm font-medium text-red-800 dark:text-red-400">
                  Error: {error}
                </p>
                {errorDescription && (
                  <p className="mt-2 text-sm text-red-700 dark:text-red-500">
                    {errorDescription}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 space-y-4">
            <Link
              href="/login"
              className="block w-full rounded-md bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm
                         hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                         focus-visible:outline-blue-600 transition-colors"
            >
              Try Signing In Again
            </Link>

            <Link
              href="/"
              className="block w-full rounded-md bg-white dark:bg-gray-800 px-4 py-3 text-center text-sm font-semibold
                         text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700
                         hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Go to Homepage
            </Link>
          </div>

          <div className="mt-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              If this problem persists, please{' '}
              <a
                href="mailto:support@relationhub.com"
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
              >
                contact support
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
