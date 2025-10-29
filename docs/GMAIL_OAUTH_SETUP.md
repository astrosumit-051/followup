# Gmail OAuth Setup Guide

This guide walks you through setting up Gmail OAuth 2.0 authentication for Cordiq's email sending functionality.

## Overview

Cordiq uses Gmail's OAuth 2.0 API to send emails on behalf of users. This requires:
1. A Google Cloud Project with Gmail API enabled
2. OAuth 2.0 credentials (Client ID and Secret)
3. Authorized redirect URIs configured
4. User consent for Gmail access

---

## Prerequisites

- A Google account with access to Google Cloud Console
- Admin access to your Cordiq deployment
- Backend API running (for testing OAuth callback)

---

## Step-by-Step Setup

### Step 1: Create a Google Cloud Project

1. **Navigate to Google Cloud Console**
   - Go to: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a new project** (or select existing)
   - Click the project dropdown in the top navigation bar
   - Click **"New Project"**
   - Enter project name: `Cordiq Email Service` (or your preference)
   - Click **"Create"**

3. **Wait for project creation**
   - This usually takes 10-30 seconds
   - You'll see a notification when complete

---

### Step 2: Enable Gmail API

1. **Navigate to API Library**
   - In the Google Cloud Console, click the navigation menu (☰)
   - Go to **"APIs & Services" > "Library"**

2. **Search for Gmail API**
   - In the search bar, type: `Gmail API`
   - Click on **"Gmail API"** from the results

3. **Enable the API**
   - Click the **"Enable"** button
   - Wait for activation (usually instant)

---

### Step 3: Configure OAuth Consent Screen

1. **Navigate to OAuth consent screen**
   - Go to **"APIs & Services" > "OAuth consent screen"**

2. **Choose User Type**
   - **For Development/Testing:**
     - Select **"External"** (allows any Google account to authenticate)
     - Click **"Create"**

   - **For Production:**
     - Select **"Internal"** (if using Google Workspace)
     - Or **"External"** with verified domain

3. **Configure App Information**

   **App name:**
   ```
   Cordiq
   ```

   **User support email:**
   ```
   your-email@example.com
   ```

   **App logo:** (Optional)
   - Upload your Cordiq logo (120x120 pixels recommended)

   **Application home page:**
   ```
   http://localhost:3000  (development)
   https://your-domain.com  (production)
   ```

   **Application privacy policy:**
   ```
   https://your-domain.com/privacy  (if available)
   ```

   **Application terms of service:**
   ```
   https://your-domain.com/terms  (if available)
   ```

   **Authorized domains:**
   - For development: Leave empty or add `localhost`
   - For production: Add your domain (e.g., `your-domain.com`)

   **Developer contact information:**
   ```
   your-email@example.com
   ```

4. **Click "Save and Continue"**

---

### Step 4: Configure OAuth Scopes

1. **Add Required Scopes**
   - Click **"Add or Remove Scopes"**

2. **Select Gmail Scopes**

   Cordiq requires these scopes:

   - `https://www.googleapis.com/auth/gmail.send`
     - **Permission:** Send email on your behalf
     - **Reason:** Required to send emails via Gmail API

   - `https://www.googleapis.com/auth/gmail.readonly`
     - **Permission:** Read email metadata
     - **Reason:** Optional - for future features (sent email verification)

3. **Filter and select scopes**
   - In the "Manually add scopes" field, paste:
     ```
     https://www.googleapis.com/auth/gmail.send
     https://www.googleapis.com/auth/gmail.readonly
     ```
   - Click **"Add to Table"**

4. **Verify scopes are added**
   - You should see both scopes in the "Your sensitive scopes" table
   - Click **"Update"**

5. **Click "Save and Continue"**

---

### Step 5: Add Test Users (Development Only)

**⚠️ Skip this step if using "Internal" user type**

For External apps in Testing mode:

1. **Add Test Users**
   - Click **"Add Users"**
   - Enter email addresses of users who will test the OAuth flow:
     ```
     test-user-1@gmail.com
     test-user-2@gmail.com
     your-personal-email@gmail.com
     ```
   - Click **"Add"**

2. **Note:**
   - Only these users can authenticate during testing
   - You can add up to 100 test users
   - For production, submit for Google verification (takes 1-2 weeks)

3. **Click "Save and Continue"**

---

### Step 6: Create OAuth 2.0 Credentials

1. **Navigate to Credentials**
   - Go to **"APIs & Services" > "Credentials"**

2. **Create OAuth Client ID**
   - Click **"+ Create Credentials"**
   - Select **"OAuth client ID"**

3. **Configure OAuth Client**

   **Application type:**
   ```
   Web application
   ```

   **Name:**
   ```
   Cordiq Backend (Development)
   ```
   OR
   ```
   Cordiq Backend (Production)
   ```

4. **Add Authorized Redirect URIs**

   Click **"+ Add URI"** and enter:

   **For Development:**
   ```
   http://localhost:3001/api/auth/gmail/callback
   ```
   OR
   ```
   http://localhost:4000/api/auth/gmail/callback
   ```
   (Use the port your backend API runs on)

   **For Production:**
   ```
   https://api.your-domain.com/api/auth/gmail/callback
   ```

   **Important Notes:**
   - The URI must **exactly match** what your backend uses
   - Include the protocol (`http://` or `https://`)
   - Do NOT include trailing slashes
   - You can add multiple URIs for different environments

5. **Click "Create"**

---

### Step 7: Copy Credentials

After creating the OAuth client, you'll see a modal with your credentials:

1. **Copy Client ID**
   ```
   123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
   ```

2. **Copy Client Secret**
   ```
   GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz
   ```

3. **Download JSON** (Optional)
   - Click **"Download JSON"**
   - Save as `google-oauth-credentials.json`
   - **DO NOT commit this file to Git**

4. **Click "OK"**

---

### Step 8: Configure Backend Environment Variables

1. **Open your backend `.env` file**
   ```bash
   cd apps/api
   nano .env  # or use your preferred editor
   ```

2. **Add/Update Gmail OAuth variables**
   ```env
   # Gmail OAuth Configuration
   GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz
   GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/gmail/callback
   ```

3. **Generate Encryption Key**

   Gmail OAuth tokens are encrypted before storage. Generate a secure encryption key:

   ```bash
   openssl rand -hex 32
   ```

   Copy the output (64-character hex string) and add to `.env`:

   ```env
   # Encryption key for Gmail OAuth tokens (keep this secret!)
   ENCRYPTION_KEY=a1b2c3d4e5f6789...  # 64 characters
   ```

   **⚠️ Security Warning:**
   - Never commit this key to Git
   - Store it securely in production (e.g., AWS Secrets Manager, Vault)
   - Rotating this key will invalidate all existing Gmail connections

4. **Save the file**

5. **Restart your backend API**
   ```bash
   pnpm dev  # or your start command
   ```

---

### Step 9: Test OAuth Flow

1. **Start your frontend and backend**
   ```bash
   # Terminal 1: Backend
   cd apps/api
   pnpm dev

   # Terminal 2: Frontend
   cd apps/web
   pnpm dev
   ```

2. **Navigate to Settings**
   - Open your browser to: `http://localhost:3000/settings`
   - Log in if needed

3. **Connect Gmail**
   - Find the "Email Integration" section
   - Click **"Connect Gmail"** button

4. **OAuth Flow**
   - A popup window opens with Google's OAuth consent screen
   - Select the Google account you want to use
   - Review the requested permissions:
     - ✅ Send emails on your behalf
     - ✅ Read email metadata (optional)
   - Click **"Allow"**

5. **Verify Connection**
   - The popup closes automatically
   - You should see: **"Gmail Connected"** with your email address
   - A **"Disconnect Gmail"** button appears

6. **Test Email Sending**
   - Navigate to: `http://localhost:3000/compose`
   - Select a contact
   - Compose an email
   - Click **"Send"**
   - Check your Gmail "Sent" folder - the email should appear there

---

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem:** The redirect URI doesn't match what's configured in Google Cloud Console

**Solution:**
1. Check your backend `.env` file:
   ```env
   GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/gmail/callback
   ```
2. Go to Google Cloud Console > Credentials
3. Edit your OAuth client
4. Verify the redirect URI exactly matches (including protocol, port, and path)
5. Add the URI if missing
6. Wait 5-10 minutes for changes to propagate
7. Clear your browser cache and try again

---

### Error: "access_denied"

**Problem:** User declined the OAuth consent, or app is restricted

**Solutions:**

1. **If user clicked "Cancel":**
   - Click "Connect Gmail" again
   - Click "Allow" on the consent screen

2. **If using External + Testing mode:**
   - Go to Google Cloud Console > OAuth consent screen
   - Click "Add Users" under Test users
   - Add the email address attempting to authenticate
   - Try again

3. **If using Internal type:**
   - Ensure the user is part of your Google Workspace organization

---

### Error: "invalid_grant"

**Problem:** The OAuth token has expired or been revoked

**Solutions:**
1. Click "Disconnect Gmail" in Settings
2. Click "Connect Gmail" again to re-authenticate
3. If issue persists, revoke access manually:
   - Go to: https://myaccount.google.com/permissions
   - Find "Cordiq" in the list
   - Click "Remove Access"
   - Try connecting again

---

### Error: "Encryption key not configured"

**Problem:** `ENCRYPTION_KEY` is missing from `.env`

**Solution:**
1. Generate a new encryption key:
   ```bash
   openssl rand -hex 32
   ```
2. Add to `apps/api/.env`:
   ```env
   ENCRYPTION_KEY=your-64-char-hex-string-here
   ```
3. Restart backend API

---

### Error: "Gmail API has not been used in project..."

**Problem:** Gmail API is not enabled for your Google Cloud Project

**Solution:**
1. Go to: https://console.cloud.google.com/apis/library/gmail.googleapis.com
2. Select your project
3. Click **"Enable"**
4. Wait 1-2 minutes
5. Try the OAuth flow again

---

### OAuth Popup Blocked

**Problem:** Browser is blocking the OAuth popup window

**Solutions:**
1. **Allow popups for localhost:**
   - Chrome: Look for popup blocked icon in address bar (right side)
   - Click it and select "Always allow popups from localhost"
   - Try again

2. **Check popup blocker settings:**
   - Chrome: Settings > Privacy and security > Site settings > Popups
   - Add `http://localhost:3000` to "Allowed to send popups"

3. **Try a different browser:**
   - Firefox and Edge generally have less aggressive popup blocking

---

## Production Deployment

When deploying to production:

### 1. Update Redirect URI

**Google Cloud Console:**
- Go to Credentials > Edit OAuth Client
- Add production redirect URI:
  ```
  https://api.your-domain.com/api/auth/gmail/callback
  ```

**Backend `.env` (production):**
```env
GOOGLE_REDIRECT_URI=https://api.your-domain.com/api/auth/gmail/callback
```

### 2. Verify OAuth Consent Screen

**For public release:**
1. Go to OAuth consent screen
2. Click "Publish App"
3. Submit for Google verification (required for External + Production)
4. Verification takes 1-2 weeks
5. Provide:
   - Privacy policy URL
   - Terms of service URL
   - App demonstration video (if requested)
   - Justification for requested scopes

**Until verified:**
- App shows "Unverified app" warning
- Limited to 100 users
- Users must click "Advanced" > "Go to Cordiq (unsafe)"

### 3. Secure Encryption Key

**DO NOT store `ENCRYPTION_KEY` in plain text in production**

**Recommended approaches:**

1. **AWS Secrets Manager:**
   ```bash
   aws secretsmanager create-secret \
     --name cordiq/gmail-encryption-key \
     --secret-string "your-64-char-hex-string"
   ```

2. **HashiCorp Vault:**
   ```bash
   vault kv put secret/cordiq/gmail encryption_key=your-key-here
   ```

3. **Environment variable from CI/CD:**
   - Store in GitHub Secrets
   - Inject during deployment

### 4. Monitor OAuth Usage

**Google Cloud Console > APIs & Services > Dashboard**
- Monitor daily API quota usage
- Gmail API quotas:
  - Send: 500 emails/day (free tier)
  - Read: 1 billion quota units/day
- Request quota increase if needed (Quotas page)

---

## Security Best Practices

### 1. Scope Minimization
- Only request scopes you actually use
- Remove `gmail.readonly` if not needed
- Regularly audit required permissions

### 2. Token Storage
- ✅ Tokens are encrypted with AES-256-GCM before database storage
- ✅ Encryption key stored separately (environment variable)
- ✅ Tokens never exposed in API responses
- ✅ Users can revoke access anytime

### 3. Error Handling
- Never log OAuth tokens (access_token, refresh_token)
- Mask tokens in error messages
- Use generic error messages for users

### 4. Monitoring
- Log OAuth connection/disconnection events
- Track failed authentication attempts
- Alert on unusual token refresh patterns

---

## Additional Resources

- **Gmail API Documentation:** https://developers.google.com/gmail/api
- **OAuth 2.0 Guide:** https://developers.google.com/identity/protocols/oauth2
- **API Quotas:** https://developers.google.com/gmail/api/reference/quota
- **Scopes Reference:** https://developers.google.com/gmail/api/auth/scopes

---

## Support

If you encounter issues not covered in this guide:

1. Check backend logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure Gmail API is enabled in Google Cloud Console
4. Check Google Cloud Console > APIs & Services > Dashboard for API errors
5. Refer to the main troubleshooting guide: `/docs/TROUBLESHOOTING.md`

---

**Last Updated:** 2025-10-28
**Version:** 1.0.0
