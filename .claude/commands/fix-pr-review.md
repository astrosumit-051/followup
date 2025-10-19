---
description: Fetch and fix all PR review comments with comprehensive error handling and iteration tracking
---

# Fix PR Review Comments

Automatically address all review feedback from the current pull request.

## Step 1: Prerequisites Check

First, verify we're in a valid PR context:

```bash
# Check if we're on a branch (not main/master)
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
  echo "❌ Error: You're on the $CURRENT_BRANCH branch. Please switch to your PR branch first."
  echo "Usage: git checkout <your-pr-branch>"
  exit 1
fi

# Check if a PR exists for this branch
PR_NUMBER=$(gh pr view --json number --jq '.number' 2>/dev/null)

if [ -z "$PR_NUMBER" ]; then
  echo "❌ Error: No pull request found for branch '$CURRENT_BRANCH'"
  echo ""
  echo "To create a PR, run:"
  echo "  gh pr create --title 'Your PR title' --body 'Description'"
  exit 1
fi

echo "✅ Found PR #$PR_NUMBER for branch '$CURRENT_BRANCH'"
```

## Step 2: Check Iteration Count

Check how many times we've auto-fixed this PR to prevent infinite loops:

```bash
# Get PR labels
LABELS=$(gh pr view $PR_NUMBER --json labels --jq '.labels[].name' | grep 'claude-fix-iteration-' | tail -1)

if [ -n "$LABELS" ]; then
  ITERATION=$(echo "$LABELS" | sed 's/claude-fix-iteration-//')
  echo "📊 Current iteration: $ITERATION/5"

  if [ "$ITERATION" -ge 5 ]; then
    echo ""
    echo "⚠️  WARNING: Maximum auto-fix iterations reached (5)"
    echo "This PR has been automatically fixed 5 times. Manual intervention recommended."
    echo ""
    read -p "Do you still want to proceed? (yes/no): " CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
      echo "Aborting."
      exit 1
    fi
  fi
  NEXT_ITERATION=$((ITERATION + 1))
else
  echo "📊 First auto-fix iteration"
  ITERATION=0
  NEXT_ITERATION=1
fi
```

## Step 3: Fetch Review Feedback

Fetch all review comments and format them for analysis:

```bash
# Fetch PR reviews and comments
echo ""
echo "📥 Fetching review feedback for PR #$PR_NUMBER..."

gh pr view $PR_NUMBER --json reviews,reviewThreads,author,title --jq '
{
  "pr_number": .number,
  "pr_title": .title,
  "pr_author": .author.login,
  "reviews": [
    .reviews[] | select(.state == "CHANGES_REQUESTED" or .state == "COMMENTED") | {
      "reviewer": .author.login,
      "state": .state,
      "body": .body,
      "submitted_at": .submittedAt
    }
  ],
  "review_threads": [
    .reviewThreads[] | {
      "path": .path,
      "line": .line,
      "comments": [.comments[] | {
        "author": .author.login,
        "body": .body
      }]
    }
  ]
}
' > /tmp/pr-review-feedback.json

# Check if we got any reviews
REVIEW_COUNT=$(cat /tmp/pr-review-feedback.json | jq '.reviews | length')

if [ "$REVIEW_COUNT" -eq 0 ]; then
  echo "✅ No review comments requesting changes found!"
  echo "This PR may already be approved or has no feedback yet."
  exit 0
fi

echo "✅ Found $REVIEW_COUNT review(s) with feedback"
echo ""
```

## Step 4: Read Project Guidelines

Before making changes, review the project's coding standards:

**CRITICAL**: Read the CLAUDE.md file first to understand:
- Project coding standards and style guide
- Testing requirements (80% coverage minimum)
- Security scanning rules (Semgrep for auth/database/API code)
- Commit message conventions
- Best practices for this specific project

```bash
echo "📖 Reading project guidelines from CLAUDE.md..."
# The CLAUDE.md file is already in your context - review it now
```

## Step 5: Analyze and Format Feedback

Parse the review feedback into a clear format:

```bash
cat > /tmp/formatted-feedback.txt << 'FEEDBACK_EOF'
# PR Review Feedback Summary

**PR**: #$(cat /tmp/pr-review-feedback.json | jq -r '.pr_number')
**Title**: $(cat /tmp/pr-review-feedback.json | jq -r '.pr_title')
**Iteration**: $ITERATION/5

## Review Comments

$(cat /tmp/pr-review-feedback.json | jq -r '.reviews[] | "### From @\(.reviewer) (\(.state))\n\n\(.body // "No general comment")\n"')

## Line-Specific Comments

$(cat /tmp/pr-review-feedback.json | jq -r '.review_threads[] | "**\(.path):\(.line)**\n\(.comments[] | "- @\(.author): \(.body)")\n"')
FEEDBACK_EOF

# Display formatted feedback
cat /tmp/formatted-feedback.txt
```

## Step 6: Address All Feedback

Now that you understand the feedback, make the necessary changes:

**Your Task:**

1. **Read each review comment** carefully from the formatted feedback above
2. **Understand the specific issues** raised by reviewers
3. **Make ALL necessary code changes** to address every piece of feedback
4. **Follow project guidelines** from CLAUDE.md:
   - Use TypeScript strict mode
   - Follow Airbnb style guide
   - Maximum function length: 50 lines
   - Adhere to all MCP server usage rules
   - Use Ref for API lookups (never hallucinate)
   - Run Semgrep on security-critical code
5. **Address line-specific comments** by modifying the exact files and lines mentioned
6. **Maintain code quality** - don't remove functionality without explicit feedback

## Step 7: Run Tests (CRITICAL)

After making changes, verify everything works:

```bash
echo ""
echo "🧪 Running test suite..."

# Run tests
if ! pnpm test; then
  echo ""
  echo "❌ Tests failed! Please fix the test failures before committing."
  echo "Review the test output above and address any issues."
  exit 1
fi

echo "✅ All tests passed!"
echo ""

# Run linter
echo "🔍 Running linter..."

if ! pnpm lint; then
  echo ""
  echo "⚠️  Linting issues found. Attempting auto-fix..."
  pnpm lint --fix

  # Check again
  if ! pnpm lint; then
    echo "❌ Linting issues remain. Please fix manually."
    exit 1
  fi
fi

echo "✅ Code passes linting!"
```

## Step 8: Commit Changes

Create a well-formatted commit following conventional commits:

```bash
# Get reviewer names for commit message
REVIEWERS=$(cat /tmp/pr-review-feedback.json | jq -r '.reviews[].reviewer' | sort -u | tr '\n' ',' | sed 's/,$//' | sed 's/,/, @/g' | sed 's/^/@/')

# Create commit message
git add -A

git commit -m "fix: address PR review feedback from $REVIEWERS

$(cat /tmp/pr-review-feedback.json | jq -r '.reviews[].body' | head -3 | sed 's/^/- /')

Addresses feedback in PR #$PR_NUMBER
Iteration: $NEXT_ITERATION/5

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo "✅ Changes committed"
```

## Step 9: Update Iteration Label

Track the number of auto-fix attempts:

```bash
echo ""
echo "🏷️  Updating iteration label..."

# Remove old iteration label if exists
if [ $ITERATION -gt 0 ]; then
  gh pr edit $PR_NUMBER --remove-label "claude-fix-iteration-$ITERATION" 2>/dev/null || true
fi

# Add new iteration label
gh pr edit $PR_NUMBER --add-label "claude-fix-iteration-$NEXT_ITERATION"

echo "✅ Updated to iteration $NEXT_ITERATION"
```

## Step 10: Push Changes

Push the fixes to GitHub:

```bash
echo ""
echo "📤 Pushing changes to GitHub..."

git push origin $CURRENT_BRANCH

echo "✅ Changes pushed successfully!"
echo ""
echo "🎉 PR review feedback addressed!"
echo ""
echo "Next steps:"
echo "  1. The PR has been updated with your fixes"
echo "  2. Reviewers will be notified of the changes"
echo "  3. Wait for re-review or use the automated workflow"
echo ""
echo "View PR: $(gh pr view $PR_NUMBER --json url --jq '.url')"
```

## Cleanup

```bash
# Remove temporary files
rm -f /tmp/pr-review-feedback.json /tmp/formatted-feedback.txt
```

---

## Notes

- This command integrates with the automated GitHub workflow
- Maximum 5 iterations per PR (prevents infinite loops)
- Follows project standards defined in CLAUDE.md
- Runs tests before committing (fail fast)
- Uses conventional commit format
- Tracks iterations with PR labels

**Manual Override**: If you need to proceed despite reaching max iterations, the command will prompt for confirmation.
