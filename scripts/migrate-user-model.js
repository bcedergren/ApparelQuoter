#!/usr/bin/env node

/**
 * User Model Migration Script
 * 
 * Adds subscriptionStatus and paymentStatus fields to existing User documents
 * Safe to run multiple times (idempotent)
 * 
 * Usage: node scripts/migrate-user-model.js
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

async function migrateUsers() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   ApparelQuoter - User Model Migration                ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Get MongoDB connection string
  let mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.log('⚠️  MONGODB_URI not found in environment variables.\n');
    mongoUri = await question('Enter your MongoDB connection string: ');
  }

  console.log('\n🔗 Connecting to MongoDB...');

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected successfully!\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Count existing users
    const totalUsers = await usersCollection.countDocuments();
    console.log(`📊 Found ${totalUsers} users in database\n`);

    if (totalUsers === 0) {
      console.log('ℹ️  No users found. Nothing to migrate.\n');
      await mongoose.disconnect();
      rl.close();
      return;
    }

    // Count users missing new fields
    const usersNeedingMigration = await usersCollection.countDocuments({
      $or: [
        { subscriptionStatus: { $exists: false } },
        { paymentStatus: { $exists: false } }
      ]
    });

    console.log(`📊 Users needing migration: ${usersNeedingMigration}\n`);

    if (usersNeedingMigration === 0) {
      console.log('✅ All users already migrated. Nothing to do.\n');
      await mongoose.disconnect();
      rl.close();
      return;
    }

    // Ask for confirmation
    const confirm = await question(`\n⚠️  This will update ${usersNeedingMigration} user records. Continue? (yes/no): `);

    if (confirm.toLowerCase() !== 'yes') {
      console.log('\n❌ Migration cancelled by user.\n');
      await mongoose.disconnect();
      rl.close();
      return;
    }

    console.log('\n🔄 Starting migration...\n');

    // Perform migration
    const result = await usersCollection.updateMany(
      {
        $or: [
          { subscriptionStatus: { $exists: false } },
          { paymentStatus: { $exists: false } }
        ]
      },
      {
        $set: {
          subscriptionStatus: 'active', // Default to active for existing users
          paymentStatus: 'succeeded'     // Assume successful for existing users
        }
      }
    );

    console.log(`✅ Migration complete!`);
    console.log(`   Modified: ${result.modifiedCount} users`);
    console.log(`   Matched: ${result.matchedCount} users\n`);

    // Verify migration
    const stillNeedMigration = await usersCollection.countDocuments({
      $or: [
        { subscriptionStatus: { $exists: false } },
        { paymentStatus: { $exists: false } }
      ]
    });

    if (stillNeedMigration === 0) {
      console.log('✅ Verification passed - all users migrated!\n');
    } else {
      console.log(`⚠️  Warning: ${stillNeedMigration} users still need migration\n`);
    }

    // Show sample migrated user
    const sampleUser = await usersCollection.findOne({ subscriptionStatus: { $exists: true } });
    if (sampleUser) {
      console.log('Sample migrated user:');
      console.log('  Email:', sampleUser.email);
      console.log('  Subscription Status:', sampleUser.subscriptionStatus);
      console.log('  Payment Status:', sampleUser.paymentStatus);
      console.log('');
    }

    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║          Migration Complete! ✅                        ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log('Next steps:');
    console.log('1. ✅ User model migration complete');
    console.log('2. 🔄 Stripe webhooks will update these fields going forward');
    console.log('3. 🧪 Test subscription flow to verify webhook updates\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nPlease check:');
    console.error('1. Database connection string is correct');
    console.error('2. Database user has write permissions');
    console.error('3. Network access is configured');
    console.error('');
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    rl.close();
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

migrateUsers();
