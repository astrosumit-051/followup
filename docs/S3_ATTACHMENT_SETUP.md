# S3 Attachment Storage Setup Guide

> Documentation for configuring AWS S3 for email attachment storage in RelationHub
> Last Updated: 2025-10-15

## Overview

RelationHub uses AWS S3 for secure, scalable attachment storage for email composition. This guide covers S3 bucket creation, CORS configuration, IAM permissions, and environment variable setup.

## Prerequisites

- AWS Account with IAM user access
- AWS CLI installed (optional but recommended)
- Access to AWS Console

## Step 1: Create S3 Bucket

### Via AWS Console

1. Navigate to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Click **Create bucket**
3. Configure bucket settings:
   - **Bucket name**: `relationhub-attachments-{environment}` (e.g., `relationhub-attachments-production`)
   - **AWS Region**: Choose region closest to your users (e.g., `us-east-1`)
   - **Object Ownership**: ACLs disabled (recommended)
   - **Block Public Access**: Keep all public access blocked (recommended for security)
   - **Versioning**: Optional (recommended for production)
   - **Default encryption**: Enable with AWS-managed keys (SSE-S3)
4. Click **Create bucket**

### Via AWS CLI

```bash
# Create bucket
# Note: us-east-1 doesn't need LocationConstraint, but other regions do
aws s3api create-bucket \
  --bucket relationhub-attachments-production \
  --region us-east-2 \
  --create-bucket-configuration LocationConstraint=us-east-2

# For us-east-1, omit LocationConstraint:
# aws s3api create-bucket \
#   --bucket relationhub-attachments-production \
#   --region us-east-1

# Enable versioning (optional)
aws s3api put-bucket-versioning \
  --bucket relationhub-attachments-production \
  --versioning-configuration Status=Enabled

# Enable default encryption
aws s3api put-bucket-encryption \
  --bucket relationhub-attachments-production \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

## Step 2: Configure CORS Policy

**Critical**: S3 bucket must allow `PUT` requests from your application domain for direct browser uploads.

### CORS Policy Configuration

1. Navigate to your S3 bucket in AWS Console
2. Go to **Permissions** tab → **Cross-origin resource sharing (CORS)**
3. Click **Edit**
4. Paste the following CORS configuration:

```json
[
  {
    "AllowedHeaders": [
      "Content-Type",
      "Content-Length",
      "Authorization",
      "x-amz-date",
      "x-amz-content-sha256",
      "x-amz-security-token"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE"
    ],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://your-production-domain.com",
      "https://your-staging-domain.com"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

**⚠️ Important CORS Configuration Notes:**

- **AllowedOrigins**: Update with your actual frontend domains
  - Development: `http://localhost:3000`
  - Staging: `https://staging.relationhub.com`
  - Production: `https://app.relationhub.com`
  - **Do NOT use wildcard (`*`) in production** for security reasons
- **AllowedMethods**: `PUT` is required for presigned URL uploads
- **AllowedHeaders**: Specific headers required for S3 presigned URL operations (Content-Type, Content-Length, Authorization, x-amz-*)
- **MaxAgeSeconds**: How long browser caches CORS preflight response (3000 = 50 minutes)

### Via AWS CLI

```bash
aws s3api put-bucket-cors \
  --bucket relationhub-attachments-production \
  --cors-configuration file://cors-policy.json
```

**cors-policy.json**:
```json
{
  "CORSRules": [
    {
      "AllowedHeaders": [
        "Content-Type",
        "Content-Length",
        "Authorization",
        "x-amz-date",
        "x-amz-content-sha256",
        "x-amz-security-token"
      ],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": [
        "http://localhost:3000",
        "https://your-production-domain.com"
      ],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

## Step 3: Configure IAM User & Permissions

### Create IAM User

1. Navigate to [IAM Console](https://console.aws.amazon.com/iam/)
2. Go to **Users** → **Add users**
3. **User name**: `relationhub-s3-service`
4. **Access type**: Select **Programmatic access**
5. Click **Next: Permissions**

### Attach S3 Permissions

**Option A: Create Inline Policy (Recommended - Most Secure)**

1. Click **Attach policies directly** → **Create policy**
2. Select **JSON** tab
3. Paste the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowPresignedURLGeneration",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::relationhub-attachments-production/*"
    },
    {
      "Sid": "AllowBucketListing",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::relationhub-attachments-production"
    }
  ]
}
```

4. Click **Review policy**
5. **Name**: `RelationHubS3AttachmentPolicy`
6. Click **Create policy**
7. Attach policy to the IAM user

**Option B: Use AWS Managed Policy (Less Secure)**

- Attach `AmazonS3FullAccess` (not recommended for production)
- Provides full S3 access across all buckets (overly permissive)

### Save Access Keys

1. After creating user, **Download credentials CSV** or copy:
   - **Access Key ID**: `AKIAIOSFODNN7EXAMPLE`
   - **Secret Access Key**: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`
2. **⚠️ Store credentials securely** - never commit to version control

## Step 4: Environment Variable Configuration

### Backend Environment Variables

Add the following to your `apps/api/.env` file:

```bash
# AWS S3 Configuration
AWS_REGION=us-east-1
S3_BUCKET=relationhub-attachments-production
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### Frontend Environment Variables (Optional)

If you need S3 bucket name in frontend for validation:

```bash
# apps/web/.env.local
NEXT_PUBLIC_S3_BUCKET=relationhub-attachments-production
```

### Environment Variable Security

**⚠️ Critical Security Practices:**

1. **Never commit `.env` files** to version control
2. Use `.env.example` templates without actual credentials
3. Store production credentials in secure secret managers:
   - AWS Secrets Manager
   - HashiCorp Vault
   - Kubernetes Secrets (for containerized deployments)
4. Rotate access keys every 90 days
5. Enable MFA for IAM user (production environments)

## Step 5: Configure Lifecycle Policy (Optional - Cost Optimization)

Automatically delete orphaned attachments older than 30 days to reduce storage costs.

### Via AWS Console

1. Navigate to your S3 bucket
2. Go to **Management** tab → **Lifecycle rules**
3. Click **Create lifecycle rule**
4. Configure rule:
   - **Rule name**: `delete-orphaned-attachments`
   - **Rule scope**: All objects in bucket (or prefix filter for specific paths)
   - **Lifecycle rule actions**: Check **Expire current versions of objects**
   - **Days after object creation**: `30`
5. Click **Create rule**

### Via AWS CLI

```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket relationhub-attachments-production \
  --lifecycle-configuration file://lifecycle-policy.json
```

**lifecycle-policy.json**:
```json
{
  "Rules": [
    {
      "Id": "delete-orphaned-attachments",
      "Status": "Enabled",
      "Expiration": {
        "Days": 30
      },
      "Filter": {
        "Prefix": ""
      }
    }
  ]
}
```

**Note**: The AttachmentService also includes a `cleanupOrphanedAttachments()` background job that can be scheduled via cron for manual cleanup control.

## Step 6: Test S3 Configuration

### Test Presigned URL Generation

Run the following test to verify S3 configuration:

```bash
cd apps/api
pnpm test attachment.service.spec.ts
```

Expected output: **25 tests passing**

### Manual Test with AWS CLI

```bash
# Create a test file
echo "Test attachment" > test-file.txt

# Upload to S3 bucket
aws s3 cp test-file.txt s3://relationhub-attachments-production/test-user/attachments/test-file.txt

# Verify upload
aws s3 ls s3://relationhub-attachments-production/test-user/attachments/

# Delete test file
aws s3 rm s3://relationhub-attachments-production/test-user/attachments/test-file.txt
```

### Test Direct Browser Upload (E2E)

1. Start backend server: `cd apps/api && pnpm dev`
2. Generate presigned URL via API:
   ```bash
   curl -X POST http://localhost:4000/api/attachments/presigned-url \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{
       "filename": "document.pdf",
       "contentType": "application/pdf",
       "fileSize": 1048576
     }'
   ```
3. Use returned `uploadUrl` to upload file:
   ```bash
   curl -X PUT "PRESIGNED_URL_FROM_STEP_2" \
     --data-binary "@path/to/local/document.pdf" \
     -H "Content-Type: application/pdf"
   ```
4. Verify file uploaded to S3 bucket

## Troubleshooting

### Error: `Access Denied`

**Cause**: IAM user lacks permissions

**Solution**:
- Verify IAM policy includes `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`
- Check bucket policy doesn't deny access
- Ensure correct bucket name in policy ARN

### Error: `CORS Error` in Browser Console

**Cause**: CORS policy not configured or incorrect AllowedOrigins

**Solution**:
- Verify CORS configuration includes your frontend domain
- Check for typos in domain name (include protocol: `https://`)
- Clear browser cache and retry
- Use `*` for testing (NOT for production)

### Error: `SignatureDoesNotMatch`

**Cause**: Incorrect AWS credentials

**Solution**:
- Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in `.env`
- Check for trailing spaces or line breaks in credentials
- Regenerate access keys if corrupted

### Error: `Presigned URL Expired`

**Cause**: URL accessed after 60-minute expiry

**Solution**:
- Generate new presigned URL
- Ensure client uploads within 60 minutes
- Consider decreasing expiry if needed for enhanced security

### Performance: Slow Uploads

**Cause**: Network latency, large file size, or S3 region far from users

**Solution**:
- Use S3 Transfer Acceleration (additional cost)
- Choose S3 region closer to your user base
- Implement multipart upload for files >25MB (future enhancement)
- Compress files before upload if applicable

## Security Best Practices

1. **Never use wildcard (`*`) for AllowedOrigins in production**
2. **Never use wildcard (`*`) for AllowedHeaders** - specify only required headers (Content-Type, Content-Length, Authorization, x-amz-*)
3. **Enable S3 bucket encryption** (SSE-S3 or SSE-KMS)
4. **Block all public access** to bucket (enabled by default)
5. **Rotate IAM access keys** every 90 days
6. **Use presigned URLs** instead of making bucket public
7. **Implement file type validation** on backend (already implemented in AttachmentService)
8. **Set file size limits** (25MB enforced in AttachmentService)
9. **Log all S3 API calls** with CloudTrail (production requirement)
10. **Enable S3 versioning** for accidental deletion recovery
11. **Use separate buckets** for dev/staging/production environments

## Cost Estimation

### S3 Storage Costs (us-east-1)

- **Storage**: $0.023 per GB/month
- **PUT Requests**: $0.005 per 1,000 requests
- **GET Requests**: $0.0004 per 1,000 requests

### Example Usage (Monthly)

| Metric | Volume | Cost |
|--------|--------|------|
| Storage | 100 GB | $2.30 |
| PUT (Uploads) | 10,000 | $0.05 |
| GET (Downloads) | 50,000 | $0.02 |
| **Total** | | **$2.37/month** |

### Cost Optimization Tips

- Enable lifecycle policy to delete orphaned attachments after 30 days
- Use S3 Intelligent-Tiering for infrequently accessed files
- Implement compression for large documents before upload
- Monitor usage with AWS Cost Explorer

## Support & Additional Resources

- **AWS S3 Documentation**: https://docs.aws.amazon.com/s3/
- **CORS Configuration**: https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html
- **Presigned URLs**: https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html
- **IAM Best Practices**: https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html

---

**Last Updated**: 2025-10-15
**Author**: RelationHub Development Team
**Status**: Production Ready
