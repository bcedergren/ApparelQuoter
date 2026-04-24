# MongoDB Atlas Setup Guide - Production Database

**Application:** ApparelQuoter  
**Date:** April 17, 2026  
**Purpose:** Production database configuration  
**Estimated Time:** 30-45 minutes

---

## Overview

MongoDB Atlas is a fully-managed cloud database service. This guide walks through setting up a production-ready database cluster for ApparelQuoter.

**Why MongoDB Atlas?**
- Automated backups and point-in-time recovery
- Built-in monitoring and alerting
- Automatic scaling
- 99.995% SLA uptime
- Global distribution options
- Security features (encryption, network isolation)

---

## Step 1: Create MongoDB Atlas Account

### 1.1 Sign Up
1. Go to https://www.mongodb.com/cloud/atlas
2. Click **"Start Free"** or **"Try Free"**
3. Sign up with:
   - Google account (recommended for SSO)
   - Or email + password
4. Verify your email address

### 1.2 Create Organization
1. After login, create an organization
2. Organization name: `ApparelQuoter` (or your company name)
3. Click **"Next"**

### 1.3: Create Project
1. Project name: `ApparelQuoter Production`
2. Click **"Next"**
3. Skip adding members for now (can add later)

---

## Step 2: Create Production Cluster

### 2.1 Choose Cluster Tier

**For Production (Recommended):**
- **Tier:** M10 (General Purpose)
- **Storage:** 10 GB (auto-scales to 4TB)
- **RAM:** 2 GB
- **vCPU:** 2 cores
- **Cost:** ~$57/month

**For Staging/Testing:**
- **Tier:** M0 (Free Tier)
- **Storage:** 512 MB
- **Note:** Limited features, good for testing

**Steps:**
1. Click **"Build a Database"** or **"Create"**
2. Choose deployment type: **"Dedicated"** for production
3. Select **M10** tier
4. Leave **"Backup"** enabled (critical for production)

### 2.2 Choose Cloud Provider & Region

**Recommended Configuration:**
```
Cloud Provider: AWS (or match your hosting provider)
Region: US East (N. Virginia) - us-east-1

OR choose region closest to your users:
- US East for North America East Coast
- US West for North America West Coast
- EU (Frankfurt) for Europe
- Asia Pacific (Singapore) for Asia
```

**Important:** Choose the same cloud provider and region as your hosting (Vercel, AWS, etc.) for lower latency.

### 2.3 Cluster Name
- Name: `apparelquoter-production`
- Click **"Create Cluster"**

**Wait Time:** 3-7 minutes for cluster creation

---

## Step 3: Database Security Configuration

### 3.1 Create Database User

1. In left sidebar, click **"Database Access"**
2. Click **"Add New Database User"**
3. **Authentication Method:** Password
4. **Username:** `apparelquoter_app`
5. **Password:** Click **"Autogenerate Secure Password"**
   - **IMPORTANT:** Copy and save this password immediately!
   - Store in password manager
6. **Database User Privileges:** 
   - Select **"Read and write to any database"**
7. **Temporary User:** Leave disabled
8. Click **"Add User"**

**Save these credentials:**
```
Username: apparelquoter_app
Password: [COPY FROM ATLAS]
```

### 3.2 Configure Network Access

1. In left sidebar, click **"Network Access"**
2. Click **"Add IP Address"**

**Option A: Development (Temporary)**
```
Access List Entry: 0.0.0.0/0
Comment: Allow from anywhere (TEMPORARY - for initial setup)
```
⚠️ **WARNING:** This allows connections from any IP. Only use temporarily!

**Option B: Production (Recommended)**
After deploying to Vercel/hosting:
```
1. Get your hosting provider's outbound IP addresses
2. Add each IP individually
3. Comment: "Vercel Production" or "AWS Production"
```

**For Vercel:**
- Vercel doesn't have static IPs on Pro plan
- Use `0.0.0.0/0` OR upgrade to Enterprise for static IPs
- Alternative: Use MongoDB Atlas PrivateLink (advanced)

3. Click **"Confirm"**

---

## Step 4: Get Connection String

### 4.1 Connect to Cluster

1. Go to **"Database"** in left sidebar
2. Find your cluster: `apparelquoter-production`
3. Click **"Connect"** button
4. Choose **"Connect your application"**

### 4.2 Copy Connection String

1. **Driver:** Node.js
2. **Version:** 5.5 or later
3. **Connection String:**
```
mongodb+srv://apparelquoter_app:<password>@apparelquoter-production.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

4. **Replace `<password>`** with the password from Step 3.1
5. **Add database name** at the end: `/apparelquoter`

**Final connection string:**
```
mongodb+srv://apparelquoter_app:YOUR_PASSWORD_HERE@apparelquoter-production.xxxxx.mongodb.net/apparelquoter?retryWrites=true&w=majority
```

### 4.3 Save to Environment Variables

**For local development (`.env.local`):**
```bash
MONGODB_URI=mongodb+srv://apparelquoter_app:YOUR_PASSWORD@apparelquoter-production.xxxxx.mongodb.net/apparelquoter?retryWrites=true&w=majority
```

**For production (Vercel/hosting):**
- Add as environment variable in hosting dashboard
- Variable name: `MONGODB_URI`
- Value: [your connection string]

---

## Step 5: Create Indexes for Performance

After connecting to your database, create these indexes for optimal performance:

### 5.1 Using MongoDB Compass (GUI)

1. Download MongoDB Compass: https://www.mongodb.com/try/download/compass
2. Connect using your connection string
3. Navigate to each collection
4. Click **"Indexes"** tab
5. Click **"Create Index"**

### 5.2 Required Indexes

**Users Collection:**
```javascript
{ email: 1 } // unique index
{ companyId: 1 }
{ stripeCustomerId: 1 }
```

**Companies Collection:**
```javascript
{ createdBy: 1 }
```

**Customers Collection:**
```javascript
{ companyId: 1 }
{ email: 1 }
```

**Quotes Collection:**
```javascript
{ companyId: 1, createdAt: -1 }
{ quoteId: 1 } // unique per company
{ selectedCustomerId: 1 }
{ quoteType: 1, companyId: 1 }
```

**Invoices Collection:**
```javascript
{ companyId: 1, createdAt: -1 }
{ customerId: 1 }
{ status: 1, companyId: 1 }
```

**Designs Collection:**
```javascript
{ companyId: 1 }
{ customerId: 1 }
{ status: 1 }
```

### 5.3 Using MongoDB Shell (CLI)

```javascript
// Connect to your database
use apparelquoter

// Users
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ companyId: 1 })
db.users.createIndex({ stripeCustomerId: 1 })

// Companies
db.companies.createIndex({ createdBy: 1 })

// Customers
db.customers.createIndex({ companyId: 1 })
db.customers.createIndex({ email: 1 })

// Quotes
db.quotes.createIndex({ companyId: 1, createdAt: -1 })
db.quotes.createIndex({ quoteId: 1 })
db.quotes.createIndex({ selectedCustomerId: 1 })
db.quotes.createIndex({ quoteType: 1, companyId: 1 })

// Invoices
db.invoices.createIndex({ companyId: 1, createdAt: -1 })
db.invoices.createIndex({ customerId: 1 })
db.invoices.createIndex({ status: 1, companyId: 1 })

// Designs
db.designs.createIndex({ companyId: 1 })
db.designs.createIndex({ customerId: 1 })
db.designs.createIndex({ status: 1 })
```

---

## Step 6: Configure Backups

### 6.1 Verify Backup Settings

1. Go to your cluster
2. Click **"...** (more options)
3. Select **"Edit Configuration"**
4. Scroll to **"Backup"**
5. Ensure **"Continuous Backup"** is enabled (M10+)

### 6.2 Backup Schedule (Default)

**Continuous Backups:**
- Snapshot every 6 hours
- Retained for 2 days
- Point-in-time recovery available

**Daily Snapshots:**
- One snapshot per day
- Retained for 7 days

**Weekly Snapshots:**
- One snapshot per week
- Retained for 4 weeks

**Monthly Snapshots:**
- One snapshot per month
- Retained for 12 months

### 6.3 Test Restore Procedure

**IMPORTANT:** Test your backup restore process before production!

1. Go to **"Backup"** tab
2. Select a snapshot
3. Click **"Restore"**
4. Choose **"Download"** (not to production cluster!)
5. Verify data integrity

---

## Step 7: Set Up Monitoring & Alerts

### 7.1 Configure Alerts

1. Go to **"Alerts"** in left sidebar
2. Click **"Create Alert"**

**Recommended Alerts:**

**Alert 1: Disk Space**
```
Condition: Disk space usage is above 75%
Notification: Email to your-email@domain.com
```

**Alert 2: Connections**
```
Condition: Current connections is above 80% of max
Notification: Email to your-email@domain.com
```

**Alert 3: Replication Lag**
```
Condition: Replication lag is above 60 seconds
Notification: Email to your-email@domain.com
```

**Alert 4: Query Performance**
```
Condition: Query targeting scanned objects per returned is above 1000
Notification: Email to your-email@domain.com
```

### 7.2 Enable Performance Advisor

1. Go to **"Performance Advisor"** tab
2. Review index suggestions
3. Create recommended indexes

---

## Step 8: Test Connection

### 8.1 Test Locally

1. Update `.env.local` with your connection string
2. Run your application:
```bash
npm run dev
```

3. Check console for database connection message
4. Try to create a user or company
5. Verify data appears in MongoDB Atlas

### 8.2 Using MongoDB Compass

1. Open MongoDB Compass
2. Paste your connection string
3. Click **"Connect"**
4. Browse collections
5. Verify indexes created

### 8.3 Using Node.js Script

Create `test-connection.js`:
```javascript
const mongoose = require('mongoose');

const MONGODB_URI = 'your-connection-string-here';

async function testConnection() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Test write
    const TestModel = mongoose.model('Test', new mongoose.Schema({ name: String }));
    const doc = await TestModel.create({ name: 'Connection Test' });
    console.log('✅ Write test successful:', doc);
    
    // Test read
    const found = await TestModel.findById(doc._id);
    console.log('✅ Read test successful:', found);
    
    // Cleanup
    await TestModel.deleteOne({ _id: doc._id });
    console.log('✅ Delete test successful');
    
    await mongoose.disconnect();
    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }
}

testConnection();
```

Run:
```bash
node test-connection.js
```

---

## Step 9: Production Hardening

### 9.1 IP Allowlist (Production)

Once deployed:
1. Go to **"Network Access"**
2. **Remove** `0.0.0.0/0` entry
3. Add only specific IPs:
   - Your production server IPs
   - Your office IP (for database admin)
   - CI/CD pipeline IPs

### 9.2 Database User Permissions

Create separate users for different purposes:

**Application User (already created):**
```
Username: apparelquoter_app
Role: readWrite on apparelquoter database
```

**Admin User (for database management):**
```
Username: apparelquoter_admin
Role: dbOwner on apparelquoter database
Use for: Database migrations, manual fixes
```

**Read-Only User (for reporting/analytics):**
```
Username: apparelquoter_readonly
Role: read on apparelquoter database
Use for: BI tools, data analysis
```

### 9.3 Enable Encryption

**Encryption at Rest:** Already enabled by default in Atlas

**Encryption in Transit:**
- Connection strings use TLS/SSL by default
- Verify `ssl=true` in connection string
- MongoDB Atlas enforces TLS 1.2+

---

## Step 10: Cost Optimization

### 10.1 Monitor Usage

1. Go to **"Billing"** in top right
2. Review **"Usage This Month"**
3. Set up budget alerts

### 10.2 Estimated Monthly Costs

**M10 Cluster (Production):**
- Base: $57/month
- Backup storage: ~$2.50/GB/month (included up to cluster size)
- Data transfer: First 10GB free, then $0.15/GB
- **Total estimate:** $60-75/month

**M0 Cluster (Free - Staging):**
- Cost: $0/month
- Storage: 512MB limit
- Good for: Development, staging, testing

### 10.3 Scaling Strategy

**When to scale up:**
- Disk space >75% full
- RAM utilization >80%
- Connection limits reached
- Query performance degrading

**Next tier:** M20
- 20GB storage
- 4GB RAM
- 4 vCPUs
- Cost: ~$102/month

---

## Step 11: Disaster Recovery Plan

### 11.1 Backup Verification Schedule

**Weekly:**
- Verify latest backup exists
- Check backup size is reasonable

**Monthly:**
- Perform test restore to separate cluster
- Verify data integrity

### 11.2 Recovery Time Objectives (RTO)

**Point-in-Time Recovery:**
- RTO: 1-4 hours
- RPO: Down to 1 second (with oplog)

**Snapshot Restore:**
- RTO: 1-2 hours
- RPO: Last snapshot (6 hours max)

### 11.3 Disaster Recovery Steps

**If production database fails:**

1. **Check Atlas Status:**
   - Go to https://status.mongodb.com
   - Check for known incidents

2. **Review Alerts:**
   - Check email/Slack for alerts
   - Review Atlas dashboard metrics

3. **Contact Support:**
   - M10+ clusters have support
   - Submit ticket or use chat

4. **Restore from Backup (if needed):**
   - Go to Backups tab
   - Select most recent snapshot
   - Restore to new cluster
   - Update connection string in app
   - Redeploy with new connection string

5. **Post-Incident:**
   - Document what happened
   - Review and improve monitoring
   - Add preventive measures

---

## Step 12: Maintenance & Best Practices

### 12.1 Regular Maintenance Tasks

**Weekly:**
- [ ] Review performance metrics
- [ ] Check slow query logs
- [ ] Verify backups are running

**Monthly:**
- [ ] Review and optimize indexes
- [ ] Check for schema issues
- [ ] Test disaster recovery
- [ ] Review access logs

**Quarterly:**
- [ ] Review cluster sizing
- [ ] Optimize costs
- [ ] Update connection strings if rotated
- [ ] Review security settings

### 12.2 Performance Monitoring

**Metrics to Watch:**
```
- Query execution time
- Number of connections
- Memory usage
- Disk IOPS
- Network throughput
- Replication lag
```

**Tools:**
- MongoDB Atlas built-in metrics
- Performance Advisor
- Real-time Performance Panel
- Query Profiler

### 12.3 Security Best Practices

✅ **DO:**
- Rotate database passwords every 90 days
- Use IP allowlisting
- Enable audit logs (available on M10+)
- Use separate users for different purposes
- Monitor unusual activity

❌ **DON'T:**
- Share database credentials in code
- Use weak passwords
- Allow `0.0.0.0/0` in production
- Grant more permissions than needed
- Forget to test backups

---

## Troubleshooting

### Issue: Cannot Connect to Database

**Symptoms:** Application shows database connection errors

**Solutions:**
1. **Check network access:**
   - Verify your IP is allowlisted
   - Check firewall settings

2. **Verify credentials:**
   - Username and password correct?
   - Connection string formatted correctly?
   - Password contains special chars? URL-encode them

3. **Check cluster status:**
   - Is cluster running?
   - Any Atlas outages?

4. **Test connection string:**
   - Use MongoDB Compass to test
   - Try from different network

### Issue: Slow Queries

**Symptoms:** Application is slow, queries taking >1 second

**Solutions:**
1. **Check indexes:**
   - Go to Performance Advisor
   - Create suggested indexes

2. **Review slow queries:**
   - Go to Performance tab
   - Identify slow queries
   - Optimize query patterns

3. **Check cluster size:**
   - Is RAM maxed out?
   - Need to scale up?

### Issue: Connection Limits Reached

**Symptoms:** "Too many connections" errors

**Solutions:**
1. **Check current connections:**
   - Atlas dashboard shows current connections
   - M10 limit: 1,500 connections

2. **Review connection pooling:**
   - Ensure app uses connection pooling
   - Set `maxPoolSize` in connection string

3. **Find connection leaks:**
   - Ensure connections are closed after use
   - Check for long-running transactions

### Issue: Backup Failed

**Symptoms:** Email alert about backup failure

**Solutions:**
1. **Check cluster health:**
   - Any performance issues?
   - Disk space full?

2. **Contact support:**
   - M10+ has support included
   - Provide cluster name and time of failure

3. **Manual snapshot:**
   - Create manual snapshot as backup
   - Go to Backups > Take Snapshot Now

---

## Quick Reference

### Connection String Format
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

### Common Commands

**Test Connection:**
```bash
mongosh "mongodb+srv://cluster.mongodb.net/apparelquoter" --username apparelquoter_app
```

**Create Index:**
```javascript
db.collection.createIndex({ field: 1 })
```

**Check Index Usage:**
```javascript
db.collection.getIndexes()
db.collection.explain().find({ field: value })
```

**Export Database:**
```bash
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/dbname"
```

**Import Database:**
```bash
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/dbname" dump/
```

---

## Support Resources

### MongoDB Atlas Support
- **Documentation:** https://docs.atlas.mongodb.com
- **Support Portal:** https://support.mongodb.com
- **Community Forums:** https://community.mongodb.com
- **Status Page:** https://status.mongodb.com

### Support Tiers
- **M0 (Free):** Community support only
- **M10+:** Includes technical support
- **M30+:** 24/7 support

### Getting Help
1. Check documentation first
2. Search community forums
3. Submit support ticket (M10+)
4. Use chat support (M10+)

---

## Checklist: Production Readiness

Before going live, verify:

### Setup
- [ ] M10 or higher cluster created
- [ ] Production region selected
- [ ] Cluster named appropriately

### Security
- [ ] Database user created with strong password
- [ ] Network access configured (not 0.0.0.0/0)
- [ ] Connection string saved securely
- [ ] TLS encryption enabled

### Performance
- [ ] All indexes created
- [ ] Performance Advisor reviewed
- [ ] Query patterns optimized
- [ ] Connection pooling configured

### Backups
- [ ] Continuous backups enabled
- [ ] Backup schedule verified
- [ ] Restore procedure tested
- [ ] Backup alerts configured

### Monitoring
- [ ] Disk space alerts set
- [ ] Connection alerts set
- [ ] Performance alerts configured
- [ ] Email notifications working

### Testing
- [ ] Connection tested from application
- [ ] Write operations work
- [ ] Read operations work
- [ ] Performance acceptable

---

## Next Steps

After completing this setup:

1. ✅ **Update application environment variables**
   - Add `MONGODB_URI` to `.env.local` (development)
   - Add to hosting provider environment variables (production)

2. ✅ **Test application connectivity**
   - Run locally with production database
   - Verify all CRUD operations work

3. ✅ **Deploy to staging first**
   - Test with staging environment
   - Verify production database connection
   - Run through critical user flows

4. ✅ **Monitor for first 24 hours**
   - Watch for connection issues
   - Check query performance
   - Verify backups running

5. ✅ **Document credentials securely**
   - Store in password manager
   - Share with team securely
   - Set up credential rotation schedule

---

**Setup Complete!** ✅

Your MongoDB Atlas production database is now ready for ApparelQuoter.

**Estimated Monthly Cost:** ~$60-75  
**Uptime SLA:** 99.995%  
**Support:** Included with M10+  
**Backups:** Automated and continuous

**Need help?** Refer to troubleshooting section or contact MongoDB support.
