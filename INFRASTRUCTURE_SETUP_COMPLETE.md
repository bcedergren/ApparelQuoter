# Production Infrastructure Setup - Automated Scripts Ready

**Date:** April 17, 2026  
**Status:** ✅ **INFRASTRUCTURE AUTOMATION COMPLETE**  
**Ready to Execute:** YES

---

## 🎯 What Was Created

I've created **complete automation** for your production infrastructure setup:

### 1. ✅ Database Initialization Script
**File:** `scripts/init-database.js`

**What it does:**
- Connects to your MongoDB Atlas cluster
- Creates all performance indexes automatically
- Verifies index creation
- Tests database connectivity

**Run:**
```bash
node scripts/init-database.js
```

**Time:** 2 minutes  
**Input needed:** MongoDB connection string (or set MONGODB_URI env var)

---

### 2. ✅ Environment Validation Script
**File:** `scripts/verify-environment.js`

**What it does:**
- Validates all 15+ required environment variables
- Checks format and values
- Tests database connection
- Optionally creates indexes
- Reports missing/invalid configuration

**Run:**
```bash
node scripts/verify-environment.js
```

**Time:** 1 minute (or 3 minutes if creating indexes)

---

### 3. ✅ Deployment Pre-Check Script
**File:** `scripts/deploy-check.sh`

**What it does:**
- Validates environment variables
- Checks dependencies installed
- Runs security audit
- Type-checks TypeScript
- Runs ESLint
- Tests production build
- Runs test suite
- Checks for hardcoded secrets
- Verifies git status
- Checks required files exist

**Run:**
```bash
./scripts/deploy-check.sh
```

**Time:** 3-5 minutes  
**Exits with error if not ready to deploy**

---

### 4. ✅ Health Check Endpoint
**File:** `src/pages/api/health.ts`

**What it provides:**
- Public health check endpoint at `/api/health`
- Database connectivity status
- Application uptime
- Memory usage
- Response times
- Overall health status

**Use with:**
- UptimeRobot (https://uptimerobot.com)
- Pingdom
- Kubernetes health probes
- Load balancer health checks

**Test:**
```bash
curl https://yourdomain.com/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-04-17T...",
  "version": "0.1.0",
  "checks": {
    "database": {
      "status": "up",
      "responseTime": 45
    },
    "application": {
      "status": "up",
      "uptime": 12345,
      "memory": {
        "used": 50000000,
        "total": 100000000,
        "percentage": 50
      }
    }
  }
}
```

---

### 5. ✅ User Model Migration Script
**File:** `scripts/migrate-user-model.js`

**What it does:**
- Adds subscriptionStatus field to existing users
- Adds paymentStatus field to existing users
- Safe to run multiple times
- Shows migration progress
- Verifies completion

**Run:**
```bash
node scripts/migrate-user-model.js
```

**Time:** 1 minute  
**Only needed if you have existing users**

---

### 6. ✅ Enhanced Package Scripts
**File:** `package.json` (updated)

**New scripts added:**
```json
"verify-env": "node scripts/verify-environment.js"
"init-db": "node scripts/init-database.js"
"migrate-users": "node scripts/migrate-user-model.js"
"deploy-check": "./scripts/deploy-check.sh"
"pre-deploy": "npm run lint && npm run type-check && npm run test:ci"
"test:security": "jest --testPathPattern=security"
"type-check": "tsc --noEmit"
"lint:fix": "next lint --fix"
```

**Use like:**
```bash
npm run verify-env
npm run init-db
npm run deploy-check
```

---

### 7. ✅ GitHub Actions CI/CD
**File:** `.github/workflows/ci.yml`

**What it automates:**
- Runs on every push and PR
- Tests with Node.js 22.x
- Runs linter
- Type checks
- Runs all tests
- Security audit
- Build verification
- Checks for hardcoded secrets
- Uploads coverage to Codecov

**4 parallel jobs:**
1. Test & Lint
2. Security Checks
3. Build Check
4. Deploy Check (main branch only)

**Status:** Will appear in GitHub after push ✅

---

### 8. ✅ Production Configuration Files

**vercel.json:**
- Deployment configuration
- Security headers
- Region configuration
- Build settings

**next.config.js:**
- Production optimizations
- Security headers (HSTS, CSP, etc.)
- Image optimization
- Minification enabled

---

## 🚀 How to Use (Step-by-Step)

### Step 1: Verify Your Environment (2 minutes)

```bash
# Check all environment variables are set correctly
npm run verify-env
```

**Expected output:**
```
✅ All environment variables properly configured!
✅ Ready for deployment
```

**If errors:** Fix missing/invalid variables in `.env.local`

---

### Step 2: Initialize Database (2 minutes)

```bash
# Create all performance indexes in MongoDB
npm run init-db
```

**Expected output:**
```
✅ All indexes created successfully!
✅ Index verification complete!
```

**If errors:** Check MongoDB connection, network access, credentials

---

### Step 3: Migrate Existing Data (1 minute)

```bash
# Only needed if you have existing users
npm run migrate-users
```

**Expected output:**
```
✅ Migration complete!
Modified: X users
```

**If no users:** Skip this step

---

### Step 4: Pre-Deployment Check (5 minutes)

```bash
# Run comprehensive deployment checks
npm run deploy-check
```

**Expected output:**
```
🎉 All checks passed! Ready for deployment!
```

**If errors:** Fix issues reported by script

---

### Step 5: Deploy to Vercel (Follow Guide)

**Two options:**

**Option A: Manual via Dashboard (Recommended for first time)**
1. Go to https://vercel.com
2. Follow `VERCEL_DEPLOYMENT_GUIDE.md` steps 1-16
3. Import project from GitHub
4. Add all environment variables
5. Click Deploy

**Option B: Via CLI (Faster for experienced users)**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Set environment variables
# (Do this in dashboard - easier than CLI)

# Deploy to production
vercel --prod
```

---

### Step 6: Post-Deployment Verification (10 minutes)

**Verify deployment:**
```bash
# Check health endpoint
curl https://yourdomain.com/api/health

# Expected: {"status":"healthy",...}
```

**Test critical paths:**
1. Visit homepage
2. Register account
3. Login
4. Create quote
5. Test payment (use test card)

**Check logs:**
```bash
vercel logs --prod
```

---

## 📋 Complete Setup Checklist

### Prerequisites (Before Running Scripts)
- [ ] MongoDB Atlas account created
- [ ] MongoDB cluster created (M10 tier)
- [ ] Database user created with password
- [ ] IP allowlist configured (0.0.0.0/0 for testing)
- [ ] Connection string obtained
- [ ] Vercel account created
- [ ] All environment variables documented

### Automated Setup
- [ ] Run `npm run verify-env` - passes ✅
- [ ] Run `npm run init-db` - completes ✅
- [ ] Run `npm run migrate-users` - if needed ✅
- [ ] Run `npm run deploy-check` - passes ✅

### Manual Setup (Can't Automate)
- [ ] Import project to Vercel
- [ ] Add environment variables in Vercel dashboard
- [ ] Deploy to Vercel
- [ ] Configure custom domain (optional)
- [ ] Set up Stripe production webhook
- [ ] Test deployment

### Verification
- [ ] Health endpoint returns 200
- [ ] Can register and login
- [ ] Payment flow works
- [ ] No errors in logs

---

## 🎯 What the Scripts Can't Do (Need Manual Setup)

### 1. MongoDB Atlas Account Creation
**Why manual:** Requires credit card, account verification

**Time:** 10 minutes

**Steps:**
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up with Google (easiest)
3. Create organization
4. Create project
5. Create M10 cluster

**Follow:** `MONGODB_ATLAS_SETUP.md` Steps 1-2

---

### 2. Vercel Account & Project Import
**Why manual:** Requires GitHub OAuth, project selection

**Time:** 20 minutes

**Steps:**
1. Go to https://vercel.com
2. Sign up with GitHub
3. Import ApparelQuoter repository
4. Add environment variables
5. Deploy

**Follow:** `VERCEL_DEPLOYMENT_GUIDE.md` Steps 1-4

---

### 3. Environment Variables in Vercel
**Why manual:** Security best practice, Vercel UI required

**Time:** 15 minutes

**Steps:**
1. In Vercel project settings
2. Go to Environment Variables
3. Add all variables from `.env.example`
4. Select appropriate environments (Production, Preview, Development)

**Tip:** Can bulk import from file

---

### 4. Stripe Production Webhook
**Why manual:** Requires Stripe dashboard access

**Time:** 10 minutes

**Steps:**
1. Go to https://dashboard.stripe.com
2. Switch to Live mode
3. Developers → Webhooks
4. Add endpoint: `https://yourdomain.com/api/stripe/webhooks`
5. Copy signing secret
6. Add to Vercel environment variables

**Follow:** `VERCEL_DEPLOYMENT_GUIDE.md` Step 6

---

### 5. Domain Configuration
**Why manual:** Requires domain registrar access

**Time:** 1 hour (includes DNS propagation wait)

**Steps:**
1. Purchase domain (Namecheap, Google Domains, etc.)
2. In Vercel: Settings → Domains
3. Add domain
4. Configure DNS (use Vercel nameservers)
5. Wait for propagation (5 min - 48 hours)

**Follow:** `VERCEL_DEPLOYMENT_GUIDE.md` Step 5

---

## 🎬 Quick Start (Execute Now)

### If MongoDB is Already Set Up:

```bash
# 1. Verify environment (2 min)
npm run verify-env

# 2. Create indexes (2 min)
npm run init-db

# 3. Run deployment checks (5 min)
npm run deploy-check

# 4. All passing? Deploy!
# Follow VERCEL_DEPLOYMENT_GUIDE.md
```

---

### If Starting Fresh (Complete Setup):

**Morning (2-3 hours):**
```bash
# 1. Set up MongoDB Atlas (30 min)
# Follow MONGODB_ATLAS_SETUP.md Steps 1-4
# Get connection string

# 2. Update .env.local (5 min)
cp .env.example .env.local
# Edit .env.local with MongoDB connection string
# Generate secrets: openssl rand -base64 32

# 3. Test locally (10 min)
npm run verify-env
npm run init-db
npm run dev
# Test: Register account, create quote

# 4. Set up Vercel (1 hour)
# Follow VERCEL_DEPLOYMENT_GUIDE.md Steps 1-4
# Import project
# Add environment variables
# Deploy

# 5. Test deployment (30 min)
# Visit deployed URL
# Run smoke tests from checklist
```

**Afternoon (2-3 hours):**
```bash
# 6. Configure domain (1 hour)
# Follow VERCEL_DEPLOYMENT_GUIDE.md Step 5
# Or skip and use .vercel.app for now

# 7. Set up Stripe webhooks (30 min)
# Follow VERCEL_DEPLOYMENT_GUIDE.md Step 6

# 8. Final testing (1 hour)
# Complete PRODUCTION_DEPLOYMENT_CHECKLIST.md Phase 8
# Test all scenarios

# 9. Set up monitoring (30 min)
# Sentry, UptimeRobot
```

**End of Day: DEPLOYED! 🚀**

---

## 📊 Infrastructure Cost Summary

### Setup Costs (First Month)
| Item | Cost | When |
|------|------|------|
| MongoDB Atlas M10 | $57 | Today |
| Vercel Pro | $20 | Today |
| Resend Email | $20 | Today |
| Domain (optional) | $10-20 | Today |
| Sentry (optional) | $26 | Today |
| **Total First Month** | **$133-163** | |

### Ongoing Monthly
| Item | Cost/Month |
|------|------------|
| MongoDB Atlas | $57 |
| Vercel Pro | $20 |
| Resend | $20 |
| Sentry | $26 |
| Domain | $2 |
| **Total** | **$125/month** |

**Annual:** ~$1,500/year (after setup)

---

## 🛠️ Scripts Usage Reference

### Development Scripts
```bash
npm run dev              # Start dev server (port 3003)
npm run build            # Build for production
npm start                # Start production server
```

### Testing Scripts
```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report
npm run test:ci          # CI mode (no watch)
npm run test:security    # Security tests only
```

### Quality Scripts
```bash
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run type-check       # TypeScript check
```

### Deployment Scripts
```bash
npm run verify-env       # Validate environment variables
npm run init-db          # Initialize database indexes
npm run migrate-users    # Migrate User model (if needed)
npm run deploy-check     # Pre-deployment verification
npm run pre-deploy       # Lint + Type-check + Tests
```

---

## 🚀 Deployment Workflows

### Workflow 1: First-Time Production Deployment

```bash
# 1. Verify everything is ready
npm run deploy-check

# 2. Commit any remaining changes
git add -A
git commit -m "Production ready"
git push origin main

# 3. In Vercel Dashboard:
#    - Import project
#    - Add environment variables
#    - Deploy

# 4. After deployment:
curl https://yourdomain.com/api/health
# Should return: {"status":"healthy"}

# 5. Run smoke tests
# Follow PRODUCTION_DEPLOYMENT_CHECKLIST.md Phase 3
```

---

### Workflow 2: Regular Updates

```bash
# 1. Make changes
# ... code changes ...

# 2. Run pre-deploy checks
npm run pre-deploy

# 3. Commit and push
git add -A
git commit -m "Your changes"
git push origin main

# 4. Vercel auto-deploys
# Monitor at: https://vercel.com/dashboard

# 5. Verify health
curl https://yourdomain.com/api/health
```

---

### Workflow 3: Hotfix Production

```bash
# 1. Fix critical bug
# ... make fix ...

# 2. Quick validation
npm run lint
npm run type-check

# 3. Deploy immediately
git add -A
git commit -m "Hotfix: [description]"
git push origin main

# 4. Monitor deployment
vercel logs --prod

# 5. Verify fix deployed
# Test the fixed functionality
```

---

## 📋 MongoDB Atlas Quick Setup (30 min)

Since I can't access external services, here's your exact checklist:

### Part 1: Create Cluster (15 min)

1. **Go to:** https://www.mongodb.com/cloud/atlas
2. **Sign up** with Google account
3. **Create organization:** "ApparelQuoter"
4. **Create project:** "ApparelQuoter Production"
5. **Create cluster:**
   - Tier: M10
   - Provider: AWS
   - Region: US East (Virginia) - us-east-1
   - Cluster Name: apparelquoter-production
6. **Wait** for cluster creation (5-7 minutes)

### Part 2: Configure Security (10 min)

7. **Create database user:**
   - Left sidebar → Database Access
   - Add New Database User
   - Username: `apparelquoter_app`
   - Password: Autogenerate (SAVE THIS!)
   - Privilege: Read and write to any database
   - Add User

8. **Configure network access:**
   - Left sidebar → Network Access
   - Add IP Address
   - Allow from anywhere: `0.0.0.0/0` (temporary)
   - Confirm

9. **Get connection string:**
   - Go to Database (left sidebar)
   - Click Connect on your cluster
   - Choose: Connect your application
   - Copy connection string
   - Replace `<password>` with your password
   - Add database name: `/apparelquoter`

**Your connection string:**
```
mongodb+srv://apparelquoter_app:YOUR_PASSWORD@apparelquoter-production.xxxxx.mongodb.net/apparelquoter?retryWrites=true&w=majority
```

### Part 3: Test & Initialize (5 min)

10. **Update .env.local:**
```bash
MONGODB_URI=mongodb+srv://apparelquoter_app:YOUR_PASSWORD@...
```

11. **Run initialization:**
```bash
npm run verify-env
npm run init-db
```

12. **Verify in Atlas:**
    - Go to Collections
    - Should see indexes created

**✅ MongoDB Atlas Setup Complete!**

---

## ☁️ Vercel Quick Setup (1 hour)

### Part 1: Account & Import (15 min)

1. **Go to:** https://vercel.com
2. **Sign up** with GitHub
3. **Authorize** Vercel for GitHub
4. **Click** "Add New Project"
5. **Import** ApparelQuoter repository
6. **Don't deploy yet!**

### Part 2: Environment Variables (30 min)

7. **In project settings** → Environment Variables
8. **Add each variable** from `.env.example`:

```bash
# Required (copy from your .env.local):
MONGODB_URI=mongodb+srv://...
NEXTAUTH_URL=https://yourdomain.com (or use .vercel.app for now)
NEXTAUTH_SECRET=[generate new]
NEXT_PUBLIC_WEBSITE_URL=https://yourdomain.com
JWT_SECRET=[generate new]
STRIPE_SECRET_KEY=sk_test_... (use test for now)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (add after deployment)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com
MAILER_API_KEY=[generate new]
MAX_FILE_SIZE=52428800
UPLOAD_DIR=public/uploads
```

9. **For each variable:**
   - Key: Variable name
   - Value: Your value
   - Environments: ✅ Production, ✅ Preview, ✅ Development

10. **Generate secrets:**
```bash
openssl rand -base64 32
```

### Part 3: Deploy (10 min)

11. **Click** "Deploy" button
12. **Wait** for build (3-5 minutes)
13. **Watch** build logs for errors
14. **Visit** deployment URL when complete

### Part 4: Verify (5 min)

15. **Test health endpoint:**
```bash
curl https://your-project.vercel.app/api/health
```

16. **Test application:**
    - Visit homepage
    - Try to register
    - Try to login

**✅ Vercel Deployment Complete!**

---

## 🧪 Testing Your Deployment

### Automated Tests

```bash
# Run security tests
npm run test:security

# Run all tests
npm run test:ci

# Check coverage
npm run test:coverage
```

**Expected:** All pass with >70% coverage

---

### Manual Tests

**Basic Functionality:**
```bash
# 1. Health check
curl https://yourdomain.com/api/health

# 2. Homepage loads
curl https://yourdomain.com

# 3. API requires auth
curl https://yourdomain.com/api/dashboard
# Should return: 401 Unauthorized
```

**User Journey:**
1. Visit site
2. Register account
3. Login
4. Create customer
5. Create quote
6. Subscribe to plan (test card: 4242 4242 4242 4242)
7. Verify webhook updates database

---

## 🔧 Troubleshooting

### Script Fails: "MONGODB_URI not set"

**Solution:**
```bash
# Option 1: Set environment variable
export MONGODB_URI="mongodb+srv://..."

# Option 2: Create .env.local
cp .env.example .env.local
# Edit .env.local with your values

# Then run script again
```

---

### Script Fails: "Cannot connect to database"

**Solution:**
1. Verify connection string is correct (check password)
2. Check IP allowlist in MongoDB Atlas
3. Ensure cluster is running
4. Test with MongoDB Compass

---

### Deploy Check Fails: TypeScript Errors

**Solution:**
```bash
npx tsc --noEmit
# Fix reported errors
# Run deploy-check again
```

---

### Vercel Build Fails: Missing Environment Variables

**Solution:**
1. Go to Vercel project settings
2. Environment Variables section
3. Add missing variables
4. Redeploy

---

### Health Endpoint Returns 503

**Solution:**
1. Check Vercel logs: `vercel logs --prod`
2. Usually database connection issue
3. Verify MONGODB_URI in Vercel
4. Check MongoDB Atlas network access
5. Verify database cluster is running

---

## 📊 Success Metrics

### After Running All Scripts:

**Environment:**
- ✅ All 15+ variables validated
- ✅ Formats correct
- ✅ No missing required vars

**Database:**
- ✅ Connection successful
- ✅ 30+ indexes created
- ✅ Read/write tests pass

**Code Quality:**
- ✅ TypeScript compiles
- ✅ ESLint passes
- ✅ Tests pass
- ✅ Build succeeds

**Security:**
- ✅ No hardcoded secrets
- ✅ Security tests pass
- ✅ Audit clean

**Deployment:**
- ✅ All checks pass
- ✅ Git status clean
- ✅ Ready for production

---

## 🎯 Next Actions

### Immediate (Today)
1. ✅ **Run verification:** `npm run verify-env`
2. ✅ **Initialize database:** `npm run init-db`
3. ✅ **Run pre-deploy check:** `npm run deploy-check`

### Next (This Week)
4. ✅ **Deploy to Vercel** (follow guide)
5. ✅ **Configure domain** (optional)
6. ✅ **Set up Stripe production** (follow guide)
7. ✅ **Complete testing** (checklist Phase 8)

### Soon (This Month)
8. ✅ **Legal review** (hire attorney)
9. ✅ **User documentation** (write guides)
10. ✅ **Beta testing** (5-10 users)
11. ✅ **Public launch!** 🚀

---

## 📖 Documentation Map

**For infrastructure setup, use these in order:**

1. **INFRASTRUCTURE_SETUP_COMPLETE.md** ← You are here (automation overview)
2. **MONGODB_ATLAS_SETUP.md** (manual MongoDB setup)
3. **VERCEL_DEPLOYMENT_GUIDE.md** (manual Vercel setup)
4. **PRODUCTION_DEPLOYMENT_CHECKLIST.md** (complete verification)

**Quick reference:**
- Scripts usage: This document (above)
- What's left: `WHATS_LEFT_TO_LAUNCH.md`
- Getting started: `START_HERE.md`

---

## ✅ Completion Status

**Infrastructure Automation:**
- [x] Database init script
- [x] Environment validator
- [x] Deployment checker
- [x] Health check endpoint
- [x] Migration script
- [x] Package.json optimization
- [x] GitHub Actions CI/CD
- [x] Vercel configuration
- [x] Security headers

**Documentation:**
- [x] MongoDB setup guide
- [x] Vercel deployment guide
- [x] Production checklist
- [x] This infrastructure summary

**Status:** ✅ **100% AUTOMATION COMPLETE**

---

## 🎉 You're Ready!

**What's automated:**
- ✅ Environment validation
- ✅ Database initialization
- ✅ Index creation
- ✅ Pre-deployment checks
- ✅ CI/CD pipeline
- ✅ Health monitoring

**What needs manual setup:**
- ⏳ MongoDB Atlas account (30 min)
- ⏳ Vercel account & import (30 min)
- ⏳ Environment variables in Vercel (15 min)
- ⏳ Domain configuration (1 hour, optional)
- ⏳ Stripe webhook setup (10 min)

**Total manual time:** 2-3 hours

**With automation:** Scripts save you 5-6 hours of manual work!

---

**Ready to start?**

```bash
npm run verify-env
```

**Then follow the output and next steps!** 🚀
