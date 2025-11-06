#!/bin/bash

# Cordiq Staging Environment Status Script
# This script displays the status of staging services
# Last Updated: 2025-11-05

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Change to project root
cd "$(dirname "$0")/.."

print_header "Cordiq Staging Environment Status"

# Check if staging environment is running
if ! docker compose -f docker-compose.staging.yml ps -q 2>/dev/null | grep -q .; then
    print_warning "Staging environment is not running"
    print_info "Start with: ./scripts/start-staging.sh"
    exit 0
fi

# Show container status
print_header "Container Status"
docker compose -f docker-compose.staging.yml ps

# Check service health
print_header "Service Health Checks"

# PostgreSQL
if docker compose -f docker-compose.staging.yml exec -T postgres pg_isready -U postgres &>/dev/null; then
    print_success "PostgreSQL: Healthy"
else
    print_error "PostgreSQL: Unhealthy"
fi

# Redis
if docker compose -f docker-compose.staging.yml exec -T redis redis-cli -a "${REDIS_PASSWORD:-staging_redis_password}" ping &>/dev/null 2>&1; then
    print_success "Redis: Healthy"
else
    print_error "Redis: Unhealthy"
fi

# API
if curl -s http://localhost:4001/health &>/dev/null; then
    print_success "API: Healthy (http://localhost:4001)"

    # Show API health details
    echo ""
    print_info "API Health Details:"
    curl -s http://localhost:4001/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:4001/health
else
    print_error "API: Unhealthy or not responding"
fi

# Frontend
if curl -s http://localhost:3001 &>/dev/null; then
    print_success "Frontend: Healthy (http://localhost:3001)"
else
    print_error "Frontend: Unhealthy or not responding"
fi

# Resource usage
print_header "Resource Usage"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" \
    $(docker compose -f docker-compose.staging.yml ps -q)

# URLs
print_header "Access URLs"
print_success "Frontend:    http://localhost:3001"
print_success "API:         http://localhost:4001"
print_success "GraphQL:     http://localhost:4001/graphql"
print_success "PostgreSQL:  localhost:5433"
print_success "Redis:       localhost:6380"

# Quick commands
print_header "Quick Commands"
print_info "View logs:           docker compose -f docker-compose.staging.yml logs -f"
print_info "View API logs:       docker compose -f docker-compose.staging.yml logs -f api"
print_info "View web logs:       docker compose -f docker-compose.staging.yml logs -f web"
print_info "Restart API:         docker compose -f docker-compose.staging.yml restart api"
print_info "Shell into API:      docker compose -f docker-compose.staging.yml exec api sh"
print_info "Stop staging:        ./scripts/stop-staging.sh"

echo ""
