# Vercel Deployment Guide - ApparelQuoter

**Application:** ApparelQuoter  
**Date:** April 17, 2026  
**Platform:** Vercel (Recommended for Next.js)  
**Estimated Time:** 1-2 hours

---

## Overview

Vercel is the optimal hosting platform for Next.js applications, offering:
- Zero-configuration deployment
- Automatic HTTPS/SSL
- Global CDN
- Automatic scaling
- Preview deployments for PRs
- Built-in analytics
- Environment variable management

**Monthly Cost:** $20/month (Pro plan - recommended for production)

---

## Prerequisites

Before starting, ensure you have:
- [ ] GitHub repository pushed and up-to-date
- [ ] MongoDB Atlas database set up (see MONGODB_ATLAS_SETUP.md)
- [ ] Stripe account configured
- [ ] Email provider (Resend) API key
- [ ] Domain name purchased (optional but recommended)

---

## Step 1: Create Vercel Account

### 1.1 Sign Up

1. Go to https://vercel.com
2. Click **"Sign Up"**
3. **Choose:** "Continue with GitHub" (recommended)
4. Authorize Vercel to access your GitHub account
5. Select repository access:
   - **All repositories** OR
   - **Only select repositories** → Choose `ApparelQuoter`

### 1.2 Choose Plan

**For Production:**
- **Pro Plan:** $20/month per user
  - Custom domains
  - Password protection
  - Advanced analytics
  - Team collaboration
  - Priority support

**For Development/Testing:**
- **Hobby Plan:** Free
  - Good for personal projects
  - Limited features
  - Use for staging environment

**Recommendation:** Start with Hobby for staging, upgrade to Pro for production

---

## Step 2: Import Your Project

### 2.1 Import Repository

1. From Vercel Dashboard, click **"Add New..."**
2. Select **"Project"**
3. Find **"ApparelQuoter"** repository
4. Click **"Import"**

### 2.2 Configure Project

**Framework Preset:** Next.js (should auto-detect)

**Root Directory:** `./` (leave as default)

**Build Command:**
```bash
npm run build
```

**Output Directory:** `.next` (default for Next.js)

**Install Command:**
```bash
npm install
```

**Development Command:**
```bash
npm run dev
```

### 2.3 Environment Variables (CRITICAL)

Click **"Environment Variables"** section and add ALL of these:

**DO NOT DEPLOY YET** - First, add all environment variables below!

---

## Step 3: Configure Environment Variables

### 3.1 Required Variables (All Environments)

Add these to **Production, Preview, and Development**:

```bash
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/apparelquoter?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generate-new-32-char-secret>

# Application
NEXT_PUBLIC_WEBSITE_URL=https://yourdomain.com
JWT_SECRET=<generate-new-32-char-secret>

# Mailer Internal Security
MAILER_API_KEY=<generate-new-32-char-secret>

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_DIR=public/uploads
```

### 3.2 Stripe Variables (Production)

```bash
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (get after deployment)
```

**Note:** For staging/preview, use test keys (`sk_test_...`)

### 3.3 OAuth Providers (Optional)

```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
```

### 3.4 How to Add Variables in Vercel

**Method 1: Via Dashboard (Recommended)**
1. In project settings, go to **"Environment Variables"**
2. For each variable:
   - **Key:** Variable name (e.g., `MONGODB_URI`)
   - **Value:** Variable value
   - **Environments:** Check appropriate boxes:
     - Production ✅ (for live site)
     - Preview ✅ (for PR previews)
     - Development ✅ (for local with Vercel CLI)
3. Click **"Save"**

**Method 2: Via Vercel CLI**
```bash
vercel env add MONGODB_URI production
vercel env add MONGODB_URI preview
```

**Method 3: Bulk Import**
1. Create `vercel-env.txt` with format:
```
MONGODB_URI=value
NEXTAUTH_SECRET=value
...
```
2. Go to Environment Variables
3. Click **"Import"**
4. Paste contents
5. Select environments

### 3.5 Generate Secrets

Use this command to generate secure secrets:
```bash
openssl rand -base64 32
```

Generate for:
- `NEXTAUTH_SECRET`
- `JWT_SECRET`
- `MAILER_API_KEY`

---

## Step 4: Initial Deployment

### 4.1 Deploy to Production

1. After adding all environment variables
2. Click **"Deploy"** button
3. **Wait for build** (2-5 minutes)
4. Watch build logs for errors

### 4.2 Verify Deployment

1. Click on deployment when complete
2. Visit the deployed URL: `https://apparelquoter.vercel.app`
3. Test basic functionality:
   - [ ] Home page loads
   - [ ] Can access login page
   - [ ] Can register new account
   - [ ] Can login
   - [ ] Dashboard displays

### 4.3 Check Build Logs

If deployment fails:
1. Click on the failed deployment
2. Review **"Build Logs"**
3. Common issues:
   - Missing environment variables
   - TypeScript errors
   - Build command issues
   - Dependencies missing

**Fix and redeploy automatically** - Vercel rebuilds on every push to main

---

## Step 5: Custom Domain Configuration

### 5.1 Purchase Domain (if needed)

**Recommended Registrars:**
- Namecheap
- Google Domains
- Cloudflare Registrar
- GoDaddy

**Cost:** $10-20/year

### 5.2 Add Domain to Vercel

1. Go to Project **"Settings"**
2. Click **"Domains"**
3. Enter your domain: `apparelquoter.com`
4. Click **"Add"**

### 5.3 Configure DNS Records

Vercel will show you DNS records to add:

**Option A: Use Vercel Nameservers (Recommended)**
```
1. In your domain registrar, find "Nameservers" setting
2. Replace with Vercel's nameservers:
   - ns1.vercel-dns.com
   - ns2.vercel-dns.com
3. Save changes
4. Wait 24-48 hours for propagation (usually faster)
```

**Option B: Add A/CNAME Records**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 5.4 Update Environment Variables

After domain is connected:

1. Update `NEXTAUTH_URL`:
```bash
NEXTAUTH_URL=https://apparelquoter.com
```

2. Update `NEXT_PUBLIC_WEBSITE_URL`:
```bash
NEXT_PUBLIC_WEBSITE_URL=https://apparelquoter.com
```

3. **Redeploy** - Vercel will use new URLs

### 5.5 Set Primary Domain

1. In Domains settings
2. Find your custom domain
3. Click **"..."** → **"Make Primary"**
4. Vercel will redirect `*.vercel.app` to your domain

---

## Step 6: Configure Stripe Webhooks

### 6.1 Get Webhook URL

Your webhook endpoint:
```
https://yourdomain.com/api/stripe/webhooks
```

### 6.2 Add in Stripe Dashboard

1. Go to https://dashboard.stripe.com
2. Switch to **Live Mode** (toggle in sidebar)
3. Go to **"Developers"** → **"Webhooks"**
4. Click **"Add endpoint"**
5. **Endpoint URL:** `https://yourdomain.com/api/stripe/webhooks`
6. **Events to send:** Select:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
7. Click **"Add endpoint"**

### 6.3 Get Signing Secret

1. Click on your newly created webhook
2. Copy **"Signing secret"** (starts with `whsec_...`)
3. Add to Vercel environment variables:
```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```
4. Redeploy to apply changes

### 6.4 Test Webhook

1. In Stripe webhook settings, click **"Send test webhook"**
2. Choose an event type (e.g., `checkout.session.completed`)
3. Click **"Send test webhook"**
4. Check Vercel logs for successful processing
5. Check database for updated user record

---

## Step 7: Deployment Configuration Files

### 7.1 Create vercel.json

**File:** `/workspace/vercel.json`

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "MONGODB_URI": "@mongodb-uri",
    "NEXTAUTH_SECRET": "@nextauth-secret",
    "STRIPE_SECRET_KEY": "@stripe-secret-key"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY": "@stripe-publishable-key",
      "NEXT_PUBLIC_WEBSITE_URL": "@website-url"
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 7.2 Update next.config.js

Ensure production optimizations are enabled:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true, // Fast minification
  poweredByHeader: false, // Remove X-Powered-By header
  compress: true, // Enable gzip compression
  
  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
  },

  // Environment variables available to browser
  env: {
    NEXT_PUBLIC_WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
```

---

## Step 8: Deployment Workflow

### 8.1 Automatic Deployments

**Vercel automatically deploys when you push to GitHub:**

```
Push to main branch → Production deployment
Push to other branch → Preview deployment
Create PR → Preview deployment (shareable link)
```

### 8.2 Manual Deployment (if needed)

**Via Vercel CLI:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project (first time)
vercel link

# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

### 8.3 Deployment Settings

**In Project Settings → Git:**

- **Production Branch:** `main`
- **Ignored Build Step:** Leave blank (build every commit)
- **Auto-expose System Environment Variables:** ✅ Enabled

**Framework Overrides:**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`
- Development Command: `npm run dev`

---

## Step 9: Monitoring & Logs

### 9.1 View Deployment Logs

1. Go to **"Deployments"** tab
2. Click on any deployment
3. View **"Build Logs"** for build-time issues
4. View **"Functions"** logs for runtime errors

### 9.2 Real-Time Function Logs

1. Go to deployment
2. Click **"Functions"** tab
3. See all API route invocations
4. Filter by:
   - Function name (API route)
   - Status code
   - Time range

### 9.3 Set Up Vercel Analytics (Optional)

1. Go to **"Analytics"** tab
2. Click **"Enable Analytics"**
3. Adds Web Vitals tracking
4. Shows page performance metrics

**Cost:** Included with Pro plan

---

## Step 10: Environment-Specific Configuration

### 10.1 Create Staging Environment

**Option A: Use Preview Deployments**
- Every PR creates a preview
- Share URL with team for testing
- Free on all plans

**Option B: Separate Project**
1. Create new Vercel project: `ApparelQuoter-Staging`
2. Connect to same repo, different branch (e.g., `staging`)
3. Use separate environment variables
4. Use separate MongoDB database
5. Use Stripe test mode

**Recommendation:** Option A (Preview deployments) for simplicity

### 10.2 Environment Variable Strategy

**Production Environment:**
```bash
MONGODB_URI=<production-database>
STRIPE_SECRET_KEY=sk_live_...
NEXTAUTH_URL=https://apparelquoter.com
```

**Preview/Staging Environment:**
```bash
MONGODB_URI=<staging-database>
STRIPE_SECRET_KEY=sk_test_...
NEXTAUTH_URL=https://apparelquoter-staging.vercel.app
```

**How to set environment-specific variables:**
1. In Environment Variables section
2. Check appropriate boxes:
   - ✅ Production (live site only)
   - ✅ Preview (PR previews only)
   - ✅ Development (local development only)

---

## Step 11: Performance Optimization

### 11.1 Edge Functions (Optional)

For faster API responses, use Edge Runtime:

**Update API route:**
```typescript
// src/pages/api/some-endpoint.ts
export const config = {
  runtime: 'edge',
};
```

**Limitations:**
- No Node.js APIs (fs, crypto, etc.)
- No native modules
- Smaller bundle size

**Recommendation:** Leave as Node.js runtime for MVP (MongoDB compatibility)

### 11.2 Enable Image Optimization

Already enabled by default in Next.js + Vercel!

**Verify:**
```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image 
  src="/logo.png" 
  width={200} 
  height={50} 
  alt="Logo"
/>
```

### 11.3 Configure Caching

**API Routes (if needed):**
```typescript
export default async function handler(req, res) {
  // Cache for 5 minutes
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
  
  // ... your code
}
```

---

## Step 12: Security Configuration

### 12.1 Security Headers

Already added in `next.config.js` (see Step 7.2)

**Verify headers:**
```bash
curl -I https://yourdomain.com
```

Should see:
```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=63072000
```

### 12.2 Environment Variable Security

**Best Practices:**
- ✅ Never commit `.env.local` to git
- ✅ Use different secrets for prod/staging
- ✅ Rotate secrets every 90 days
- ✅ Use Vercel's encrypted storage
- ❌ Never expose secrets in client code
- ❌ Never log secrets in console

**Vercel Security:**
- All env vars are encrypted at rest
- Not exposed in logs
- Not visible in preview deployments unless explicitly set

### 12.3 Enable Password Protection (Staging)

For staging/preview environments:

1. Go to **"Settings"** → **"Deployment Protection"**
2. Enable **"Password Protection"**
3. Set password
4. Share with team only

---

## Step 13: Testing Deployment

### 13.1 Smoke Test Checklist

After deployment, test these critical paths:

**Authentication:**
- [ ] Visit homepage
- [ ] Register new account
- [ ] Verify email received (if enabled)
- [ ] Login with credentials
- [ ] Logout
- [ ] Password reset flow

**Core Features:**
- [ ] Create customer
- [ ] Create quote
- [ ] Convert quote to order
- [ ] Create invoice
- [ ] Upload design file
- [ ] View dashboard

**Payments:**
- [ ] Subscribe to plan (use test card initially)
- [ ] Verify webhook updates database
- [ ] Check Stripe dashboard

**Security:**
- [ ] Try accessing API without login (should fail)
- [ ] Try accessing another company's data (should fail)

### 13.2 Performance Testing

**Check Page Load Times:**
```bash
# Install lighthouse
npm install -g lighthouse

# Test performance
lighthouse https://yourdomain.com --view
```

**Target Scores:**
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

### 13.3 Error Monitoring

1. Cause intentional errors (try invalid inputs)
2. Check Vercel function logs
3. Verify errors are caught and handled
4. Set up Sentry (see Step 14)

---

## Step 14: External Monitoring Setup

### 14.1 Sentry (Error Tracking)

**Install Sentry:**
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

**Configure:**
```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.VERCEL_ENV || 'development',
});
```

**Add to Vercel env vars:**
```bash
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

### 14.2 Uptime Monitoring

**UptimeRobot (Free):**
1. Sign up: https://uptimerobot.com
2. Add monitor:
   - Type: HTTPS
   - URL: `https://yourdomain.com`
   - Interval: 5 minutes
3. Set up alerts (email, Slack, etc.)

**Alternative:** Pingdom, StatusCake, Better Uptime

---

## Step 15: Continuous Deployment

### 15.1 Git Workflow

**Production Deployments:**
```bash
git checkout main
git pull origin main
# Make changes
git add .
git commit -m "Your changes"
git push origin main
# Vercel automatically deploys!
```

**Preview Deployments:**
```bash
git checkout -b feature/new-feature
# Make changes
git push origin feature/new-feature
# Create PR on GitHub
# Vercel creates preview deployment with unique URL
```

### 15.2 Deployment Protection

**Enable for Production:**
1. Settings → Deployment Protection
2. **Vercel Authentication:** Require team login to view
3. **Password Protection:** Require password to view
4. **Trusted IPs:** Only allow specific IPs

**Recommendation:** Leave public for production, enable for staging

### 15.3 Rollback Strategy

**If production deployment breaks:**

1. **Option A: Instant Rollback**
   - Go to **"Deployments"**
   - Find last working deployment
   - Click **"..."** → **"Promote to Production"**
   - Takes effect immediately

2. **Option B: Git Revert**
   ```bash
   git revert HEAD
   git push origin main
   # Vercel deploys reverted code
   ```

3. **Option C: Redeploy Previous**
   - In Vercel dashboard
   - Click on previous deployment
   - Click **"Redeploy"**

---

## Step 16: Team Collaboration

### 16.1 Invite Team Members

1. Go to **"Settings"** → **"Members"**
2. Click **"Invite"**
3. Enter email addresses
4. Assign roles:
   - **Owner:** Full access
   - **Member:** Deploy and view
   - **Viewer:** View only

### 16.2 Set Up Notifications

1. Settings → **"Notifications"**
2. Enable:
   - ✅ Deployment failed
   - ✅ Deployment ready
   - ⚠️ Comment on preview (optional)

3. Choose notification channels:
   - Email
   - Slack
   - Discord
   - Webhooks

---

## Troubleshooting

### Build Fails: "Module not found"

**Solution:**
```bash
# Ensure all dependencies in package.json
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

### Build Fails: Environment Variables Not Set

**Solution:**
1. Go to Settings → Environment Variables
2. Ensure ALL required variables are added
3. Check variable names match exactly
4. Redeploy

### Runtime Error: Database Connection Failed

**Solution:**
1. Verify `MONGODB_URI` is set correctly
2. Check MongoDB Atlas network access
3. Ensure cluster is running
4. Test connection string locally

### Stripe Webhooks Not Working

**Solution:**
1. Verify webhook URL is correct
2. Check webhook signing secret matches
3. Check Vercel function logs for errors
4. Test with Stripe CLI locally first

### Site Shows "Application Error"

**Solution:**
1. Check Vercel function logs
2. Look for runtime errors
3. Check database connection
4. Verify all environment variables set
5. Check for TypeScript errors

### Too Many Requests (429 Error)

**Solution:**
1. Vercel has request limits
2. Pro plan: Higher limits
3. Add caching to reduce API calls
4. Optimize database queries

---

## Cost Breakdown

### Vercel Pro Plan: $20/month

**Includes:**
- Unlimited bandwidth
- Unlimited deployments
- Custom domains
- Analytics
- Password protection
- Priority support
- Team collaboration

**Additional Costs:**
- Serverless function execution: Included (100GB-hours/month)
- Edge middleware: Included (1M requests/month)
- Image optimization: Included
- **Overages:** Very rare with typical usage

**Total Expected Cost:** $20/month (no overages for MVP traffic)

---

## Quick Reference

### Essential URLs

**Vercel Dashboard:**
```
https://vercel.com/dashboard
```

**Your Project:**
```
https://vercel.com/your-username/apparelquoter
```

**Production URL (before custom domain):**
```
https://apparelquoter.vercel.app
```

**Production URL (after custom domain):**
```
https://apparelquoter.com
```

### Essential Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link local project to Vercel
vercel link

# Deploy to production
vercel --prod

# View logs
vercel logs

# View environment variables
vercel env ls

# Add environment variable
vercel env add VARIABLE_NAME production

# Pull environment variables locally
vercel env pull
```

---

## Deployment Checklist

Before going live:

### Pre-Deployment
- [ ] All environment variables configured
- [ ] MongoDB Atlas connected and tested
- [ ] Stripe keys (live mode) added
- [ ] Domain configured (if using custom)
- [ ] Build succeeds locally
- [ ] All tests passing

### Deployment
- [ ] Deploy to Vercel
- [ ] Verify build succeeds
- [ ] Check deployment logs
- [ ] Visit deployed URL
- [ ] Test critical paths

### Post-Deployment
- [ ] Configure Stripe webhooks
- [ ] Test webhook delivery
- [ ] Set up monitoring (Sentry, UptimeRobot)
- [ ] Configure alerts
- [ ] Update DNS (if needed)
- [ ] SSL certificate active (automatic)

### Verification
- [ ] All features work
- [ ] No console errors
- [ ] Database queries work
- [ ] Payments process correctly
- [ ] Emails send successfully

---

## Support & Resources

### Vercel Support
- **Documentation:** https://vercel.com/docs
- **Community:** https://github.com/vercel/vercel/discussions
- **Support:** support@vercel.com (Pro plan)
- **Status:** https://www.vercel-status.com

### Best Practices
- Use preview deployments for testing
- Never commit secrets to git
- Monitor function logs regularly
- Set up alerts for failures
- Keep dependencies updated
- Review analytics monthly

---

## Next Steps

After successful deployment:

1. ✅ **Monitor for 24-48 hours**
   - Watch error rates
   - Check function logs
   - Monitor database connections
   - Verify webhooks working

2. ✅ **Set up monitoring**
   - Sentry for errors
   - UptimeRobot for uptime
   - Google Analytics for traffic

3. ✅ **Performance optimization**
   - Run Lighthouse audit
   - Fix any issues
   - Optimize slow queries

4. ✅ **Documentation**
   - Document deployment process
   - Create runbook for common issues
   - Train team on Vercel dashboard

5. ✅ **Beta testing**
   - Invite 5-10 beta users
   - Collect feedback
   - Fix issues
   - Prepare for public launch

---

**Deployment Complete!** 🚀

Your ApparelQuoter application is now live on Vercel.

**Your URLs:**
- Production: https://apparelquoter.com (or apparelquoter.vercel.app)
- Staging: Preview deployments from PRs

**Need help?** Check Vercel documentation or contact support@vercel.com
