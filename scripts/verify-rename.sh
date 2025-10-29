#!/bin/bash

# Cordiq Rebrand Verification Script
# Ensures all "RelationHub" references have been renamed to "Cordiq"

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Verifying Cordiq rebrand...${NC}\n"

ERRORS=0

# Function to check for patterns
check_pattern() {
  local pattern=$1
  local description=$2
  local exclude_dirs="node_modules|.git|dist|build|.next|coverage|.turbo"

  echo -e "${YELLOW}Checking: ${description}${NC}"

  if grep -r "${pattern}" \
    --exclude-dir={node_modules,.git,dist,build,.next,coverage,.turbo,jscpd-report} \
    --exclude="*.lock" \
    --exclude="*.log" \
    --exclude="*.json" \
    --exclude="pnpm-lock.yaml" \
    --exclude="verify-rename.sh" \
    --exclude="RENAME_CHECKLIST.md" \
    . 2>/dev/null; then
    echo -e "${RED}❌ Found ${description}${NC}\n"
    ERRORS=$((ERRORS + 1))
  else
    echo -e "${GREEN}✅ No ${description} found${NC}\n"
  fi
}

# Check for various patterns
echo -e "${BLUE}=== Checking for 'relationhub' references ===${NC}\n"
check_pattern "relationhub" "lowercase 'relationhub' references"
check_pattern "RelationHub" "PascalCase 'RelationHub' references"
check_pattern "RELATIONHUB" "uppercase 'RELATIONHUB' references"
check_pattern "relation-hub" "kebab-case 'relation-hub' references"
check_pattern "relation_hub" "snake_case 'relation_hub' references"

echo -e "${BLUE}=== Checking package scopes ===${NC}\n"
check_pattern "@relationhub/" "@relationhub package scope references"

echo -e "${BLUE}=== Checking database names ===${NC}\n"
check_pattern "relationhub_dev" "relationhub_dev database references"
check_pattern "relationhub_test" "relationhub_test database references"

echo -e "${BLUE}=== Checking Docker container names ===${NC}\n"
check_pattern "relationhub-" "relationhub container name prefixes"

echo -e "${BLUE}=== Verifying correct usage ===${NC}\n"

# Verify package.json files have correct scopes
echo -e "${YELLOW}Checking: Package scopes in package.json files${NC}"
if grep -r '"name": "@cordiq/' package.json apps/*/package.json packages/*/package.json 2>/dev/null | wc -l | grep -q "[5-9]"; then
  echo -e "${GREEN}✅ Package scopes correctly use @cordiq${NC}\n"
else
  echo -e "${RED}❌ Package scopes not properly updated to @cordiq${NC}\n"
  ERRORS=$((ERRORS + 1))
fi

# Verify Docker Compose uses cordiq names
echo -e "${YELLOW}Checking: Docker Compose container names${NC}"
if grep -q "container_name: cordiq-" docker-compose.yml 2>/dev/null; then
  echo -e "${GREEN}✅ Docker Compose uses cordiq container names${NC}\n"
else
  echo -e "${RED}❌ Docker Compose container names not updated${NC}\n"
  ERRORS=$((ERRORS + 1))
fi

# Verify database name in Docker Compose
echo -e "${YELLOW}Checking: Database name in Docker Compose${NC}"
if grep -q "POSTGRES_DB: cordiq_dev" docker-compose.yml 2>/dev/null; then
  echo -e "${GREEN}✅ Docker Compose uses cordiq_dev database${NC}\n"
else
  echo -e "${RED}❌ Database name not updated in Docker Compose${NC}\n"
  ERRORS=$((ERRORS + 1))
fi

# Verify environment examples
echo -e "${YELLOW}Checking: Environment example files${NC}"
ENV_FILES=(
  ".env.docker.example"
  "apps/web/.env.local.example"
  "apps/api/.env.example"
)

for file in "${ENV_FILES[@]}"; do
  if [ -f "$file" ]; then
    if grep -q "relationhub" "$file" 2>/dev/null; then
      echo -e "${RED}❌ Found 'relationhub' in $file${NC}"
      ERRORS=$((ERRORS + 1))
    else
      echo -e "${GREEN}✅ $file is clean${NC}"
    fi
  fi
done
echo ""

# Final summary
echo -e "${BLUE}=== Verification Summary ===${NC}\n"

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}🎉 All checks passed! Rename is complete.${NC}"
  echo -e "${GREEN}✅ No 'relationhub' references found${NC}"
  echo -e "${GREEN}✅ All package scopes updated to @cordiq${NC}"
  echo -e "${GREEN}✅ Docker configuration updated${NC}"
  echo -e "${GREEN}✅ Environment examples are clean${NC}\n"
  exit 0
else
  echo -e "${RED}❌ Verification failed with $ERRORS error(s)${NC}"
  echo -e "${RED}Please review the output above and fix the remaining references.${NC}\n"
  exit 1
fi
