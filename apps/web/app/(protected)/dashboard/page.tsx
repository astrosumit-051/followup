import { LogoutButton } from '@/components/auth/logout-button';

/**
 * Dashboard Page
 *
 * Protected route that requires authentication.
 * Middleware will redirect unauthenticated users to /login.
 */
export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome to your RelationHub dashboard!
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Quick Actions</h2>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              This is a protected route. You are successfully authenticated.
            </p>

            <LogoutButton className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
              Sign Out
            </LogoutButton>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Session is automatically refreshed to keep you logged in.</p>
        </div>
      </div>
    </div>
  );
}
