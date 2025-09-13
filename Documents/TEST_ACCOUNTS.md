# Test Accounts Documentation

This document provides comprehensive information about the test accounts created for the ApparelQuoter application. These accounts are designed to test different user roles, subscription plans, and business scenarios.

## Table of Contents
1. [Overview](#overview)
2. [Test Account Credentials](#test-account-credentials)
3. [Company Information](#company-information)
4. [Test Customers](#test-customers)
5. [Sample Data](#sample-data)
6. [Usage Instructions](#usage-instructions)
7. [Script Usage](#script-usage)

## Overview

The test environment includes:
- **6 Test Users** across 3 different subscription plans
- **3 Test Companies** with different business profiles
- **3 Test Customers** for each company
- **3 Sample Quotes** with different quote types
- **Default Pricing** configured for each company

### Subscription Plans Tested
- **Starter Plan** ($9.99/month) - 1 user, 10 clients
- **Standard Plan** ($19.99/month) - 5 users, 50 clients  
- **Professional Plan** ($49.99/month) - 20 users, 200 clients

## Test Account Credentials

### Admin Accounts

#### 1. Starter Plan Admin
- **Name:** John Admin
- **Email:** admin.starter@test.com
- **Password:** TestPassword123!
- **Role:** admin
- **Company:** Starter Apparel Co.
- **Plan:** Starter Plan ($9.99/month)
- **Stripe Customer ID:** cus_test_starter_admin
- **Subscription ID:** sub_test_starter_admin

#### 2. Standard Plan Admin
- **Name:** Sarah Manager
- **Email:** admin.standard@test.com
- **Password:** TestPassword123!
- **Role:** admin
- **Company:** Standard Fashion LLC
- **Plan:** Standard Plan ($19.99/month)
- **Stripe Customer ID:** cus_test_standard_admin
- **Subscription ID:** sub_test_standard_admin

#### 3. Professional Plan Admin
- **Name:** Michael Director
- **Email:** admin.professional@test.com
- **Password:** TestPassword123!
- **Role:** admin
- **Company:** Professional Garments Inc.
- **Plan:** Professional Plan ($49.99/month)
- **Stripe Customer ID:** cus_test_professional_admin
- **Subscription ID:** sub_test_professional_admin

### User Accounts

#### 4. Starter Plan User
- **Name:** Emily Designer
- **Email:** user.starter@test.com
- **Password:** TestPassword123!
- **Role:** user
- **Company:** Starter Apparel Co. (shared with admin)
- **Plan:** Starter Plan ($9.99/month)
- **Stripe Customer ID:** cus_test_starter_user
- **Subscription ID:** sub_test_starter_user

#### 5. Standard Plan User
- **Name:** David Sales Rep
- **Email:** user.standard@test.com
- **Password:** TestPassword123!
- **Role:** user
- **Company:** Standard Fashion LLC (shared with admin)
- **Plan:** Standard Plan ($19.99/month)
- **Stripe Customer ID:** cus_test_standard_user
- **Subscription ID:** sub_test_standard_user

#### 6. Professional Plan User
- **Name:** Lisa Account Manager
- **Email:** user.professional@test.com
- **Password:** TestPassword123!
- **Role:** user
- **Company:** Professional Garments Inc. (shared with admin)
- **Plan:** Professional Plan ($49.99/month)
- **Stripe Customer ID:** cus_test_professional_user
- **Subscription ID:** sub_test_professional_user

## Company Information

### 1. Starter Apparel Co.
- **Name:** Starter Apparel Co.
- **Address:** 123 Main St, New York, NY 10001
- **Phone:** 555-0101
- **Email:** admin.starter@test.com
- **Offerings:** T-Shirts, Hoodies, Caps
- **Quote ID Format:** SA-{YYYY}-{MM}-{DD}-{###}
- **Users:** John Admin (admin), Emily Designer (user)

### 2. Standard Fashion LLC
- **Name:** Standard Fashion LLC
- **Address:** 456 Business Ave, Los Angeles, CA 90210
- **Phone:** 555-0102
- **Email:** admin.standard@test.com
- **Offerings:** T-Shirts, Hoodies, Caps, Polo Shirts, Jackets
- **Quote ID Format:** SF-{YYYY}-{MM}-{DD}-{###}
- **Users:** Sarah Manager (admin), David Sales Rep (user)

### 3. Professional Garments Inc.
- **Name:** Professional Garments Inc.
- **Address:** 789 Corporate Blvd, Chicago, IL 60601
- **Phone:** 555-0103
- **Email:** admin.professional@test.com
- **Offerings:** T-Shirts, Hoodies, Caps, Polo Shirts, Jackets, Work Uniforms, Custom Embroidery
- **Quote ID Format:** PG-{YYYY}-{MM}-{DD}-{###}
- **Users:** Michael Director (admin), Lisa Account Manager (user)

## Test Customers

Each company has 3 test customers with different profiles:

### 1. Acme Corporation
- **Contact:** John Smith
- **Address:** 100 Corporate Dr, Boston, MA 02101
- **Phone:** 555-1001
- **Email:** john.smith@acme.com
- **Notes:** Initial contact - interested in bulk t-shirt order

### 2. Tech Startup Inc
- **Contact:** Jane Doe
- **Address:** 200 Innovation Way, San Francisco, CA 94105
- **Phone:** 555-1002
- **Email:** jane.doe@techstartup.com
- **Notes:** Follow up on hoodie design mockup

### 3. Local Sports Club
- **Contact:** Mike Johnson
- **Address:** 300 Sports Ave, Miami, FL 33101
- **Phone:** 555-1003
- **Email:** mike.johnson@sportsclub.com
- **Notes:** Need custom team jerseys with embroidery

## Sample Data

### Sample Quotes
The system includes 3 sample quotes with different types:

1. **Apparel Quote** (Draft Status)
   - Product: 100% Cotton T-Shirt
   - Quantity: 100 pieces
   - Size breakdown: XS(10), S(20), M(30), L(25), XL(15)
   - Total: $850.00

2. **Combination Quote** (Sent Status)
   - Product: Fleece Hoodie with Custom Print
   - Quantity: 50 pieces
   - Printing: Front and Back locations
   - Total: $1,300.00

3. **Embroidery Quote** (Accepted Status)
   - Product: Embroidered Polo Shirt
   - Quantity: 25 pieces
   - Embroidery: 5000 stitches
   - Total: $500.00

### Default Pricing
Each company has default pricing configured for:
- **T-Shirts:** $8.50 - $12.00
- **Hoodies:** $20.00 - $30.00
- **Caps:** $8.00 - $18.00
- **Printing:** $25.00 - $75.00 setup fees
- **Embroidery:** $0.15 per 1000 stitches, $25.00 hooping fee

## Usage Instructions

### 1. Running the Test Account Creation Script

```bash
# Navigate to the project root
cd /path/to/ApparelQuoter

# Install dependencies if not already installed
npm install

# Run the test account creation script
node src/scripts/createTestAccounts.js
```

### 2. Testing Different Scenarios

#### Admin Testing
- Use admin accounts to test full system functionality
- Test user management, company settings, and advanced features
- Verify subscription plan limitations

#### User Testing
- Use user accounts to test limited functionality
- Verify role-based access controls
- Test quote creation and customer management

#### Cross-Company Testing
- Test data isolation between companies
- Verify users can only access their company's data
- Test quote and customer management per company

### 3. Testing Subscription Plans

#### Starter Plan Testing
- Login as admin.starter@test.com or user.starter@test.com
- Test 1-user limitation
- Test 10-client limitation
- Verify basic features only

#### Standard Plan Testing
- Login as admin.standard@test.com or user.standard@test.com
- Test up to 5 users
- Test up to 50 clients
- Verify advanced features

#### Professional Plan Testing
- Login as admin.professional@test.com or user.professional@test.com
- Test up to 20 users
- Test up to 200 clients
- Verify all features including invoicing and reporting

## Script Usage

### Prerequisites
- MongoDB connection configured
- Environment variables set (MONGODB_URI)
- All required dependencies installed

### Script Features
- **Clean Slate:** Removes existing test data before creating new accounts
- **Complete Setup:** Creates users, companies, customers, quotes, and pricing
- **Realistic Data:** Uses realistic business data and scenarios
- **Error Handling:** Includes comprehensive error handling and logging

### Customization
The script can be easily customized by modifying:
- `testAccounts` array for different user configurations
- `testCustomers` array for different customer profiles
- `testQuotes` array for different quote scenarios
- Company information and pricing structures

### Safety Features
- Only affects test accounts (emails ending with @test.com)
- Preserves production data
- Includes rollback capability by clearing test data

## Security Notes

⚠️ **Important Security Considerations:**
- These are TEST accounts only - never use in production
- All passwords are the same for easy testing: `TestPassword123!`
- Stripe IDs are test IDs and won't process real payments
- Test data should be cleared before production deployment

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify MONGODB_URI environment variable
   - Ensure MongoDB is running
   - Check network connectivity

2. **Script Fails to Run**
   - Ensure all dependencies are installed
   - Check file permissions
   - Verify Node.js version compatibility

3. **Test Data Not Appearing**
   - Check database connection
   - Verify script completed successfully
   - Check for duplicate email errors

### Support
For issues with test accounts or the creation script, refer to the main application documentation or contact the development team.

---

**Last Updated:** January 2024
**Version:** 1.0
**Maintained By:** Development Team

