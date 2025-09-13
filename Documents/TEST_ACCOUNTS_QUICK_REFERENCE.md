# Test Accounts - Quick Reference

## 🔐 Login Credentials

| Role | Email | Password | Company | Plan |
|------|-------|----------|---------|------|
| **Admin** | admin.starter@test.com | TestPassword123! | Starter Apparel Co. | Starter ($9.99) |
| **User** | user.starter@test.com | TestPassword123! | Starter Apparel Co. | Starter ($9.99) |
| **Admin** | admin.standard@test.com | TestPassword123! | Standard Fashion LLC | Standard ($19.99) |
| **User** | user.standard@test.com | TestPassword123! | Standard Fashion LLC | Standard ($19.99) |
| **Admin** | admin.professional@test.com | TestPassword123! | Professional Garments Inc. | Professional ($49.99) |
| **User** | user.professional@test.com | TestPassword123! | Professional Garments Inc. | Professional ($49.99) |

## 🏢 Companies

| Company | Address | Phone | Quote Format |
|---------|---------|-------|--------------|
| **Starter Apparel Co.** | 123 Main St, New York, NY 10001 | 555-0101 | SA-{YYYY}-{MM}-{DD}-{###} |
| **Standard Fashion LLC** | 456 Business Ave, Los Angeles, CA 90210 | 555-0102 | SF-{YYYY}-{MM}-{DD}-{###} |
| **Professional Garments Inc.** | 789 Corporate Blvd, Chicago, IL 60601 | 555-0103 | PG-{YYYY}-{MM}-{DD}-{###} |

## 👥 Test Customers

| Customer | Contact | Email | Phone |
|----------|---------|-------|-------|
| **Acme Corporation** | John Smith | john.smith@acme.com | 555-1001 |
| **Tech Startup Inc** | Jane Doe | jane.doe@techstartup.com | 555-1002 |
| **Local Sports Club** | Mike Johnson | mike.johnson@sportsclub.com | 555-1003 |

## 📊 Subscription Plans

| Plan | Price | Users | Clients | Features |
|------|-------|-------|---------|----------|
| **Starter** | $9.99/mo | 1 | 10 | Basic quoting tools |
| **Standard** | $19.99/mo | 5 | 50 | Advanced tools, CRM |
| **Professional** | $49.99/mo | 20 | 200 | All features, reporting |

## 🚀 Quick Start

1. **Create test accounts:**
   ```bash
   npm run create-test-accounts
   ```

2. **Login to test:**
   - Go to `/login`
   - Use any email/password from the table above

3. **Test different scenarios:**
   - Admin accounts: Full access
   - User accounts: Limited access
   - Different plans: Feature limitations

## ⚠️ Important Notes

- All passwords are: `TestPassword123!`
- These are TEST accounts only
- Stripe IDs are test IDs (no real payments)
- Data is isolated per company
- Script clears existing test data before creating new accounts

## 🔧 Troubleshooting

- **Can't login?** Check if accounts were created successfully
- **Missing data?** Run the creation script again
- **Database errors?** Verify MongoDB connection and environment variables

