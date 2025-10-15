# Spec Requirements Document

> Spec: Email Composition Interface & Gmail OAuth Integration
> Created: 2025-10-15
> Status: Planning

## Overview

Implement a standalone email composition page with a two-section layout: contact selection sidebar (30%) and email composer (70%). The system supports both single and bulk email sending (campaign mode), AI-powered template generation with A/B testing display, "Polish Draft" feature with 4 style options, rich text editing, file attachments, and Gmail OAuth integration. Users can access Compose either directly as a navigation tab or from the Contacts page via dynamic CTAs ("Follow Up" vs "Cold Email").

## User Stories

### Story 1: Compose AI-Generated Email with A/B Template Selection

As a business professional, I want to generate AI-powered email templates and compare formal vs casual options side-by-side, so that I can choose the best tone for my relationship and send professional emails quickly.

**Workflow:**
1. User navigates to Compose tab (standalone page) from main navigation
2. Left sidebar (30% width) displays all contacts with search and filters (Company, Industry, Role, Gender, Birthday)
3. User filters contacts by "Tech Industry" and selects contact "John Doe"
4. Contact details populate in sidebar, composer area (70% width) activates
5. User clicks "Generate with AI" button in composer
6. Modal displays two templates side-by-side:
   - **Template A: Formal** - Professional greeting, structured content
   - **Template B: Casual** - Friendly tone, conversational style
7. Loading state shows (2-5s) while AI generates both versions
8. User clicks "Use Template A" (Formal)
9. Template loads into TipTap rich text editor
10. User edits content: adds bold, bullets, underlines
11. User uploads PDF resume as attachment (25MB limit)
12. Attachment uploads to S3 immediately with progress indicator
13. Signature auto-selected as "Formal" based on template style
14. User clicks "Send Email" via Gmail OAuth
15. Email sends successfully with tracking in conversation history

**Problem Solved:** Eliminates the friction between AI generation and email sending. Users can generate, compare two tone options (A/B testing), edit, and send in one seamless workflow without copy-pasting between tools or switching contexts.

### Story 2: Recover Unsaved Draft After Browser Crash

As a consultant who spends 20 minutes crafting a detailed proposal email, I want the system to auto-save my draft locally every 2 seconds and recover it after a browser crash, so that I never lose work even if my browser unexpectedly closes.

**Workflow:**
1. User navigates to Compose page and selects contact
2. User composes long email with attachments (20 minutes elapsed)
3. System auto-saves to localStorage every 2 seconds (instant feedback)
4. System syncs to database every 10 seconds (shown as "Saved 5s ago")
5. Browser crashes unexpectedly
6. User reopens browser and navigates to Compose page
7. System detects localStorage draft newer than DB version for this contact
8. "Recover unsaved draft?" prompt appears
9. User clicks "Recover" and all content + attachments restored in composer
10. User continues editing seamlessly

**Problem Solved:** Prevents devastating data loss from browser crashes, network issues, or accidental tab closures. Builds user confidence that their work is always protected.

### Story 3: Manage Multiple Professional Signatures

As a freelance consultant serving different industries, I want to create and manage multiple email signatures (Formal, Casual, Sales Pitch) and have the system auto-select the appropriate signature based on email context, so that my emails always have the right professional tone.

**Workflow:**
1. User navigates to Settings → Email Signatures
2. User creates "Formal Signature" with name, title, company, phone
3. User creates "Casual Signature" with just name and LinkedIn
4. User creates "Sales Pitch" with full contact info and CTA
5. User sets "Formal" as default for formal AI-generated emails
6. User sets "Casual" as default for casual AI-generated emails
7. When composing email, signature auto-selected based on template style
8. User can manually switch signatures via dropdown
9. Signature appears in composer with rich text formatting

**Problem Solved:** Eliminates the tedious task of manually adding/updating signatures across hundreds of emails. Ensures consistent professional branding while allowing context-appropriate personalization.

### Story 4: Send Bulk Campaign Email to Multiple Contacts

As a sales professional conducting outreach to 20 potential clients in the tech industry, I want to select multiple contacts from a filtered list and send them a personalized email in bulk, so that I can efficiently conduct campaigns without copy-pasting or sending emails individually.

**Workflow:**
1. User navigates to Compose page from main navigation
2. Left sidebar displays all contacts (500+ total)
3. User applies filters: Industry = "Technology", Priority = "High"
4. Filtered list shows 25 matching contacts
5. User selects checkbox on 20 contacts for campaign
6. Contact counter shows "20 contacts selected" in composer area
7. User clicks "Generate with AI" for campaign email
8. AI generates templates considering multiple recipients (generic personalization)
9. User selects Template A (Formal) and edits content
10. User clicks "Send to 20 contacts" button
11. System queues 20 individual emails with BullMQ
12. Progress indicator shows "Sending 5/20 emails..."
13. All 20 emails send successfully via Gmail API (rate limited to avoid spam)
14. Success message: "Campaign sent to 20 contacts"
15. Each contact's conversation history updated with sent email

**Problem Solved:** Enables efficient bulk outreach for campaigns, job applications, or announcements without sacrificing personalization. Automates repetitive sending while maintaining professional email delivery through user's Gmail account.

### Story 5: Polish Draft with AI Style Options & Dynamic CTA Navigation

As a business development manager, I want to write a rough draft email and have AI refine it in different styles (Formal, Casual, Elaborate, Concise), and I want the system to automatically detect whether I'm sending a cold email or follow-up, so that I can quickly improve my writing and use the right tone based on relationship history.

**Workflow (Polish Draft):**
1. User navigates to All Contacts page
2. User clicks on contact "Sarah Johnson" (has conversation history)
3. Contact detail page shows dynamic CTA: "Follow Up" (blue button)
4. User clicks "Follow Up" button
5. System redirects to Compose page with contact pre-selected
6. Composer shows context indicator: "Follow-Up Email" (conversation history exists)
7. User types rough draft: "hey sarah, wanted to check in on the proposal we discussed last month. any updates? thanks"
8. User clicks "Polish Draft" button
9. Modal displays 4 refined versions side-by-side:
   - **Formal**: "Dear Sarah, I hope this message finds you well. I wanted to follow up regarding the proposal we discussed last month. Do you have any updates on the progress? Thank you for your time."
   - **Casual**: "Hi Sarah! Just wanted to touch base about the proposal from last month. Any updates on your end? Thanks!"
   - **Elaborate**: "Dear Sarah, I trust you are doing well. I wanted to reach out to follow up on our recent conversation regarding the proposal we discussed in detail last month. I'm eager to hear about any developments or updates you might have regarding the decision-making process. Please let me know if there's any additional information I can provide to assist. I appreciate your time and consideration."
   - **Concise**: "Hi Sarah, following up on last month's proposal. Any updates? Thanks."
10. User selects "Formal" version
11. Text replaces rough draft in TipTap editor
12. User makes minor edits, adds attachment, and sends

**Workflow (Cold Email Detection):**
1. User navigates to All Contacts page
2. User clicks on contact "Michael Chen" (NO conversation history)
3. Contact detail page shows dynamic CTA: "Cold Email" (orange/amber button)
4. User clicks "Cold Email" button
5. System redirects to Compose page with contact pre-selected
6. Composer shows context indicator: "Cold Email" (no previous communication)
7. User clicks "Generate with AI" to create introduction email
8. AI generates templates optimized for cold outreach
9. User edits, polishes with "Formal" style, and sends

**Problem Solved:** Saves time by AI-refining rough drafts into professional emails with multiple style options. Automatically detects cold vs follow-up context so users can tailor their approach based on relationship history, improving response rates and reducing cognitive overhead.

## Spec Scope

1. **Standalone Compose Page Layout** - Build dedicated Compose page as main navigation tab with 30% left sidebar (contact selection) and 70% right area (email composer), replacing modal-based design with full-page experience for focused email composition.

2. **Contact Selection Sidebar** - Implement left sidebar displaying all contacts with search bar (debounced text search), filters (Company, Industry, Role, Gender, Birthday Month, Priority), multi-select checkboxes for campaign mode, and real-time counter showing selected contacts.

3. **Bulk Email Campaign Mode** - Enable selection of multiple contacts (up to 100 per campaign) for bulk sending, display recipient count in composer, queue emails via BullMQ with rate limiting (10 emails/minute to avoid Gmail spam detection), show progress indicator during bulk send, and update conversation history for each recipient.

4. **A/B Template Side-by-Side Display** - Build modal that displays AI-generated formal and casual templates in side-by-side layout (50/50 split) with "Use Template A" and "Use Template B" buttons, loading state during generation (2-5s), and regeneration option if user dislikes both versions.

5. **Polish Draft Feature** - Implement "Polish Draft" button that sends user's rough draft to AI for refinement, displays 4 polished versions in grid layout (Formal, Casual, Elaborate, Concise), allows selection of preferred version to replace draft content, and maintains original attachments/signatures.

6. **Dynamic CTA Detection** - Add logic to Contact Detail page that checks conversation history and displays context-aware CTA button: "Follow Up" (blue) if emails exist, "Cold Email" (orange/amber) if no history, both buttons navigate to Compose page with contact pre-selected and context indicator shown in composer.

7. **TipTap Rich Text Editor Integration** - Implement TipTap editor with formatting toolbar (bold, italic, underline, bullet lists, numbered lists, headings, links, text alignment) and keyboard shortcuts for common actions.

8. **File Attachment System** - Build multi-file upload component with drag-and-drop support, immediate S3 upload on selection, progress indicators, file type restrictions (PDF, DOC/DOCX, XLSX), 25MB per file limit, and thumbnail previews for images.

9. **Email Signature Management** - Create CRUD interface for multiple signatures with rich text editing, context-based auto-selection (formal/casual), manual signature switching in composer, and database storage for signature templates.

10. **Draft Auto-Save & Recovery** - Implement hybrid auto-save strategy (localStorage every 2s, DB sync every 10s), crash recovery with newer-version detection, "Saving/Saved" indicator, and conflict resolution between local and server drafts.

11. **Gmail OAuth Integration** - Implement Google OAuth 2.0 flow for Gmail API access, email sending via Gmail API (single and bulk), sent email tracking in conversation history, token refresh handling, and error handling for rate limits/permissions.

12. **Email Templates Library** - Create template management system allowing users to save current draft as template, load saved templates into composer, list/edit/delete templates, and categorize templates by use case (follow-up, introduction, thank you).

## Out of Scope

- Microsoft Outlook OAuth integration (deferred to separate spec - Phase 2)
- Email tracking pixels for open/read rates (Phase 4 - Analytics)
- Email scheduling/delayed send (future enhancement)
- Email threading and reply handling (Phase 2 - Conversation Management)
- Images/logos in signatures (deferred)
- Inline image embedding in email body (deferred)
- Email templates sharing between users (Phase 5 - Team Features)
- Advanced TipTap features (tables, code blocks, text color) (nice-to-have, defer if time-constrained)
- Contact list pagination in sidebar (load all contacts initially, optimize later if performance issues)
- Real-time collaboration on email drafts (Phase 5 - Team Features)

## Expected Deliverable

1. **Standalone Compose Page Working** - User can navigate to Compose tab from main menu, see 30/70 sidebar layout, select contacts from sidebar with search/filter, and compose emails in dedicated interface without modal popups.

2. **Bulk Campaign Functional** - User can select multiple contacts (up to 100), see selected count, send bulk emails with rate limiting (10/min), view progress indicator during send, and verify all conversation histories updated.

3. **A/B Template Display Operational** - User can click "Generate with AI", see formal and casual templates side-by-side in modal (50/50 split), select preferred template, load into composer, and regenerate if unsatisfied.

4. **Polish Draft Feature Working** - User can write rough draft, click "Polish Draft", see 4 refined versions (Formal, Casual, Elaborate, Concise) in grid layout, select preferred version, and have it replace draft content.

5. **Dynamic CTA Detection Functional** - Contact Detail page displays "Follow Up" button (blue) if conversation history exists, "Cold Email" button (orange/amber) if no history, both navigate to Compose with contact pre-selected and context indicator shown.

6. **Rich Text Editor Functional** - User can compose email with TipTap formatting (bold, italic, lists, links, alignment), attach files (PDF/DOC/XLSX), select signature, and send via Gmail OAuth with all content preserved.

7. **Auto-Save Working** - Drafts auto-save to localStorage every 2 seconds with visual indicator ("Saving..." / "Saved 5s ago"), sync to database every 10 seconds, and recover after browser crash with prompt.

8. **Gmail OAuth Integrated** - User can connect Gmail account via OAuth 2.0, send single or bulk emails through Gmail API, and all sent emails appear in conversation history with tracking.

9. **Template Library Operational** - User can save current draft as template, view template list, load template into composer, edit templates, and delete templates with confirmation.

10. **80%+ Test Coverage** - Unit tests for composer components, integration tests for Gmail OAuth flow, E2E tests for draft auto-save recovery, bulk send workflow, A/B template selection, Polish Draft feature, and API tests for template CRUD operations.

## Spec Documentation

- Tasks: @.agent-os/specs/2025-10-15-email-composition-gmail-integration/tasks.md
- Technical Specification: @.agent-os/specs/2025-10-15-email-composition-gmail-integration/sub-specs/technical-spec.md
- Database Schema: @.agent-os/specs/2025-10-15-email-composition-gmail-integration/sub-specs/database-schema.md
- API Specification: @.agent-os/specs/2025-10-15-email-composition-gmail-integration/sub-specs/api-spec.md
- Tests Specification: @.agent-os/specs/2025-10-15-email-composition-gmail-integration/sub-specs/tests.md
