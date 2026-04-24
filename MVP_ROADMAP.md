# ApparelQuoter MVP Roadmap

**Project:** ApparelQuoter  
**Repository:** https://github.com/bcedergren/ApparelQuoter  
**Current Version:** 0.1.0  
**Target:** Production-Ready MVP  
**Last Updated:** April 17, 2026

---

## Executive Summary

ApparelQuoter is a comprehensive business management application for apparel companies, featuring quote management, order processing, CRM, design collaboration, invoicing, and reporting. The application has **strong feature depth** with most core functionality implemented, but requires critical security hardening, billing system fixes, and production readiness improvements before MVP launch.

**Current State:** ~75% complete - Core features built but needs security, billing, and deployment work  
**Estimated Effort:** Medium complexity - 15-20 major tasks to complete MVP  
**Primary Blockers:** Security vulnerabilities, broken Stripe integration, missing deployment configuration

---

## Table of Contents

1. [Critical Blockers (Must Fix Before Launch)](#1-critical-blockers-must-fix-before-launch)
2. [Security & Authentication](#2-security--authentication)
3. [Billing & Payments](#3-billing--payments)
4. [Feature Completion](#4-feature-completion)
5. [Testing & Quality Assurance](#5-testing--quality-assurance)
6. [Deployment & Infrastructure](#6-deployment--infrastructure)
7. [Documentation & Support](#7-documentation--support)
8. [Marketing & Go-to-Market](#8-marketing--go-to-market)
9. [Post-MVP Enhancements](#9-post-mvp-enhancements)

---

## 1. Critical Blockers (Must Fix Before Launch)

### 1.1 Security Vulnerabilities - CRITICAL
**Priority:** URGENT  
**Status:** ❌ Not Started  
**Estimated Effort:** High

#### Issues:
- **Unauthenticated Data Access:** Multiple API endpoints expose sensitive data without authentication
  - `/api/dashboard` - Company metrics accessible to anyone with companyId
  - `/api/customers/[companyId]` - Customer data enumeration
  - `/api/quotes/[companyId]` - Quote data exposure
  - `/api/prices/[companyId]` - Pricing data exposure
  - `/api/company/[CompanyId]` - Company details exposure
  - `/api/quote/[quoteId]` - Individual quote GET/DELETE without auth

- **Unauthenticated Mutations:** Critical write operations without auth checks
  - `/api/users/add-user` - Unrestricted user creation
  - `/api/users/[id]` - Update/delete any user
  - `/api/customers/update/[id]` - Cross-tenant customer tampering
  - `/api/customers/delete/[id]` - Cross-tenant customer deletion
  - `/api/quotes/saveQuote` - Trusts client-supplied userId/companyId
  - `/api/order/[quoteId]` - Convert quotes without authorization
  - `/api/status/update` - Modify order status without auth
  - `/api/sales/create` - Create sales records without auth
  - `/api/activities/create` - Create activities without auth
  - `/api/company/create` - Unrestricted company creation
  - `/api/company/update` - No ownership verification
  - `/api/prices/create` - Unrestricted pricing creation

- **Email Relay Vulnerability:**
  - `/api/mailer` - Publicly accessible, accepts arbitrary from/to addresses (spam/abuse risk)

- **Admin Endpoint Exposure:**
  - `/api/admin/customerNotes` - No admin check, migrates all customers

#### Tasks:
- [ ] **1.1.1** Create authentication middleware utility
  - Create `src/lib/auth.ts` with `requireAuth()` and `requireCompanyAccess()` helpers
  - Implement session validation using NextAuth `getServerSession`
  - Add company ownership verification
  - Add role-based access control (admin vs user)

- [ ] **1.1.2** Add authentication to all data read endpoints
  - `/api/dashboard` - Require session, verify companyId ownership
  - `/api/customers/[companyId]` - Require session, verify company access
  - `/api/quotes/[companyId]` - Require session, verify company access
  - `/api/prices/[companyId]` - Require session, verify company access
  - `/api/company/[CompanyId]` - Require session, verify company ownership
  - `/api/quote/[quoteId]` - Require session, verify quote company ownership

- [ ] **1.1.3** Add authentication to all mutation endpoints
  - `/api/users/add-user` - Require session, verify admin role
  - `/api/users/[id]` - Require session, verify company/admin access
  - `/api/customers/update/[id]` - Require session, verify customer company ownership
  - `/api/customers/delete/[id]` - Require session, verify customer company ownership
  - `/api/quotes/saveQuote` - Require session, use session userId/companyId (don't trust body)
  - `/api/order/[quoteId]` - Require session, verify quote ownership
  - `/api/status/update` - Require session, verify resource ownership
  - `/api/sales/create` - Require session, verify company access
  - `/api/activities/create` - Require session, verify company access
  - `/api/company/create` - Keep public for registration, add rate limiting
  - `/api/company/update` - Require session, verify company ownership
  - `/api/prices/create` - Require session, verify company access

- [ ] **1.1.4** Secure email and admin endpoints
  - Add internal-only authentication to `/api/mailer` (require API key header)
  - Update all server-side code to use internal API key when calling mailer
  - Add admin role check to `/api/admin/customerNotes`
  - Add one-time migration flag to prevent repeated execution

- [ ] **1.1.5** Add request validation
  - Validate all ObjectId parameters
  - Add input sanitization for all user inputs
  - Implement request size limits
  - Add rate limiting to sensitive endpoints

**Testing:**
- [ ] Write security tests for each protected endpoint
- [ ] Test cross-tenant access scenarios
- [ ] Verify session expiration handling
- [ ] Test role-based access control

---

### 1.2 Broken Stripe Integration - CRITICAL
**Priority:** URGENT  
**Status:** ❌ Not Started  
**Estimated Effort:** Medium

#### Issues:
- `/api/stripe/checkout.ts` uses App Router syntax (`NextRequest`, `NextResponse`, `export async function POST`) in a Pages Router project
- UI calls `/api/stripe/checkout-session` but file is named `checkout.ts`
- `subscribe.tsx` expects `value.session` while `payment.tsx` expects `checkoutSession.id` - inconsistent API contract
- No Stripe webhook handler for subscription lifecycle events
- Missing webhook signature verification
- Subscription state can drift from Stripe reality

#### Tasks:
- [ ] **1.2.1** Fix Stripe checkout API endpoint
  - Delete or relocate invalid `src/pages/api/stripe/checkout.ts`
  - Create new `src/pages/api/stripe/checkout-session.ts` using Pages Router syntax
  - Implement proper session creation with Next.js API route handler pattern
  - Add authentication and user validation
  - Test with both `subscribe.tsx` and `payment.tsx` flows

- [ ] **1.2.2** Standardize Stripe response format
  - Document expected response structure: `{ success: boolean, session: { id: string, url: string } }`
  - Update `subscribe.tsx` to handle standardized response
  - Update `payment.tsx` to handle standardized response
  - Add error response handling

- [ ] **1.2.3** Implement Stripe webhooks
  - Create `src/pages/api/stripe/webhooks.ts`
  - Add webhook signature verification
  - Handle `checkout.session.completed` event
  - Handle `customer.subscription.updated` event
  - Handle `customer.subscription.deleted` event
  - Handle `invoice.payment_failed` event
  - Update User model with subscription status changes
  - Add logging for webhook events

- [ ] **1.2.4** Test Stripe integration end-to-end
  - Test subscription creation flow
  - Test webhook handling with Stripe CLI
  - Test subscription updates
  - Test payment failures
  - Test subscription cancellations
  - Verify database state matches Stripe

- [ ] **1.2.5** Configure Stripe environment
  - Add webhook endpoint URL to Stripe dashboard
  - Configure webhook signing secret
  - Set up test mode vs production mode
  - Document required environment variables
  - Test with Stripe test cards

**Environment Variables Needed:**
```bash
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_WEBSITE_URL=https://yourdomain.com
```

---

## 2. Security & Authentication

### 2.1 OAuth Registration Flow
**Priority:** High  
**Status:** ⚠️ Partially Implemented  
**Estimated Effort:** Medium

#### Issues:
- `RegistrationForm.tsx` has incomplete Google sign-in (`handleGoogleSignIn` mostly logs)
- JWT callback in `[...nextauth].ts` creates duplicate User documents for OAuth users
- No password for OAuth users causing potential issues
- Facebook OAuth configured but not tested

#### Tasks:
- [ ] **2.1.1** Complete OAuth registration implementation
  - Finish `handleGoogleSignIn` in RegistrationForm
  - Add proper error handling
  - Redirect to company setup after OAuth success
  - Handle existing email scenarios

- [ ] **2.1.2** Fix duplicate user creation in JWT callback
  - Check for existing user by email before creating
  - Handle OAuth users vs credential users separately
  - Add proper linking of OAuth accounts to existing users
  - Test with multiple OAuth providers

- [ ] **2.1.3** Test OAuth flows
  - Test Google OAuth sign-in
  - Test Facebook OAuth sign-in
  - Test email/password registration
  - Test account linking scenarios
  - Test error cases (declined permissions, etc.)

---

### 2.2 Password Management
**Priority:** Medium  
**Status:** ⚠️ Inconsistent  
**Estimated Effort:** Low

#### Issues:
- `reset-password.ts` uses `bcryptjs` while other code uses `@/lib/password`
- Inconsistent hashing implementation across codebase

#### Tasks:
- [ ] **2.2.1** Standardize password hashing
  - Audit all password hashing locations
  - Use consistent bcrypt implementation throughout
  - Verify salt rounds are consistent (recommend 10-12)
  - Document password hashing strategy

- [ ] **2.2.2** Test password flows
  - Test registration with password
  - Test login with password
  - Test forgot password flow
  - Test reset password flow
  - Test invalid token scenarios

---

### 2.3 File Upload Security
**Priority:** Medium  
**Status:** ⚠️ Partially Implemented  
**Estimated Effort:** Low

#### Issues:
- Files uploaded to `public/uploads` are publicly accessible
- Partial size/type validation exists
- No malware scanning
- No company-based authorization

#### Tasks:
- [ ] **2.3.1** Enhance upload security
  - Add strict file type validation (whitelist approach)
  - Enforce file size limits (currently 50MB, consider reducing)
  - Add company ownership verification to upload endpoint
  - Generate unique filenames to prevent overwrites

- [ ] **2.3.2** Consider file storage strategy
  - Evaluate moving uploads outside public directory
  - Consider using signed URLs for file access
  - Or implement authorization check before serving files
  - Document chosen approach

- [ ] **2.3.3** Add file scanning (optional for MVP)
  - Research antivirus/malware scanning options
  - Implement if critical for launch
  - Or add to post-MVP roadmap

---

## 3. Billing & Payments

### 3.1 Subscription Management
**Priority:** High  
**Status:** ⚠️ Partially Implemented  
**Estimated Effort:** Medium

#### Tasks:
- [ ] **3.1.1** Build subscription management UI
  - Create `/app/settings/billing` page
  - Show current subscription status
  - Display payment history
  - Add upgrade/downgrade options
  - Add cancel subscription option

- [ ] **3.1.2** Implement subscription changes
  - Create API endpoint for plan changes
  - Handle proration with Stripe
  - Update User model when plan changes
  - Send confirmation emails

- [ ] **3.1.3** Handle subscription lifecycle
  - Grace period for failed payments
  - Downgrade to free tier on cancellation
  - Feature access based on subscription tier
  - Warning emails before subscription expires

---

### 3.2 Payment Processing
**Priority:** High  
**Status:** ⚠️ Needs Testing  
**Estimated Effort:** Low

#### Tasks:
- [ ] **3.2.1** Test payment flows thoroughly
  - Test successful payment
  - Test declined card
  - Test expired card
  - Test insufficient funds
  - Test 3D Secure authentication

- [ ] **3.2.2** Add payment failure handling
  - User-friendly error messages
  - Retry logic for failed payments
  - Email notifications for payment issues
  - Account suspension logic if needed

---

### 3.3 Invoicing Enhancements
**Priority:** Medium  
**Status:** ✅ Mostly Complete  
**Estimated Effort:** Low

#### Tasks:
- [ ] **3.3.1** Polish invoice features
  - Test PDF generation thoroughly
  - Add invoice email sending
  - Test payment tracking
  - Verify overdue invoice handling

- [ ] **3.3.2** Add invoice reminders (optional for MVP)
  - Automated reminder emails
  - Configurable reminder schedule
  - Track sent reminders

---

## 4. Feature Completion

### 4.1 Receipt Page - REQUIRED
**Priority:** High  
**Status:** ❌ Stubbed  
**Estimated Effort:** Medium

#### Issues:
- `src/pages/app/receipt.tsx` has hardcoded placeholder data
- Not connected to real payment/invoice/quote data

#### Tasks:
- [ ] **4.1.1** Implement real receipt functionality
  - Accept invoice ID or quote ID parameter
  - Fetch real data from database
  - Display actual line items, totals, customer info
  - Add print functionality
  - Add PDF download

- [ ] **4.1.2** Alternative: Hide receipt until post-MVP
  - Remove from navigation
  - Return 404 or redirect
  - Add to post-MVP roadmap
  - Document decision

**Recommendation:** Either implement properly or hide from navigation. Having a placeholder in production looks unprofessional.

---

### 4.2 Quote Details Bug Fix
**Priority:** High  
**Status:** ❌ Bug Identified  
**Estimated Effort:** Low

#### Issues:
- `quote-details/[quoteId].tsx` expects company API to return raw company object
- API actually returns `{ success, company }` structure
- May cause UI breakage

#### Tasks:
- [ ] **4.2.1** Fix company data handling
  - Update `quote-details/[quoteId].tsx` to parse `data.company`
  - Test quote details page thoroughly
  - Verify company information displays correctly
  - Check for similar issues in other pages

---

### 4.3 Sales Integration
**Priority:** Medium  
**Status:** ⚠️ Partially Implemented  
**Estimated Effort:** Medium

#### Issues:
- Sale model exists and used in reports/dashboard
- No automatic creation when order is completed
- Can have empty sales while dashboard expects data

#### Tasks:
- [ ] **4.3.1** Implement automatic sale creation
  - Add sale creation when quote status changes to "completed"
  - Populate sale with quote data (amount, customer, items)
  - Add creation date and metadata
  - Test with order workflow

- [ ] **4.3.2** Add manual sale creation
  - Create UI for manual sale entry
  - Add validation
  - Link to customers
  - Test in sales/dashboard context

---

### 4.4 Scheduled Reports
**Priority:** Low (Optional for MVP)  
**Status:** ⚠️ UI Only  
**Estimated Effort:** High

#### Issues:
- Report model has scheduling fields (`isScheduled`, `scheduleFrequency`, `nextRunAt`)
- UI shows scheduling options
- No backend job/cron to execute scheduled reports
- No email delivery of scheduled reports

#### Tasks:
- [ ] **4.4.1** Option A: Implement scheduled reports
  - Set up cron job or worker process
  - Implement report generation on schedule
  - Email reports via mailer API
  - Update `lastRunAt` and `nextRunAt` fields
  - Add error handling and logging

- [ ] **4.4.2** Option B: Disable for MVP (RECOMMENDED)
  - Hide scheduling UI elements
  - Keep manual report generation
  - Add to post-MVP roadmap
  - Document as future enhancement

**Recommendation:** Disable for MVP unless critical business requirement.

---

### 4.5 Email Provider Decision
**Priority:** Medium  
**Status:** ⚠️ Inconsistent  
**Estimated Effort:** Low

#### Issues:
- `@sendgrid/mail` in package.json but unused
- Currently using Resend in `mailer.ts`
- Confusion about email strategy

#### Tasks:
- [ ] **4.5.1** Choose email provider
  - Decision: Resend (currently implemented) or SendGrid
  - Document reasoning
  - Update documentation to reflect choice

- [ ] **4.5.2** Clean up dependencies
  - Remove `@sendgrid/mail` if using Resend
  - Or implement SendGrid if that's the choice
  - Update package.json
  - Test email sending

- [ ] **4.5.3** Configure email templates
  - Design email templates for common scenarios
  - Welcome email
  - Password reset
  - Invoice sent
  - Quote sent
  - Payment received

---

### 4.6 Activity Tracking
**Priority:** Low  
**Status:** ⚠️ Partially Implemented  
**Estimated Effort:** Low

#### Issues:
- Activity model exists and displayed in dashboard
- Not consistently created across all order actions
- May have gaps in activity stream

#### Tasks:
- [ ] **4.6.1** Audit activity creation
  - Check all order status changes create activities
  - Verify customer actions create activities
  - Ensure quote/invoice actions tracked
  - Fill in gaps

- [ ] **4.6.2** Test activity stream
  - Perform full workflow
  - Verify all activities appear
  - Check activity formatting
  - Test pagination if implemented

---

### 4.7 Customer Notes Consolidation
**Priority:** Low  
**Status:** ⚠️ Duplicate Systems  
**Estimated Effort:** Low

#### Issues:
- `CustomerNote` model (separate collection)
- `Customer.followUpNotes` (embedded array)
- Two systems for same functionality

#### Tasks:
- [ ] **4.7.1** Consolidate note systems
  - Choose one approach (recommend embedded for simplicity)
  - Migrate data if needed
  - Update all code to use single system
  - Remove unused model/code

---

## 5. Testing & Quality Assurance

### 5.1 Security Testing
**Priority:** URGENT  
**Status:** ❌ Not Started  
**Estimated Effort:** High

#### Tasks:
- [ ] **5.1.1** Write authentication tests
  - Test all protected endpoints require auth
  - Test cross-tenant access prevention
  - Test role-based access control
  - Test session expiration
  - Test invalid tokens

- [ ] **5.1.2** Penetration testing
  - Test for SQL injection (MongoDB injection)
  - Test for XSS vulnerabilities
  - Test for CSRF (verify Next.js protection)
  - Test file upload exploits
  - Test API rate limiting

- [ ] **5.1.3** Security audit
  - Review all authentication code
  - Review all authorization checks
  - Review input validation
  - Review error messages (no sensitive data leaks)
  - Review logging (no password/token logging)

---

### 5.2 Integration Testing
**Priority:** High  
**Status:** ⚠️ Partial Coverage  
**Estimated Effort:** Medium

#### Current State:
- Designs, invoices, reports workflows tested
- Missing: quotes, customers, orders, auth, billing

#### Tasks:
- [ ] **5.2.1** Quote workflow tests
  - Create quote
  - Edit quote
  - Send quote
  - Convert to order
  - Complete order
  - Full lifecycle test

- [ ] **5.2.2** Customer workflow tests
  - Create customer
  - Update customer
  - Add notes
  - Create quote for customer
  - Create invoice for customer

- [ ] **5.2.3** Order workflow tests
  - Quote to order conversion
  - Status changes (drag-and-drop simulation)
  - Activity creation
  - Sale creation on completion

- [ ] **5.2.4** Authentication workflow tests
  - Registration
  - Login
  - Logout
  - Password reset
  - OAuth flows

- [ ] **5.2.5** Billing workflow tests
  - Subscription creation
  - Payment processing
  - Webhook handling
  - Subscription updates
  - Cancellation

---

### 5.3 Coverage Improvement
**Priority:** Medium  
**Status:** ⚠️ Below Target  
**Estimated Effort:** High

#### Current State:
- Target: 70% coverage (per jest.config.js)
- Large untested areas: register, subscribe, mailer, most APIs, most pages

#### Tasks:
- [ ] **5.3.1** API endpoint tests
  - `/api/auth/register` - Full registration flow
  - `/api/subscribe` - Subscription creation
  - `/api/mailer` - Email sending (mocked)
  - `/api/quotes/saveQuote` - Quote CRUD
  - `/api/customers/*` - Customer CRUD
  - `/api/users/*` - User management
  - `/api/dashboard` - Dashboard data

- [ ] **5.3.2** Page component tests
  - Dashboard rendering
  - Quote form
  - Customer management
  - Invoice pages
  - Company settings
  - User management

- [ ] **5.3.3** Run coverage report
  - Execute `npm run test:coverage`
  - Identify gaps
  - Prioritize critical paths
  - Reach 70% minimum threshold

---

### 5.4 End-to-End Testing
**Priority:** Medium  
**Status:** ⚠️ Basic Tests Exist  
**Estimated Effort:** Medium

#### Tasks:
- [ ] **5.4.1** User journey tests
  - New user registration through first quote
  - Customer creation through invoice and payment
  - Design upload through approval
  - Report creation and generation

- [ ] **5.4.2** Error scenario tests
  - Network failures
  - Database errors
  - Invalid inputs
  - Permission errors
  - Payment failures

---

### 5.5 Browser & Device Testing
**Priority:** Medium  
**Status:** ❌ Not Started  
**Estimated Effort:** Medium

#### Tasks:
- [ ] **5.5.1** Cross-browser testing
  - Chrome (latest)
  - Firefox (latest)
  - Safari (latest)
  - Edge (latest)

- [ ] **5.5.2** Responsive design testing
  - Desktop (1920x1080, 1366x768)
  - Tablet (iPad, Android tablets)
  - Mobile (iOS, Android)
  - Test all critical workflows on mobile

- [ ] **5.5.3** Accessibility testing
  - Keyboard navigation
  - Screen reader compatibility
  - Color contrast
  - ARIA labels
  - Form validation announcements

---

## 6. Deployment & Infrastructure

### 6.1 Environment Configuration
**Priority:** URGENT  
**Status:** ❌ Not Started  
**Estimated Effort:** Medium

#### Tasks:
- [ ] **6.1.1** Create environment variable documentation
  - Document all required env vars
  - Document optional env vars
  - Provide example values
  - Create `.env.example` file

- [ ] **6.1.2** Set up production environment variables
  - Database connection string
  - NextAuth configuration
  - Stripe keys (production)
  - Email provider keys
  - JWT secrets
  - Base URLs
  - File upload settings

- [ ] **6.1.3** Set up staging environment
  - Separate database
  - Stripe test mode
  - Email sandbox
  - Separate domain/subdomain

**Required Environment Variables:**
```bash
# Database
MONGODB_URI=mongodb+srv://...

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generate-strong-secret>

# OAuth Providers
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_CLIENT_ID=...
FACEBOOK_CLIENT_SECRET=...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com

# Application
NEXT_PUBLIC_WEBSITE_URL=https://yourdomain.com
JWT_SECRET=<generate-strong-secret>

# File Uploads
MAX_FILE_SIZE=52428800
UPLOAD_DIR=public/uploads

# Mailer (internal security)
MAILER_API_KEY=<generate-strong-secret>
```

---

### 6.2 Database Setup
**Priority:** URGENT  
**Status:** ⚠️ Development Only  
**Estimated Effort:** Medium

#### Tasks:
- [ ] **6.2.1** Set up production database
  - Create MongoDB Atlas cluster (or alternative)
  - Configure backup strategy
  - Set up monitoring
  - Configure connection string
  - Test connection

- [ ] **6.2.2** Database indexes
  - Review all models for index requirements
  - Add indexes for frequently queried fields
  - Add compound indexes where needed
  - Test query performance

- [ ] **6.2.3** Database migrations
  - Create any necessary data migrations
  - Test on staging database
  - Document migration process
  - Plan rollback strategy

- [ ] **6.2.4** Seed data (optional)
  - Create sample data script
  - Default price lists
  - Sample templates
  - Or allow empty start

---

### 6.3 Hosting & Deployment
**Priority:** URGENT  
**Status:** ❌ Not Started  
**Estimated Effort:** High

#### Tasks:
- [ ] **6.3.1** Choose hosting platform
  - Vercel (recommended for Next.js)
  - AWS (Elastic Beanstalk, ECS, or Amplify)
  - DigitalOcean App Platform
  - Railway
  - Render
  - Document choice and reasoning

- [ ] **6.3.2** Set up deployment pipeline
  - Connect GitHub repository
  - Configure build settings
  - Set environment variables
  - Set up preview deployments
  - Configure custom domain

- [ ] **6.3.3** Create deployment documentation
  - Step-by-step deployment guide
  - Environment setup instructions
  - Rollback procedures
  - Monitoring setup
  - Troubleshooting guide

- [ ] **6.3.4** Configure domain & SSL
  - Purchase/configure domain
  - Set up DNS records
  - Configure SSL certificate
  - Set up www redirect
  - Test HTTPS

---

### 6.4 Docker Configuration (Optional)
**Priority:** Low  
**Status:** ❌ Not Started  
**Estimated Effort:** Low

#### Tasks:
- [ ] **6.4.1** Create Dockerfile
  - Based on Node 22 Alpine
  - Multi-stage build
  - Optimize image size
  - Test build

- [ ] **6.4.2** Create docker-compose.yml
  - Application container
  - MongoDB container
  - Development environment
  - Production environment

- [ ] **6.4.3** Document Docker deployment
  - Build instructions
  - Run instructions
  - Environment variable setup
  - Volume management

---

### 6.5 CI/CD Pipeline
**Priority:** Medium  
**Status:** ❌ Not Started  
**Estimated Effort:** Medium

#### Tasks:
- [ ] **6.5.1** Set up GitHub Actions (or alternative)
  - Automated testing on PR
  - Linting checks
  - Type checking
  - Build verification
  - Coverage reporting

- [ ] **6.5.2** Deployment automation
  - Auto-deploy main branch to staging
  - Manual approval for production
  - Automated database migrations
  - Post-deployment smoke tests

- [ ] **6.5.3** Create CI/CD documentation
  - Workflow explanation
  - How to trigger deployments
  - How to roll back
  - Troubleshooting guide

---

### 6.6 Monitoring & Logging
**Priority:** Medium  
**Status:** ⚠️ Basic Winston Logger  
**Estimated Effort:** Medium

#### Current State:
- Winston logger configured in `src/utils/logger.ts`
- Basic file logging

#### Tasks:
- [ ] **6.6.1** Set up error tracking
  - Sentry (recommended)
  - Or Bugsnag, Rollbar, etc.
  - Configure error capturing
  - Set up alerts
  - Test error reporting

- [ ] **6.6.2** Set up application monitoring
  - Vercel Analytics (if using Vercel)
  - Or New Relic, DataDog, etc.
  - Monitor response times
  - Monitor error rates
  - Set up alerts

- [ ] **6.6.3** Set up logging aggregation
  - CloudWatch (AWS)
  - Or Logtail, Papertrail, etc.
  - Centralized log viewing
  - Log retention policy
  - Search and filtering

- [ ] **6.6.4** Database monitoring
  - MongoDB Atlas monitoring
  - Query performance
  - Connection pool monitoring
  - Disk usage alerts
  - Backup verification

---

### 6.7 Performance Optimization
**Priority:** Medium  
**Status:** ❌ Not Started  
**Estimated Effort:** Medium

#### Tasks:
- [ ] **6.7.1** Frontend optimization
  - Enable Next.js Image optimization
  - Implement lazy loading
  - Code splitting for large pages
  - Bundle size analysis
  - Remove unused dependencies

- [ ] **6.7.2** Backend optimization
  - Database query optimization
  - Add caching where appropriate
  - Optimize API response sizes
  - Reduce N+1 queries
  - Connection pooling

- [ ] **6.7.3** Performance testing
  - Lighthouse audit
  - Core Web Vitals
  - Load testing (basic)
  - Identify bottlenecks
  - Set performance budgets

---

### 6.8 Backup & Disaster Recovery
**Priority:** High  
**Status:** ❌ Not Started  
**Estimated Effort:** Low

#### Tasks:
- [ ] **6.8.1** Database backup strategy
  - Automated daily backups
  - Point-in-time recovery
  - Off-site backup storage
  - Test restore procedure
  - Document backup retention policy

- [ ] **6.8.2** File backup strategy
  - Back up uploaded files
  - Separate from database backups
  - Test file restore
  - Document retention policy

- [ ] **6.8.3** Disaster recovery plan
  - Document recovery procedures
  - Define RTO (Recovery Time Objective)
  - Define RPO (Recovery Point Objective)
  - Test recovery process
  - Assign responsibilities

---

## 7. Documentation & Support

### 7.1 User Documentation
**Priority:** High  
**Status:** ⚠️ Technical Docs Only  
**Estimated Effort:** Medium

#### Current State:
- Comprehensive technical documentation exists
- No user-facing documentation

#### Tasks:
- [ ] **7.1.1** Create user guide
  - Getting started guide
  - Feature walkthroughs
  - Common workflows
  - FAQ section
  - Screenshots/videos

- [ ] **7.1.2** Create help center
  - Searchable knowledge base
  - Categorized articles
  - Tutorial videos
  - Best practices

- [ ] **7.1.3** In-app help
  - Tooltips for complex features
  - Context-sensitive help
  - Onboarding tour for new users
  - Help links throughout app

---

### 7.2 API Documentation
**Priority:** Medium  
**Status:** ✅ Mostly Complete  
**Estimated Effort:** Low

#### Current State:
- Comprehensive API docs in APPLICATION_DOCUMENTATION.md
- Well-documented endpoints

#### Tasks:
- [ ] **7.2.1** Polish API documentation
  - Review for accuracy
  - Add example requests/responses
  - Document error codes
  - Add rate limiting info

- [ ] **7.2.2** Consider API documentation tool (optional)
  - Swagger/OpenAPI
  - Postman collection
  - Or keep markdown docs

---

### 7.3 Legal Documentation
**Priority:** URGENT  
**Status:** ❌ Needs Legal Review  
**Estimated Effort:** Medium (requires legal counsel)

#### Tasks:
- [ ] **7.3.1** Review/update Terms of Service
  - Have attorney review
  - Ensure compliance with regulations
  - Cover SaaS-specific terms
  - Dispute resolution
  - Liability limitations

- [ ] **7.3.2** Review/update Privacy Policy
  - GDPR compliance
  - CCPA compliance (if applicable)
  - Data collection practices
  - Data retention policies
  - Cookie policy
  - Third-party integrations (Stripe, email provider)

- [ ] **7.3.3** Create acceptable use policy
  - Prohibited uses
  - Account termination conditions
  - Content guidelines

- [ ] **7.3.4** Update contact page
  - Valid contact email
  - Support channels
  - Business address
  - Response time expectations

---

### 7.4 Developer Documentation
**Priority:** Low  
**Status:** ✅ Excellent  
**Estimated Effort:** Low

#### Current State:
- Excellent APPLICATION_DOCUMENTATION.md
- Good TESTING.md
- Clear code structure

#### Tasks:
- [ ] **7.4.1** Add setup documentation
  - Local development setup
  - Environment configuration
  - Database setup
  - Testing setup

- [ ] **7.4.2** Contributing guidelines (if open source)
  - Code standards
  - PR process
  - Testing requirements
  - Commit message format

---

## 8. Marketing & Go-to-Market

### 8.1 Landing Page Optimization
**Priority:** High  
**Status:** ⚠️ Basic Landing Page  
**Estimated Effort:** Medium

#### Tasks:
- [ ] **8.1.1** Enhance landing page content
  - Clear value proposition
  - Feature highlights with screenshots
  - Customer testimonials (if available)
  - Pricing comparison table
  - Call-to-action optimization
  - Trust indicators (security badges, etc.)

- [ ] **8.1.2** SEO optimization
  - Meta titles and descriptions
  - Open Graph tags
  - Schema markup
  - Sitemap.xml
  - Robots.txt
  - Page speed optimization

- [ ] **8.1.3** Conversion optimization
  - A/B testing key elements
  - Form optimization
  - Remove friction in signup
  - Add social proof
  - Clear pricing

---

### 8.2 Pricing Strategy
**Priority:** High  
**Status:** ⚠️ Needs Validation  
**Estimated Effort:** Low

#### Tasks:
- [ ] **8.2.1** Finalize pricing tiers
  - Research competitor pricing
  - Define feature limits per tier
  - Set pricing points
  - Create pricing page
  - Document tier differences

- [ ] **8.2.2** Implement tier enforcement
  - Limit features based on subscription
  - Show upgrade prompts
  - Track usage against limits
  - Grace period for overages

---

### 8.3 Marketing Materials
**Priority:** Medium  
**Status:** ❌ Not Started  
**Estimated Effort:** Medium

#### Tasks:
- [ ] **8.3.1** Create demo video
  - Product walkthrough
  - Key features demonstration
  - Real-world use cases
  - Professional production

- [ ] **8.3.2** Create marketing assets
  - Product screenshots
  - Feature graphics
  - Social media images
  - Email templates
  - Press kit

- [ ] **8.3.3** Case studies (if available)
  - Early customer success stories
  - Metrics and results
  - Testimonials
  - Use case examples

---

### 8.4 Launch Strategy
**Priority:** High  
**Status:** ❌ Not Started  
**Estimated Effort:** Low (planning)

#### Tasks:
- [ ] **8.4.1** Pre-launch checklist
  - Beta testing with select users
  - Collect feedback
  - Fix critical issues
  - Build email list
  - Create launch timeline

- [ ] **8.4.2** Launch plan
  - Soft launch vs hard launch
  - Press release
  - Social media announcement
  - Email campaign
  - Product Hunt submission (optional)
  - Industry forums/communities

- [ ] **8.4.3** Post-launch plan
  - Monitor for issues
  - Rapid response team
  - Collect user feedback
  - Iterate quickly
  - Weekly metrics review

---

### 8.5 Analytics & Tracking
**Priority:** High  
**Status:** ❌ Not Started  
**Estimated Effort:** Low

#### Tasks:
- [ ] **8.5.1** Set up analytics
  - Google Analytics 4
  - Or alternative (Plausible, Fathom)
  - Event tracking
  - Conversion funnels
  - Goal tracking

- [ ] **8.5.2** Define key metrics
  - Signups
  - Activations (created first quote)
  - Conversion to paid
  - Churn rate
  - Customer lifetime value
  - MRR (Monthly Recurring Revenue)

- [ ] **8.5.3** Create analytics dashboard
  - Real-time metrics
  - Weekly/monthly reports
  - Cohort analysis
  - Funnel visualization

---

### 8.6 Customer Acquisition
**Priority:** Medium  
**Status:** ❌ Not Started  
**Estimated Effort:** Ongoing

#### Tasks:
- [ ] **8.6.1** Content marketing
  - Blog posts about apparel industry
  - How-to guides
  - Best practices
  - SEO-optimized content

- [ ] **8.6.2** Paid advertising (budget permitting)
  - Google Ads
  - Facebook/Instagram Ads
  - LinkedIn Ads (B2B focus)
  - Retargeting campaigns

- [ ] **8.6.3** Partnerships
  - Apparel industry associations
  - Complementary software integrations
  - Affiliate program
  - Referral program

- [ ] **8.6.4** Direct outreach
  - Identify target customers
  - Email outreach
  - LinkedIn outreach
  - Trade shows/events
  - Industry publications

---

## 9. Post-MVP Enhancements

### 9.1 Feature Roadmap
**Priority:** Post-Launch  
**Status:** Future  

#### Planned Features:
- [ ] Scheduled report email delivery
- [ ] Advanced inventory management
- [ ] Multi-location support
- [ ] Team collaboration features
- [ ] Mobile app (React Native)
- [ ] API for integrations
- [ ] Zapier integration
- [ ] QuickBooks integration
- [ ] Advanced reporting dashboards
- [ ] Customer portal (quote approval, design feedback)
- [ ] Production workflow management
- [ ] Vendor management
- [ ] Purchase orders
- [ ] Shipping integration
- [ ] Multi-currency support
- [ ] Multi-language support

### 9.2 Technical Debt
**Priority:** Post-Launch  
**Status:** Future  

#### Items to Address:
- [ ] Refactor duplicate code
- [ ] Improve component reusability
- [ ] Optimize database queries
- [ ] Improve error handling consistency
- [ ] Add comprehensive logging
- [ ] Improve TypeScript type coverage
- [ ] Refactor large components
- [ ] Improve test coverage to 90%+

---

## Priority Matrix

### Must Have (Before Launch)
1. ✅ **Security vulnerabilities fixed** (Section 1.1)
2. ✅ **Stripe integration working** (Section 1.2)
3. ✅ **Environment variables configured** (Section 6.1)
4. ✅ **Production database set up** (Section 6.2)
5. ✅ **Hosting configured & deployed** (Section 6.3)
6. ✅ **Legal docs reviewed** (Section 7.3)
7. ✅ **Basic security testing** (Section 5.1)
8. ✅ **Receipt page implemented or hidden** (Section 4.1)
9. ✅ **Quote details bug fixed** (Section 4.2)
10. ✅ **Analytics set up** (Section 8.5)

### Should Have (High Priority)
1. OAuth flows completed (Section 2.1)
2. Subscription management UI (Section 3.1)
3. Sales integration (Section 4.3)
4. Email provider decision (Section 4.5)
5. Integration testing coverage (Section 5.2)
6. Landing page optimization (Section 8.1)
7. User documentation (Section 7.1)
8. Monitoring & logging (Section 6.6)
9. Backup strategy (Section 6.8)
10. Launch strategy (Section 8.4)

### Nice to Have (Medium Priority)
1. Scheduled reports (Section 4.4)
2. File upload security enhancements (Section 2.3)
3. CI/CD pipeline (Section 6.5)
4. Performance optimization (Section 6.7)
5. Browser/device testing (Section 5.5)
6. Marketing materials (Section 8.3)
7. API documentation polish (Section 7.2)

### Future (Post-MVP)
1. Docker configuration (Section 6.4)
2. Advanced features (Section 9.1)
3. Technical debt (Section 9.2)

---

## Success Criteria for MVP Launch

### Technical Readiness
- [ ] All "Must Have" tasks completed
- [ ] All critical security vulnerabilities addressed
- [ ] All core features functional and tested
- [ ] Application deployed and accessible
- [ ] No critical bugs in production
- [ ] Monitoring and logging in place
- [ ] Backup and recovery tested

### Business Readiness
- [ ] Pricing strategy finalized
- [ ] Payment processing working
- [ ] Legal documents in place
- [ ] Landing page live and optimized
- [ ] Analytics tracking configured
- [ ] Support channels defined
- [ ] User documentation available

### Quality Assurance
- [ ] 70%+ test coverage achieved
- [ ] Security testing completed
- [ ] Integration testing completed
- [ ] Cross-browser testing completed
- [ ] Load testing completed (basic)
- [ ] No critical accessibility issues

### Marketing Readiness
- [ ] Target audience defined
- [ ] Marketing channels identified
- [ ] Launch plan created
- [ ] Marketing materials prepared
- [ ] Social media presence established
- [ ] Email list built (if applicable)

---

## Timeline Estimate

### Phase 1: Critical Fixes (Week 1-2)
- Security vulnerabilities (Section 1.1)
- Stripe integration (Section 1.2)
- Receipt page decision (Section 4.1)
- Quote details bug (Section 4.2)

### Phase 2: Infrastructure (Week 2-3)
- Environment configuration (Section 6.1)
- Database setup (Section 6.2)
- Hosting setup (Section 6.3)
- Monitoring setup (Section 6.6)

### Phase 3: Testing & Quality (Week 3-4)
- Security testing (Section 5.1)
- Integration testing (Section 5.2)
- Coverage improvement (Section 5.3)
- Browser testing (Section 5.5)

### Phase 4: Polish & Documentation (Week 4-5)
- User documentation (Section 7.1)
- Legal review (Section 7.3)
- Landing page optimization (Section 8.1)
- Analytics setup (Section 8.5)

### Phase 5: Pre-Launch (Week 5-6)
- Beta testing
- Bug fixes
- Performance optimization (Section 6.7)
- Launch preparation (Section 8.4)

### Phase 6: Launch (Week 6)
- Soft launch
- Monitor and fix issues
- Marketing push
- Customer support

**Note:** Timeline is aggressive and assumes full-time dedicated work. Adjust based on available resources.

---

## Risk Assessment

### High Risk
1. **Security vulnerabilities** - Could lead to data breaches, legal issues, reputation damage
   - Mitigation: Prioritize Section 1.1, conduct thorough security audit
   
2. **Stripe integration broken** - No revenue, blocked launch
   - Mitigation: Prioritize Section 1.2, extensive testing with Stripe test mode

3. **Legal compliance** - Could face legal action, fines
   - Mitigation: Hire attorney for Section 7.3 review

### Medium Risk
1. **Performance issues at scale** - Poor user experience
   - Mitigation: Load testing, monitoring, scalable infrastructure
   
2. **Data loss** - Customer dissatisfaction, business disruption
   - Mitigation: Comprehensive backup strategy (Section 6.8)

3. **Low conversion rate** - Poor product-market fit
   - Mitigation: Beta testing, user feedback, iterate on value proposition

### Low Risk
1. **Browser compatibility** - Some users can't access
   - Mitigation: Cross-browser testing (Section 5.5)
   
2. **Email deliverability** - Important emails not received
   - Mitigation: Proper email provider configuration, SPF/DKIM/DMARC

---

## Resource Requirements

### Development Team
- **Backend Developer** - API security, Stripe integration, database
- **Frontend Developer** - UI polish, responsive design, UX
- **Full-Stack Developer** - Can handle both (if solo)
- **DevOps/Infrastructure** - Deployment, monitoring, CI/CD
- **QA/Testing** - Security testing, integration testing

### External Services
- **Hosting** - Vercel ($20-50/month) or AWS (variable)
- **Database** - MongoDB Atlas ($57+/month for production)
- **Email** - Resend ($20/month) or SendGrid (variable)
- **Monitoring** - Sentry ($26/month) or similar
- **Legal** - Attorney for document review ($500-2000 one-time)
- **Domain** - $10-20/year
- **SSL** - Free with hosting provider

### Estimated Budget
- **Monthly SaaS costs:** $100-200/month
- **One-time costs:** $500-2000 (legal, setup)
- **Development time:** 200-300 hours (if contracting)

---

## Next Steps

### Immediate Actions (This Week)
1. **Review this roadmap** - Validate priorities and timeline
2. **Assign ownership** - Who will handle each section
3. **Set up project tracking** - GitHub Projects, Jira, Trello, etc.
4. **Start Phase 1** - Begin critical security fixes
5. **Schedule legal consultation** - Get attorney lined up
6. **Choose hosting provider** - Start account setup

### Week 1 Priorities
1. Fix all authentication/authorization issues (Section 1.1)
2. Fix Stripe checkout integration (Section 1.2)
3. Set up staging environment (Section 6.1)
4. Begin security testing (Section 5.1)

### Communication Plan
- **Daily standups** - Progress updates, blockers
- **Weekly sprint planning** - Review roadmap, adjust priorities
- **Bi-weekly stakeholder updates** - Progress, risks, decisions needed
- **Launch readiness reviews** - Bi-weekly checklist review

---

## Conclusion

ApparelQuoter is a **well-architected application with strong core functionality** that is approximately **75% complete**. The primary blockers to MVP launch are:

1. **Security vulnerabilities** that must be addressed before any production use
2. **Broken Stripe integration** that prevents revenue generation
3. **Lack of deployment infrastructure** and production configuration

With focused effort on the "Must Have" tasks, **MVP launch is achievable within 4-6 weeks**. The application has excellent potential in the apparel management space with its comprehensive feature set.

**Success depends on:**
- Rigorous security hardening
- Complete billing system implementation
- Thorough testing before launch
- Professional deployment and monitoring
- Clear marketing and value proposition

The technical foundation is solid. With the fixes and improvements outlined in this roadmap, ApparelQuoter can become a competitive, revenue-generating SaaS product.

---

**Document Version:** 1.0  
**Created:** April 17, 2026  
**Next Review:** After Phase 1 completion
