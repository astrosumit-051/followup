# Production Dockerfile for Cordiq Backend API
# Multi-stage build for optimized image size

# Stage 1: Dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.9 --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/

# Install ALL dependencies (including dev dependencies needed for NestJS runtime)
# Note: --prod flag was removed because @nestjs/* packages are needed at runtime
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.9 --activate

# Copy package files and node_modules from deps
# Note: types and utils packages don't have their own node_modules (hoisted to root)
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Generate Prisma client FIRST (database package needs it)
WORKDIR /app/packages/database
RUN pnpm prisma generate

# Build database package (after Prisma client is generated)
RUN pnpm build

# Build application
WORKDIR /app
RUN pnpm --filter @cordiq/api build

# Stage 3: Production Deployment
FROM node:22-alpine AS deploy
RUN apk add --no-cache libc6-compat openssl
WORKDIR /tmp/deploy

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.9 --activate

# Copy workspace files needed for pnpm deploy
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/

# Copy workspace package source files (needed for deployment)
COPY --from=builder /app/packages/database ./packages/database
COPY --from=builder /app/packages/types ./packages/types
COPY --from=builder /app/packages/utils ./packages/utils

# Use pnpm deploy to create flattened production node_modules
# This resolves the symlink issue by creating a proper deployment structure
RUN pnpm install --frozen-lockfile --prod=false
RUN pnpm deploy --filter=@cordiq/api --prod /prod/api

# Stage 4: Runner
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat openssl curl
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy deployed node_modules from deploy stage (flattened, no symlinks)
# This includes all external dependencies AND workspace packages
COPY --from=deploy /prod/api/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Copy package files
COPY --chown=nestjs:nodejs package.json ./
COPY --chown=nestjs:nodejs apps/api/package.json ./apps/api/

# Copy database package with Prisma schema
COPY --from=builder /app/packages/database ./packages/database

# Generate Prisma client in final stage (needed for runtime)
WORKDIR /app
RUN node_modules/.bin/prisma generate --schema=./packages/database/prisma/schema.prisma

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "apps/api/dist/main.js"]
