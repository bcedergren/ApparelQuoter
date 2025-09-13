# ApparelQuoter - Comprehensive Application Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [API Documentation](#api-documentation)
6. [Frontend Components](#frontend-components)
7. [Authentication & Authorization](#authentication--authorization)
8. [Business Logic](#business-logic)
9. [File Structure](#file-structure)
10. [Deployment](#deployment)
11. [Testing](#testing)
12. [Development Guide](#development-guide)
13. [Troubleshooting](#troubleshooting)

## Overview

ApparelQuoter is a comprehensive business management application designed specifically for apparel companies. It provides tools for quote management, order processing, customer relationship management, design collaboration, invoicing, and advanced reporting.

### Key Features
- **Quote Management**: Create, edit, and manage customer quotes
- **Order Processing**: Convert quotes to orders with tracking
- **Customer Management**: Complete CRM with communication history
- **Design Collaboration**: File uploads, version control, and approval workflows
- **Invoicing System**: Professional invoice generation and payment tracking
- **Advanced Reporting**: Custom reports with data visualization
- **Inventory Management**: Track products and pricing
- **User Management**: Multi-user support with role-based access

### Target Users
- Apparel manufacturers
- Custom clothing businesses
- Print-on-demand services
- Fashion design companies
- Textile suppliers

## Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ • React Pages   │    │ • REST APIs     │    │ • Collections   │
│ • Components    │    │ • Authentication│    │ • Indexes       │
│ • State Mgmt    │    │ • File Uploads  │    │ • Relationships │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Application Flow
1. **User Authentication** → NextAuth.js with multiple providers
2. **Data Access** → MongoDB with Mongoose ODM
3. **API Layer** → Next.js API routes with validation
4. **Frontend** → React components with Bootstrap UI
5. **File Storage** → Local file system with organized structure
6. **PDF Generation** → jsPDF for document creation

## Technology Stack

### Frontend
- **Framework**: Next.js 14.2.32
- **UI Library**: React 18.3.1
- **Styling**: CSS Modules + Bootstrap 5.3.2
- **State Management**: React Hooks (useState, useEffect)
- **Form Handling**: React Hook Form 7.51.5
- **Charts**: Chart.js 4.4.3 with React Chart.js 2
- **Icons**: React Icons 5.2.1 + Material Design Icons
- **Date Handling**: React DatePicker 6.9.0
- **Drag & Drop**: React Beautiful DnD 13.1.1

### Backend
- **Runtime**: Node.js 22.x
- **Framework**: Next.js API Routes
- **Database**: MongoDB 6.3.0
- **ODM**: Mongoose 8.5.2
- **Authentication**: NextAuth.js 4.24.6
- **File Uploads**: Formidable 3.5.1
- **PDF Generation**: jsPDF 2.5.1 + jspdf-autotable 3.8.2
- **Email**: SendGrid 8.1.3 + Nodemailer 6.9.13
- **Payments**: Stripe 18.5.0

### Development Tools
- **Language**: TypeScript 5.9.2
- **Linting**: ESLint 8
- **Testing**: Jest 29.7.0 + Testing Library
- **Build Tool**: Next.js built-in
- **Version Control**: Git

## Database Schema

### Core Collections

#### Users
```typescript
interface User {
  _id: ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  companyId: ObjectId;
  role: 'admin' | 'user';
  stripeCustomerId: string;
  subscriptionId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Companies
```typescript
interface Company {
  _id: ObjectId;
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  fax?: string;
  email: string;
  url?: string;
  paymentMethods: string[];
  salesTax: string;
  creditCardCharge: string;
  offerings: string[];
  quoteIdFormat: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Customers
```typescript
interface Customer {
  _id: ObjectId;
  companyId: ObjectId;
  companyName: string;
  contactName: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  followUpNotes: FollowUpNote[];
  createdBy: string;
  createdDate: Date;
}

interface FollowUpNote {
  date: Date;
  note: string;
  addedBy: string;
  addedDate: Date;
}
```

#### Quotes
```typescript
interface Quote {
  _id: ObjectId;
  companyId: ObjectId;
  customerId: ObjectId;
  quoteNumber: string;
  quoteType: 'apparel' | 'printing' | 'embroidery' | 'combination';
  items: QuoteItem[];
  embroidery: EmbroideryDetails;
  printing: PrintingDetails;
  pricing: PricingDetails;
  totalAmount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  notes: string;
  validUntil: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface QuoteItem {
  product: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  sizes: SizeBreakdown;
}

interface SizeBreakdown {
  XS: number;
  S: number;
  M: number;
  L: number;
  XL: number;
  '2XL': number;
  '3XL': number;
  '4XL': number;
  '5XL': number;
}
```

#### Invoices
```typescript
interface Invoice {
  _id: ObjectId;
  companyId: ObjectId;
  customerId: ObjectId;
  quoteId?: ObjectId;
  invoiceNumber: string;
  items: InvoiceItem[];
  totalAmount: number;
  balanceDue: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  invoiceDate: Date;
  dueDate: Date;
  paymentTerms: string;
  notes?: string;
  payments: PaymentRecord[];
  createdAt: Date;
  updatedAt: Date;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PaymentRecord {
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  reference?: string;
  notes?: string;
}
```

#### Designs
```typescript
interface Design {
  _id: ObjectId;
  companyId: ObjectId;
  customerId: ObjectId;
  quoteId?: ObjectId;
  designName: string;
  description?: string;
  status: 'draft' | 'in_progress' | 'review' | 'approved' | 'rejected' | 'completed';
  currentVersion: number;
  versions: DesignVersion[];
  comments: DesignComment[];
  assignedTo?: ObjectId;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
}

interface DesignVersion {
  versionNumber: number;
  fileUrl: string;
  description?: string;
  uploadedBy: string;
  createdAt: Date;
}

interface DesignComment {
  text: string;
  author: string;
  x?: number;
  y?: number;
  createdAt: Date;
}
```

#### Reports
```typescript
interface Report {
  _id: ObjectId;
  companyId: ObjectId;
  reportName: string;
  reportType: 'sales' | 'quotes' | 'customers' | 'inventory' | 'revenue';
  description?: string;
  filters: ReportFilter;
  columns: string[];
  groupBy?: string;
  sortBy: { field: string; order: 'asc' | 'desc' };
  schedule?: ReportSchedule;
  lastGenerated?: Date;
  generatedBy?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface ReportFilter {
  dateRange?: { start: string; end: string };
  status?: string;
  customerId?: string;
  [key: string]: any;
}

interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  dayOfWeek?: number;
  time?: string;
  enabled: boolean;
}
```

### Database Relationships
- **Users** → **Companies** (Many-to-One)
- **Companies** → **Customers** (One-to-Many)
- **Companies** → **Quotes** (One-to-Many)
- **Companies** → **Invoices** (One-to-Many)
- **Companies** → **Designs** (One-to-Many)
- **Companies** → **Reports** (One-to-Many)
- **Customers** → **Quotes** (One-to-Many)
- **Customers** → **Invoices** (One-to-Many)
- **Customers** → **Designs** (One-to-Many)
- **Quotes** → **Invoices** (One-to-One, optional)
- **Quotes** → **Designs** (One-to-Many, optional)

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.
```typescript
Request Body: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  planId: string;
}

Response: {
  user: User;
  company: Company;
  subscription: StripeSubscription;
}
```

#### POST /api/auth/login
Authenticate user login.
```typescript
Request Body: {
  email: string;
  password: string;
}

Response: {
  user: User;
  token: string;
}
```

### Quote Management

#### GET /api/quotes/[companyId]
Get all quotes for a company.
```typescript
Query Parameters: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

Response: {
  quotes: Quote[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };
}
```

#### POST /api/quotes/saveQuote
Create or update a quote.
```typescript
Request Body: {
  quoteData: Quote;
  customerNote?: string;
}

Response: {
  quote: Quote;
  customerNote?: CustomerNote;
}
```

#### PUT /api/order/[quoteId]
Convert a quote to an order.
```typescript
Request Body: {
  orderData: Partial<Quote>;
}

Response: {
  order: Quote;
}
```

### Invoice Management

#### GET /api/invoices
Get all invoices with filtering and pagination.
```typescript
Query Parameters: {
  page?: number;
  limit?: number;
  status?: string;
  customerId?: string;
  search?: string;
}

Response: {
  invoices: Invoice[];
  pagination: PaginationInfo;
}
```

#### POST /api/invoices
Create a new invoice.
```typescript
Request Body: {
  customerId: string;
  items: InvoiceItem[];
  totalAmount: number;
  invoiceDate: string;
  dueDate: string;
  paymentTerms?: string;
  notes?: string;
}

Response: {
  invoice: Invoice;
}
```

#### GET /api/invoices/[invoiceId]
Get a specific invoice with populated data.
```typescript
Response: {
  invoice: Invoice;
  customer: Customer;
  company: Company;
}
```

#### PUT /api/invoices/[invoiceId]
Update an invoice.
```typescript
Request Body: {
  status?: string;
  notes?: string;
  // ... other updatable fields
}

Response: {
  invoice: Invoice;
}
```

#### POST /api/invoices/[invoiceId]/payments
Add a payment to an invoice.
```typescript
Request Body: {
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference?: string;
  notes?: string;
}

Response: {
  payment: PaymentRecord;
  invoice: Invoice;
}
```

### Design Management

#### GET /api/designs
Get all designs with filtering.
```typescript
Query Parameters: {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  customerId?: string;
  search?: string;
}

Response: {
  designs: Design[];
  pagination: PaginationInfo;
}
```

#### POST /api/designs
Create a new design.
```typescript
Request Body: {
  designName: string;
  description?: string;
  customerId: string;
  quoteId?: string;
  priority?: string;
  assignedTo?: string;
}

Response: {
  design: Design;
}
```

#### POST /api/designs/upload
Upload a design file.
```typescript
Request: FormData with file
Response: {
  file: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: Date;
  };
}
```

#### POST /api/designs/[designId]/versions
Add a new version to a design.
```typescript
Request Body: {
  fileUrl: string;
  description?: string;
  uploadedBy: string;
}

Response: {
  version: DesignVersion;
  design: Design;
}
```

#### POST /api/designs/[designId]/comments
Add a comment to a design.
```typescript
Request Body: {
  text: string;
  author: string;
  x?: number;
  y?: number;
}

Response: {
  comment: DesignComment;
  design: Design;
}
```

### Report Management

#### GET /api/reports
Get all reports with filtering.
```typescript
Query Parameters: {
  page?: number;
  limit?: number;
  reportType?: string;
  search?: string;
}

Response: {
  reports: Report[];
  pagination: PaginationInfo;
}
```

#### POST /api/reports
Create a new report.
```typescript
Request Body: {
  reportName: string;
  reportType: string;
  description?: string;
  filters: ReportFilter;
  columns: string[];
  groupBy?: string;
  sortBy: { field: string; order: string };
  schedule?: ReportSchedule;
}

Response: {
  report: Report;
}
```

#### GET /api/reports/[reportId]/data
Generate report data.
```typescript
Response: {
  data: any[];
  metadata: {
    totalRecords: number;
    generatedAt: Date;
    filters: ReportFilter;
  };
}
```

### Customer Management

#### GET /api/customers
Get all customers for a company.
```typescript
Query Parameters: {
  page?: number;
  limit?: number;
  search?: string;
}

Response: {
  customers: Customer[];
  pagination: PaginationInfo;
}
```

#### POST /api/customers
Create a new customer.
```typescript
Request Body: {
  companyName: string;
  contactName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
}

Response: {
  customer: Customer;
}
```

### Dashboard Data

#### GET /api/dashboard
Get dashboard statistics and data.
```typescript
Response: {
  customers: number;
  sales: number;
  income: number;
  activity: Activity[];
  orders: Order[];
  transactions: Transaction[];
  balance: number;
  revenue: RevenueData;
  salesByCategory: CategoryData[];
}
```

## Frontend Components

### Page Components

#### Public Pages
- **`/`** - Landing page with features and pricing
- **`/login`** - User authentication
- **`/register`** - User registration
- **`/forgot-password`** - Password reset request
- **`/reset-password`** - Password reset form
- **`/contact`** - Contact form
- **`/privacy`** - Privacy policy
- **`/terms`** - Terms of service

#### Application Pages
- **`/app/dashboard`** - Main dashboard with statistics
- **`/app/quote`** - Create new quote
- **`/app/quote-details/[quoteId]`** - View/edit specific quote
- **`/app/orders-board`** - Drag-and-drop order management
- **`/app/customers`** - Customer management
- **`/app/company`** - Company settings
- **`/app/inventory`** - Product inventory management
- **`/app/prices`** - Pricing configuration
- **`/app/users`** - User management
- **`/app/invoice`** - Invoice management
- **`/app/invoices/create`** - Create new invoice
- **`/app/invoices/[invoiceId]`** - View/edit specific invoice
- **`/app/designs`** - Design management
- **`/app/reports`** - Report management

### Layout Components

#### AppLayout
Main application layout with sidebar navigation and header.
```typescript
interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}
```

#### SideNavigation
Collapsible sidebar navigation with menu items.
```typescript
interface SideNavigationProps {
  collapsed: boolean;
  onToggle: () => void;
}
```

#### Header
Application header with user menu and notifications.
```typescript
interface HeaderProps {
  user: User;
  onLogout: () => void;
}
```

### Feature Components

#### QuoteForm
Comprehensive quote creation and editing form.
```typescript
interface QuoteFormProps {
  initialData?: Partial<Quote>;
  onSubmit: (data: Quote) => void;
  onCancel: () => void;
}
```

#### InvoiceForm
Invoice creation and editing form.
```typescript
interface InvoiceFormProps {
  initialData?: Partial<Invoice>;
  customers: Customer[];
  onSubmit: (data: Invoice) => void;
  onCancel: () => void;
}
```

#### DesignUpload
File upload component for design files.
```typescript
interface DesignUploadProps {
  onUpload: (file: File) => void;
  acceptedTypes: string[];
  maxSize: number;
}
```

#### ReportBuilder
Dynamic report configuration builder.
```typescript
interface ReportBuilderProps {
  reportTypes: string[];
  onSave: (config: Report) => void;
  onGenerate: (reportId: string) => void;
}
```

### UI Components

#### DataTable
Reusable table component with sorting, filtering, and pagination.
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
  pagination?: PaginationProps;
}
```

#### StatusBadge
Status indicator component with color coding.
```typescript
interface StatusBadgeProps {
  status: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
}
```

#### LoadingSpinner
Loading indicator component.
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}
```

## Authentication & Authorization

### Authentication Flow
1. **Registration**: User creates account with company information
2. **Stripe Integration**: Automatic subscription creation
3. **Email Verification**: Optional email confirmation
4. **Login**: Multiple provider support (Google, Facebook, Email/Password)
5. **Session Management**: JWT tokens with NextAuth.js

### Authorization Levels
- **Company Admin**: Full access to all company data
- **Company User**: Limited access based on role permissions
- **Public**: Access to marketing pages only

### Security Features
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure session management
- **CSRF Protection**: Built-in Next.js protection
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: API endpoint protection
- **File Upload Security**: Type and size validation

## Business Logic

### Quote Management
1. **Quote Creation**: Multi-step form with product selection
2. **Pricing Calculation**: Automatic price calculation based on quantities and options
3. **Size Breakdown**: Detailed size distribution tracking
4. **Embroidery/Printing**: Additional service pricing
5. **Quote Conversion**: Convert quotes to orders with status tracking

### Order Processing
1. **Order Board**: Drag-and-drop status management
2. **Status Workflow**: Draft → Sent → Accepted → In Production → Completed
3. **Customer Communication**: Automated email notifications
4. **Progress Tracking**: Real-time order status updates

### Invoice Management
1. **Invoice Generation**: Create invoices from quotes or manually
2. **Payment Tracking**: Record and track payments
3. **PDF Generation**: Professional invoice PDFs
4. **Status Management**: Draft → Sent → Paid → Overdue
5. **Payment Reminders**: Automated overdue notifications

### Design Collaboration
1. **File Upload**: Support for multiple design file formats
2. **Version Control**: Track design iterations
3. **Comment System**: Annotate designs with feedback
4. **Approval Workflow**: Multi-stage approval process
5. **Team Assignment**: Assign designs to team members

### Reporting System
1. **Custom Reports**: Build reports with custom filters and columns
2. **Data Visualization**: Charts and graphs for data analysis
3. **Export Options**: PDF, Excel, CSV export formats
4. **Scheduled Reports**: Automated report generation
5. **Real-time Data**: Live data updates

## File Structure

```
src/
├── components/                 # React components
│   ├── app/                   # Application components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── forms/            # Form components
│   │   └── ui/               # UI components
│   └── public/               # Public page components
├── pages/                    # Next.js pages
│   ├── api/                  # API routes
│   │   ├── auth/             # Authentication endpoints
│   │   ├── invoices/         # Invoice management
│   │   ├── designs/          # Design management
│   │   ├── reports/          # Report management
│   │   └── dashboard.ts      # Dashboard data
│   ├── app/                  # Application pages
│   └── _app.tsx             # App configuration
├── models/                   # Mongoose models
├── types/                    # TypeScript type definitions
├── utils/                    # Utility functions
├── styles/                   # CSS modules
├── lib/                      # External library configurations
├── context/                  # React context providers
└── __tests__/               # Test files
```

## Deployment

### Environment Variables
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/apparelquoter

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SENDGRID_API_KEY=SG...
EMAIL_FROM=noreply@apparelquoter.com

# File Upload
MAX_FILE_SIZE=52428800  # 50MB
UPLOAD_DIR=public/uploads
```

### Build Process
```bash
# Install dependencies
npm install

# Build application
npm run build

# Start production server
npm start
```

### Docker Deployment
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Testing

### Test Structure
- **Unit Tests**: Individual component and function testing
- **Integration Tests**: API endpoint and database testing
- **E2E Tests**: Complete user workflow testing
- **Coverage**: 70% minimum coverage requirement

### Running Tests
```bash
# All tests
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch

# CI/CD
npm run test:ci
```

## Development Guide

### Getting Started
1. **Clone Repository**: `git clone <repository-url>`
2. **Install Dependencies**: `npm install`
3. **Environment Setup**: Copy `.env.example` to `.env.local`
4. **Database Setup**: Start MongoDB instance
5. **Development Server**: `npm run dev`

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Conventional Commits**: Standardized commit messages

### Git Workflow
1. **Feature Branches**: Create feature branches from main
2. **Pull Requests**: All changes via pull requests
3. **Code Review**: Required before merging
4. **Testing**: All tests must pass before merge

### API Development
1. **RESTful Design**: Follow REST principles
2. **Error Handling**: Consistent error responses
3. **Validation**: Input validation on all endpoints
4. **Documentation**: Update API docs with changes

## Troubleshooting

### Common Issues

#### Database Connection
```bash
Error: MongoNetworkError: failed to connect to server
Solution: Check MONGODB_URI and ensure MongoDB is running
```

#### Authentication Issues
```bash
Error: NextAuth configuration error
Solution: Verify NEXTAUTH_SECRET and provider configurations
```

#### File Upload Problems
```bash
Error: File too large
Solution: Check MAX_FILE_SIZE environment variable
```

#### Build Errors
```bash
Error: TypeScript compilation failed
Solution: Run `npx tsc --noEmit` to check type errors
```

### Performance Optimization
1. **Database Indexing**: Ensure proper indexes on frequently queried fields
2. **Image Optimization**: Use Next.js Image component
3. **Code Splitting**: Lazy load components when possible
4. **Caching**: Implement appropriate caching strategies

### Monitoring
1. **Error Tracking**: Implement error monitoring (Sentry, etc.)
2. **Performance Monitoring**: Track Core Web Vitals
3. **Database Monitoring**: Monitor query performance
4. **User Analytics**: Track user behavior and usage patterns

## Support

### Documentation
- **API Docs**: Available at `/api/docs` (if implemented)
- **Component Library**: Storybook documentation
- **Code Comments**: Inline documentation for complex logic

### Community
- **GitHub Issues**: Bug reports and feature requests
- **Discord/Slack**: Community support channels
- **Email Support**: Direct support for enterprise customers

This comprehensive documentation covers all aspects of the ApparelQuoter application, from technical implementation to business logic and deployment procedures. It serves as a complete reference for developers, administrators, and stakeholders.
