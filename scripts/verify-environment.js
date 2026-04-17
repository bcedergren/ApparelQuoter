#!/usr/bin/env node

/**
 * Environment Variables Verification Script
 * 
 * Validates all required environment variables are set
 * Run before deployment to catch configuration issues
 * 
 * Usage: node scripts/verify-environment.js
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_VARS = {
  // Database
  MONGODB_URI: {
    description: 'MongoDB connection string',
    example: 'mongodb+srv://user:pass@cluster.mongodb.net/apparelquoter',
    required: true,
    validation: (val) => val.includes('mongodb') && val.includes('apparelquoter'),
  },

  // NextAuth
  NEXTAUTH_URL: {
    description: 'Application URL for NextAuth',
    example: 'https://yourdomain.com or http://localhost:3003',
    required: true,
    validation: (val) => val.startsWith('http'),
  },
  NEXTAUTH_SECRET: {
    description: 'Secret for NextAuth session encryption',
    example: 'Generate with: openssl rand -base64 32',
    required: true,
    validation: (val) => val.length >= 32,
  },

  // Application
  NEXT_PUBLIC_WEBSITE_URL: {
    description: 'Public website URL',
    example: 'https://yourdomain.com',
    required: true,
    validation: (val) => val.startsWith('http'),
  },
  JWT_SECRET: {
    description: 'Secret for JWT tokens',
    example: 'Generate with: openssl rand -base64 32',
    required: true,
    validation: (val) => val.length >= 32,
  },

  // Stripe
  STRIPE_SECRET_KEY: {
    description: 'Stripe secret key (sk_test_ or sk_live_)',
    example: 'sk_test_... or sk_live_...',
    required: true,
    validation: (val) => val.startsWith('sk_'),
  },
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
    description: 'Stripe publishable key (pk_test_ or pk_live_)',
    example: 'pk_test_... or pk_live_...',
    required: true,
    validation: (val) => val.startsWith('pk_'),
  },
  STRIPE_WEBHOOK_SECRET: {
    description: 'Stripe webhook signing secret',
    example: 'whsec_...',
    required: true,
    validation: (val) => val.startsWith('whsec_'),
  },

  // Email
  RESEND_API_KEY: {
    description: 'Resend email API key',
    example: 're_...',
    required: true,
    validation: (val) => val.startsWith('re_'),
  },
  EMAIL_FROM: {
    description: 'Sender email address',
    example: 'noreply@yourdomain.com',
    required: true,
    validation: (val) => val.includes('@'),
  },

  // Security
  MAILER_API_KEY: {
    description: 'Internal API key for mailer endpoint',
    example: 'Generate with: openssl rand -base64 32',
    required: true,
    validation: (val) => val.length >= 32,
  },

  // File Upload
  MAX_FILE_SIZE: {
    description: 'Maximum file upload size in bytes',
    example: '52428800',
    required: false,
    validation: (val) => !isNaN(parseInt(val)),
  },
  UPLOAD_DIR: {
    description: 'Directory for file uploads',
    example: 'public/uploads',
    required: false,
  },
};

const OPTIONAL_VARS = {
  GOOGLE_CLIENT_ID: 'Google OAuth client ID',
  GOOGLE_CLIENT_SECRET: 'Google OAuth client secret',
  FACEBOOK_CLIENT_ID: 'Facebook OAuth app ID',
  FACEBOOK_CLIENT_SECRET: 'Facebook OAuth app secret',
};

function checkEnvironment() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   ApparelQuoter - Environment Verification            ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  let hasErrors = false;
  let hasWarnings = false;
  const missing = [];
  const invalid = [];
  const warnings = [];

  // Check required variables
  console.log('📋 Checking required environment variables...\n');

  for (const [varName, config] of Object.entries(REQUIRED_VARS)) {
    const value = process.env[varName];

    if (!value) {
      if (config.required) {
        console.log(`❌ ${varName}: MISSING`);
        console.log(`   Description: ${config.description}`);
        console.log(`   Example: ${config.example}\n`);
        missing.push(varName);
        hasErrors = true;
      }
    } else {
      if (config.validation && !config.validation(value)) {
        console.log(`⚠️  ${varName}: INVALID FORMAT`);
        console.log(`   Current: ${value.substring(0, 20)}...`);
        console.log(`   Expected: ${config.example}\n`);
        invalid.push(varName);
        hasErrors = true;
      } else {
        console.log(`✅ ${varName}: OK`);
      }
    }
  }

  // Check optional variables
  console.log('\n📋 Checking optional environment variables...\n');

  for (const [varName, description] of Object.entries(OPTIONAL_VARS)) {
    const value = process.env[varName];
    
    if (!value) {
      console.log(`⚠️  ${varName}: Not set (${description})`);
      warnings.push(varName);
      hasWarnings = true;
    } else {
      console.log(`✅ ${varName}: OK`);
    }
  }

  // Check environment-specific configuration
  console.log('\n📋 Checking environment-specific settings...\n');

  const isProduction = process.env.NODE_ENV === 'production';
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const nextauthUrl = process.env.NEXTAUTH_URL;

  if (isProduction) {
    if (stripeKey && !stripeKey.startsWith('sk_live_')) {
      console.log('⚠️  WARNING: Using Stripe TEST key in production!');
      console.log('   Switch to live keys before accepting real payments\n');
      hasWarnings = true;
    }

    if (nextauthUrl && nextauthUrl.includes('localhost')) {
      console.log('❌ ERROR: NEXTAUTH_URL still set to localhost in production!');
      console.log('   Update to your production domain\n');
      hasErrors = true;
    }
  }

  // Summary
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                    SUMMARY                             ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  if (!hasErrors && !hasWarnings) {
    console.log('🎉 All environment variables are properly configured!\n');
    console.log('✅ Ready for deployment\n');
    return true;
  }

  if (hasErrors) {
    console.log('❌ ERRORS FOUND - Cannot deploy until fixed:\n');
    if (missing.length > 0) {
      console.log(`   Missing variables (${missing.length}):`);
      missing.forEach(v => console.log(`   - ${v}`));
    }
    if (invalid.length > 0) {
      console.log(`\n   Invalid variables (${invalid.length}):`);
      invalid.forEach(v => console.log(`   - ${v}`));
    }
    console.log('\n   Fix these before deploying!\n');
  }

  if (hasWarnings) {
    console.log('⚠️  WARNINGS (optional but recommended):\n');
    if (warnings.length > 0) {
      warnings.forEach(v => console.log(`   - ${v}`));
    }
    console.log('\n   These are optional but may affect functionality\n');
  }

  console.log('📖 See .env.example for complete configuration\n');

  return !hasErrors;
}

// Test database connection
async function testDatabaseConnection() {
  console.log('\n🔌 Testing database connection...\n');

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.log('❌ MONGODB_URI not set, skipping connection test\n');
    return false;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('✅ Successfully connected to MongoDB!\n');

    // Test write
    const TestModel = mongoose.model('_test', new mongoose.Schema({ name: String, timestamp: Date }));
    const testDoc = await TestModel.create({ 
      name: 'Connection Test', 
      timestamp: new Date() 
    });
    console.log('✅ Write test successful');

    // Test read
    const found = await TestModel.findById(testDoc._id);
    console.log('✅ Read test successful');

    // Cleanup
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('✅ Delete test successful');

    await mongoose.connection.dropCollection('_tests').catch(() => {});
    console.log('✅ Cleanup successful\n');

    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Verify connection string is correct');
    console.log('2. Check IP allowlist in MongoDB Atlas');
    console.log('3. Verify database user credentials');
    console.log('4. Ensure cluster is running\n');
    
    await mongoose.disconnect().catch(() => {});
    return false;
  }
}

async function run() {
  // Check environment variables
  const envOk = checkEnvironment();

  if (!envOk) {
    console.log('❌ Environment check failed. Fix issues above before continuing.\n');
    process.exit(1);
  }

  // Ask if user wants to test database
  const testDb = await question('\n🔌 Test database connection? (y/n): ');

  if (testDb.toLowerCase() === 'y' || testDb.toLowerCase() === 'yes') {
    const dbOk = await testDatabaseConnection();
    
    if (!dbOk) {
      console.log('❌ Database connection test failed.\n');
      process.exit(1);
    }

    // Ask if user wants to create indexes
    const createIdx = await question('📊 Create database indexes? (y/n): ');
    
    if (createIdx.toLowerCase() === 'y' || createIdx.toLowerCase() === 'yes') {
      await mongoose.connect(process.env.MONGODB_URI);
      await createIndexes(mongoose.connection.db);
      await verifyIndexes(mongoose.connection.db);
      await mongoose.disconnect();
    }
  }

  console.log('✅ Environment verification complete!\n');
  console.log('Next steps:');
  console.log('1. Deploy to Vercel (see VERCEL_DEPLOYMENT_GUIDE.md)');
  console.log('2. Add environment variables in Vercel dashboard');
  console.log('3. Test deployment');
  console.log('4. Complete PRODUCTION_DEPLOYMENT_CHECKLIST.md\n');

  rl.close();
  process.exit(0);
}

run();
