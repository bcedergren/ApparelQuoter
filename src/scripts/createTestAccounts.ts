import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Import models
import User from '../models/User.js';
import Company from '../models/Company.js';
import Customer from '../models/Customer.js';
import Quote from '../models/Quote.js';
import Price from '../models/Price.js';
import Invoice from '../models/Invoice.js';
import Sale from '../models/Sale.js';

dotenv.config();

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
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

// Enhanced test quotes data with comprehensive order and income tracking
const testQuotes = [
  // Starter Company Quotes
  {
    customerName: 'Acme Corporation',
    quoteType: 'completedOrders',
    items: [{
      brandAndStyle: 'Gildan 5000 - Heavy Cotton T-Shirt',
      color: 'Navy Blue',
      standardPrice: 8.50,
      sizes: { XS: 5, S: 15, M: 25, L: 20, XL: 10, '2XL': 0, '3XL': 0, '4XL': 0, '5XL': 0 }
    }],
    embroideryDetails: {
      stitchesFront: 0, hoopingFeeFront: false, stitchesBack: 0, hoopingFeeBack: false,
      stitchesLeft: 0, hoopingFeeLeft: false, stitchesRight: 0, hoopingFeeRight: false,
      digitizingCost: 0, setupFee: 0, artworkFee: 0
    },
    printingOptions: {
      colorsFront: 2, flashFront: false, dtgDarkFront: false,
      colorsBack: 0, flashBack: false, dtgDarkBack: false,
      colorsLeft: 0, flashLeft: false, dtgDarkLeft: false,
      colorsRight: 0, flashRight: false, dtgDarkRight: false
    },
    printingDetails: {
      colorMatches: 0, artworkNeeded: true, deliveryDueDays: 14,
      deliveryDueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    apparelAndShipping: {
      customerProvidesApparel: false, creditCardCharge: true,
      shippingAndHandling: 25.00, shippingAndHandlingTaxed: false
    },
    vinylDetails: { namesFront: 0, namesBack: 0, numbersFront: 0, numbersBack: 0 },
    screenPrintingDetails: {
      newScreensNeeded: true, additionalScreens: 0, colorChanges: 0, inkType: 'Standard'
    },
    summary: {
      qty: 75, avgCost: 12.50, apparelCost: 637.50, printingCost: 225.00,
      shippingCost: 25.00, taxCost: 73.14, totalCost: 960.64
    },
    depositPercentage: 100, totalDueDays: 0
  },
  {
    customerName: 'Tech Startup Inc',
    quoteType: 'openOrders',
    items: [{
      brandAndStyle: 'Champion S700 - Double Dry T-Shirt',
      color: 'Heather Grey',
      standardPrice: 11.00,
      sizes: { XS: 8, S: 22, M: 35, L: 25, XL: 15, '2XL': 5, '3XL': 0, '4XL': 0, '5XL': 0 }
    }],
    embroideryDetails: {
      stitchesFront: 4500, hoopingFeeFront: true, stitchesBack: 0, hoopingFeeBack: false,
      stitchesLeft: 0, hoopingFeeLeft: false, stitchesRight: 0, hoopingFeeRight: false,
      digitizingCost: 75.00, setupFee: 25.00, artworkFee: 50.00
    },
    printingOptions: {
      colorsFront: 0, flashFront: false, dtgDarkFront: false,
      colorsBack: 0, flashBack: false, dtgDarkBack: false,
      colorsLeft: 0, flashLeft: false, dtgDarkLeft: false,
      colorsRight: 0, flashRight: false, dtgDarkRight: false
    },
    printingDetails: {
      colorMatches: 0, artworkNeeded: false, deliveryDueDays: 21,
      deliveryDueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    },
    apparelAndShipping: {
      customerProvidesApparel: false, creditCardCharge: true,
      shippingAndHandling: 35.00, shippingAndHandlingTaxed: false
    },
    vinylDetails: { namesFront: 0, namesBack: 0, numbersFront: 0, numbersBack: 0 },
    screenPrintingDetails: {
      newScreensNeeded: false, additionalScreens: 0, colorChanges: 0, inkType: 'Standard'
    },
    summary: {
      qty: 110, avgCost: 16.25, apparelCost: 1210.00, printingCost: 637.50,
      shippingCost: 35.00, taxCost: 155.14, totalCost: 2037.64
    },
    depositPercentage: 50, totalDueDays: 30
  },
  {
    customerName: 'Local Sports Club',
    quoteType: 'savedQuotes',
    items: [{
      brandAndStyle: 'Port Authority K500 - Silk Touch Polo',
      color: 'Royal Blue',
      standardPrice: 18.00,
      sizes: { XS: 0, S: 15, M: 25, L: 20, XL: 10, '2XL': 5, '3XL': 0, '4XL': 0, '5XL': 0 }
    }],
    embroideryDetails: {
      stitchesFront: 6000, hoopingFeeFront: true, stitchesBack: 2500, hoopingFeeBack: true,
      stitchesLeft: 0, hoopingFeeLeft: false, stitchesRight: 0, hoopingFeeRight: false,
      digitizingCost: 100.00, setupFee: 50.00, artworkFee: 0
    },
    printingOptions: {
      colorsFront: 0, flashFront: false, dtgDarkFront: false,
      colorsBack: 0, flashBack: false, dtgDarkBack: false,
      colorsLeft: 0, flashLeft: false, dtgDarkLeft: false,
      colorsRight: 0, flashRight: false, dtgDarkRight: false
    },
    printingDetails: {
      colorMatches: 0, artworkNeeded: true, deliveryDueDays: 18,
      deliveryDueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000)
    },
    apparelAndShipping: {
      customerProvidesApparel: false, creditCardCharge: false,
      shippingAndHandling: 40.00, shippingAndHandlingTaxed: false
    },
    vinylDetails: { namesFront: 0, namesBack: 0, numbersFront: 0, numbersBack: 0 },
    screenPrintingDetails: {
      newScreensNeeded: false, additionalScreens: 0, colorChanges: 0, inkType: 'Standard'
    },
    summary: {
      qty: 75, avgCost: 24.50, apparelCost: 1350.00, printingCost: 487.50,
      shippingCost: 40.00, taxCost: 0, totalCost: 1877.50
    },
    depositPercentage: 50, totalDueDays: 30
  },
  // Standard Company Quotes
  {
    customerName: 'Acme Corporation',
    quoteType: 'completedOrders',
    items: [
      {
        brandAndStyle: 'Next Level 3600 - Premium T-Shirt',
        color: 'Black',
        standardPrice: 9.50,
        sizes: { XS: 15, S: 40, M: 60, L: 45, XL: 25, '2XL': 10, '3XL': 5, '4XL': 0, '5XL': 0 }
      },
      {
        brandAndStyle: 'Independent 4000 - Midweight Hoodie',
        color: 'Charcoal',
        standardPrice: 28.00,
        sizes: { XS: 5, S: 15, M: 25, L: 20, XL: 10, '2XL': 5, '3XL': 0, '4XL': 0, '5XL': 0 }
      }
    ],
    embroideryDetails: {
      stitchesFront: 0, hoopingFeeFront: false, stitchesBack: 0, hoopingFeeBack: false,
      stitchesLeft: 0, hoopingFeeLeft: false, stitchesRight: 0, hoopingFeeRight: false,
      digitizingCost: 0, setupFee: 0, artworkFee: 125.00
    },
    printingOptions: {
      colorsFront: 3, flashFront: false, dtgDarkFront: true,
      colorsBack: 1, flashBack: false, dtgDarkBack: false,
      colorsLeft: 0, flashLeft: false, dtgDarkLeft: false,
      colorsRight: 0, flashRight: false, dtgDarkRight: false
    },
    printingDetails: {
      colorMatches: 1, artworkNeeded: true, deliveryDueDays: 18,
      deliveryDueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    },
    apparelAndShipping: {
      customerProvidesApparel: false, creditCardCharge: true,
      shippingAndHandling: 75.00, shippingAndHandlingTaxed: true
    },
    vinylDetails: { namesFront: 0, namesBack: 0, numbersFront: 0, numbersBack: 0 },
    screenPrintingDetails: {
      newScreensNeeded: true, additionalScreens: 1, colorChanges: 1, inkType: 'Water-based'
    },
    summary: {
      qty: 280, avgCost: 18.75, apparelCost: 4130.00, printingCost: 1375.00,
      shippingCost: 81.19, taxCost: 461.85, totalCost: 6048.04
    },
    depositPercentage: 100, totalDueDays: 0
  },
  {
    customerName: 'Tech Startup Inc',
    quoteType: 'openOrders',
    items: [{
      brandAndStyle: 'Bella Canvas 3001 - Jersey T-Shirt',
      color: 'White',
      standardPrice: 7.25,
      sizes: { XS: 10, S: 25, M: 35, L: 30, XL: 20, '2XL': 5, '3XL': 0, '4XL': 0, '5XL': 0 }
    }],
    embroideryDetails: {
      stitchesFront: 0, hoopingFeeFront: false, stitchesBack: 0, hoopingFeeBack: false,
      stitchesLeft: 0, hoopingFeeLeft: false, stitchesRight: 0, hoopingFeeRight: false,
      digitizingCost: 0, setupFee: 0, artworkFee: 85.00
    },
    printingOptions: {
      colorsFront: 4, flashFront: false, dtgDarkFront: false,
      colorsBack: 0, flashBack: false, dtgDarkBack: false,
      colorsLeft: 0, flashLeft: false, dtgDarkLeft: false,
      colorsRight: 0, flashRight: false, dtgDarkRight: false
    },
    printingDetails: {
      colorMatches: 2, artworkNeeded: true, deliveryDueDays: 12,
      deliveryDueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
    },
    apparelAndShipping: {
      customerProvidesApparel: false, creditCardCharge: true,
      shippingAndHandling: 45.00, shippingAndHandlingTaxed: false
    },
    vinylDetails: { namesFront: 0, namesBack: 0, numbersFront: 0, numbersBack: 0 },
    screenPrintingDetails: {
      newScreensNeeded: true, additionalScreens: 0, colorChanges: 2, inkType: 'Plastisol'
    },
    summary: {
      qty: 125, avgCost: 13.85, apparelCost: 906.25, printingCost: 825.00,
      shippingCost: 45.00, taxCost: 146.76, totalCost: 1923.01
    },
    depositPercentage: 50, totalDueDays: 30
  },
  {
    customerName: 'Local Sports Club',
    quoteType: 'completedOrders',
    items: [{
      brandAndStyle: 'Sport-Tek ST350 - PosiCharge Competitor Tee',
      color: 'True Red',
      standardPrice: 10.50,
      sizes: { XS: 20, S: 45, M: 80, L: 55, XL: 30, '2XL': 15, '3XL': 5, '4XL': 0, '5XL': 0 }
    }],
    embroideryDetails: {
      stitchesFront: 0, hoopingFeeFront: false, stitchesBack: 0, hoopingFeeBack: false,
      stitchesLeft: 0, hoopingFeeLeft: false, stitchesRight: 0, hoopingFeeRight: false,
      digitizingCost: 0, setupFee: 0, artworkFee: 0
    },
    printingOptions: {
      colorsFront: 2, flashFront: false, dtgDarkFront: false,
      colorsBack: 3, flashBack: false, dtgDarkBack: false,
      colorsLeft: 0, flashLeft: false, dtgDarkLeft: false,
      colorsRight: 0, flashRight: false, dtgDarkRight: false
    },
    printingDetails: {
      colorMatches: 0, artworkNeeded: false, deliveryDueDays: 10,
      deliveryDueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    },
    apparelAndShipping: {
      customerProvidesApparel: false, creditCardCharge: false,
      shippingAndHandling: 65.00, shippingAndHandlingTaxed: false
    },
    vinylDetails: { namesFront: 0, namesBack: 0, numbersFront: 0, numbersBack: 0 },
    screenPrintingDetails: {
      newScreensNeeded: true, additionalScreens: 2, colorChanges: 0, inkType: 'Standard'
    },
    summary: {
      qty: 250, avgCost: 15.25, apparelCost: 2625.00, printingCost: 1187.50,
      shippingCost: 65.00, taxCost: 0, totalCost: 3877.50
    },
    depositPercentage: 100, totalDueDays: 0
  },
  // Professional Company Quotes
  {
    customerName: 'Acme Corporation',
    quoteType: 'completedOrders',
    items: [
      {
        brandAndStyle: 'Port Authority K500 - Silk Touch Polo',
        color: 'Navy Blue',
        standardPrice: 18.00,
        sizes: { XS: 15, S: 50, M: 85, L: 70, XL: 40, '2XL': 20, '3XL': 10, '4XL': 5, '5XL': 5 }
      },
      {
        brandAndStyle: 'CornerStone CS410 - Duck Cloth Work Jacket',
        color: 'Brown Duck',
        standardPrice: 45.00,
        sizes: { XS: 0, S: 10, M: 20, L: 25, XL: 20, '2XL': 10, '3XL': 5, '4XL': 0, '5XL': 0 }
      }
    ],
    embroideryDetails: {
      stitchesFront: 7500, hoopingFeeFront: true, stitchesBack: 3000, hoopingFeeBack: true,
      stitchesLeft: 2000, hoopingFeeLeft: true, stitchesRight: 0, hoopingFeeRight: false,
      digitizingCost: 150.00, setupFee: 75.00, artworkFee: 0
    },
    printingOptions: {
      colorsFront: 0, flashFront: false, dtgDarkFront: false,
      colorsBack: 0, flashBack: false, dtgDarkBack: false,
      colorsLeft: 0, flashLeft: false, dtgDarkLeft: false,
      colorsRight: 0, flashRight: false, dtgDarkRight: false
    },
    printingDetails: {
      colorMatches: 0, artworkNeeded: false, deliveryDueDays: 25,
      deliveryDueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
    },
    apparelAndShipping: {
      customerProvidesApparel: false, creditCardCharge: true,
      shippingAndHandling: 125.00, shippingAndHandlingTaxed: true
    },
    vinylDetails: { namesFront: 0, namesBack: 0, numbersFront: 0, numbersBack: 0 },
    screenPrintingDetails: {
      newScreensNeeded: false, additionalScreens: 0, colorChanges: 0, inkType: 'Standard'
    },
    summary: {
      qty: 390, avgCost: 28.75, apparelCost: 9270.00, printingCost: 2932.50,
      shippingCost: 135.31, taxCost: 1017.75, totalCost: 13355.56
    },
    depositPercentage: 100, totalDueDays: 0
  },
  {
    customerName: 'Tech Startup Inc',
    quoteType: 'openOrders',
    items: [{
      brandAndStyle: 'Alternative 1973 - Eco-Jersey T-Shirt',
      color: 'Eco True Navy',
      standardPrice: 12.50,
      sizes: { XS: 12, S: 28, M: 42, L: 35, XL: 23, '2XL': 8, '3XL': 2, '4XL': 0, '5XL': 0 }
    }],
    embroideryDetails: {
      stitchesFront: 0, hoopingFeeFront: false, stitchesBack: 0, hoopingFeeBack: false,
      stitchesLeft: 0, hoopingFeeLeft: false, stitchesRight: 0, hoopingFeeRight: false,
      digitizingCost: 0, setupFee: 0, artworkFee: 150.00
    },
    printingOptions: {
      colorsFront: 1, flashFront: false, dtgDarkFront: true,
      colorsBack: 0, flashBack: false, dtgDarkBack: false,
      colorsLeft: 0, flashLeft: false, dtgDarkLeft: false,
      colorsRight: 0, flashRight: false, dtgDarkRight: false
    },
    printingDetails: {
      colorMatches: 0, artworkNeeded: true, deliveryDueDays: 16,
      deliveryDueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000)
    },
    apparelAndShipping: {
      customerProvidesApparel: false, creditCardCharge: true,
      shippingAndHandling: 55.00, shippingAndHandlingTaxed: false
    },
    vinylDetails: { namesFront: 0, namesBack: 0, numbersFront: 0, numbersBack: 0 },
    screenPrintingDetails: {
      newScreensNeeded: true, additionalScreens: 0, colorChanges: 0, inkType: 'Water-based'
    },
    summary: {
      qty: 150, avgCost: 16.85, apparelCost: 1875.00, printingCost: 652.50,
      shippingCost: 55.00, taxCost: 212.98, totalCost: 2795.48
    },
    depositPercentage: 50, totalDueDays: 30
  },
  {
    customerName: 'Local Sports Club',
    quoteType: 'savedQuotes',
    items: [{
      brandAndStyle: 'New Era NEA100 - Heritage Blend Varsity Tee',
      color: 'Vintage Navy',
      standardPrice: 14.25,
      sizes: { XS: 8, S: 20, M: 32, L: 28, XL: 18, '2XL': 6, '3XL': 3, '4XL': 0, '5XL': 0 }
    }],
    embroideryDetails: {
      stitchesFront: 5500, hoopingFeeFront: true, stitchesBack: 0, hoopingFeeBack: false,
      stitchesLeft: 0, hoopingFeeLeft: false, stitchesRight: 1500, hoopingFeeRight: true,
      digitizingCost: 85.00, setupFee: 50.00, artworkFee: 75.00
    },
    printingOptions: {
      colorsFront: 0, flashFront: false, dtgDarkFront: false,
      colorsBack: 0, flashBack: false, dtgDarkBack: false,
      colorsLeft: 0, flashLeft: false, dtgDarkLeft: false,
      colorsRight: 0, flashRight: false, dtgDarkRight: false
    },
    printingDetails: {
      colorMatches: 0, artworkNeeded: true, deliveryDueDays: 20,
      deliveryDueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
    },
    apparelAndShipping: {
      customerProvidesApparel: false, creditCardCharge: false,
      shippingAndHandling: 45.00, shippingAndHandlingTaxed: false
    },
    vinylDetails: { namesFront: 0, namesBack: 0, numbersFront: 0, numbersBack: 0 },
    screenPrintingDetails: {
      newScreensNeeded: false, additionalScreens: 0, colorChanges: 0, inkType: 'Standard'
    },
    summary: {
      qty: 115, avgCost: 19.50, apparelCost: 1638.75, printingCost: 603.75,
      shippingCost: 45.00, taxCost: 0, totalCost: 2287.50
    },
    depositPercentage: 50, totalDueDays: 30
  }
];

// Test invoice data for completed orders
const testInvoices = [
  {
    customerName: 'Acme Corporation',
    companyName: 'Starter Apparel Co.',
    items: [
      { description: 'Gildan 5000 T-Shirts - Navy Blue (75 pcs)', quantity: 75, unitPrice: 8.50, total: 637.50, itemType: 'apparel' },
      { description: 'Screen Printing - 2 Colors Front', quantity: 75, unitPrice: 3.00, total: 225.00, itemType: 'printing' },
      { description: 'Shipping and Handling', quantity: 1, unitPrice: 25.00, total: 25.00, itemType: 'shipping' }
    ],
    subtotal: 887.50,
    taxRate: 8.25,
    discountAmount: 0,
    status: 'paid',
    terms: 'Net 30',
    payments: [
      { amount: 960.64, paymentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), paymentMethod: 'credit_card', reference: 'CC-001-2024' }
    ],
    invoiceDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
  },
  {
    customerName: 'Acme Corporation',
    companyName: 'Standard Fashion LLC',
    items: [
      { description: 'Next Level 3600 T-Shirts - Black (200 pcs)', quantity: 200, unitPrice: 9.50, total: 1900.00, itemType: 'apparel' },
      { description: 'Independent 4000 Hoodies - Charcoal (80 pcs)', quantity: 80, unitPrice: 28.00, total: 2240.00, itemType: 'apparel' },
      { description: 'Screen Printing - 3 Colors Front, 1 Color Back', quantity: 280, unitPrice: 4.91, total: 1375.00, itemType: 'printing' },
      { description: 'Artwork Fee', quantity: 1, unitPrice: 125.00, total: 125.00, itemType: 'setup' },
      { description: 'Shipping and Handling', quantity: 1, unitPrice: 81.19, total: 81.19, itemType: 'shipping' }
    ],
    subtotal: 5721.19,
    taxRate: 8.25,
    discountAmount: 0,
    status: 'paid',
    terms: 'Net 30',
    payments: [
      { amount: 3000.00, paymentDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), paymentMethod: 'check', reference: 'CHK-2024-001' },
      { amount: 3048.04, paymentDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), paymentMethod: 'credit_card', reference: 'CC-002-2024' }
    ],
    invoiceDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
  },
  {
    customerName: 'Local Sports Club',
    companyName: 'Standard Fashion LLC',
    items: [
      { description: 'Sport-Tek ST350 T-Shirts - True Red (250 pcs)', quantity: 250, unitPrice: 10.50, total: 2625.00, itemType: 'apparel' },
      { description: 'Screen Printing - 2 Colors Front, 3 Colors Back', quantity: 250, unitPrice: 4.75, total: 1187.50, itemType: 'printing' },
      { description: 'Shipping and Handling', quantity: 1, unitPrice: 65.00, total: 65.00, itemType: 'shipping' }
    ],
    subtotal: 3877.50,
    taxRate: 0,
    discountAmount: 0,
    status: 'paid',
    terms: 'Payment on Delivery',
    payments: [
      { amount: 3877.50, paymentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), paymentMethod: 'cash', reference: 'CASH-001' }
    ],
    invoiceDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000)
  },
  {
    customerName: 'Acme Corporation',
    companyName: 'Professional Garments Inc.',
    items: [
      { description: 'Port Authority K500 Polo Shirts - Navy Blue (300 pcs)', quantity: 300, unitPrice: 18.00, total: 5400.00, itemType: 'apparel' },
      { description: 'CornerStone CS410 Work Jackets - Brown Duck (90 pcs)', quantity: 90, unitPrice: 45.00, total: 4050.00, itemType: 'apparel' },
      { description: 'Embroidery - Front, Back, Left Sleeve', quantity: 390, unitPrice: 7.52, total: 2932.50, itemType: 'printing' },
      { description: 'Digitizing and Setup Fees', quantity: 1, unitPrice: 225.00, total: 225.00, itemType: 'setup' },
      { description: 'Shipping and Handling', quantity: 1, unitPrice: 135.31, total: 135.31, itemType: 'shipping' }
    ],
    subtotal: 12742.81,
    taxRate: 8.25,
    discountAmount: 0,
    status: 'paid',
    terms: 'Net 30',
    payments: [
      { amount: 6677.78, paymentDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), paymentMethod: 'bank_transfer', reference: 'ACH-2024-001' },
      { amount: 6677.78, paymentDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000), paymentMethod: 'bank_transfer', reference: 'ACH-2024-002' }
    ],
    invoiceDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  }
];

// Create test accounts
const createTestAccounts = async () => {
  try {
    console.log('Starting test account creation...');
    
    // Clear existing test data
    console.log('Clearing existing test data...');
    
    // Find test users first to get their IDs
    const testUsers = await User.find({ email: { $regex: /@test\.com$/ } });
    const testUserIds = testUsers.map(user => user._id);
    const testEmails = testUsers.map(user => user.email);
    
    // Delete in the correct order to avoid reference issues
    await Sale.deleteMany({ salesPersonId: { $in: testUserIds } });
    await Invoice.deleteMany({ createdBy: { $in: testUserIds } });
    await Quote.deleteMany({ createdBy: { $in: testUserIds } });
    await Customer.deleteMany({ createdBy: { $in: testUserIds } });
    await Price.deleteMany({ CompanyId: { $in: testUsers.map(u => u.companyId) } });
    await Company.deleteMany({ createdBy: { $in: testEmails } });
    await User.deleteMany({ email: { $regex: /@test\.com$/ } });
    
    console.log(`✅ Cleared data for ${testUsers.length} test users`);
    
    const createdCompanies = new Map();
    const createdCustomers = [];
    const companyAdminEmails = new Map(); // Map company name to admin email
    
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
        console.log(`Found existing company: ${company.name}`);
      } else {
        // Remove createdBy from company data since it's not part of the schema
        const { createdBy, ...companyData } = account.company;
        company = new Company(companyData);
        await company.save();
        createdCompanies.set(companyKey, company);
        console.log(`Created company: ${company.name}`);
      }
      
      // Store admin email for this company (only for admin users)
      if (account.user.role === 'admin') {
        companyAdminEmails.set(company.name, account.user.email);
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
          artCost: {
            firstColor: '35.00',
            additionalColor: '15.00',
            flatFee: '25.00',
            inkMarkup: '10.00',
            inkChargesPerPiece: '0.50',
            glitterOrPuff: '1.00',
            colorMatch: '25.00',
            inkColorChanges: '15.00',
            dtgDarkGarmentMarkup: '2.00',
            flashMarkup: '0.75'
          },
          wholesaleMarkup: {
            lessThan: '50',
            betweenStart: '50',
            betweenEnd: '144',
            over: '144',
            markupLessThan: '100',
            markupBetween: '75',
            markupOver: '50',
            andOrLessThan: '5.00',
            andOrBetween: '3.50',
            andOrOver: '2.00'
          },
          printingQuantityRanges: [
            { start: '1', end: '11' },
            { start: '12', end: '23' },
            { start: '24', end: '47' },
            { start: '48', end: '71' },
            { start: '72', end: '143' },
            { start: '144', end: '287' },
            { start: '288', end: '499' },
            { start: '500', end: '999' },
            { start: '1000', end: '2499' },
            { start: '2500', end: '4999' },
            { start: '5000', end: '9999' },
            { start: '10000', end: '999999' }
          ],
          printingLocationNames: ['Front', 'Back', 'Left Sleeve', 'Right Sleeve', 'Left Chest', 'Right Chest'],
          screenPrinting: {
            '1 color': ['8.50', '6.25', '4.75', '3.50', '2.85', '2.25', '1.95', '1.75', '1.50', '1.25', '1.10', '0.95'],
            '2 colors': ['12.50', '9.25', '7.25', '5.50', '4.35', '3.75', '3.25', '2.95', '2.65', '2.35', '2.10', '1.85'],
            '3 colors': ['16.50', '12.25', '9.75', '7.50', '5.85', '5.25', '4.55', '4.15', '3.80', '3.45', '3.10', '2.75'],
            '4 colors': ['20.50', '15.25', '12.25', '9.50', '7.35', '6.75', '5.85', '5.35', '4.95', '4.55', '4.10', '3.65'],
            '5 colors': ['24.50', '18.25', '14.75', '11.50', '8.85', '8.25', '7.15', '6.55', '6.10', '5.65', '5.10', '4.55'],
            '6 colors': ['28.50', '21.25', '17.25', '13.50', '10.35', '9.75', '8.45', '7.75', '7.25', '6.75', '6.10', '5.45'],
            '7 colors': ['32.50', '24.25', '19.75', '15.50', '11.85', '11.25', '9.75', '8.95', '8.40', '7.85', '7.10', '6.35'],
            '8 colors': ['36.50', '27.25', '22.25', '17.50', '13.35', '12.75', '11.05', '10.15', '9.55', '8.95', '8.10', '7.25'],
            '9 colors': ['40.50', '30.25', '24.75', '19.50', '14.85', '14.25', '12.35', '11.35', '10.70', '10.05', '9.10', '8.15'],
            '10 colors': ['44.50', '33.25', '27.25', '21.50', '16.35', '15.75', '13.65', '12.55', '11.85', '11.15', '10.10', '9.05'],
            '11 colors': ['48.50', '36.25', '29.75', '23.50', '17.85', '17.25', '14.95', '13.75', '13.00', '12.25', '11.10', '9.95'],
            '12 colors': ['52.50', '39.25', '32.25', '25.50', '19.35', '18.75', '16.25', '14.95', '14.15', '13.35', '12.10', '10.85'],
            perScreenNew: '45.00',
            perScreenExisting: '15.00'
          },
          preCutVinyl: {
            names: ['5.00', '4.50', '4.00', '3.50', '3.25', '3.00', '2.75'],
            numbers: ['3.00', '2.75', '2.50', '2.25', '2.00', '1.85', '1.75']
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
    for (const [companyName, company] of Array.from(createdCompanies.entries())) {
      console.log(`Creating customers for ${companyName}...`);
      
      // Find the admin user for this company
      const adminEmail = companyAdminEmails.get(companyName);
      console.log(`  Looking for admin user with email: ${adminEmail}`);
      const adminUser = await User.findOne({ 
        email: adminEmail,
        role: 'admin'
      });
      
      if (!adminUser) {
        console.error(`  ❌ Could not find admin user for company ${companyName}`);
        continue;
      }
      console.log(`  ✅ Found admin user: ${adminUser.firstName} ${adminUser.lastName}`);
      
      for (let i = 0; i < testCustomers.length; i++) {
        const customerData = testCustomers[i];
        // Make customer emails unique by adding company suffix
        const uniqueEmail = customerData.email.replace('@', `+${companyName.toLowerCase().replace(/\s+/g, '')}@`);
        
        const customer = new Customer({
          ...customerData,
          email: uniqueEmail,
          companyId: company._id,
          createdBy: adminUser._id,
          // Convert followUpNotes addedBy from email to user ID
          followUpNotes: customerData.followUpNotes.map(note => ({
            ...note,
            addedBy: adminUser._id
          }))
        });
        
        await customer.save();
        createdCustomers.push(customer);
        console.log(`  ✅ Created customer: ${customer.companyName} (${uniqueEmail})`);
      }
    }
    
    // Create test quotes
    console.log('Creating test quotes...');
    const createdQuotes = [];
    let quoteIndex = 0;
    
    for (const [companyName, company] of Array.from(createdCompanies.entries())) {
      const companyQuotes = testQuotes.filter(q => {
        if (companyName === 'Starter Apparel Co.') return quoteIndex < 3;
        if (companyName === 'Standard Fashion LLC') return quoteIndex >= 3 && quoteIndex < 6;
        if (companyName === 'Professional Garments Inc.') return quoteIndex >= 6;
        return false;
      });
      
      for (const quoteData of companyQuotes) {
        const customer = createdCustomers.find(c => 
          c.companyName === quoteData.customerName && c.companyId.equals(company._id)
        );
        
        if (!customer) {
          console.log(`Warning: Customer ${quoteData.customerName} not found for company ${companyName}`);
          continue;
        }
        
        // Generate quote number
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const quoteNumber = company.quoteIdFormat
          .replace('{YYYY}', year)
          .replace('{MM}', month)
          .replace('{DD}', day)
          .replace('{###}', String(quoteIndex + 1).padStart(3, '0'));
        
        const quote = new Quote({
          ...quoteData,
          companyId: company._id,
          selectedCustomerId: customer._id,
          quoteId: quoteNumber,
          CreatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          ModifiedAt: new Date()
        });
        
        await quote.save();
        createdQuotes.push(quote);
        console.log(`  ✅ Created quote: ${quote.quoteId} for ${quote.customerName} (${companyName})`);
        quoteIndex++;
      }
    }
    
    // Create invoices for completed orders
    console.log('Creating invoices for completed orders...');
    for (const invoiceData of testInvoices) {
      const company = Array.from(createdCompanies.values()).find(c => c.name === invoiceData.companyName);
      const customer = createdCustomers.find(c => 
        c.companyName === invoiceData.customerName && c.companyId.equals(company._id)
      );
      const relatedQuote = createdQuotes.find(q => 
        q.customerName === invoiceData.customerName && q.companyId.equals(company._id) && q.quoteType === 'completedOrders'
      );
      
      if (!company || !customer) {
        console.log(`Warning: Missing company or customer for invoice ${invoiceData.customerName}`);
        continue;
      }
      
      // Find admin user for this company
      const adminEmail = companyAdminEmails.get(company.name);
      const adminUser = await User.findOne({ 
        email: adminEmail,
        role: 'admin'
      });
      
      if (!adminUser) {
        console.log(`Warning: Could not find admin user for company ${company.name}`);
        continue;
      }
      
      // Generate invoice number
      const invoiceNumber = `INV-${company.name.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;
      
      const invoice = new Invoice({
        companyId: company._id,
        customerId: customer._id,
        quoteId: relatedQuote ? relatedQuote._id : undefined,
        invoiceNumber,
        invoiceDate: invoiceData.invoiceDate,
        dueDate: invoiceData.dueDate,
        status: invoiceData.status,
        items: invoiceData.items,
        // Set initial values - pre-save middleware will calculate correct values
        subtotal: invoiceData.subtotal,
        taxRate: invoiceData.taxRate,
        discountAmount: invoiceData.discountAmount,
        totalAmount: invoiceData.subtotal, // Will be recalculated
        balanceDue: invoiceData.subtotal, // Will be recalculated
        notes: `Generated from completed order for ${customer.companyName}`,
        terms: invoiceData.terms,
        payments: invoiceData.payments,
        sentDate: invoiceData.status !== 'draft' ? invoiceData.invoiceDate : undefined,
        paidDate: invoiceData.status === 'paid' ? invoiceData.payments[invoiceData.payments.length - 1].paymentDate : undefined,
        createdBy: adminUser._id
      });
      
      await invoice.save();
      console.log(`  ✅ Created invoice: ${invoice.invoiceNumber} for ${customer.companyName} - $${invoice.totalAmount.toFixed(2)}`);
      
      // Create sales record for paid invoices
      if (invoice.status === 'paid') {
        const sale = new Sale({
          orderId: relatedQuote ? relatedQuote._id : invoice._id,
          companyId: company._id,
          salesPersonId: adminUser._id,
          saleDate: invoice.paidDate,
          totalAmount: invoice.totalAmount
        });
        
        await sale.save();
        console.log(`    💰 Created sales record: $${sale.totalAmount.toFixed(2)} on ${sale.saleDate.toDateString()}`);
      }
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
    for (const [name, company] of Array.from(createdCompanies.entries())) {
      console.log(`   - ${name} (${company._id})`);
    }
    
    console.log('\n👥 Customers Created:');
    for (const customer of createdCustomers) {
      console.log(`   - ${customer.companyName} (${customer.contactName})`);
    }
    
    console.log('\n📄 Quotes Created:');
    console.log(`   - ${createdQuotes.length} quotes across different companies and types`);
    
    console.log('\n🧾 Invoices Created:');
    console.log(`   - ${testInvoices.length} invoices for completed orders`);
    
    console.log('\n💰 Sales Records:');
    const totalRevenue = testInvoices.reduce((sum, inv) => {
      const total = inv.subtotal + (inv.subtotal * inv.taxRate / 100) - inv.discountAmount;
      return sum + total;
    }, 0);
    console.log(`   - Total Revenue Generated: $${totalRevenue.toFixed(2)}`);
    
    console.log('\n📊 Revenue Breakdown by Company:');
    const revenueByCompany: Record<string, number> = {};
    testInvoices.forEach(inv => {
      const total = inv.subtotal + (inv.subtotal * inv.taxRate / 100) - inv.discountAmount;
      revenueByCompany[inv.companyName] = (revenueByCompany[inv.companyName] || 0) + total;
    });
    Object.entries(revenueByCompany).forEach(([company, revenue]) => {
      console.log(`   - ${company}: $${revenue.toFixed(2)}`);
    });
    
  } catch (error) {
    console.error('Error creating test accounts:', error);
  }
};

// Main execution
const main = async () => {
  try {
    console.log('🚀 Starting main execution...');
    await connectDB();
    console.log('✅ Database connected');
    await createTestAccounts();
    console.log('✅ Test accounts creation completed');
    await mongoose.connection.close();
    console.log('✅ Database connection closed.');
  } catch (error) {
    console.error('❌ Error in main execution:', error);
    process.exit(1);
  }
};

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { createTestAccounts, testAccounts, testCustomers, testQuotes };

