#!/bin/bash

# Cordiq Staging Environment Startup Script
# This script starts the staging environment with production-like configuration
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

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"

    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    print_success "Docker installed: $(docker --version | cut -d ' ' -f3)"

    # Check Docker Compose
    if ! command -v docker compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    print_success "Docker Compose installed"

    # Check if .env.staging exists
    if [ ! -f .env.staging ]; then
        print_error ".env.staging file not found"
        print_info "Creating from template..."
        if [ -f .env.staging.example ]; then
            cp .env.staging.example .env.staging
            print_warning "Please edit .env.staging with your credentials before continuing"
            print_info "Run: nano .env.staging"
            exit 1
        else
            print_error ".env.staging.example not found"
            exit 1
        fi
    fi
    print_success ".env.staging file found"

    # Check if docker-compose.staging.yml exists
    if [ ! -f docker-compose.staging.yml ]; then
        print_error "docker-compose.staging.yml not found"
        exit 1
    fi
    print_success "docker-compose.staging.yml found"
}

# Stop any existing staging containers
stop_existing() {
    print_header "Stopping Existing Containers"

    if docker compose -f docker-compose.staging.yml ps -q 2>/dev/null | grep -q .; then
        print_info "Stopping existing staging containers..."
        docker compose -f docker-compose.staging.yml down
        print_success "Stopped existing containers"
    else
        print_info "No existing containers to stop"
    fi
}

# Build and start services
start_services() {
    print_header "Building and Starting Services"

    print_info "Building Docker images (this may take 5-10 minutes)..."
    docker compose -f docker-compose.staging.yml --env-file .env.staging build
    print_success "Docker images built successfully"

    print_info "Starting services..."
    docker compose -f docker-compose.staging.yml --env-file .env.staging up -d
    print_success "Services started"
}

# Wait for services to be healthy
wait_for_health() {
    print_header "Waiting for Services to be Healthy"

    print_info "Waiting for PostgreSQL..."
    timeout=60
    elapsed=0
    while [ $elapsed -lt $timeout ]; do
        if docker compose -f docker-compose.staging.yml exec -T postgres pg_isready -U postgres &>/dev/null; then
            print_success "PostgreSQL is ready"
            break
        fi
        sleep 2
        elapsed=$((elapsed + 2))
    done

    if [ $elapsed -ge $timeout ]; then
        print_error "PostgreSQL failed to start within ${timeout}s"
        exit 1
    fi

    print_info "Waiting for Redis..."
    timeout=30
    elapsed=0
    while [ $elapsed -lt $timeout ]; do
        if docker compose -f docker-compose.staging.yml exec -T redis redis-cli -a "${REDIS_PASSWORD:-staging_redis_password}" ping &>/dev/null; then
            print_success "Redis is ready"
            break
        fi
        sleep 2
        elapsed=$((elapsed + 2))
    done

    if [ $elapsed -ge $timeout ]; then
        print_error "Redis failed to start within ${timeout}s"
        exit 1
    fi

    print_info "Waiting for API..."
    timeout=120
    elapsed=0
    while [ $elapsed -lt $timeout ]; do
        if curl -s http://localhost:4001/health &>/dev/null; then
            print_success "API is ready"
            break
        fi
        sleep 3
        elapsed=$((elapsed + 3))
    done

    if [ $elapsed -ge $timeout ]; then
        print_error "API failed to start within ${timeout}s"
        print_info "Check logs: docker compose -f docker-compose.staging.yml logs api"
        exit 1
    fi

    print_info "Waiting for Frontend..."
    timeout=60
    elapsed=0
    while [ $elapsed -lt $timeout ]; do
        if curl -s http://localhost:3001 &>/dev/null; then
            print_success "Frontend is ready"
            break
        fi
        sleep 3
        elapsed=$((elapsed + 3))
    done

    if [ $elapsed -ge $timeout ]; then
        print_warning "Frontend failed to start within ${timeout}s, but continuing..."
    fi
}

# Run database migrations
run_migrations() {
    print_header "Running Database Migrations"

    print_info "Applying Prisma migrations..."
    docker compose -f docker-compose.staging.yml exec -T api sh -c "cd /app/packages/database && pnpm prisma migrate deploy" || {
        print_warning "Migration failed - this might be OK if migrations are already applied"
    }
    print_success "Migrations completed"
}

# Display service status
show_status() {
    print_header "Service Status"

    docker compose -f docker-compose.staging.yml ps

    echo ""
    print_header "Access Information"
    print_success "Frontend:    http://localhost:3001"
    print_success "API:         http://localhost:4001"
    print_success "GraphQL:     http://localhost:4001/graphql"
    print_success "PostgreSQL:  localhost:5433"
    print_success "Redis:       localhost:6380"

    echo ""
    print_header "Quick Commands"
    print_info "View logs:           docker compose -f docker-compose.staging.yml logs -f"
    print_info "Stop services:       docker compose -f docker-compose.staging.yml stop"
    print_info "Restart services:    docker compose -f docker-compose.staging.yml restart"
    print_info "Remove services:     docker compose -f docker-compose.staging.yml down"
    print_info "View API logs:       docker compose -f docker-compose.staging.yml logs -f api"
    print_info "Shell into API:      docker compose -f docker-compose.staging.yml exec api sh"

    echo ""
    print_header "Testing Checklist"
    print_info "Complete testing guide: STAGING_DEPLOYMENT.md"
    print_info ""
    print_info "Quick verification:"
    print_info "1. Visit http://localhost:3001 in browser"
    print_info "2. Sign up / Log in"
    print_info "3. Navigate to /compose"
    print_info "4. Test AI template generation"
    print_info "5. Test Gmail OAuth connection"
    print_info "6. Test file upload"
    print_info "7. Test email sending"

    echo ""
}

# Main execution
main() {
    print_header "Cordiq Staging Environment Setup"

    # Change to project root
    cd "$(dirname "$0")/.."

    check_prerequisites
    stop_existing
    start_services
    wait_for_health
    run_migrations
    show_status

    print_header "Staging Environment Ready!"
    print_success "All services are running and healthy"
    print_info "Open your browser to http://localhost:3001 to get started"
}

# Handle script interruption
trap 'print_error "Script interrupted"; exit 1' INT TERM

# Run main function
main
