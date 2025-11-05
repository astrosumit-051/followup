#!/bin/bash

# Cordiq Staging Environment Stop Script
# This script stops and optionally removes the staging environment
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

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Change to project root
cd "$(dirname "$0")/.."

# Parse command line arguments
REMOVE_VOLUMES=false
if [ "$1" == "--remove-volumes" ] || [ "$1" == "-v" ]; then
    REMOVE_VOLUMES=true
fi

print_header "Stopping Cordiq Staging Environment"

# Check if staging environment is running
if ! docker compose -f docker-compose.staging.yml ps -q 2>/dev/null | grep -q .; then
    print_info "No staging containers are currently running"
    exit 0
fi

# Stop containers
print_info "Stopping staging containers..."
docker compose -f docker-compose.staging.yml stop
print_success "Containers stopped"

# Ask about removal
if [ "$REMOVE_VOLUMES" = false ]; then
    echo ""
    print_info "Containers are stopped but not removed"
    print_info "To start again: ./scripts/start-staging.sh"
    print_info ""
    print_info "To remove containers and volumes completely:"
    print_info "  ./scripts/stop-staging.sh --remove-volumes"
else
    echo ""
    print_info "Removing containers and volumes..."
    docker compose -f docker-compose.staging.yml down -v
    print_success "Staging environment completely removed"
    print_info "Note: This removed all data including database and cache"
    print_info "To start fresh: ./scripts/start-staging.sh"
fi

print_header "Staging Environment Stopped"
