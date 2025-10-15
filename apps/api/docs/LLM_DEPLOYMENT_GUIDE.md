# LLM API Key Deployment Guide

> Step-by-step guide for configuring LLM providers in RelationHub

## Overview

RelationHub's AI email generation requires at least one LLM provider API key. This guide covers acquisition, configuration, security, and cost management for all supported providers.

## Quick Start

### Minimum Requirements

**For Testing/Development**:
- ✅ Google Gemini API key (free tier available)
- ✅ Redis for caching
- ✅ PostgreSQL for data storage

**For Production**:
- ✅ At least 2 provider API keys (for redundancy)
- ✅ Recommended: OpenAI + Anthropic or Gemini Paid + OpenAI
- ✅ Monitoring and alerting configured

## Provider Setup Guides

### 1. Google Gemini (Recommended for Testing)

#### Acquisition

1. **Visit Google AI Studio**
   ```
   https://aistudio.google.com/app/apikey
   ```

2. **Sign in with Google Account**
   - Use organizational Google Workspace account for production
   - Personal Gmail fine for testing

3. **Create API Key**
   - Click "Create API key"
   - Select existing Google Cloud project or create new one
   - Copy key immediately (won't be shown again)

4. **Key Format**
   ```
   AIzaSy...  (39 characters)
   ```

#### Configuration

**Development (.env)**:
```bash
GEMINI_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

**Production (Environment Variable)**:
```bash
# Kubernetes Secret
kubectl create secret generic llm-api-keys \
  --from-literal=gemini-api-key='AIzaSy...'

# AWS Parameter Store
aws ssm put-parameter \
  --name /relationhub/prod/gemini-api-key \
  --value "AIzaSy..." \
  --type SecureString
```

#### Rate Limits

**Free Tier**:
- 10 requests per minute
- 1,500 requests per day
- No cost

**Paid Tier** (Pay-as-you-go):
- 1,000 requests per minute
- No daily limit
- $0.00025 per 1K input tokens
- $0.0005 per 1K output tokens

**Cost Example** (Paid):
```
Prompt: 350 tokens × $0.00025 = $0.0000875
Response: 180 tokens × $0.0005 = $0.00009
Total per email: ~$0.00018

1,000 emails/month: ~$0.18
10,000 emails/month: ~$1.80
```

#### Upgrade to Paid Tier

1. Go to Google Cloud Console
2. Enable billing for your project
3. Activate Gemini API
4. No code changes needed (same API key)

**When to Upgrade**:
- ❌ Free tier: Testing only (10 req/min = 600/hour max)
- ✅ Paid tier: Production (handles 100+ concurrent users)

---

### 2. OpenAI GPT-4 Turbo (Recommended for Production)

#### Acquisition

1. **Visit OpenAI Platform**
   ```
   https://platform.openai.com/api-keys
   ```

2. **Create Account**
   - Business email recommended for production
   - Enable 2FA for security

3. **Add Payment Method**
   - OpenAI requires prepaid credit
   - Minimum: $5 initial deposit
   - Set spending limits

4. **Create API Key**
   - Click "Create new secret key"
   - Name it: "RelationHub Production"
   - Copy key immediately (won't be shown again)

5. **Key Format**
   ```
   sk-proj-...  (starts with "sk-proj-" or "sk-")
   ```

#### Configuration

**Development (.env)**:
```bash
OPENAI_API_KEY="sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

**Production**:
```bash
# Kubernetes Secret
kubectl create secret generic llm-api-keys \
  --from-literal=openai-api-key='sk-proj-...'

# AWS Secrets Manager
aws secretsmanager create-secret \
  --name /relationhub/prod/openai-api-key \
  --secret-string "sk-proj-..."
```

#### Rate Limits

**GPT-4 Turbo** (default for new accounts):
- Tier 1 (first $100 spent): 500 RPM, 30K TPM
- Tier 2 ($100-$500): 5K RPM, 450K TPM
- Tier 3 ($500+): 10K RPM, 10M TPM

**Rate Limit Tips**:
- Start at Tier 1 (500 requests/min = plenty for most apps)
- Monitor usage in OpenAI dashboard
- Auto-upgrades to higher tiers based on spending

#### Pricing

**GPT-4 Turbo (gpt-4-turbo-preview)**:
- Input: $0.01 per 1K tokens
- Output: $0.03 per 1K tokens

**Cost Example**:
```
Prompt: 350 tokens × $0.01 = $0.0035
Response: 180 tokens × $0.03 = $0.0054
Total per email: ~$0.009

1,000 emails/month: ~$9
10,000 emails/month: ~$90
```

**Budget Recommendations**:
- Testing: $20/month (2,200 emails)
- Small team (<50 users): $50-100/month
- Medium team (50-200 users): $200-500/month

#### Cost Management

**Set Usage Limits**:
1. Go to Settings → Limits
2. Set "Hard limit" (won't exceed)
3. Set "Soft limit" (email alert)

**Example Limits**:
```
Soft limit: $80/month (alerts when reached)
Hard limit: $100/month (stops all requests)
```

---

### 3. Anthropic Claude Sonnet 3.5 (Alternative/Backup)

#### Acquisition

1. **Visit Anthropic Console**
   ```
   https://console.anthropic.com/
   ```

2. **Create Account**
   - Business email for production
   - May require waitlist approval

3. **Add Payment Method**
   - Credit card required
   - No minimum deposit

4. **Generate API Key**
   - Go to Settings → API Keys
   - Click "Create Key"
   - Name: "RelationHub Production"
   - Copy immediately

5. **Key Format**
   ```
   sk-ant-...  (starts with "sk-ant-")
   ```

#### Configuration

**Development (.env)**:
```bash
ANTHROPIC_API_KEY="sk-ant-XXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

**Production**:
```bash
# Environment variable
export ANTHROPIC_API_KEY="sk-ant-..."

# Docker Compose secret
echo "sk-ant-..." | docker secret create anthropic_api_key -
```

#### Rate Limits

**Claude Sonnet 3.5**:
- Tier 1: 50 RPM, 40K TPM
- Tier 2 (after $100 spent): 1K RPM, 80K TPM
- Tier 3 (after $500): 2K RPM, 160K TPM

#### Pricing

**Claude 3.5 Sonnet**:
- Input: $0.003 per 1K tokens
- Output: $0.015 per 1K tokens

**Cost Example**:
```
Prompt: 350 tokens × $0.003 = $0.00105
Response: 180 tokens × $0.015 = $0.0027
Total per email: ~$0.004

1,000 emails/month: ~$4
10,000 emails/month: ~$40
```

**Why Claude**:
- ✅ Lowest cost per email (~$0.004 vs OpenAI's ~$0.009)
- ✅ High quality, natural writing
- ✅ Strong safety features
- ❌ Lower rate limits than OpenAI

---

## Multi-Provider Strategy

### Recommended Configurations

#### Development/Testing

```bash
# Single provider (free tier)
GEMINI_API_KEY="AIzaSy..."
# OPENAI_API_KEY=""    # Not needed for testing
# ANTHROPIC_API_KEY="" # Not needed for testing
```

**Pros**:
- $0 cost
- Fast iteration
- Sufficient for development

**Cons**:
- 10 req/min limit
- No redundancy

#### Production (Small Scale)

```bash
# Primary: Gemini Paid Tier
GEMINI_API_KEY="AIzaSy..."  # Paid tier

# Fallback: OpenAI
OPENAI_API_KEY="sk-proj-..."

# ANTHROPIC_API_KEY=""  # Optional third fallback
```

**Pros**:
- Low cost (~$0.002/email with Gemini)
- Redundancy (auto-failover)
- 1000 RPM (Gemini paid)

**Budget**: ~$50-100/month for 10K-20K emails

#### Production (High Scale)

```bash
# Primary: OpenAI
OPENAI_API_KEY="sk-proj-..."

# Fallback: Anthropic
ANTHROPIC_API_KEY="sk-ant-..."

# Optional: Gemini as tertiary
GEMINI_API_KEY="AIzaSy..."
```

**Pros**:
- Highest rate limits (5K RPM+ with OpenAI Tier 2)
- Best quality
- Triple redundancy

**Cons**:
- Higher cost (~$0.009/email)

**Budget**: ~$500-1000/month for 50K-100K emails

### Failover Logic

```typescript
// apps/api/src/ai/ai.service.ts

async generateEmailTemplate() {
  // Try primary provider
  if (this.geminiClient) {
    try {
      return await this.generateWithGemini(prompt);
    } catch (error) {
      this.logger.warn('Gemini failed, trying OpenAI');
    }
  }

  // Fallback to OpenAI
  if (this.openaiClient) {
    try {
      return await this.generateWithOpenAI(prompt);
    } catch (error) {
      this.logger.warn('OpenAI failed, trying Anthropic');
    }
  }

  // Final fallback to Anthropic
  if (this.anthropicClient) {
    return await this.generateWithAnthropic(prompt);
  }

  throw new Error('All AI providers failed');
}
```

**Result**: 99.9%+ uptime even if one provider has outage

---

## Security Best Practices

### API Key Storage

**❌ NEVER**:
- Commit keys to version control
- Share keys in Slack/email
- Hard-code keys in application code
- Use production keys in local development
- Log keys in application logs

**✅ ALWAYS**:
- Use environment variables
- Use secrets management (Kubernetes, AWS, etc.)
- Rotate keys every 90 days
- Use separate keys per environment (dev/staging/prod)
- Enable IP allowlisting when available

### Environment Separation

```bash
# Development
GEMINI_API_KEY="AIzaSy...dev"  # Free tier, separate project

# Staging
GEMINI_API_KEY="AIzaSy...staging"  # Paid tier, separate project

# Production
GEMINI_API_KEY="AIzaSy...prod"  # Paid tier, separate project
```

### Key Rotation

**Recommended Schedule**: Every 90 days

**Process**:
1. Generate new API key in provider console
2. Add new key to secrets manager (keep old key active)
3. Deploy application with both keys in fallback chain
4. Verify new key works in production
5. Remove old key from secrets manager
6. Delete old key from provider console

**Automated Rotation** (Advanced):
```bash
# Example: AWS Lambda for OpenAI key rotation
# Trigger: CloudWatch Events (every 90 days)
# Action: Generate new key, update Parameter Store, notify team
```

### Monitoring & Alerts

**Key Metrics to Track**:
1. **Usage vs Limits**: Track daily request count
2. **Costs**: Alert on unexpected spikes
3. **Error Rates**: Provider failures
4. **Rate Limit Hits**: Need to upgrade tier?

**Recommended Alerts**:

```yaml
# Prometheus Alert Rules
groups:
  - name: llm_api_alerts
    rules:
      - alert: LLMCostSpikeDetected
        expr: rate(ai_email_generation_total[1h]) > 100
        annotations:
          summary: "Unusual AI API usage detected"

      - alert: AllProvidersFailure
        expr: rate(ai_email_generation_errors[5m]) > 0.5
        annotations:
          summary: "Multiple LLM providers failing"
```

**Email Alerts** (OpenAI example):
1. Go to Settings → Limits
2. Enable email notifications
3. Add team email addresses
4. Set threshold: 80% of hard limit

---

## Cost Optimization

### 1. Enable Redis Caching

**Impact**: Reduces LLM calls by ~30-40%

```bash
# Cache hit = $0 cost
# Cache miss = LLM call cost

# With 35% cache hit rate:
# 10,000 requests = 6,500 LLM calls + 3,500 cache hits
# Savings: 3,500 × $0.009 = $31.50/month (OpenAI example)
```

### 2. Use Cheaper Providers for Non-Critical

```typescript
// Route based on priority
if (contact.priority === 'HIGH') {
  // Use OpenAI (best quality)
  provider = 'openai';
} else {
  // Use Gemini (cheaper)
  provider = 'gemini';
}
```

### 3. Batch Requests

**Not Applicable**: Our use case requires synchronous responses

### 4. Prompt Optimization

**Current**: ~350 input tokens
**If not optimized**: Could be 500-700 tokens

**Savings**: 350 tokens vs 600 tokens = 42% reduction
```
10,000 emails × 250 saved tokens × $0.01/1K = $2.50/month
```

### 5. Monitor & Set Budgets

```bash
# .env
MAX_DAILY_LLM_BUDGET=10  # $10/day max

# In code (optional hard limit)
if (dailySpend > MAX_DAILY_LLM_BUDGET) {
  throw new Error('Daily LLM budget exceeded');
}
```

---

## Troubleshooting

### Issue: "No AI provider API keys configured"

**Error**:
```
Error: No AI provider API keys configured. Set at least one of:
GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY
```

**Solution**:
1. Check `.env` file exists
2. Verify at least one key is set
3. Restart server after adding keys
4. Check for typos in variable names

### Issue: "All AI providers failed"

**Error**:
```
Error: All AI providers failed. Please try again later.
```

**Causes**:
1. All API keys invalid
2. Rate limits exceeded
3. Provider outages
4. Network issues

**Diagnosis**:
```bash
# Check logs for specific errors
docker logs api-container | grep "generation failed"

# Test each provider
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Issue: "429 Too Many Requests"

**Error**:
```
[429 Too Many Requests] Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 10
```

**Solutions**:
1. **Wait**: Free tier resets every minute
2. **Upgrade**: Switch to paid tier
3. **Add fallback**: Configure second provider
4. **Implement queueing**: BullMQ for rate-limited requests

### Issue: "Invalid API key"

**Error**:
```
[401 Unauthorized] Invalid API key
```

**Solutions**:
1. Verify key copied correctly (no extra spaces/newlines)
2. Check key hasn't been deleted in provider console
3. Verify key has correct permissions
4. Regenerate key if needed

### Issue: "Prompt too long"

**Error**:
```
Error: Prompt exceeds model's context window
```

**Solutions**:
1. Reduce conversation history limit (from 5 to 3)
2. Truncate contact notes more aggressively
3. Use model with larger context window

---

## Production Deployment Checklist

### Pre-Deployment

- [ ] API keys acquired for at least 2 providers
- [ ] Keys stored in secrets manager (not .env)
- [ ] Separate keys for staging and production
- [ ] Rate limits reviewed and appropriate tier selected
- [ ] Budget limits configured
- [ ] Redis caching enabled and tested
- [ ] Monitoring/alerting configured

### Deployment

- [ ] API keys injected as environment variables
- [ ] Application starts successfully
- [ ] Health check passes
- [ ] Test email generation via GraphQL playground
- [ ] Verify provider fallback works (disable one provider)
- [ ] Check Prometheus metrics endpoint (`/metrics`)
- [ ] Verify logs show provider usage

### Post-Deployment

- [ ] Monitor error rates for 24 hours
- [ ] Check cost dashboard daily for first week
- [ ] Set up weekly cost reports
- [ ] Document any issues and solutions
- [ ] Schedule 90-day key rotation reminder

---

## Support & Resources

### Provider Documentation

- **Gemini**: https://ai.google.dev/docs
- **OpenAI**: https://platform.openai.com/docs
- **Anthropic**: https://docs.anthropic.com/

### Pricing Calculators

- **OpenAI**: https://openai.com/pricing
- **Anthropic**: https://www.anthropic.com/pricing
- **Gemini**: https://ai.google.dev/pricing

### Status Pages

- **OpenAI**: https://status.openai.com/
- **Anthropic**: https://status.anthropic.com/
- **Google Cloud**: https://status.cloud.google.com/

### Getting Help

**Internal**:
- Check Prometheus metrics: `http://localhost:4000/metrics`
- Review application logs: `docker logs api-container`
- See API README: `apps/api/README.md`

**External**:
- OpenAI Discord: https://discord.gg/openai
- LangChain Discord: https://discord.gg/langchain
- Stack Overflow: Tag with `langchain`, `openai`, or `anthropic`

---

## Appendix: Environment Variable Reference

```bash
# Required: At least ONE provider
GEMINI_API_KEY="AIzaSy..."       # Google Gemini 2.0 Flash
OPENAI_API_KEY="sk-proj-..."     # OpenAI GPT-4 Turbo
ANTHROPIC_API_KEY="sk-ant-..."   # Anthropic Claude Sonnet 3.5

# Required: Infrastructure
DATABASE_URL="postgresql://..."   # PostgreSQL connection
REDIS_HOST="localhost"           # Redis for caching
REDIS_PORT=6379

# Optional: Redis Authentication
REDIS_PASSWORD="..."             # If Redis requires auth

# Optional: Supabase (for authentication)
SUPABASE_URL="https://..."
SUPABASE_JWT_SECRET="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Optional: Application Config
PORT=4000
NODE_ENV="production"
```

---

*Last Updated: 2025-10-15*
*Version: 1.0.0*
