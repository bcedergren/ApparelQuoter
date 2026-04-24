# ApparelQuoter

**Comprehensive Business Management Software for Apparel Companies**

[![Next.js](https://img.shields.io/badge/Next.js-14.2.32-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.3.0-green)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-Private-red)]()

---

## 🎯 Overview

ApparelQuoter is a modern SaaS platform designed specifically for apparel manufacturers, custom clothing businesses, and print-on-demand services. Manage quotes, orders, customers, invoices, designs, and reporting all in one comprehensive platform.

### Key Features

- **📋 Quote Management** - Create and manage customer quotes with detailed pricing
- **🛍️ Order Processing** - Drag-and-drop order board with status tracking
- **👥 Customer Relationship Management** - Complete CRM with communication history
- **🎨 Design Collaboration** - File uploads, version control, and approval workflows
- **💰 Invoicing System** - Professional invoice generation with PDF export
- **📊 Advanced Reporting** - Custom reports with data visualization
- **📦 Inventory Management** - Track products and pricing
- **👤 User Management** - Multi-user support with role-based access

---

## 🚀 Quick Start

### Prerequisites

- Node.js 22.x
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/bcedergren/ApparelQuoter.git
cd ApparelQuoter

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

Visit [http://localhost:3003](http://localhost:3003)

---

## 📚 Documentation

### MVP Roadmap Documentation
- **[MVP Roadmap](./MVP_ROADMAP.md)** - Complete roadmap with all tasks to MVP launch
- **[Executive Summary](./MVP_EXECUTIVE_SUMMARY.md)** - High-level overview for stakeholders
- **[Implementation Checklist](./IMMEDIATE_ACTION_CHECKLIST.md)** - Day-by-day implementation guide
- **[Quick Reference](./MVP_QUICK_REFERENCE.md)** - One-page overview for quick decisions

### Technical Documentation
- **[Application Documentation](./Documents/APPLICATION_DOCUMENTATION.md)** - Comprehensive technical guide
- **[Testing Documentation](./Documents/TESTING.md)** - Testing strategy and coverage
- **[Test Accounts](./Documents/TEST_ACCOUNTS.md)** - Development test account information

---

## 🎯 Current Status

**Project Status:** Pre-MVP (Approximately 75% Complete)

### ✅ What's Working
- Core quote and order management
- Customer relationship management
- Invoice generation with PDF export
- Design file management with version control
- Advanced reporting system
- User and company management
- Dashboard with analytics
- Inventory and pricing management

### ⚠️ Needs Attention Before MVP
1. **Security** - Add authentication to all API endpoints
2. **Billing** - Fix Stripe integration for subscription management
3. **Deployment** - Set up production hosting and infrastructure
4. **Testing** - Improve test coverage to 70%+ target
5. **Legal** - Attorney review of Terms of Service and Privacy Policy

**Estimated Time to MVP:** 4-6 weeks with focused effort

See [MVP_ROADMAP.md](./MVP_ROADMAP.md) for complete details.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14.2.32 (React 18.3.1)
- **Language:** TypeScript 5.9.2
- **Styling:** Bootstrap 5.3.2 + CSS Modules
- **Charts:** Chart.js 4.4.3
- **Forms:** React Hook Form 7.51.5

### Backend
- **Runtime:** Node.js 22.x
- **Framework:** Next.js API Routes
- **Database:** MongoDB 6.3.0 with Mongoose 8.5.2
- **Authentication:** NextAuth.js 4.24.6
- **Payments:** Stripe 18.5.0
- **Email:** Resend 3.5.0
- **PDF Generation:** jsPDF 2.5.1

### Development
- **Testing:** Jest 29.7.0 + Testing Library
- **Linting:** ESLint 8
- **Type Checking:** TypeScript strict mode

---

## 📦 Available Scripts

```bash
# Development
npm run dev              # Start development server on port 3003
npm run build            # Build for production
npm start                # Start production server

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
npm run test:ci          # Run tests for CI/CD

# Code Quality
npm run lint             # Run ESLint
npx tsc --noEmit        # Type check without emitting files

# Utilities
npm run create-test-accounts  # Create test user accounts
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/apparelquoter

# NextAuth
NEXTAUTH_URL=http://localhost:3003
NEXTAUTH_SECRET=<generate-secret>

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com

# Application
NEXT_PUBLIC_WEBSITE_URL=http://localhost:3003
JWT_SECRET=<generate-secret>

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_DIR=public/uploads
```

Generate secrets with: `openssl rand -base64 32`

---

## 🧪 Testing

The project uses Jest with React Testing Library for comprehensive testing.

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --testPathPattern="api"
npm test -- --testPathPattern="models"
npm test -- --testPathPattern="integration"

# Run with coverage
npm run test:coverage
```

**Coverage Target:** 70% (branches, functions, lines, statements)

See [TESTING.md](./Documents/TESTING.md) for detailed testing documentation.

---

## 🚀 Deployment

### Recommended: Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Alternative: Docker

```bash
# Build image
docker build -t apparelquoter .

# Run container
docker run -p 3000:3000 --env-file .env.local apparelquoter
```

See [MVP_ROADMAP.md](./MVP_ROADMAP.md) Section 6 for complete deployment guide.

---

## 📊 Project Structure

```
ApparelQuoter/
├── src/
│   ├── components/          # React components
│   │   ├── app/            # Application components
│   │   └── account/        # Authentication components
│   ├── pages/              # Next.js pages
│   │   ├── api/            # API routes
│   │   └── app/            # Application pages
│   ├── models/             # Mongoose models
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── styles/             # CSS modules
│   └── __tests__/          # Test files
├── public/                 # Static assets
├── Documents/              # Documentation
└── [config files]          # Configuration files
```

---

## 🎯 MVP Roadmap Highlights

### Phase 1: Critical Fixes (Week 1-2)
- ✅ Fix security vulnerabilities (add authentication to all endpoints)
- ✅ Fix Stripe integration
- ✅ Bug fixes (receipt page, quote details)

### Phase 2: Infrastructure (Week 2-3)
- ✅ Set up production environment
- ✅ Configure MongoDB Atlas
- ✅ Deploy to hosting provider
- ✅ Set up monitoring

### Phase 3: Testing & Quality (Week 3-4)
- ✅ Security testing
- ✅ Integration testing
- ✅ Reach 70% code coverage
- ✅ Browser/device testing

### Phase 4: Polish & Launch (Week 4-6)
- ✅ User documentation
- ✅ Legal review
- ✅ Marketing preparation
- ✅ Beta testing
- ✅ Public launch

**Full roadmap:** [MVP_ROADMAP.md](./MVP_ROADMAP.md)

---

## 🐛 Known Issues

See [MVP_ROADMAP.md](./MVP_ROADMAP.md) for complete list of issues and fixes.

### Critical (Must Fix Before Launch)
1. API endpoints lack authentication (security risk)
2. Stripe integration broken (payment processing doesn't work)
3. No production deployment configured

### High Priority
1. OAuth registration flow incomplete
2. Receipt page is placeholder (needs implementation or hiding)
3. Quote details company data parsing bug

See [IMMEDIATE_ACTION_CHECKLIST.md](./IMMEDIATE_ACTION_CHECKLIST.md) for step-by-step fixes.

---

## 🤝 Contributing

This is a private project. For the development team:

1. Create feature branch from `main`
2. Make changes with clear commit messages
3. Write/update tests
4. Submit pull request
5. Code review required before merge

### Coding Standards
- TypeScript strict mode
- ESLint rules must pass
- 70% minimum test coverage
- Conventional commit messages

---

## 📄 License

Private and Proprietary - All Rights Reserved

---

## 👥 Team

- **Developer:** bcedergren
- **Repository:** https://github.com/bcedergren/ApparelQuoter

---

## 📞 Support

For development questions or issues:
- Review documentation in `./Documents/`
- Check [MVP_ROADMAP.md](./MVP_ROADMAP.md) for task details
- Review [IMMEDIATE_ACTION_CHECKLIST.md](./IMMEDIATE_ACTION_CHECKLIST.md) for implementation guidance

---

## 🎯 Target Audience

### Primary Market
- Small to medium apparel manufacturers (10-100 employees)
- Custom clothing businesses
- Screen printing shops
- Embroidery services

### Secondary Market
- Fashion design companies
- Promotional products companies
- Print-on-demand services
- Textile suppliers

---

## 💼 Competitive Advantages

1. **Industry-Specific** - Built specifically for apparel companies, not generic CRM
2. **Comprehensive** - Quotes, orders, invoices, designs, reports in one platform
3. **Modern UX** - Clean, intuitive interface with drag-and-drop
4. **Design Collaboration** - Version control and approval workflows built-in
5. **Advanced Reporting** - Custom reports with data visualization
6. **Flexible Pricing** - Configure complex pricing models for apparel industry

---

## 📈 Roadmap

### MVP (Current Focus)
- Security hardening
- Stripe integration
- Production deployment
- Testing & quality assurance

### Version 1.1 (Post-MVP)
- Scheduled report email delivery
- Advanced inventory management
- Team collaboration enhancements
- Customer portal for quote approval

### Future Versions
- Mobile app (React Native)
- API for integrations
- QuickBooks integration
- Multi-location support
- Multi-currency support
- Shipping integration

See [MVP_ROADMAP.md](./MVP_ROADMAP.md) Section 9 for complete post-MVP roadmap.

---

## 🌟 Getting Started Guide

### For Developers
1. Read [APPLICATION_DOCUMENTATION.md](./Documents/APPLICATION_DOCUMENTATION.md)
2. Set up local environment (see Quick Start above)
3. Review [IMMEDIATE_ACTION_CHECKLIST.md](./IMMEDIATE_ACTION_CHECKLIST.md) for current priorities
4. Run tests to verify setup: `npm test`

### For Product Owners
1. Read [MVP_EXECUTIVE_SUMMARY.md](./MVP_EXECUTIVE_SUMMARY.md)
2. Review [MVP_QUICK_REFERENCE.md](./MVP_QUICK_REFERENCE.md) for decision points
3. Check [MVP_ROADMAP.md](./MVP_ROADMAP.md) for detailed timeline

### For Stakeholders
1. Start with [MVP_EXECUTIVE_SUMMARY.md](./MVP_EXECUTIVE_SUMMARY.md)
2. Review [MVP_QUICK_REFERENCE.md](./MVP_QUICK_REFERENCE.md) for status overview
3. Weekly status updates in Section 📞 of Quick Reference

---

**Ready to launch your MVP? Start with the [IMMEDIATE_ACTION_CHECKLIST.md](./IMMEDIATE_ACTION_CHECKLIST.md)!** 🚀
