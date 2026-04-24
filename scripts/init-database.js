#!/usr/bin/env node

/**
 * Database Initialization Script
 * 
 * This script creates all necessary indexes for optimal performance
 * Run this after setting up MongoDB Atlas
 * 
 * Usage: node scripts/init-database.js
 */

const mongoose = require('mongoose');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createIndexes(db) {
  console.log('\n📊 Creating indexes for optimal performance...\n');

  try {
    // Users Collection
    console.log('Creating indexes for Users collection...');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ companyId: 1 });
    await db.collection('users').createIndex({ stripeCustomerId: 1 });
    console.log('✅ Users indexes created');

    // Companies Collection
    console.log('\nCreating indexes for Companies collection...');
    await db.collection('companies').createIndex({ createdBy: 1 });
    await db.collection('companies').createIndex({ email: 1 });
    console.log('✅ Companies indexes created');

    // Customers Collection
    console.log('\nCreating indexes for Customers collection...');
    await db.collection('customers').createIndex({ companyId: 1 });
    await db.collection('customers').createIndex({ email: 1 });
    await db.collection('customers').createIndex({ companyId: 1, createdDate: -1 });
    console.log('✅ Customers indexes created');

    // Quotes Collection
    console.log('\nCreating indexes for Quotes collection...');
    await db.collection('quotes').createIndex({ companyId: 1, CreatedAt: -1 });
    await db.collection('quotes').createIndex({ quoteId: 1 });
    await db.collection('quotes').createIndex({ selectedCustomerId: 1 });
    await db.collection('quotes').createIndex({ quoteType: 1, companyId: 1 });
    await db.collection('quotes').createIndex({ companyId: 1, quoteType: 1, CreatedAt: -1 });
    console.log('✅ Quotes indexes created');

    // Invoices Collection
    console.log('\nCreating indexes for Invoices collection...');
    await db.collection('invoices').createIndex({ companyId: 1, createdAt: -1 });
    await db.collection('invoices').createIndex({ customerId: 1 });
    await db.collection('invoices').createIndex({ status: 1, companyId: 1 });
    await db.collection('invoices').createIndex({ invoiceNumber: 1 });
    console.log('✅ Invoices indexes created');

    // Designs Collection
    console.log('\nCreating indexes for Designs collection...');
    await db.collection('designs').createIndex({ companyId: 1 });
    await db.collection('designs').createIndex({ customerId: 1 });
    await db.collection('designs').createIndex({ status: 1 });
    await db.collection('designs').createIndex({ companyId: 1, createdAt: -1 });
    console.log('✅ Designs indexes created');

    // Reports Collection
    console.log('\nCreating indexes for Reports collection...');
    await db.collection('reports').createIndex({ companyId: 1 });
    await db.collection('reports').createIndex({ reportType: 1 });
    console.log('✅ Reports indexes created');

    // Sales Collection
    console.log('\nCreating indexes for Sales collection...');
    await db.collection('sales').createIndex({ companyId: 1 });
    await db.collection('sales').createIndex({ saleDate: -1 });
    await db.collection('sales').createIndex({ companyId: 1, saleDate: -1 });
    console.log('✅ Sales indexes created');

    // Activities Collection
    console.log('\nCreating indexes for Activities collection...');
    await db.collection('activities').createIndex({ companyId: 1 });
    await db.collection('activities').createIndex({ timestamp: -1 });
    await db.collection('activities').createIndex({ companyId: 1, timestamp: -1 });
    console.log('✅ Activities indexes created');

    // Prices Collection
    console.log('\nCreating indexes for Prices collection...');
    await db.collection('prices').createIndex({ companyId: 1 }, { unique: true });
    console.log('✅ Prices indexes created');

    console.log('\n✅ All indexes created successfully!\n');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  }
}

async function verifyIndexes(db) {
  console.log('\n🔍 Verifying indexes...\n');

  const collections = [
    'users',
    'companies',
    'customers',
    'quotes',
    'invoices',
    'designs',
    'reports',
    'sales',
    'activities',
    'prices'
  ];

  for (const collectionName of collections) {
    const indexes = await db.collection(collectionName).indexes();
    console.log(`${collectionName}: ${indexes.length} indexes`);
    indexes.forEach(index => {
      console.log(`  - ${JSON.stringify(index.key)}`);
    });
  }

  console.log('\n✅ Index verification complete!\n');
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   ApparelQuoter - Database Initialization Script      ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Get MongoDB connection string
  let mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.log('⚠️  MONGODB_URI not found in environment variables.\n');
    mongoUri = await question('Enter your MongoDB connection string: ');
  }

  console.log('\n🔗 Connecting to MongoDB Atlas...');

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully!\n');

    const db = mongoose.connection.db;

    // Create indexes
    await createIndexes(db);

    // Verify indexes
    await verifyIndexes(db);

    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║            Database Setup Complete! ✅                 ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log('Next steps:');
    console.log('1. ✅ Database indexes created');
    console.log('2. 🚀 Deploy to Vercel (follow VERCEL_DEPLOYMENT_GUIDE.md)');
    console.log('3. 🧪 Run tests: npm run test:ci');
    console.log('4. 📋 Complete PRODUCTION_DEPLOYMENT_CHECKLIST.md\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Verify MONGODB_URI is correct');
    console.error('2. Check network access in MongoDB Atlas (IP allowlist)');
    console.error('3. Verify database user credentials');
    console.error('4. Ensure cluster is running\n');
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    rl.close();
  }
}

main();
