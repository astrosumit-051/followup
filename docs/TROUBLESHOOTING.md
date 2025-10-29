# Troubleshooting Guide

This guide covers common issues you may encounter while using Cordiq's email composition features and their solutions.

---

## Table of Contents

1. [Gmail OAuth Issues](#gmail-oauth-issues)
2. [S3 Attachment Upload Issues](#s3-attachment-upload-issues)
3. [Bulk Email Campaign Issues](#bulk-email-campaign-issues)
4. [Email Composition Issues](#email-composition-issues)
5. [Draft Management Issues](#draft-management-issues)
6. [AI Features Issues](#ai-features-issues)
7. [General Application Issues](#general-application-issues)

---

## Gmail OAuth Issues

### Error: "redirect_uri_mismatch"

**Problem:** The redirect URI doesn't match what's configured in Google Cloud Console.

**Symptoms:**
- OAuth flow fails with "redirect_uri_mismatch" error
- Cannot complete Gmail authentication

**Solutions:**

1. **Check your backend `.env` file:**
   ```env
   GOOGLE_REDIRECT_URI=http://localhost:3001/gmail/callback
   ```

2. **Verify in Google Cloud Console:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Select your OAuth 2.0 Client ID
   - Check "Authorized redirect URIs" section
   - The URI must **exactly match** including:
     - Protocol (`http://` or `https://`)
     - Port number
     - Path
     - No trailing slashes

3. **For production:**
   ```
   https://api.your-domain.com/gmail/callback
   ```

4. **Wait for propagation:**
   - Changes in Google Cloud Console take 5-10 minutes to propagate
   - Clear browser cache and cookies
   - Try again after waiting

---

### Error: "access_denied"

**Problem:** User declined OAuth consent, or app is restricted.

**Symptoms:**
- User clicks "Cancel" on Google consent screen
- User sees "This app isn't verified" warning
- OAuth flow redirects back with error

**Solutions:**

**1. If user clicked "Cancel":**
- Click "Connect Gmail" again
- Click "Allow" on the consent screen

**2. If using External + Testing mode:**
- Go to: https://console.cloud.google.com/apis/credentials/consent
- Click "Add Users" under Test users section
- Add the email address attempting to authenticate
- Save and try again

**3. If using Internal type:**
- Ensure the user is part of your Google Workspace organization
- Internal apps only work for users in the same Workspace

**4. If you see "Unverified app" warning:**
- Click "Advanced" at the bottom of the warning
- Click "Go to Cordiq (unsafe)"
- This is normal for apps in testing mode
- For production, submit for Google verification (takes 1-2 weeks)

---

### Error: "invalid_grant"

**Problem:** The OAuth token has expired or been revoked.

**Symptoms:**
- Previously connected Gmail account stops working
- Email sending fails with authentication error
- "Token expired" or "Invalid credentials" messages

**Solutions:**

**1. Refresh the connection:**
- Go to Settings → Email Integration
- Click "Disconnect Gmail"
- Click "Connect Gmail" again
- Complete OAuth flow

**2. Manual revocation (if above doesn't work):**
- Visit: https://myaccount.google.com/permissions
- Find "Cordiq" in the list of connected apps
- Click "Remove Access"
- Go back to Cordiq Settings
- Click "Connect Gmail" again

**3. Check for token corruption:**
- If issue persists, contact support
- Backend may need to clear encrypted tokens from database

---

### OAuth Popup Blocked

**Problem:** Browser is blocking the OAuth popup window.

**Symptoms:**
- Clicking "Connect Gmail" does nothing
- No popup window appears
- Browser shows popup blocked icon in address bar

**Solutions:**

**1. Allow popups for localhost (Chrome):**
- Look for popup blocked icon in address bar (right side)
- Click the icon
- Select "Always allow popups from http://localhost:3000"
- Click "Connect Gmail" again

**2. Check popup blocker settings:**
- Chrome: Settings → Privacy and security → Site settings → Popups
- Add `http://localhost:3000` to "Allowed to send popups"
- For production: Add your production domain

**3. Try a different browser:**
- Firefox and Edge generally have less aggressive popup blocking
- Safari may require similar configuration

**4. Temporary workaround:**
- Disable popup blocker temporarily for testing
- Not recommended for production use

---

## S3 Attachment Upload Issues

### Error: "Access Denied"

**Problem:** AWS IAM permissions are not configured correctly.

**Symptoms:**
- File upload fails immediately
- Console shows 403 Forbidden error
- S3 upload error message displayed

**Solutions:**

**1. Verify IAM policy:**

Check your IAM user/role has this policy attached:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name"
    }
  ]
}
```

**2. Check bucket policy:**

Your S3 bucket should have a policy allowing uploads from your backend:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowBackendUploads",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR_ACCOUNT_ID:user/YOUR_IAM_USER"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

**3. Verify environment variables:**

In `apps/api/.env`:
```env
AWS_REGION=us-east-1
S3_BUCKET=your-actual-bucket-name
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

**4. Test with AWS CLI:**
```bash
aws s3 cp test.txt s3://your-bucket-name/test.txt
```

If this fails, your AWS credentials are incorrect.

---

### Error: "SignatureDoesNotMatch"

**Problem:** Presigned URL signature is invalid or expired.

**Symptoms:**
- File upload fails with 403 error
- Error message mentions signature mismatch
- Upload works initially, then fails after some time

**Solutions:**

**1. Check system clock:**
- Presigned URLs are time-sensitive
- Ensure your server clock is synchronized with NTP
- Run: `sudo ntpdate -s time.nist.gov` (Linux/Mac)

**2. Verify expiration time:**

In `apps/api/src/attachments/attachment.service.ts`:
```typescript
const presignedUrl = await this.s3Client.getSignedUrlPromise('putObject', {
  Bucket: this.s3Bucket,
  Key: key,
  Expires: 900, // 15 minutes - may need to increase
  ContentType: mimeType,
});
```

**3. Check CORS configuration:**

Your S3 bucket needs proper CORS rules. See `docs/S3_ATTACHMENT_SETUP.md` for details.

**4. Verify AWS credentials:**
- Ensure `AWS_SECRET_ACCESS_KEY` is correct (no extra spaces)
- Regenerate access key if needed

---

### Error: "NoSuchBucket"

**Problem:** S3 bucket doesn't exist or name is incorrect.

**Symptoms:**
- All uploads fail immediately
- Console shows 404 error
- Backend logs mention bucket not found

**Solutions:**

**1. Verify bucket exists:**
```bash
aws s3 ls s3://your-bucket-name
```

**2. Check bucket name in `.env`:**
```env
S3_BUCKET=your-bucket-name  # Must match exactly
```

**3. Verify AWS region:**
```env
AWS_REGION=us-east-1  # Must match bucket region
```

To find your bucket's region:
```bash
aws s3api get-bucket-location --bucket your-bucket-name
```

**4. Create bucket if missing:**
```bash
aws s3 mb s3://your-bucket-name --region us-east-1
```

---

### Slow Upload Performance

**Problem:** File uploads take too long (>10 seconds for <25MB).

**Symptoms:**
- Progress bar moves slowly
- Large files timeout
- Users complain about slow uploads

**Solutions:**

**1. Check network connection:**
- Test upload speed: https://fast.com
- Ensure stable internet connection
- Try wired connection instead of WiFi

**2. Verify S3 region:**
- Use S3 bucket in region closest to users
- us-east-1 typically has best performance for US users
- Consider CloudFront CDN for global distribution

**3. Enable multipart upload for large files:**

In `apps/web/components/email/FileUploadZone.tsx`, large files (>5MB) should use multipart upload:

```typescript
// This is already implemented, but verify it's working:
if (file.size > 5 * 1024 * 1024) {
  // Use multipart upload logic
}
```

**4. Check browser console:**
- Look for network errors or retries
- Check if CORS errors are causing failures
- Verify presigned URL is being generated correctly

---

## Bulk Email Campaign Issues

### Error: Rate Limiting

**Problem:** Exceeded bulk send limits.

**Symptoms:**
- Campaign fails with "Rate limit exceeded" error
- Only some emails sent before failure
- Error message mentions 429 status code

**Solutions:**

**1. Check current limits:**

Backend enforces:
- **100 emails per day** per user (Gmail API limit)
- **60 bulk campaigns per hour** per user
- **10 AI generations per minute** per user

**2. Verify your send count:**
- Check GraphQL API for today's send count
- Query: `{ me { emailsSentToday } }`

**3. Request quota increase:**

For Gmail API:
- Go to: https://console.cloud.google.com/apis/api/gmail.googleapis.com/quotas
- Request quota increase if needed
- Typical limit: 500 emails/day (free tier) or 2,000/day (paid)

**4. Distribute sending:**
- Break large campaigns into smaller batches
- Wait 1-2 hours between batches
- Use scheduled sending feature

**5. Production workaround:**

For production deployments with high volume:
- Use Mailgun, SendGrid, or AWS SES instead of Gmail
- These services support 10,000+ emails/day
- See `docs/EMAIL_PROVIDER_INTEGRATION.md` (if available)

---

### Error: Placeholder Validation Failure

**Problem:** Template contains invalid or unresolved placeholders.

**Symptoms:**
- Bulk send fails before sending any emails
- Error mentions "Invalid placeholder" or "Missing contact data"
- Specific contacts highlighted in error message

**Solutions:**

**1. Check placeholder syntax:**

Valid placeholders:
```
{{firstName}}
{{lastName}}
{{email}}
{{company}}
{{role}}
```

Invalid:
```
{firstName}      // Missing one brace
{{ firstName }}  // Extra spaces
{{first_name}}   // Wrong field name
```

**2. Verify contact data:**
- Ensure all contacts in campaign have required fields
- Check for null/undefined values in contact records
- Run validation query before campaign:

```graphql
query ValidateCampaignContacts($contactIds: [String!]!) {
  contacts(ids: $contactIds) {
    id
    firstName
    lastName
    email
    company
    role
  }
}
```

**3. Use optional placeholders:**

For fields that may be missing:
```
Hi {{firstName}}!
```

Instead of:
```
Hi {{firstName}} {{lastName}}!  // Fails if lastName is null
```

**4. Add default values (backend enhancement):**

File: `apps/api/src/email/email.service.ts`

```typescript
resolvePlaceholders(template: string, contact: Contact): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return contact[key] || `[${key}]`; // Add default fallback
  });
}
```

---

### Campaign Sending Stuck or Incomplete

**Problem:** Campaign starts but doesn't complete.

**Symptoms:**
- Some emails sent, others pending
- Campaign status shows "In Progress" indefinitely
- No error messages displayed

**Solutions:**

**1. Check background job queue:**

If using BullMQ (production):
```bash
# Connect to Redis
redis-cli

# Check queue length
LLEN bull:email-queue:wait
LLEN bull:email-queue:active
LLEN bull:email-queue:failed

# View failed jobs
LRANGE bull:email-queue:failed 0 10
```

**2. Check backend logs:**
```bash
cd apps/api
pnpm logs  # or check Docker logs if containerized
```

Look for:
- Gmail API errors
- Database connection issues
- Memory errors

**3. Verify worker is running:**

For production deployments:
```bash
# Check if worker process is running
pm2 list  # or equivalent process manager
```

**4. Restart campaign:**
- Cancel current campaign
- Check sent status for each contact
- Re-send to contacts that didn't receive email

**5. Reduce batch size:**

In `apps/api/src/email/email.service.ts`:
```typescript
async sendBulkCampaign(campaign: Campaign) {
  const batchSize = 10; // Reduce from 50 to 10
  // Process in smaller batches
}
```

---

## Email Composition Issues

### Draft Auto-Save Not Working

**Problem:** Draft content is not saving automatically.

**Symptoms:**
- Typing doesn't trigger save
- localStorage shows old content
- No database sync happening

**Solutions:**

**1. Check browser localStorage:**

Open DevTools Console:
```javascript
// Check if draft exists
localStorage.getItem('draft-compose-test-contact-1')

// Should see debounce timestamp
localStorage.getItem('draft-debounce-compose-test-contact-1')
```

**2. Verify debounce timing:**

File: `apps/web/hooks/useAutoSave.ts`

```typescript
const debouncedSave = useDebouncedCallback(
  async (content) => {
    // Save to localStorage
    localStorage.setItem(storageKey, JSON.stringify(content));

    // Sync to database after 2 seconds
    setTimeout(() => syncToDatabase(content), 2000);
  },
  500 // Should trigger 500ms after typing stops
);
```

**3. Check network requests:**

In DevTools Network tab:
- Look for `POST /graphql` requests with `saveDraft` mutation
- If failing with 401: Authentication issue
- If failing with 500: Backend error (check logs)

**4. Test localStorage availability:**

```javascript
// In browser console
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
  console.log('localStorage is available');
} catch (e) {
  console.error('localStorage is disabled:', e);
}
```

**5. Clear corrupted draft:**
```javascript
// In browser console
localStorage.removeItem('draft-compose-test-contact-1');
```

---

### Draft Recovery Not Showing

**Problem:** Browser crashed but draft recovery prompt doesn't appear.

**Symptoms:**
- Had unsaved draft content
- Browser crashed or was closed
- Recovery modal doesn't appear on reload

**Solutions:**

**1. Check localStorage manually:**

```javascript
// In browser console
const draftKey = 'draft-compose-test-contact-1';
const draft = localStorage.getItem(draftKey);
console.log('Draft content:', JSON.parse(draft));
```

**2. Verify recovery logic:**

File: `apps/web/hooks/useDraftRecovery.ts`

Recovery should trigger if:
- localStorage has draft data
- Draft timestamp is within last 24 hours
- Draft is different from last saved version

**3. Manual recovery:**

If recovery prompt doesn't show:
```javascript
// Copy this in console
const draft = JSON.parse(localStorage.getItem('draft-compose-test-contact-1'));
console.log('Subject:', draft.subject);
console.log('Body:', draft.body);
// Copy content manually
```

**4. Check database for draft:**

Use GraphQL playground:
```graphql
query GetUserDrafts {
  emailDrafts(limit: 10) {
    edges {
      node {
        id
        subject
        body
        createdAt
        updatedAt
      }
    }
  }
}
```

---

### Attachment Upload Stuck

**Problem:** File uploads but shows "Uploading..." indefinitely.

**Symptoms:**
- Progress bar reaches 100% but doesn't complete
- File badge shows loading spinner
- Cannot remove or replace file

**Solutions:**

**1. Check presigned URL expiration:**

Presigned URLs expire after 15 minutes. If uploading a very large file or slow connection:

In `apps/api/src/attachments/attachment.service.ts`:
```typescript
Expires: 1800, // Increase from 900 to 1800 (30 minutes)
```

**2. Check S3 upload response:**

In DevTools Network tab:
- Find the `PUT` request to S3 (amazonaws.com domain)
- Status should be 200 OK
- If 403: Check CORS and bucket policy
- If 500: Check S3 service status

**3. Verify callback handling:**

File: `apps/web/components/email/FileUploadZone.tsx`

```typescript
const handleUpload = async (file: File) => {
  try {
    const { presignedUrl, key } = await getPresignedUrl(file);

    await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });

    // Should reach here
    setAttachments([...attachments, { key, name: file.name }]);
  } catch (error) {
    console.error('Upload failed:', error);
    // Check error message
  }
};
```

**4. Check browser console for errors:**
- CORS errors indicate S3 bucket configuration issue
- Network errors indicate connection problem
- Auth errors indicate presigned URL issue

---

### Cannot Remove Attachment

**Problem:** Clicking "X" on attachment doesn't remove it.

**Symptoms:**
- Click handler doesn't fire
- Attachment remains in list
- No console errors

**Solutions:**

**1. Verify click event:**

File: `apps/web/components/email/FileUploadZone.tsx`

```typescript
<button
  onClick={(e) => {
    e.preventDefault(); // Important!
    e.stopPropagation(); // Prevent form submission
    handleRemove(attachment.key);
  }}
>
  <X className="h-4 w-4" />
</button>
```

**2. Check if attachment is in state:**

```javascript
// In React DevTools
// Find FileUploadZone component
// Check attachments state array
```

**3. Verify S3 deletion:**

Check backend logs for:
```
DELETE s3://bucket-name/attachments/...
```

If deletion fails, attachment may remain in S3 but be removed from UI.

**4. Clear attachment state manually:**

If stuck in invalid state:
```javascript
// This is a temporary fix - report bug
localStorage.removeItem('draft-compose-test-contact-1');
window.location.reload();
```

---

## AI Features Issues

### AI Template Generation Slow

**Problem:** Generating email templates takes >5 seconds.

**Symptoms:**
- Long wait after clicking "Generate with AI"
- Timeout errors
- Poor user experience

**Solutions:**

**1. Check LLM provider status:**

- OpenRouter: https://status.openrouter.ai/
- OpenAI: https://status.openai.com/
- Anthropic: https://status.anthropic.com/

**2. Verify Redis caching is working:**

In backend logs, look for:
```
Cache hit for template generation: contact-123-casual
```

If not caching:
```bash
# Check Redis connection
redis-cli ping
# Should respond: PONG
```

**3. Check rate limiting:**

Backend limits:
- 10 AI generations per minute per user
- 100 OpenRouter API calls per minute (account limit)

If hitting limits, wait 60 seconds and try again.

**4. Switch LLM provider:**

In `apps/api/.env`:
```env
# Try different provider if OpenRouter is slow
OPENAI_API_KEY=sk-...
LLM_PROVIDER=openai  # or anthropic, gemini
```

**5. Reduce context length:**

For very long contact notes:
```typescript
// In apps/api/src/ai/ai.service.ts
const truncatedNotes = contact.notes.slice(0, 1000); // Limit to 1000 chars
```

---

### Polish Draft Returns Same Text

**Problem:** AI polish feature doesn't change the text.

**Symptoms:**
- Click "Formal", "Casual", etc. but text stays the same
- No AI changes visible
- Original draft unchanged

**Solutions:**

**1. Check if draft is empty:**

Polish Draft requires at least 10 characters of content:
```typescript
if (draft.body.length < 10) {
  throw new Error('Draft is too short to polish');
}
```

**2. Verify style parameter:**

In `apps/web/components/email/PolishDraftModal.tsx`:
```typescript
const handlePolish = async (style: 'formal' | 'casual' | 'elaborate' | 'concise') => {
  const result = await polishDraft({
    draftId: draft.id,
    style, // Must be one of the 4 valid styles
  });
};
```

**3. Check AI response:**

In DevTools Network tab:
- Find `POST /graphql` with `polishDraft` mutation
- Check response body for `polishedBody` field
- If empty, check backend logs for AI errors

**4. Verify prompt template:**

File: `apps/api/src/ai/prompts/polish-draft.template.ts`

Ensure template includes:
```typescript
<style>${style}</style>
<original_draft>${draftBody}</original_draft>
```

---

### Template Placeholders Not Resolving

**Problem:** Email sent with `{{firstName}}` instead of actual name.

**Symptoms:**
- Recipient sees placeholder text
- Variables not replaced
- Email looks unprofessional

**Solutions:**

**1. Verify contact data exists:**

```graphql
query CheckContact($id: String!) {
  contact(id: $id) {
    id
    firstName
    lastName
    email
  }
}
```

If `firstName` is null, placeholder cannot be resolved.

**2. Check placeholder resolution logic:**

File: `apps/api/src/email/email.service.ts`

```typescript
private resolvePlaceholders(template: string, contact: Contact): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = contact[key];
    if (!value) {
      console.warn(`Missing placeholder value for: ${key}`);
      return `[${key}]`; // Fallback
    }
    return value;
  });
}
```

**3. Test placeholder resolution:**

In GraphQL playground:
```graphql
mutation TestResolution {
  previewEmail(
    templateId: "test-template-id"
    contactId: "test-contact-id"
  ) {
    subject
    body
  }
}
```

**4. Update contact data:**

If fields are missing:
```graphql
mutation UpdateContact($id: String!, $input: UpdateContactInput!) {
  updateContact(id: $id, input: $input) {
    id
    firstName
    lastName
  }
}
```

---

## General Application Issues

### Authentication Errors

**Problem:** "Unauthorized" or "Invalid token" errors.

**Symptoms:**
- Logged in but API calls fail with 401
- Session expires unexpectedly
- Redirect to login page

**Solutions:**

**1. Check Supabase session:**

In browser console:
```javascript
// Check if session exists
const { data, error } = await supabase.auth.getSession();
console.log('Session:', data.session);
console.log('User:', data.session?.user);
```

**2. Verify JWT token:**

In DevTools Network tab:
- Find any `/graphql` request
- Check Headers → Authorization
- Should be: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**3. Refresh session:**

```typescript
// In apps/web/lib/supabase/client.ts
const { data, error } = await supabase.auth.refreshSession();
```

**4. Clear and re-authenticate:**
```javascript
// In browser console
await supabase.auth.signOut();
// Then log in again
```

**5. Check backend JWT verification:**

In `apps/api/src/auth/auth.guard.ts`:
```typescript
// Ensure SUPABASE_JWT_SECRET is correct in .env
```

---

### Database Connection Errors

**Problem:** Cannot connect to PostgreSQL database.

**Symptoms:**
- API returns 500 errors
- Backend logs show connection failures
- Prisma errors in console

**Solutions:**

**1. Check DATABASE_URL:**

In `apps/api/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/cordiq_dev?schema=public"
```

Verify:
- Username and password are correct
- Database name exists (`cordiq_dev`)
- Port 5432 is accessible

**2. Test connection:**
```bash
psql $DATABASE_URL
# Or
psql -h localhost -U user -d cordiq_dev
```

**3. Check if database is running:**
```bash
# For Docker Compose
docker-compose ps

# For local PostgreSQL
pg_isready -h localhost -p 5432
```

**4. Recreate database if needed:**
```bash
cd apps/api
pnpm prisma migrate reset  # WARNING: Deletes all data!
pnpm prisma migrate dev
```

**5. Check connection pool:**

In `apps/api/src/prisma/prisma.service.ts`:
```typescript
// Increase pool size if needed
const connectionLimit = process.env.DATABASE_POOL_SIZE || '10';
```

---

### GraphQL Errors

**Problem:** GraphQL queries/mutations fail unexpectedly.

**Symptoms:**
- Query returns null or errors
- Network tab shows 200 OK but response has errors
- Frontend displays "Something went wrong"

**Solutions:**

**1. Check GraphQL playground:**

Visit: http://localhost:4000/graphql

Test query directly:
```graphql
query TestConnection {
  me {
    id
    email
    name
  }
}
```

**2. Check authentication:**

Playground requires JWT token in headers:
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN_HERE"
}
```

Get token from browser:
```javascript
const { data } = await supabase.auth.getSession();
console.log('Token:', data.session?.access_token);
```

**3. Verify schema types:**

```bash
cd apps/api
pnpm schema:generate  # Regenerate TypeScript types
```

**4. Check resolver implementation:**

In `apps/api/src/*/**.resolver.ts`:
- Look for `@Query()` or `@Mutation()` decorators
- Verify return types match schema
- Check for unhandled errors

**5. Enable debug mode:**

In `apps/api/src/main.ts`:
```typescript
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn', 'debug'], // Add 'debug'
});
```

---

## Getting Additional Help

If you've tried the solutions above and still experience issues:

**1. Check backend logs:**
```bash
cd apps/api
pnpm dev  # Watch for errors in console
```

**2. Enable debug logging:**

In `apps/api/.env`:
```env
LOG_LEVEL=debug
```

**3. Check browser console:**
- Open DevTools (F12)
- Check Console tab for JavaScript errors
- Check Network tab for failed requests

**4. Collect diagnostic information:**
- What were you trying to do?
- What error message did you see? (screenshot if possible)
- What have you already tried?
- Backend logs (if accessible)
- Browser console errors

**5. Contact support:**
- Email: support@cordiq.com (if available)
- GitHub Issues: Create a new issue with:
  - Clear description of problem
  - Steps to reproduce
  - Expected vs actual behavior
  - Environment details (OS, browser, Node.js version)

---

**Last Updated:** 2025-10-28
**Version:** 1.0.0
