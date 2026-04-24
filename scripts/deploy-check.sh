#!/bin/bash

###############################################################################
# ApparelQuoter - Pre-Deployment Verification Script
#
# Runs comprehensive checks before deployment
# Ensures code is production-ready
#
# Usage: ./scripts/deploy-check.sh
###############################################################################

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║   ApparelQuoter - Pre-Deployment Verification         ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

ERRORS=0
WARNINGS=0

###############################################################################
# Helper Functions
###############################################################################

check_pass() {
    echo "✅ $1"
}

check_fail() {
    echo "❌ $1"
    ERRORS=$((ERRORS + 1))
}

check_warn() {
    echo "⚠️  $1"
    WARNINGS=$((WARNINGS + 1))
}

###############################################################################
# 1. Environment Check
###############################################################################

echo "📋 Step 1: Checking environment..."
echo ""

if [ -f .env.local ]; then
    check_pass "Environment file exists"
else
    check_fail "No .env.local file found - copy .env.example"
fi

# Run environment verification script
if node scripts/verify-environment.js > /dev/null 2>&1; then
    check_pass "Environment variables validated"
else
    check_fail "Environment validation failed - run: node scripts/verify-environment.js"
fi

echo ""

###############################################################################
# 2. Dependencies Check
###############################################################################

echo "📦 Step 2: Checking dependencies..."
echo ""

if [ -d node_modules ]; then
    check_pass "Dependencies installed"
else
    check_fail "Dependencies not installed - run: npm install"
fi

# Check for security vulnerabilities
AUDIT_OUTPUT=$(npm audit --production --audit-level=high 2>&1 || true)
if echo "$AUDIT_OUTPUT" | grep -q "found 0 vulnerabilities"; then
    check_pass "No high/critical vulnerabilities"
elif echo "$AUDIT_OUTPUT" | grep -q "found.*vulnerabilities"; then
    check_fail "Security vulnerabilities found - run: npm audit fix"
else
    check_warn "Could not check vulnerabilities"
fi

# Check for outdated packages
if npm outdated --depth=0 | grep -q "."; then
    check_warn "Some packages are outdated - consider updating"
else
    check_pass "All packages up to date"
fi

echo ""

###############################################################################
# 3. TypeScript Check
###############################################################################

echo "📘 Step 3: Type checking..."
echo ""

if npx tsc --noEmit --pretty false > /dev/null 2>&1; then
    check_pass "TypeScript compilation successful"
else
    check_fail "TypeScript errors found - run: npx tsc --noEmit"
fi

echo ""

###############################################################################
# 4. Linting Check
###############################################################################

echo "🔍 Step 4: Linting code..."
echo ""

if npm run lint > /dev/null 2>&1; then
    check_pass "ESLint passed"
else
    check_fail "ESLint errors found - run: npm run lint"
fi

echo ""

###############################################################################
# 5. Build Check
###############################################################################

echo "🏗️  Step 5: Testing production build..."
echo ""

if npm run build > /dev/null 2>&1; then
    check_pass "Production build successful"
    rm -rf .next
else
    check_fail "Build failed - run: npm run build"
fi

echo ""

###############################################################################
# 6. Test Suite
###############################################################################

echo "🧪 Step 6: Running tests..."
echo ""

if npm test -- --passWithNoTests --silent > /dev/null 2>&1; then
    check_pass "All tests passed"
else
    check_fail "Tests failed - run: npm test"
fi

# Check coverage
if [ -d coverage ]; then
    COVERAGE=$(cat coverage/coverage-summary.json 2>/dev/null || echo "{}")
    if echo "$COVERAGE" | grep -q "lines"; then
        check_pass "Test coverage report generated"
    else
        check_warn "No coverage report - run: npm run test:coverage"
    fi
else
    check_warn "No coverage data - run: npm run test:coverage"
fi

echo ""

###############################################################################
# 7. Security Checks
###############################################################################

echo "🔐 Step 7: Security verification..."
echo ""

# Check for hardcoded secrets
if grep -r "sk_live_" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" > /dev/null 2>&1; then
    check_fail "Hardcoded Stripe keys found in source code!"
else
    check_pass "No hardcoded secrets in source"
fi

# Check for console.log in production code
if grep -r "console.log" src/pages/api --include="*.ts" --include="*.js" | grep -v "logger" | grep -v "//" > /dev/null 2>&1; then
    check_warn "console.log found in API routes - use logger instead"
else
    check_pass "No console.log in API routes"
fi

# Check for TODO/FIXME
if grep -r "TODO\|FIXME" src/ --include="*.ts" --include="*.tsx" | grep -v "scripts" > /dev/null 2>&1; then
    check_warn "TODO/FIXME comments found in code"
else
    check_pass "No TODO/FIXME in source code"
fi

echo ""

###############################################################################
# 8. File Check
###############################################################################

echo "📁 Step 8: Checking required files..."
echo ""

REQUIRED_FILES=(
    ".env.example"
    "vercel.json"
    "package.json"
    "next.config.js"
    "tsconfig.json"
    "src/lib/auth.ts"
    "src/pages/api/stripe/checkout-session.ts"
    "src/pages/api/stripe/webhooks.ts"
    "PRODUCTION_DEPLOYMENT_CHECKLIST.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_pass "$file exists"
    else
        check_fail "$file missing"
    fi
done

echo ""

###############################################################################
# 9. Git Check
###############################################################################

echo "🌳 Step 9: Checking git status..."
echo ""

if [ -d .git ]; then
    check_pass "Git repository initialized"
    
    if git diff-index --quiet HEAD -- 2>/dev/null; then
        check_pass "No uncommitted changes"
    else
        check_warn "Uncommitted changes detected - commit before deploying"
    fi
    
    if git remote get-url origin > /dev/null 2>&1; then
        check_pass "Git remote configured"
    else
        check_fail "No git remote - cannot deploy to Vercel"
    fi
else
    check_fail "Not a git repository"
fi

echo ""

###############################################################################
# Summary
###############################################################################

echo "╔════════════════════════════════════════════════════════╗"
echo "║                    SUMMARY                             ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "🎉 All checks passed! Ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Run: node scripts/init-database.js"
    echo "2. Follow: VERCEL_DEPLOYMENT_GUIDE.md"
    echo "3. Deploy to Vercel"
    echo "4. Complete: PRODUCTION_DEPLOYMENT_CHECKLIST.md"
    echo ""
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  $WARNINGS warning(s) found"
    echo ""
    echo "You can deploy, but consider fixing warnings"
    echo ""
    exit 0
else
    echo "❌ $ERRORS error(s) found"
    if [ $WARNINGS -gt 0 ]; then
        echo "⚠️  $WARNINGS warning(s) found"
    fi
    echo ""
    echo "Fix errors before deploying!"
    echo ""
    exit 1
fi
