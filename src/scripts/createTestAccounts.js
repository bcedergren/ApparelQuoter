const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Company = require('../models/Company');
const Customer = require('../models/Customer');
const Quote = require('../models/Quote');
const Price = require('../models/Price');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test account data
const testAccounts = [
  // Admin accounts for each subscription plan
  {
    user: {
      firstName: 'John',
      lastName: 'Admin',
      email: 'admin.starter@test.com',
      password: 'TestPassword123!',
      role: 'admin',
      isActive: true,
      rememberMe: false
    },
    company: {
      name: 'Starter Apparel Co.',
      streetAddress: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      phone: '555-0101',
      email: 'admin.starter@test.com',
      offerings: ['T-Shirts', 'Hoodies', 'Caps'],
      quoteIdFormat: 'SA-{YYYY}-{MM}-{DD}-{###}',
      createdBy: 'admin.starter@test.com'
    },
    subscription: {
      planId: 'price_1Ov16JLifuqhaGkV8cjqx4Gd', // Starter Plan
      planName: 'Starter Plan',
      stripeCustomerId: 'cus_test_starter_admin',
      subscriptionId: 'sub_test_starter_admin'
    }
  },
  {
    user: {
      firstName: 'Sarah',
      lastName: 'Manager',
      email: 'admin.standard@test.com',
      password: 'TestPassword123!',
      role: 'admin',
      isActive: true,
      rememberMe: false
    },
    company: {
      name: 'Standard Fashion LLC',
      streetAddress: '456 Business Ave',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90210',
      phone: '555-0102',
      email: 'admin.standard@test.com',
      offerings: ['T-Shirts', 'Hoodies', 'Caps', 'Polo Shirts', 'Jackets'],
      quoteIdFormat: 'SF-{YYYY}-{MM}-{DD}-{###}',
      createdBy: 'admin.standard@test.com'
    },
    subscription: {
      planId: 'price_1Ov160LifuqhaGkVZ7VNwASh', // Standard Plan
      planName: 'Standard Plan',
      stripeCustomerId: 'cus_test_standard_admin',
      subscriptionId: 'sub_test_standard_admin'
    }
  },
  {
    user: {
      firstName: 'Michael',
      lastName: 'Director',
      email: 'admin.professional@test.com',
      password: 'TestPassword123!',
      role: 'admin',
      isActive: true,
      rememberMe: false
    },
    company: {
      name: 'Professional Garments Inc.',
      streetAddress: '789 Corporate Blvd',
      city: 'Chicago',
      state: 'IL',
      zip: '60601',
      phone: '555-0103',
      email: 'admin.professional@test.com',
      offerings: ['T-Shirts', 'Hoodies', 'Caps', 'Polo Shirts', 'Jackets', 'Work Uniforms', 'Custom Embroidery'],
      quoteIdFormat: 'PG-{YYYY}-{MM}-{DD}-{###}',
      createdBy: 'admin.professional@test.com'
    },
    subscription: {
      planId: 'price_1PJR5iLifuqhaGkVkngdP981', // Professional Plan
      planName: 'Professional Plan',
      stripeCustomerId: 'cus_test_professional_admin',
      subscriptionId: 'sub_test_professional_admin'
    }
  },
  // Regular user accounts
  {
    user: {
      firstName: 'Emily',
      lastName: 'Designer',
      email: 'user.starter@test.com',
      password: 'TestPassword123!',
      role: 'user',
      isActive: true,
      rememberMe: false
    },
    company: {
      name: 'Starter Apparel Co.',
      streetAddress: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      phone: '555-0101',
      email: 'admin.starter@test.com',
      offerings: ['T-Shirts', 'Hoodies', 'Caps'],
      quoteIdFormat: 'SA-{YYYY}-{MM}-{DD}-{###}',
      createdBy: 'admin.starter@test.com'
    },
    subscription: {
      planId: 'price_1Ov16JLifuqhaGkV8cjqx4Gd', // Starter Plan
      planName: 'Starter Plan',
      stripeCustomerId: 'cus_test_starter_user',
      subscriptionId: 'sub_test_starter_user'
    }
  },
  {
    user: {
      firstName: 'David',
      lastName: 'Sales Rep',
      email: 'user.standard@test.com',
      password: 'TestPassword123!',
      role: 'user',
      isActive: true,
      rememberMe: false
    },
    company: {
      name: 'Standard Fashion LLC',
      streetAddress: '456 Business Ave',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90210',
      phone: '555-0102',
      email: 'admin.standard@test.com',
      offerings: ['T-Shirts', 'Hoodies', 'Caps', 'Polo Shirts', 'Jackets'],
      quoteIdFormat: 'SF-{YYYY}-{MM}-{DD}-{###}',
      createdBy: 'admin.standard@test.com'
    },
    subscription: {
      planId: 'price_1Ov160LifuqhaGkVZ7VNwASh', // Standard Plan
      planName: 'Standard Plan',
      stripeCustomerId: 'cus_test_standard_user',
      subscriptionId: 'sub_test_standard_user'
    }
  },
  {
    user: {
      firstName: 'Lisa',
      lastName: 'Account Manager',
      email: 'user.professional@test.com',
      password: 'TestPassword123!',
      role: 'user',
      isActive: true,
      rememberMe: false
    },
    company: {
      name: 'Professional Garments Inc.',
      streetAddress: '789 Corporate Blvd',
      city: 'Chicago',
      state: 'IL',
      zip: '60601',
      phone: '555-0103',
      email: 'admin.professional@test.com',
      offerings: ['T-Shirts', 'Hoodies', 'Caps', 'Polo Shirts', 'Jackets', 'Work Uniforms', 'Custom Embroidery'],
      quoteIdFormat: 'PG-{YYYY}-{MM}-{DD}-{###}',
      createdBy: 'admin.professional@test.com'
    },
    subscription: {
      planId: 'price_1PJR5iLifuqhaGkVkngdP981', // Professional Plan
      planName: 'Professional Plan',
      stripeCustomerId: 'cus_test_professional_user',
      subscriptionId: 'sub_test_professional_user'
    }
  }
];

// Test customers data
const testCustomers = [
  {
    companyName: 'Acme Corporation',
    contactName: 'John Smith',
    address: '100 Corporate Dr',
    city: 'Boston',
    state: 'MA',
    zip: '02101',
    phone: '555-1001',
    email: 'john.smith@acme.com',
    followUpNotes: [
      {
        date: new Date('2024-01-15'),
        note: 'Initial contact - interested in bulk t-shirt order',
        addedBy: 'admin.starter@test.com',
        addedDate: new Date('2024-01-15')
      }
    ]
  },
  {
    companyName: 'Tech Startup Inc',
    contactName: 'Jane Doe',
    address: '200 Innovation Way',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
    phone: '555-1002',
    email: 'jane.doe@techstartup.com',
    followUpNotes: [
      {
        date: new Date('2024-01-20'),
        note: 'Follow up on hoodie design mockup',
        addedBy: 'admin.standard@test.com',
        addedDate: new Date('2024-01-20')
      }
    ]
  },
  {
    companyName: 'Local Sports Club',
    contactName: 'Mike Johnson',
    address: '300 Sports Ave',
    city: 'Miami',
    state: 'FL',
    zip: '33101',
    phone: '555-1003',
    email: 'mike.johnson@sportsclub.com',
    followUpNotes: [
      {
        date: new Date('2024-01-25'),
        note: 'Need custom team jerseys with embroidery',
        addedBy: 'admin.professional@test.com',
        addedDate: new Date('2024-01-25')
      }
    ]
  }
];

// Test quotes data
const testQuotes = [
  {
    quoteType: 'apparel',
    items: [
      {
        product: 'T-Shirt',
        description: '100% Cotton T-Shirt',
        quantity: 100,
        unitPrice: 8.50,
        total: 850.00,
        sizes: {
          XS: 10,
          S: 20,
          M: 30,
          L: 25,
          XL: 15
        }
      }
    ],
    totalAmount: 850.00,
    status: 'draft',
    notes: 'Test quote for bulk t-shirt order',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  },
  {
    quoteType: 'combination',
    items: [
      {
        product: 'Hoodie',
        description: 'Fleece Hoodie with Custom Print',
        quantity: 50,
        unitPrice: 25.00,
        total: 1250.00,
        sizes: {
          S: 10,
          M: 20,
          L: 15,
          XL: 5
        }
      }
    ],
    printing: {
      locations: ['Front', 'Back'],
      colors: ['Black', 'White'],
      setupFee: 50.00
    },
    totalAmount: 1300.00,
    status: 'sent',
    notes: 'Hoodie with custom printing',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  {
    quoteType: 'embroidery',
    items: [
      {
        product: 'Polo Shirt',
        description: 'Embroidered Polo Shirt',
        quantity: 25,
        unitPrice: 18.00,
        total: 450.00,
        sizes: {
          M: 10,
          L: 10,
          XL: 5
        }
      }
    ],
    embroidery: {
      stitchCount: '5000',
      costPerThousandStitches: '0.15',
      hoopingFee: 25.00,
      costPerFirst5000Stitches: '0.20'
    },
    totalAmount: 500.00,
    status: 'accepted',
    notes: 'Custom embroidered polo shirts',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
];

// Create test accounts
const createTestAccounts = async () => {
  try {
    console.log('Starting test account creation...');
    
    // Clear existing test data
    console.log('Clearing existing test data...');
    await User.deleteMany({ email: { $regex: /@test\.com$/ } });
    await Company.deleteMany({ createdBy: { $regex: /@test\.com$/ } });
    await Customer.deleteMany({ createdBy: { $regex: /@test\.com$/ } });
    await Quote.deleteMany({ createdBy: { $regex: /@test\.com$/ } });
    
    const createdCompanies = new Map();
    const createdCustomers = [];
    
    // Create companies and users
    for (const account of testAccounts) {
      console.log(`Creating account for ${account.user.email}...`);
      
      // Hash password
      const hashedPassword = await bcrypt.hash(account.user.password, 12);
      
      // Create or find company
      let company;
      const companyKey = account.company.name;
      if (createdCompanies.has(companyKey)) {
        company = createdCompanies.get(companyKey);
      } else {
        company = new Company(account.company);
        await company.save();
        createdCompanies.set(companyKey, company);
        console.log(`Created company: ${company.name}`);
      }
      
      // Create user
      const user = new User({
        ...account.user,
        password: hashedPassword,
        companyId: company._id,
        stripeCustomerId: account.subscription.stripeCustomerId,
        subscriptionId: account.subscription.subscriptionId
      });
      
      await user.save();
      console.log(`Created user: ${user.email} (${user.role})`);
      
      // Create default pricing for company if not exists
      const existingPrice = await Price.findOne({ CompanyId: company._id });
      if (!existingPrice) {
        const defaultPrice = new Price({
          CompanyId: company._id,
          tShirts: {
            names: ['Basic T-Shirt', 'Premium T-Shirt', 'V-Neck T-Shirt', 'Long Sleeve', 'Tank Top', 'Raglan', 'Pocket T-Shirt'],
            numbers: ['8.50', '12.00', '9.00', '11.50', '7.50', '10.00', '9.50']
          },
          hoodies: {
            names: ['Basic Hoodie', 'Premium Hoodie', 'Zip-Up Hoodie', 'Pullover', 'Fleece Jacket', 'Heavyweight', 'Lightweight'],
            numbers: ['22.00', '28.00', '25.00', '23.00', '26.00', '30.00', '20.00']
          },
          caps: {
            names: ['Baseball Cap', 'Snapback', 'Fitted Cap', 'Trucker Hat', 'Beanie', 'Visor', 'Bucket Hat'],
            numbers: ['12.00', '15.00', '18.00', '14.00', '10.00', '8.00', '11.00']
          },
          printing: {
            locations: ['Front', 'Back', 'Left Sleeve', 'Right Sleeve', 'Chest', 'Pocket'],
            colors: ['1 Color', '2 Colors', '3 Colors', '4 Colors', 'Full Color', 'White Ink', 'Metallic'],
            setupFees: ['25.00', '35.00', '45.00', '55.00', '75.00', '65.00', '70.00']
          },
          preCutVinyl: {
            names: ['Basic Vinyl', 'Premium Vinyl', 'Glow-in-Dark', 'Reflective', 'Metallic', 'Holographic', 'Flocked'],
            numbers: ['15.00', '20.00', '25.00', '22.00', '18.00', '30.00', '16.00']
          },
          embroidery: {
            stitchCount: '5000',
            costPerThousandStitches: '0.15',
            hoopingFee: '25.00',
            costPerFirst5000Stitches: '0.20'
          }
        });
        
        await defaultPrice.save();
        console.log(`Created default pricing for ${company.name}`);
      }
    }
    
    // Create test customers for each company
    for (const [companyName, company] of createdCompanies) {
      console.log(`Creating customers for ${companyName}...`);
      
      for (const customerData of testCustomers) {
        const customer = new Customer({
          ...customerData,
          companyId: company._id,
          createdBy: company.createdBy
        });
        
        await customer.save();
        createdCustomers.push(customer);
        console.log(`Created customer: ${customer.companyName}`);
      }
    }
    
    // Create test quotes
    console.log('Creating test quotes...');
    for (let i = 0; i < testQuotes.length; i++) {
      const quoteData = testQuotes[i];
      const company = Array.from(createdCompanies.values())[i % createdCompanies.size];
      const customer = createdCustomers[i % createdCustomers.length];
      
      // Generate quote number
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const quoteNumber = company.quoteIdFormat
        .replace('{YYYY}', year)
        .replace('{MM}', month)
        .replace('{DD}', day)
        .replace('{###}', String(i + 1).padStart(3, '0'));
      
      const quote = new Quote({
        ...quoteData,
        companyId: company._id,
        customerId: customer._id,
        quoteNumber,
        createdBy: company.createdBy
      });
      
      await quote.save();
      console.log(`Created quote: ${quote.quoteNumber}`);
    }
    
    console.log('\n✅ Test accounts created successfully!');
    console.log('\n📋 Test Account Summary:');
    console.log('====================');
    
    for (const account of testAccounts) {
      console.log(`\n👤 ${account.user.firstName} ${account.user.lastName}`);
      console.log(`   Email: ${account.user.email}`);
      console.log(`   Password: ${account.user.password}`);
      console.log(`   Role: ${account.user.role}`);
      console.log(`   Company: ${account.company.name}`);
      console.log(`   Plan: ${account.subscription.planName}`);
    }
    
    console.log('\n🏢 Companies Created:');
    for (const [name, company] of createdCompanies) {
      console.log(`   - ${name} (${company._id})`);
    }
    
    console.log('\n👥 Customers Created:');
    for (const customer of createdCustomers) {
      console.log(`   - ${customer.companyName} (${customer.contactName})`);
    }
    
    console.log('\n📄 Quotes Created:');
    console.log(`   - ${testQuotes.length} sample quotes with different types`);
    
  } catch (error) {
    console.error('Error creating test accounts:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await createTestAccounts();
  await mongoose.connection.close();
  console.log('\nDatabase connection closed.');
};

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createTestAccounts, testAccounts, testCustomers, testQuotes };

