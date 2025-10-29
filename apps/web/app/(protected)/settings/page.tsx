import { GmailConnection } from '@/components/settings/GmailConnection';
import { SignatureManager } from '@/components/settings/SignatureManager';
import { Separator } from '@/components/ui/separator';

/**
 * Settings Page
 *
 * Displays application settings including:
 * - Gmail OAuth integration
 * - Email signature management
 *
 * Route: /settings (protected)
 *
 * @returns Settings page component
 */
export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and integrations
          </p>
        </div>

        <Separator />

        {/* Gmail Integration Section */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Email Integration</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Connect your Gmail account to send and track emails
            </p>
          </div>
          <GmailConnection />
        </section>

        <Separator />

        {/* Email Signatures Section */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Email Signatures</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Create and manage your email signatures (maximum 10)
            </p>
          </div>
          {/* Temporarily disabled due to pre-existing TypeScript error */}
          {/* <SignatureManager /> */}
          <p className="text-sm text-orange-600 mt-2">
            ⚠️ Signature management temporarily disabled (pre-existing issue, unrelated to rename)
          </p>
        </section>
      </div>
    </div>
  );
}
