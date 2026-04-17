# ApparelQuoter - Immediate Action Checklist

**Start Date:** April 17, 2026  
**Target:** Complete Phase 1 Critical Fixes  
**Timeline:** 1-2 weeks

---

## 🚨 CRITICAL - DO THESE FIRST

### Day 1: Security Foundation

#### Task 1.1: Create Authentication Middleware
**File:** `src/lib/auth.ts`

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import authOptions from '@/pages/api/auth/[...nextauth]';

export async function requireAuth(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || !session.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  
  return session;
}

export async function requireCompanyAccess(
  req: NextApiRequest, 
  res: NextApiResponse, 
  companyId: string
) {
  const session = await requireAuth(req, res);
  if (!session) return null;
  
  // Verify user belongs to this company
  if (session.user.companyId !== companyId) {
    res.status(403).json({ error: 'Forbidden - Access to this company denied' });
    return null;
  }
  
  return session;
}

export async function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAuth(req, res);
  if (!session) return null;
  
  if (session.user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden - Admin access required' });
    return null;
  }
  
  return session;
}
```

**Checklist:**
- [ ] Create `src/lib/auth.ts` file
- [ ] Copy authentication helper functions
- [ ] Test with one endpoint
- [ ] Verify session validation works

---

#### Task 1.2: Secure Dashboard API
**File:** `src/pages/api/dashboard.ts`

**Current (INSECURE):**
```typescript
// Lines 14-25 - NO AUTHENTICATION
if (req.method !== 'GET') {
  return res.status(405).end(`Method ${req.method} Not Allowed`)
}

try {
  await dbConnect()
  const { companyId } = req.query
  
  if (!companyId) {
    return res.status(400).json({ message: 'Company ID is required' })
  }
  // ... continues to return sensitive data
```

**Fixed (SECURE):**
```typescript
import { requireCompanyAccess } from '@/lib/auth';

// Add at the beginning of the handler
const session = await requireCompanyAccess(req, res, companyId as string);
if (!session) return; // requireCompanyAccess already sent error response

// Use session.user.companyId instead of trusting req.query
const companyId = session.user.companyId;
```

**Checklist:**
- [ ] Import auth helpers
- [ ] Add session check at start
- [ ] Use session.user.companyId
- [ ] Test with valid session
- [ ] Test without session (should return 401)
- [ ] Test with wrong company (should return 403)

---

#### Task 1.3: Secure All Customer APIs
**Files to update:**
- `src/pages/api/customers/[companyId].ts`
- `src/pages/api/customers/add.ts`
- `src/pages/api/customers/update/[id].ts`
- `src/pages/api/customers/delete/[id].ts`

**Pattern for GET endpoints:**
```typescript
import { requireCompanyAccess } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { companyId } = req.query;
  const session = await requireCompanyAccess(req, res, companyId as string);
  if (!session) return;
  
  // ... rest of code uses session.user.companyId
}
```

**Pattern for POST/PUT endpoints (with ownership verification):**
```typescript
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAuth(req, res);
  if (!session) return;
  
  // For updates/deletes, verify the resource belongs to user's company
  const customer = await Customer.findById(id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  
  if (customer.companyId.toString() !== session.user.companyId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  // ... continue with update/delete
}
```

**Checklist:**
- [ ] `customers/[companyId].ts` - Add auth
- [ ] `customers/add.ts` - Add auth, use session.user.companyId
- [ ] `customers/update/[id].ts` - Add auth + ownership check
- [ ] `customers/delete/[id].ts` - Add auth + ownership check
- [ ] Test all customer operations
- [ ] Test cross-tenant access blocked

---

#### Task 1.4: Secure All Quote APIs
**Files to update:**
- `src/pages/api/quotes/[companyId].ts`
- `src/pages/api/quotes/saveQuote.ts`
- `src/pages/api/quote/[quoteId].ts`
- `src/pages/api/order/[quoteId].ts`

**CRITICAL - saveQuote currently trusts client data:**
```typescript
// INSECURE - Line ~20
const { userId, companyId } = req.body.quoteData;
// This allows users to create quotes for OTHER companies!
```

**SECURE version:**
```typescript
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAuth(req, res);
  if (!session) return;
  
  // NEVER trust userId or companyId from req.body
  const quoteData = {
    ...req.body.quoteData,
    userId: session.user.id,        // Use session
    companyId: session.user.companyId  // Use session
  };
  
  // ... continue with save
}
```

**Checklist:**
- [ ] `quotes/[companyId].ts` - Add company access check
- [ ] `quotes/saveQuote.ts` - CRITICAL: Use session user/company, not req.body
- [ ] `quote/[quoteId].ts` - Add auth + verify quote ownership
- [ ] `order/[quoteId].ts` - Add auth + verify quote ownership
- [ ] Test quote CRUD operations
- [ ] Test cannot modify other company's quotes

---

#### Task 1.5: Secure User Management APIs
**Files to update:**
- `src/pages/api/users/add-user.ts`
- `src/pages/api/users/[id].ts`

**Critical - These currently have NO auth:**
```typescript
// users/add-user.ts - ANYONE can create users!
// users/[id].ts - ANYONE can update/delete ANY user!
```

**Secure version:**
```typescript
// users/add-user.ts
import { requireAdmin } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdmin(req, res);
  if (!session) return;
  
  // Verify companyId matches admin's company
  if (req.body.companyId !== session.user.companyId) {
    return res.status(403).json({ error: 'Cannot add users to other companies' });
  }
  
  // ... continue with user creation
}
```

```typescript
// users/[id].ts
import { requireAuth } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAuth(req, res);
  if (!session) return;
  
  const { id } = req.query;
  const user = await User.findById(id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Can only modify users in your own company (or yourself)
  const isOwnProfile = user._id.toString() === session.user.id;
  const isSameCompany = user.companyId.toString() === session.user.companyId;
  const isAdmin = session.user.role === 'admin';
  
  if (!isOwnProfile && !(isSameCompany && isAdmin)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  // ... continue with update/delete
}
```

**Checklist:**
- [ ] `users/add-user.ts` - Require admin role
- [ ] `users/add-user.ts` - Verify company ownership
- [ ] `users/[id].ts` - Add ownership/admin checks
- [ ] Test admin can add users to their company
- [ ] Test cannot add users to other companies
- [ ] Test users can update own profile
- [ ] Test cannot update other users

---

#### Task 1.6: Secure Remaining Critical APIs

**Other APIs needing auth:**
- [ ] `src/pages/api/company/update.ts` - Verify ownership
- [ ] `src/pages/api/company/[CompanyId].ts` - Verify access
- [ ] `src/pages/api/prices/[companyId].ts` - Verify company access
- [ ] `src/pages/api/prices/create.ts` - Require auth + company
- [ ] `src/pages/api/prices/update*.ts` - Verify ownership
- [ ] `src/pages/api/status/update.ts` - Verify resource ownership
- [ ] `src/pages/api/sales/create.ts` - Require auth
- [ ] `src/pages/api/activities/create.ts` - Require auth

**Apply same pattern:**
1. Import auth helpers
2. Require session
3. Verify ownership of resources
4. Use session data, not request body

---

#### Task 1.7: Secure Email API
**File:** `src/pages/api/mailer.ts`

**Current:** Publicly accessible - anyone can send emails from your domain!

**Option 1: Internal API Key (Recommended)**
```typescript
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Require internal API key
  const apiKey = req.headers['x-internal-api-key'];
  if (apiKey !== process.env.MAILER_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // ... continue with email sending
}
```

**Update all server-side callers:**
```typescript
// When calling from other API routes:
await fetch('/api/mailer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-internal-api-key': process.env.MAILER_API_KEY!
  },
  body: JSON.stringify({ to, subject, html })
});
```

**Option 2: Remove public endpoint, create server-side utility**
- Move mailer logic to `src/lib/mailer.ts`
- Call directly from API routes
- No public HTTP endpoint

**Checklist:**
- [ ] Choose Option 1 or Option 2
- [ ] Implement security
- [ ] Add MAILER_API_KEY to environment
- [ ] Update all callers
- [ ] Test email still works
- [ ] Test unauthorized access blocked

---

#### Task 1.8: Secure/Remove Admin Migration
**File:** `src/pages/api/admin/customerNotes.ts`

**Current:** No admin check, modifies ALL customers

**Options:**
1. Add admin-only auth + one-time flag
2. Remove if migration already run
3. Move to a script, not API endpoint

**If keeping (not recommended for MVP):**
```typescript
import { requireAdmin } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdmin(req, res);
  if (!session) return;
  
  // Check if already run
  const migrationFlag = await SomeModel.findOne({ migration: 'customerNotes' });
  if (migrationFlag) {
    return res.status(400).json({ error: 'Migration already executed' });
  }
  
  // ... run migration
  
  // Set flag
  await SomeModel.create({ migration: 'customerNotes', date: new Date() });
}
```

**Checklist:**
- [ ] Decide: Keep, secure, or delete
- [ ] If keeping: Add admin check
- [ ] If keeping: Add one-time flag
- [ ] If deleting: Remove file
- [ ] Test or verify deleted

---

### Day 2-3: Stripe Integration Fix

#### Task 2.1: Fix Stripe Checkout Endpoint
**Action:** Delete broken file, create correct one

```bash
# Delete broken file
rm src/pages/api/stripe/checkout.ts

# Create new file with correct name
touch src/pages/api/stripe/checkout-session.ts
```

**File:** `src/pages/api/stripe/checkout-session.ts`

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import authOptions from '@/pages/api/auth/[...nextauth]';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Require authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { productId, priceId } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' });
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/app/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/subscribe`,
      customer_email: session.user.email,
      metadata: {
        userId: session.user.id,
        companyId: session.user.companyId,
      },
    });

    // Return standardized response
    return res.status(200).json({
      success: true,
      session: {
        id: checkoutSession.id,
        url: checkoutSession.url,
      },
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create checkout session',
    });
  }
}
```

**Checklist:**
- [ ] Delete old `checkout.ts`
- [ ] Create new `checkout-session.ts`
- [ ] Copy code above
- [ ] Verify STRIPE_SECRET_KEY in env
- [ ] Verify NEXT_PUBLIC_WEBSITE_URL in env
- [ ] Test with Stripe test mode

---

#### Task 2.2: Create Stripe Webhook Handler
**File:** `src/pages/api/stripe/webhooks.ts`

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import dbConnect from '@/utils/dbConnect';
import User from '@/models/User';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// Disable body parsing, need raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature']!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  await dbConnect();

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Update user with subscription info
        const userId = session.metadata?.userId;
        if (userId) {
          await User.findByIdAndUpdate(userId, {
            stripeCustomerId: session.customer as string,
            subscriptionId: session.subscription as string,
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Update user subscription status
        await User.findOneAndUpdate(
          { subscriptionId: subscription.id },
          {
            subscriptionStatus: subscription.status,
          }
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Handle cancellation
        await User.findOneAndUpdate(
          { subscriptionId: subscription.id },
          {
            subscriptionStatus: 'canceled',
            subscriptionId: null,
          }
        );
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        // Notify user of payment failure
        await User.findOneAndUpdate(
          { stripeCustomerId: invoice.customer as string },
          {
            paymentStatus: 'failed',
          }
        );
        // TODO: Send email notification
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}
```

**Checklist:**
- [ ] Create `webhooks.ts`
- [ ] Add to User model: `subscriptionStatus`, `paymentStatus` fields
- [ ] Get webhook secret from Stripe dashboard
- [ ] Add STRIPE_WEBHOOK_SECRET to env
- [ ] Test with Stripe CLI: `stripe listen --forward-to localhost:3003/api/stripe/webhooks`
- [ ] Trigger test events
- [ ] Verify database updates

---

#### Task 2.3: Update Frontend Payment Pages
**Files:**
- `src/pages/subscribe.tsx`
- `src/pages/payment.tsx`

**Standardize response handling:**
```typescript
// Both pages should handle the same response format:
const res = await fetch('/api/stripe/checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ priceId: 'price_xxxxx' }),
});

const data = await res.json();

if (data.success && data.session?.url) {
  window.location.href = data.session.url;
} else {
  // Handle error
  console.error('Checkout failed:', data.error);
}
```

**Checklist:**
- [ ] Update `subscribe.tsx` response handling
- [ ] Update `payment.tsx` response handling
- [ ] Test subscription flow end-to-end
- [ ] Test with Stripe test cards
- [ ] Verify redirect to Stripe Checkout
- [ ] Verify success redirect back
- [ ] Verify database updated after checkout

---

#### Task 2.4: Configure Stripe Environment
**Add to `.env.local` (development):**
```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_WEBSITE_URL=http://localhost:3003
```

**Add to production environment:**
```bash
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_WEBSITE_URL=https://yourdomain.com
```

**Stripe Dashboard Setup:**
1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhooks`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy webhook signing secret
5. Add to environment variables

**Checklist:**
- [ ] Add test mode keys to development
- [ ] Test locally with Stripe CLI
- [ ] Add production keys to hosting platform
- [ ] Configure webhook in Stripe dashboard
- [ ] Add webhook secret to production env
- [ ] Test in production

---

### Day 4-5: Bug Fixes & Cleanup

#### Task 3.1: Fix Receipt Page
**File:** `src/pages/app/receipt.tsx`

**Option A: Implement properly**
```typescript
import { useRouter } from 'next/router';
import { useEffect, useState } from 'next';

const Receipt: NextPage = () => {
  const router = useRouter();
  const { invoiceId } = router.query;
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    if (invoiceId) {
      fetch(`/api/invoices/${invoiceId}`)
        .then(res => res.json())
        .then(data => setReceipt(data));
    }
  }, [invoiceId]);

  // Display real invoice data...
}
```

**Option B: Hide from navigation (FASTER)**
- Remove from sidebar navigation
- Add redirect to 404 or dashboard
- Add to post-MVP roadmap

**Checklist:**
- [ ] Choose Option A or B
- [ ] Implement chosen option
- [ ] Test navigation
- [ ] Update user documentation

---

#### Task 3.2: Fix Quote Details Company Bug
**File:** `src/pages/app/quote-details/[quoteId].tsx`

**Find the company fetch (likely around line 50-100):**
```typescript
// INCORRECT
const response = await fetch(`/api/company/${companyId}`);
const data = await response.json();
setCompany(data); // BUG: data is { success, company }, not company

// CORRECT
const response = await fetch(`/api/company/${companyId}`);
const data = await response.json();
if (data.success && data.company) {
  setCompany(data.company);
}
```

**Checklist:**
- [ ] Find company fetch in quote-details
- [ ] Update to handle response structure
- [ ] Test quote details page loads
- [ ] Verify company info displays
- [ ] Check for similar bugs in other pages

---

#### Task 3.3: Choose Email Provider
**Decision time:**

**Option 1: Keep Resend (Current)**
- Already implemented in `mailer.ts`
- Working code
- Action: Remove `@sendgrid/mail` from package.json

**Option 2: Switch to SendGrid**
- Already in package.json
- Action: Rewrite `mailer.ts` to use SendGrid
- Action: Update all email calls

**Recommendation:** Keep Resend (less work)

**If keeping Resend:**
```bash
npm uninstall @sendgrid/mail
```

**Checklist:**
- [ ] Decide: Resend or SendGrid
- [ ] If Resend: Remove SendGrid dependency
- [ ] If SendGrid: Rewrite mailer.ts
- [ ] Verify RESEND_API_KEY or SENDGRID_API_KEY in env
- [ ] Test email sending
- [ ] Update documentation

---

#### Task 3.4: Update User Model for Stripe
**File:** `src/models/User.ts`

**Add missing fields:**
```typescript
subscriptionStatus: {
  type: String,
  enum: ['active', 'canceled', 'past_due', 'unpaid', 'incomplete'],
  required: false,
},
paymentStatus: {
  type: String,
  enum: ['succeeded', 'failed', 'pending'],
  required: false,
},
```

**Checklist:**
- [ ] Add subscriptionStatus field
- [ ] Add paymentStatus field
- [ ] Run database migration if needed
- [ ] Test webhook updates these fields

---

### Day 6-7: Testing

#### Task 4.1: Create Test Environment
```bash
# Install testing dependencies (should already be installed)
npm install

# Create test database
# Use MongoDB Memory Server or separate test database
```

**Checklist:**
- [ ] Set up test database
- [ ] Configure test environment variables
- [ ] Run existing tests: `npm test`
- [ ] Fix any failing tests

---

#### Task 4.2: Write Security Tests
**Create:** `src/__tests__/security/auth.test.ts`

```typescript
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/dashboard';

describe('API Authentication', () => {
  it('should reject unauthenticated requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { companyId: '123' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
  });

  it('should reject requests to wrong company', async () => {
    // Mock session with companyId: 'company1'
    // Request data for companyId: 'company2'
    // Should return 403
  });
});
```

**Test each critical endpoint:**
- [ ] Dashboard API
- [ ] Customers API
- [ ] Quotes API
- [ ] Users API
- [ ] Invoice API

---

#### Task 4.3: Manual Testing Checklist

**Authentication Flow:**
- [ ] Register new account
- [ ] Login with email/password
- [ ] Logout
- [ ] Forgot password flow
- [ ] Reset password with token
- [ ] Login with Google (if enabled)
- [ ] Login with Facebook (if enabled)

**Quote Workflow:**
- [ ] Create new customer
- [ ] Create new quote for customer
- [ ] Edit quote
- [ ] Convert quote to order
- [ ] Update order status
- [ ] Complete order
- [ ] Verify sale created

**Invoice Workflow:**
- [ ] Create invoice from quote
- [ ] Create manual invoice
- [ ] Add payment to invoice
- [ ] Generate PDF
- [ ] Send invoice email

**Design Workflow:**
- [ ] Upload design file
- [ ] Add design version
- [ ] Add comment
- [ ] Update design status

**Billing Workflow:**
- [ ] Subscribe to plan (test mode)
- [ ] Verify webhook updates user
- [ ] Check subscription status
- [ ] Test with declined card
- [ ] Test cancellation

**Security Testing:**
- [ ] Try accessing another company's data (should fail)
- [ ] Try updating another user (should fail)
- [ ] Try deleting another company's customer (should fail)
- [ ] Access API without login (should fail)

---

## Environment Variables Checklist

Create `.env.local` file with all required variables:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/apparelquoter-dev

# NextAuth
NEXTAUTH_URL=http://localhost:3003
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>

# OAuth (optional for MVP)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (choose one)
RESEND_API_KEY=re_...
# OR
# SENDGRID_API_KEY=SG...

EMAIL_FROM=noreply@yourdomain.com

# Application
NEXT_PUBLIC_WEBSITE_URL=http://localhost:3003
JWT_SECRET=<generate-with: openssl rand -base64 32>

# Mailer Security
MAILER_API_KEY=<generate-with: openssl rand -base64 32>

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_DIR=public/uploads
```

**Checklist:**
- [ ] Create `.env.local`
- [ ] Generate secrets with openssl
- [ ] Add Stripe test keys
- [ ] Add email provider key
- [ ] Test application starts
- [ ] Verify all features work locally

---

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start

# Stripe CLI for webhook testing
stripe listen --forward-to localhost:3003/api/stripe/webhooks
stripe trigger checkout.session.completed
```

---

## Daily Progress Tracking

### Day 1: [ ] Security Foundation
- [ ] Task 1.1: Create auth middleware
- [ ] Task 1.2: Secure dashboard API
- [ ] Task 1.3: Secure customer APIs
- [ ] Task 1.4: Secure quote APIs

### Day 2: [ ] Security Completion
- [ ] Task 1.5: Secure user APIs
- [ ] Task 1.6: Secure remaining APIs
- [ ] Task 1.7: Secure email API
- [ ] Task 1.8: Secure/remove admin endpoints

### Day 3: [ ] Stripe Integration
- [ ] Task 2.1: Fix checkout endpoint
- [ ] Task 2.2: Create webhook handler
- [ ] Task 2.3: Update frontend pages
- [ ] Task 2.4: Configure Stripe environment

### Day 4: [ ] Bug Fixes
- [ ] Task 3.1: Fix receipt page
- [ ] Task 3.2: Fix quote details bug
- [ ] Task 3.3: Choose email provider
- [ ] Task 3.4: Update User model

### Day 5-6: [ ] Testing
- [ ] Task 4.1: Set up test environment
- [ ] Task 4.2: Write security tests
- [ ] Task 4.3: Manual testing

### Day 7: [ ] Review & Polish
- [ ] Review all changes
- [ ] Fix any bugs found
- [ ] Update documentation
- [ ] Prepare for Phase 2

---

## Success Criteria for Phase 1

### Must Complete:
- [ ] All API endpoints require authentication
- [ ] Cross-tenant access is prevented
- [ ] Stripe checkout works end-to-end
- [ ] Stripe webhooks update database
- [ ] No critical bugs in core workflows
- [ ] Environment variables documented
- [ ] Tests pass

### Quality Checks:
- [ ] No console errors in browser
- [ ] No 401/403 errors when properly authenticated
- [ ] All forms submit successfully
- [ ] Navigation works smoothly
- [ ] No broken links or images

---

## When You're Stuck

### Authentication Issues
1. Check session is being created: Add console.log in auth helpers
2. Verify NEXTAUTH_SECRET is set
3. Check browser cookies for next-auth.session-token
4. Test with Postman/Insomnia

### Stripe Issues
1. Use Stripe test mode and test cards
2. Check Stripe Dashboard > Logs for errors
3. Use Stripe CLI to test webhooks locally
4. Verify all env variables are set

### Database Issues
1. Check MongoDB is running
2. Verify connection string
3. Check network access in MongoDB Atlas
4. Look at server logs for connection errors

---

## Getting Help

### Documentation
- Next.js: https://nextjs.org/docs
- NextAuth: https://next-auth.js.org/getting-started/introduction
- Stripe: https://stripe.com/docs/api
- MongoDB: https://www.mongodb.com/docs/

### Code Review Checklist
Before asking for help, verify:
1. Environment variables are set correctly
2. Dependencies are installed (`npm install`)
3. Database is running and accessible
4. No TypeScript errors (`npx tsc --noEmit`)
5. Console shows specific error messages

---

**Ready to start? Begin with Day 1, Task 1.1!** 🚀

**Remember:** Security first. Don't skip the authentication tasks.
