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
import Design from '../models/Design.js';
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

// Main account data for info@apparelquoter.com
const mainAccount = {
  user: {
    firstName: 'ApparelQuoter',
    lastName: 'Demo',
    email: 'info@apparelquoter.com',
    password: 'DemoPassword123!',
    role: 'admin',
    isActive: true,
    rememberMe: false
  },
  company: {
    name: 'ApparelQuoter Demo Company',
    streetAddress: '1234 Business Center Dr',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    phone: '512-555-0199',
    fax: '512-555-0198',
    email: 'info@apparelquoter.com',
    url: 'https://apparelquoter.com',
    paymentMethods: ['Cash', 'Check', 'Credit Card', 'PayPal', 'Venmo', 'Zelle'],
    salesTax: '8.25',
    creditCardCharge: '2.9',
    offerings: [
      'T-Shirts', 'Hoodies', 'Caps', 'Polo Shirts', 'Jackets', 
      'Tank Tops', 'Long Sleeves', 'Sweatshirts', 'Work Uniforms',
      'Custom Embroidery', 'Screen Printing', 'DTG Printing', 'Vinyl'
    ],
    quoteIdFormat: 'AQ-{YYYY}-{MM}-{DD}-{###}',
    createdBy: 'info@apparelquoter.com'
  },
  subscription: {
    planId: 'price_1PJR5iLifuqhaGkVkngdP981', // Professional Plan
    planName: 'Professional Plan',
    stripeCustomerId: 'cus_demo_apparelquoter',
    subscriptionId: 'sub_demo_apparelquoter'
  }
};

// Comprehensive customer data
const customers = [
  {
    companyName: 'TechStart Solutions',
    contactName: 'Sarah Johnson',
    address: '500 Innovation Blvd',
    address2: 'Suite 200',
    city: 'San Francisco',
    state: 'CA',
    zip: '94107',
    phone: '415-555-0101',
    email: 'sarah.johnson@techstart.com',
    followUpNotes: [
      {
        date: new Date('2024-01-15'),
        note: 'Initial contact - interested in company t-shirts for team building event. Looking for 50-100 shirts with custom logo.',
        addedBy: 'info@apparelquoter.com',
        addedDate: new Date('2024-01-15')
      },
      {
        date: new Date('2024-01-22'),
        note: 'Sent quote for 75 t-shirts. Client wants to see mockup before proceeding.',
        addedBy: 'info@apparelquoter.com',
        addedDate: new Date('2024-01-22')
      }
    ]
  },
  {
    companyName: 'Mountain View Restaurant Group',
    contactName: 'Michael Chen',
    address: '1200 Restaurant Row',
    city: 'Denver',
    state: 'CO',
    zip: '80202',
    phone: '303-555-0102',
    email: 'michael.chen@mvrestaurants.com',
    followUpNotes: [
      {
        date: new Date('2024-01-10'),
        note: 'Restaurant chain needs uniforms for staff. 5 locations, approximately 200 employees total.',
        addedBy: 'info@apparelquoter.com',
        addedDate: new Date('2024-01-10')
      }
    ]
  },
  {
    companyName: 'Sunshine Elementary School',
    contactName: 'Lisa Rodriguez',
    address: '789 Education Way',
    city: 'Phoenix',
    state: 'AZ',
    zip: '85001',
    phone: '602-555-0103',
    email: 'lisa.rodriguez@sunshineschool.edu',
    followUpNotes: [
      {
        date: new Date('2024-02-01'),
        note: 'PTA fundraiser - need 300 spirit shirts for school fundraising event.',
        addedBy: 'info@apparelquoter.com',
        addedDate: new Date('2024-02-01')
      }
    ]
  },
  {
    companyName: 'Elite Fitness Centers',
    contactName: 'David Williams',
    address: '2500 Fitness Blvd',
    city: 'Miami',
    state: 'FL',
    zip: '33101',
    phone: '305-555-0104',
    email: 'david.williams@elitefitness.com',
    followUpNotes: [
      {
        date: new Date('2024-01-28'),
        note: 'Gym chain expansion - need branded apparel for new locations. Tank tops, t-shirts, hoodies.',
        addedBy: 'info@apparelquoter.com',
        addedDate: new Date('2024-01-28')
      }
    ]
  },
  {
    companyName: 'Green Valley Construction',
    contactName: 'Jennifer Davis',
    address: '4100 Industrial Park Dr',
    city: 'Charlotte',
    state: 'NC',
    zip: '28201',
    phone: '704-555-0105',
    email: 'jennifer.davis@greenvalley.com',
    followUpNotes: [
      {
        date: new Date('2024-02-05'),
        note: 'Safety-compliant work shirts needed. High-vis colors, company logo embroidery.',
        addedBy: 'info@apparelquoter.com',
        addedDate: new Date('2024-02-05')
      }
    ]
  },
  {
    companyName: 'Riverside Medical Center',
    contactName: 'Dr. Robert Thompson',
    address: '1800 Healthcare Plaza',
    city: 'Portland',
    state: 'OR',
    zip: '97201',
    phone: '503-555-0106',
    email: 'robert.thompson@riverside.health',
    followUpNotes: [
      {
        date: new Date('2024-01-20'),
        note: 'Medical scrubs and polo shirts for administrative staff. Need specific colors for different departments.',
        addedBy: 'info@apparelquoter.com',
        addedDate: new Date('2024-01-20')
      }
    ]
  },
  {
    companyName: 'Thunder Bay Sports Club',
    contactName: 'Amanda Martinez',
    address: '3300 Athletic Center Way',
    city: 'Seattle',
    state: 'WA',
    zip: '98101',
    phone: '206-555-0107',
    email: 'amanda.martinez@thunderbay.sports',
    followUpNotes: [
      {
        date: new Date('2024-02-10'),
        note: 'Youth sports league uniforms. Multiple teams, different colors. Embroidered team names and numbers.',
        addedBy: 'info@apparelquoter.com',
        addedDate: new Date('2024-02-10')
      }
    ]
  },
  {
    companyName: 'Metro Law Firm',
    contactName: 'Charles Anderson',
    address: '900 Legal Plaza',
    city: 'Chicago',
    state: 'IL',
    zip: '60601',
    phone: '312-555-0108',
    email: 'charles.anderson@metrolaw.com',
    followUpNotes: [
      {
        date: new Date('2024-01-25'),
        note: 'Professional polo shirts for casual Friday. Conservative colors, embroidered firm logo.',
        addedBy: 'info@apparelquoter.com',
        addedDate: new Date('2024-01-25')
      }
    ]
  },
  {
    companyName: 'Craft Beer Brewery',
    contactName: 'Jessica Wilson',
    address: '1500 Brewery District',
    city: 'Nashville',
    state: 'TN',
    zip: '37201',
    phone: '615-555-0109',
    email: 'jessica.wilson@craftbeer.com',
    followUpNotes: [
      {
        date: new Date('2024-02-08'),
        note: 'Merchandise for taproom - t-shirts, hoodies, caps. Creative designs with brewery branding.',
        addedBy: 'info@apparelquoter.com',
        addedDate: new Date('2024-02-08')
      }
    ]
  },
  {
    companyName: 'Volunteer Fire Department',
    contactName: 'Captain Mark Taylor',
    address: '200 Fire Station Rd',
    city: 'Richmond',
    state: 'VA',
    zip: '23201',
    phone: '804-555-0110',
    email: 'mark.taylor@volunteerfire.org',
    followUpNotes: [
      {
        date: new Date('2024-01-30'),
        note: 'Department t-shirts and hoodies for fundraising event. Fire department logo and motto.',
        addedBy: 'info@apparelquoter.com',
        addedDate: new Date('2024-01-30')
      }
    ]
  },
  {
    companyName: 'Digital Marketing Agency',
    contactName: 'Rachel Kim',
    address: '750 Creative Commons',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90028',
    phone: '323-555-0111',
    email: 'rachel.kim@digitalmarketing.com',
    followUpNotes: [
      {
        date: new Date('2024-02-03'),
        note: 'Agency rebrand - need new branded apparel for team. Modern designs, trendy colors.',
        addedBy: 'info@apparelquoter.com',
        addedDate: new Date('2024-02-03')
      }
    ]
  },
  {
    companyName: 'University Bookstore',
    contactName: 'Professor James Lee',
    address: '100 Campus Center',
    city: 'Madison',
    state: 'WI',
    zip: '53701',
    phone: '608-555-0112',
    email: 'james.lee@university.edu',
    followUpNotes: [
      {
        date: new Date('2024-01-18'),
        note: 'Graduation merchandise - t-shirts, hoodies, caps with university branding for spring graduation.',
        addedBy: 'info@apparelquoter.com',
        addedDate: new Date('2024-01-18')
      }
    ]
  }
];

// Comprehensive quotes data
const quotes = [
  {
    customerName: 'TechStart Solutions',
    quoteType: 'savedQuotes',
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
      deliveryDueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
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
    depositPercentage: 50, totalDueDays: 30
  },
  {
    customerName: 'Mountain View Restaurant Group',
    quoteType: 'openOrders',
    items: [{
      brandAndStyle: 'Port Authority K500 - Silk Touch Polo',
      color: 'White',
      standardPrice: 18.00,
      sizes: { XS: 10, S: 40, M: 80, L: 50, XL: 20, '2XL': 0, '3XL': 0, '4XL': 0, '5XL': 0 }
    }],
    embroideryDetails: {
      stitchesFront: 5000, hoopingFeeFront: true, stitchesBack: 0, hoopingFeeBack: false,
      stitchesLeft: 0, hoopingFeeLeft: false, stitchesRight: 0, hoopingFeeRight: false,
      digitizingCost: 50.00, setupFee: 25.00, artworkFee: 0
    },
    printingOptions: {
      colorsFront: 0, flashFront: false, dtgDarkFront: false,
      colorsBack: 0, flashBack: false, dtgDarkBack: false,
      colorsLeft: 0, flashLeft: false, dtgDarkLeft: false,
      colorsRight: 0, flashRight: false, dtgDarkRight: false
    },
    printingDetails: {
      colorMatches: 0, artworkNeeded: false, deliveryDueDays: 21,
      deliveryDueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
    },
    apparelAndShipping: {
      customerProvidesApparel: false, creditCardCharge: true,
      shippingAndHandling: 45.00, shippingAndHandlingTaxed: false
    },
    vinylDetails: { namesFront: 0, namesBack: 0, numbersFront: 0, numbersBack: 0 },
    screenPrintingDetails: {
      newScreensNeeded: false, additionalScreens: 0, colorChanges: 0, inkType: 'Standard'
    },
    summary: {
      qty: 200, avgCost: 22.50, apparelCost: 3600.00, printingCost: 1075.00,
      shippingCost: 45.00, taxCost: 388.95, totalCost: 5108.95
    },
    depositPercentage: 50, totalDueDays: 30
  },
  {
    customerName: 'Sunshine Elementary School',
    quoteType: 'completedOrders',
    items: [{
      brandAndStyle: 'Gildan 8000B - Youth DryBlend T-Shirt',
      color: 'Gold',
      standardPrice: 6.50,
      sizes: { XS: 50, S: 100, M: 100, L: 50, XL: 0, '2XL': 0, '3XL': 0, '4XL': 0, '5XL': 0 }
    }],
    embroideryDetails: {
      stitchesFront: 0, hoopingFeeFront: false, stitchesBack: 0, hoopingFeeBack: false,
      stitchesLeft: 0, hoopingFeeLeft: false, stitchesRight: 0, hoopingFeeRight: false,
      digitizingCost: 0, setupFee: 0, artworkFee: 0
    },
    printingOptions: {
      colorsFront: 3, flashFront: false, dtgDarkFront: false,
      colorsBack: 1, flashBack: false, dtgDarkBack: false,
      colorsLeft: 0, flashLeft: false, dtgDarkLeft: false,
      colorsRight: 0, flashRight: false, dtgDarkRight: false
    },
    printingDetails: {
      colorMatches: 1, artworkNeeded: true, deliveryDueDays: 10,
      deliveryDueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // Completed 5 days ago
    },
    apparelAndShipping: {
      customerProvidesApparel: false, creditCardCharge: false,
      shippingAndHandling: 35.00, shippingAndHandlingTaxed: false
    },
    vinylDetails: { namesFront: 0, namesBack: 0, numbersFront: 0, numbersBack: 0 },
    screenPrintingDetails: {
      newScreensNeeded: true, additionalScreens: 1, colorChanges: 1, inkType: 'Standard'
    },
    summary: {
      qty: 300, avgCost: 9.25, apparelCost: 1950.00, printingCost: 825.00,
      shippingCost: 35.00, taxCost: 0, totalCost: 2810.00
    },
    depositPercentage: 100, totalDueDays: 0
  },
  {
    customerName: 'Elite Fitness Centers',
    quoteType: 'savedQuotes',
    items: [
      {
        brandAndStyle: 'Next Level 3633 - Premium Tank Top',
        color: 'Charcoal',
        standardPrice: 9.50,
        sizes: { XS: 10, S: 30, M: 40, L: 30, XL: 15, '2XL': 5, '3XL': 0, '4XL': 0, '5XL': 0 }
      },
      {
        brandAndStyle: 'Champion S700 - Double Dry T-Shirt',
        color: 'Athletic Red',
        standardPrice: 11.00,
        sizes: { XS: 5, S: 20, M: 30, L: 25, XL: 15, '2XL': 5, '3XL': 0, '4XL': 0, '5XL': 0 }
      }
    ],
    embroideryDetails: {
      stitchesFront: 0, hoopingFeeFront: false, stitchesBack: 0, hoopingFeeBack: false,
      stitchesLeft: 0, hoopingFeeLeft: false, stitchesRight: 0, hoopingFeeRight: false,
      digitizingCost: 0, setupFee: 0, artworkFee: 75.00
    },
    printingOptions: {
      colorsFront: 2, flashFront: false, dtgDarkFront: true,
      colorsBack: 0, flashBack: false, dtgDarkBack: false,
      colorsLeft: 0, flashLeft: false, dtgDarkLeft: false,
      colorsRight: 0, flashRight: false, dtgDarkRight: false
    },
    printingDetails: {
      colorMatches: 0, artworkNeeded: true, deliveryDueDays: 18,
      deliveryDueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000)
    },
    apparelAndShipping: {
      customerProvidesApparel: false, creditCardCharge: true,
      shippingAndHandling: 55.00, shippingAndHandlingTaxed: true
    },
    vinylDetails: { namesFront: 0, namesBack: 0, numbersFront: 0, numbersBack: 0 },
    screenPrintingDetails: {
      newScreensNeeded: true, additionalScreens: 0, colorChanges: 0, inkType: 'Water-based'
    },
    summary: {
      qty: 230, avgCost: 14.75, apparelCost: 2415.00, printingCost: 975.00,
      shippingCost: 59.54, taxCost: 284.04, totalCost: 3733.58
    },
    depositPercentage: 50, totalDueDays: 30
  }
];

// Comprehensive invoice data for demo account
const invoices = [
  {
    customerName: 'TechStart Solutions',
    items: [
      { description: 'Gildan 5000 T-Shirts - Navy Blue (75 pcs)', quantity: 75, unitPrice: 8.50, total: 637.50, itemType: 'apparel' },
      { description: 'Screen Printing - 2 Colors Front', quantity: 75, unitPrice: 3.00, total: 225.00, itemType: 'printing' },
      { description: 'Shipping and Handling', quantity: 1, unitPrice: 25.00, total: 25.00, itemType: 'shipping' }
    ],
    subtotal: 887.50,
    taxRate: 8.25,
    discountAmount: 0,
    status: 'paid' as const,
    terms: 'Net 30',
    payments: [
      { amount: 960.64, paymentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), paymentMethod: 'credit_card' as const, reference: 'CC-TS-001' }
    ],
    invoiceDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
  },
  {
    customerName: 'Mountain View Restaurant Group',
    items: [
      { description: 'Port Authority K500 Polo Shirts - White (200 pcs)', quantity: 200, unitPrice: 18.00, total: 3600.00, itemType: 'apparel' },
      { description: 'Embroidery - Front Logo (5000 stitches)', quantity: 200, unitPrice: 5.38, total: 1075.00, itemType: 'printing' },
      { description: 'Digitizing and Setup Fees', quantity: 1, unitPrice: 75.00, total: 75.00, itemType: 'setup' },
      { description: 'Shipping and Handling', quantity: 1, unitPrice: 45.00, total: 45.00, itemType: 'shipping' }
    ],
    subtotal: 4795.00,
    taxRate: 8.25,
    discountAmount: 0,
    status: 'paid' as const,
    terms: 'Net 30',
    payments: [
      { amount: 2500.00, paymentDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), paymentMethod: 'check' as const, reference: 'CHK-MVR-001' },
      { amount: 2690.59, paymentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), paymentMethod: 'bank_transfer' as const, reference: 'ACH-MVR-001' }
    ],
    invoiceDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    customerName: 'Sunshine Elementary School',
    items: [
      { description: 'Gildan 8000B Youth T-Shirts - Gold (300 pcs)', quantity: 300, unitPrice: 6.50, total: 1950.00, itemType: 'apparel' },
      { description: 'Screen Printing - 3 Colors Front, 1 Color Back', quantity: 300, unitPrice: 2.75, total: 825.00, itemType: 'printing' },
      { description: 'Shipping and Handling', quantity: 1, unitPrice: 35.00, total: 35.00, itemType: 'shipping' }
    ],
    subtotal: 2810.00,
    taxRate: 0,
    discountAmount: 100.00,
    status: 'paid' as const,
    terms: 'Payment on Delivery',
    payments: [
      { amount: 2710.00, paymentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), paymentMethod: 'cash' as const, reference: 'CASH-SES-001' }
    ],
    invoiceDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000)
  },
  {
    customerName: 'Elite Fitness Centers',
    items: [
      { description: 'Next Level 3633 Tank Tops - Charcoal (130 pcs)', quantity: 130, unitPrice: 9.50, total: 1235.00, itemType: 'apparel' },
      { description: 'Champion S700 T-Shirts - Athletic Red (100 pcs)', quantity: 100, unitPrice: 11.00, total: 1100.00, itemType: 'apparel' },
      { description: 'DTG Printing - Full Color Front', quantity: 230, unitPrice: 4.25, total: 977.50, itemType: 'printing' },
      { description: 'Artwork Fee', quantity: 1, unitPrice: 75.00, total: 75.00, itemType: 'setup' },
      { description: 'Shipping and Handling', quantity: 1, unitPrice: 59.54, total: 59.54, itemType: 'shipping' }
    ],
    subtotal: 3447.04,
    taxRate: 8.25,
    discountAmount: 0,
    status: 'sent' as const,
    terms: 'Net 30',
    payments: [],
    invoiceDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
  },
  {
    customerName: 'Green Valley Construction',
    items: [
      { description: 'CornerStone CS410 Work Jackets - Hi-Vis Orange (50 pcs)', quantity: 50, unitPrice: 45.00, total: 2250.00, itemType: 'apparel' },
      { description: 'Port Authority K500 Polo Shirts - Hi-Vis Yellow (100 pcs)', quantity: 100, unitPrice: 18.00, total: 1800.00, itemType: 'apparel' },
      { description: 'Embroidery - Company Logo (6000 stitches)', quantity: 150, unitPrice: 8.50, total: 1275.00, itemType: 'printing' },
      { description: 'Digitizing and Setup Fees', quantity: 1, unitPrice: 125.00, total: 125.00, itemType: 'setup' },
      { description: 'Shipping and Handling', quantity: 1, unitPrice: 85.00, total: 85.00, itemType: 'shipping' }
    ],
    subtotal: 5535.00,
    taxRate: 8.25,
    discountAmount: 200.00,
    status: 'paid' as const,
    terms: 'Net 30',
    payments: [
      { amount: 2750.00, paymentDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), paymentMethod: 'check' as const, reference: 'CHK-GVC-001' },
      { amount: 3025.14, paymentDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), paymentMethod: 'check' as const, reference: 'CHK-GVC-002' }
    ],
    invoiceDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
  },
  {
    customerName: 'Riverside Medical Center',
    items: [
      { description: 'Cherokee Workwear Scrub Tops - Navy (75 pcs)', quantity: 75, unitPrice: 22.00, total: 1650.00, itemType: 'apparel' },
      { description: 'Cherokee Workwear Scrub Pants - Navy (75 pcs)', quantity: 75, unitPrice: 20.00, total: 1500.00, itemType: 'apparel' },
      { description: 'Port Authority K500 Polo Shirts - White (25 pcs)', quantity: 25, unitPrice: 18.00, total: 450.00, itemType: 'apparel' },
      { description: 'Embroidery - Medical Center Logo', quantity: 100, unitPrice: 6.75, total: 675.00, itemType: 'printing' },
      { description: 'Digitizing Fee', quantity: 1, unitPrice: 85.00, total: 85.00, itemType: 'setup' },
      { description: 'Shipping and Handling', quantity: 1, unitPrice: 65.00, total: 65.00, itemType: 'shipping' }
    ],
    subtotal: 4425.00,
    taxRate: 8.25,
    discountAmount: 150.00,
    status: 'paid' as const,
    terms: 'Net 45',
    payments: [
      { amount: 4790.06, paymentDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), paymentMethod: 'bank_transfer' as const, reference: 'ACH-RMC-001' }
    ],
    invoiceDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000)
  },
  {
    customerName: 'Thunder Bay Sports Club',
    items: [
      { description: 'Sport-Tek ST350 Performance Tees - Royal Blue (120 pcs)', quantity: 120, unitPrice: 10.50, total: 1260.00, itemType: 'apparel' },
      { description: 'Sport-Tek ST350 Performance Tees - White (80 pcs)', quantity: 80, unitPrice: 10.50, total: 840.00, itemType: 'apparel' },
      { description: 'Screen Printing - Team Numbers and Names', quantity: 200, unitPrice: 3.25, total: 650.00, itemType: 'printing' },
      { description: 'Embroidery - Team Logo', quantity: 200, unitPrice: 4.50, total: 900.00, itemType: 'printing' },
      { description: 'Setup and Digitizing Fees', quantity: 1, unitPrice: 150.00, total: 150.00, itemType: 'setup' },
      { description: 'Shipping and Handling', quantity: 1, unitPrice: 75.00, total: 75.00, itemType: 'shipping' }
    ],
    subtotal: 3875.00,
    taxRate: 8.25,
    discountAmount: 0,
    status: 'overdue' as const,
    terms: 'Net 30',
    payments: [
      { amount: 2000.00, paymentDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), paymentMethod: 'check' as const, reference: 'CHK-TBSC-001' }
    ],
    invoiceDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
  },
  {
    customerName: 'Metro Law Firm',
    items: [
      { description: 'Port Authority K500 Polo Shirts - Navy (40 pcs)', quantity: 40, unitPrice: 18.00, total: 720.00, itemType: 'apparel' },
      { description: 'Port Authority K500 Polo Shirts - White (35 pcs)', quantity: 35, unitPrice: 18.00, total: 630.00, itemType: 'apparel' },
      { description: 'Embroidery - Law Firm Logo', quantity: 75, unitPrice: 5.25, total: 393.75, itemType: 'printing' },
      { description: 'Digitizing Fee', quantity: 1, unitPrice: 75.00, total: 75.00, itemType: 'setup' },
      { description: 'Shipping and Handling', quantity: 1, unitPrice: 35.00, total: 35.00, itemType: 'shipping' }
    ],
    subtotal: 1853.75,
    taxRate: 8.25,
    discountAmount: 50.00,
    status: 'paid' as const,
    terms: 'Net 30',
    payments: [
      { amount: 1952.03, paymentDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), paymentMethod: 'credit_card' as const, reference: 'CC-MLF-001' }
    ],
    invoiceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now())
  },
  {
    customerName: 'Craft Beer Brewery',
    items: [
      { description: 'Next Level 3600 T-Shirts - Charcoal (150 pcs)', quantity: 150, unitPrice: 9.50, total: 1425.00, itemType: 'apparel' },
      { description: 'Independent 4000 Hoodies - Black (75 pcs)', quantity: 75, unitPrice: 28.00, total: 2100.00, itemType: 'apparel' },
      { description: 'Yupoong 6245CM Caps - Black (100 pcs)', quantity: 100, unitPrice: 12.00, total: 1200.00, itemType: 'apparel' },
      { description: 'Screen Printing - Brewery Logo and Design', quantity: 325, unitPrice: 3.85, total: 1251.25, itemType: 'printing' },
      { description: 'Embroidery - Caps Logo', quantity: 100, unitPrice: 4.25, total: 425.00, itemType: 'printing' },
      { description: 'Artwork and Setup Fees', quantity: 1, unitPrice: 200.00, total: 200.00, itemType: 'setup' },
      { description: 'Shipping and Handling', quantity: 1, unitPrice: 95.00, total: 95.00, itemType: 'shipping' }
    ],
    subtotal: 6696.25,
    taxRate: 8.25,
    discountAmount: 250.00,
    status: 'sent' as const,
    terms: 'Net 30',
    payments: [],
    invoiceDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000)
  },
  {
    customerName: 'Volunteer Fire Department',
    items: [
      { description: 'Gildan 5000 T-Shirts - Red (200 pcs)', quantity: 200, unitPrice: 8.50, total: 1700.00, itemType: 'apparel' },
      { description: 'Jerzees 996 Hoodies - Navy (100 pcs)', quantity: 100, unitPrice: 24.00, total: 2400.00, itemType: 'apparel' },
      { description: 'Screen Printing - Fire Department Logo', quantity: 300, unitPrice: 3.50, total: 1050.00, itemType: 'printing' },
      { description: 'Setup Fees', quantity: 1, unitPrice: 75.00, total: 75.00, itemType: 'setup' },
      { description: 'Shipping and Handling', quantity: 1, unitPrice: 85.00, total: 85.00, itemType: 'shipping' }
    ],
    subtotal: 5310.00,
    taxRate: 0,
    discountAmount: 300.00,
    status: 'paid' as const,
    terms: 'Net 30',
    payments: [
      { amount: 5010.00, paymentDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), paymentMethod: 'check' as const, reference: 'CHK-VFD-001' }
    ],
    invoiceDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
  },
  {
    customerName: 'Digital Marketing Agency',
    items: [
      { description: 'Bella Canvas 3001 T-Shirts - Heather Grey (80 pcs)', quantity: 80, unitPrice: 7.25, total: 580.00, itemType: 'apparel' },
      { description: 'Alternative 9573 Hoodies - Eco Black (40 pcs)', quantity: 40, unitPrice: 32.00, total: 1280.00, itemType: 'apparel' },
      { description: 'DTG Printing - Full Color Design', quantity: 120, unitPrice: 5.50, total: 660.00, itemType: 'printing' },
      { description: 'Artwork and Design Fee', quantity: 1, unitPrice: 250.00, total: 250.00, itemType: 'setup' },
      { description: 'Shipping and Handling', quantity: 1, unitPrice: 45.00, total: 45.00, itemType: 'shipping' }
    ],
    subtotal: 2815.00,
    taxRate: 8.25,
    discountAmount: 100.00,
    status: 'draft' as const,
    terms: 'Net 30',
    payments: [],
    invoiceDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000)
  },
  {
    customerName: 'University Bookstore',
    items: [
      { description: 'Champion S700 T-Shirts - Navy (300 pcs)', quantity: 300, unitPrice: 11.00, total: 3300.00, itemType: 'apparel' },
      { description: 'Jerzees 996 Hoodies - Navy (150 pcs)', quantity: 150, unitPrice: 24.00, total: 3600.00, itemType: 'apparel' },
      { description: 'Yupoong 6245CM Caps - Navy (200 pcs)', quantity: 200, unitPrice: 12.00, total: 2400.00, itemType: 'apparel' },
      { description: 'Screen Printing - University Logo', quantity: 650, unitPrice: 2.95, total: 1917.50, itemType: 'printing' },
      { description: 'Embroidery - Caps Logo', quantity: 200, unitPrice: 4.00, total: 800.00, itemType: 'printing' },
      { description: 'Setup and Screen Fees', quantity: 1, unitPrice: 150.00, total: 150.00, itemType: 'setup' },
      { description: 'Shipping and Handling', quantity: 1, unitPrice: 125.00, total: 125.00, itemType: 'shipping' }
    ],
    subtotal: 12292.50,
    taxRate: 0,
    discountAmount: 500.00,
    status: 'paid' as const,
    terms: 'Net 45',
    payments: [
      { amount: 6000.00, paymentDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), paymentMethod: 'bank_transfer' as const, reference: 'ACH-UBS-001' },
      { amount: 5792.50, paymentDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), paymentMethod: 'bank_transfer' as const, reference: 'ACH-UBS-002' }
    ],
    invoiceDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
  }
];

// Default pricing structure
const defaultPricing = {
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
};

// Sample designs data
const designs = [
  {
    title: 'TechStart Logo Design',
    description: 'Company logo with modern typography and tech elements',
    category: 'logo',
    status: 'approved',
    priority: 'medium',
    tags: ['corporate', 'technology', 'modern'],
    versions: [
      {
        versionNumber: '1.0',
        fileName: 'techstart-logo-v1.png',
        fileUrl: '/uploads/designs/techstart-logo.png',
        fileSize: 125000,
        mimeType: 'image/png',
        isApproved: true,
        notes: 'Initial approved logo design'
      }
    ],
    customerName: 'TechStart Solutions'
  },
  {
    title: 'Restaurant Group Uniform Design',
    description: 'Professional restaurant branding for staff uniforms',
    category: 'apparel',
    status: 'in_review',
    priority: 'high',
    tags: ['restaurant', 'professional', 'embroidery'],
    versions: [
      {
        versionNumber: '1.0',
        fileName: 'restaurant-uniform-v1.png',
        fileUrl: '/uploads/designs/restaurant-uniform.png',
        fileSize: 98000,
        mimeType: 'image/png',
        isApproved: false,
        notes: 'Initial uniform design concept'
      }
    ],
    customerName: 'Mountain View Restaurant Group'
  },
  {
    title: 'School Spirit Design',
    description: 'Colorful school mascot design for fundraising shirts',
    category: 'graphic',
    status: 'completed',
    priority: 'medium',
    tags: ['school', 'mascot', 'fundraising', 'colorful'],
    versions: [
      {
        versionNumber: '1.0',
        fileName: 'school-spirit-v1.png',
        fileUrl: '/uploads/designs/school-spirit.png',
        fileSize: 156000,
        mimeType: 'image/png',
        isApproved: true,
        notes: 'Final approved school spirit design'
      }
    ],
    customerName: 'Sunshine Elementary School',
    completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // Completed 10 days ago
  },
  {
    title: 'Fitness Center Branding Package',
    description: 'Complete branding package for gym merchandise',
    category: 'layout',
    status: 'draft',
    priority: 'medium',
    tags: ['fitness', 'branding', 'merchandise'],
    versions: [
      {
        versionNumber: '0.1',
        fileName: 'fitness-branding-draft.png',
        fileUrl: '/uploads/designs/fitness-branding.png',
        fileSize: 89000,
        mimeType: 'image/png',
        isApproved: false,
        notes: 'Initial concept for review'
      }
    ],
    customerName: 'Elite Fitness Centers'
  }
];

// Create comprehensive data for ApparelQuoter account
const seedApparelQuoterData = async () => {
  try {
    console.log('🚀 Starting ApparelQuoter data seeding...');
    
    // Clear existing data for this account
    console.log('🧹 Clearing existing data for info@apparelquoter.com...');
    const existingUser = await User.findOne({ email: mainAccount.user.email });
    if (existingUser) {
      await User.deleteMany({ email: mainAccount.user.email });
      await Company.deleteMany({ createdBy: mainAccount.user.email });
      await Customer.deleteMany({ createdBy: existingUser._id });
      await Quote.deleteMany({ createdBy: existingUser._id });
      await Price.deleteMany({ CompanyId: existingUser.companyId });
      await Design.deleteMany({ createdBy: existingUser._id });
      await Invoice.deleteMany({ createdBy: existingUser._id });
      await Sale.deleteMany({ salesPersonId: existingUser._id });
      console.log('✅ Existing data cleared');
    }
    
    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(mainAccount.user.password, 12);
    
    // Create company
    console.log('🏢 Creating company...');
    const company = new Company(mainAccount.company);
    await company.save();
    console.log(`✅ Created company: ${company.name}`);
    
    // Create user
    console.log('👤 Creating user...');
    const user = new User({
      ...mainAccount.user,
      password: hashedPassword,
      companyId: company._id,
      stripeCustomerId: mainAccount.subscription.stripeCustomerId,
      subscriptionId: mainAccount.subscription.subscriptionId
    });
    await user.save();
    console.log(`✅ Created user: ${user.email} (${user.role})`);
    
    // Create default pricing
    console.log('💰 Creating pricing structure...');
    const pricing = new Price({
      CompanyId: company._id,
      ...defaultPricing
    });
    await pricing.save();
    console.log('✅ Created default pricing structure');
    
    // Create customers
    console.log('👥 Creating customers...');
    const createdCustomers = [];
    for (const customerData of customers) {
      const customer = new Customer({
        ...customerData,
        companyId: company._id,
        createdBy: user._id,
        // Convert followUpNotes addedBy from email to user ID
        followUpNotes: customerData.followUpNotes.map(note => ({
          ...note,
          addedBy: user._id
        }))
      });
      await customer.save();
      createdCustomers.push(customer);
      console.log(`  ✅ Created customer: ${customer.companyName}`);
    }
    
    // Create quotes
    console.log('📄 Creating quotes...');
    for (let i = 0; i < quotes.length; i++) {
      const quoteData = quotes[i];
      const customer = createdCustomers.find(c => c.companyName === quoteData.customerName);
      
      // Generate quote ID
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const quoteId = company.quoteIdFormat
        .replace('{YYYY}', year)
        .replace('{MM}', month)
        .replace('{DD}', day)
        .replace('{###}', String(i + 1).padStart(3, '0'));
      
      const quote = new Quote({
        ...quoteData,
        companyId: company._id,
        selectedCustomerId: customer ? customer._id : null,
        quoteId: quoteId,
        CreatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        ModifiedAt: new Date()
      });
      
      await quote.save();
      console.log(`  ✅ Created quote: ${quote.quoteId} for ${quote.customerName}`);
    }
    
    // Create designs
    console.log('🎨 Creating designs...');
    for (const designData of designs) {
      const customer = createdCustomers.find(c => c.companyName === designData.customerName);
      if (!customer) {
        console.log(`  ⚠️  Skipping design ${designData.title} - customer not found`);
        continue;
      }

      // Process versions to include uploadedBy
      const processedVersions = designData.versions.map(version => ({
        ...version,
        uploadedBy: user._id,
        uploadedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        approvedBy: version.isApproved ? user._id : undefined,
        approvedAt: version.isApproved ? new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000) : undefined
      }));

      const design = new Design({
        ...designData,
        companyId: company._id,
        customerId: customer._id,
        createdBy: user._id,
        versions: processedVersions,
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Random date within last 60 days
        updatedAt: new Date()
      });
      
      // Remove customerName as it's not part of the schema
      delete design.customerName;
      
      await design.save();
      console.log(`  ✅ Created design: ${design.title} for ${customer.companyName}`);
    }
    
    // Create comprehensive invoices
    console.log('🧾 Creating invoices...');
    const createdInvoices: any[] = [];
    for (const invoiceData of invoices) {
      const customer = createdCustomers.find(c => c.companyName === invoiceData.customerName);
      if (!customer) {
        console.log(`  ⚠️  Skipping invoice for ${invoiceData.customerName} - customer not found`);
        continue;
      }

      const relatedQuote = quotes.find(q => q.customerName === invoiceData.customerName);
      
      // Generate invoice number
      const invoiceNumber = `AQ-INV-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
      
      const invoice = new Invoice({
        companyId: company._id,
        customerId: customer._id,
        quoteId: relatedQuote ? undefined : undefined, // Link to quote if needed
        invoiceNumber,
        invoiceDate: invoiceData.invoiceDate,
        dueDate: invoiceData.dueDate,
        status: invoiceData.status,
        items: invoiceData.items,
        subtotal: invoiceData.subtotal,
        taxRate: invoiceData.taxRate,
        discountAmount: invoiceData.discountAmount,
        notes: `Professional invoice for ${customer.companyName}`,
        terms: invoiceData.terms,
        payments: invoiceData.payments,
        sentDate: invoiceData.status !== 'draft' ? invoiceData.invoiceDate : undefined,
        paidDate: invoiceData.status === 'paid' ? invoiceData.payments[invoiceData.payments.length - 1]?.paymentDate : undefined,
        createdBy: user._id
      });
      
      await invoice.save();
      createdInvoices.push(invoice);
      console.log(`  ✅ Created invoice: ${invoice.invoiceNumber} for ${customer.companyName} - $${invoice.totalAmount.toFixed(2)}`);
      
      // Create sales record for paid invoices
      if (invoice.status === 'paid') {
        const sale = new Sale({
          orderId: invoice._id,
          companyId: company._id,
          salesPersonId: user._id,
          saleDate: invoice.paidDate || invoice.invoiceDate,
          totalAmount: invoice.totalAmount
        });
        
        await sale.save();
        console.log(`    💰 Created sales record: $${sale.totalAmount.toFixed(2)} on ${sale.saleDate.toDateString()}`);
      }
    }
    
    console.log('\n🎉 ApparelQuoter data seeding completed successfully!');
    console.log('\n📋 Data Summary:');
    console.log('================');
    console.log(`👤 User: ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`🔑 Password: ${mainAccount.user.password}`);
    console.log(`🏢 Company: ${company.name}`);
    console.log(`💳 Plan: ${mainAccount.subscription.planName}`);
    console.log(`👥 Customers: ${createdCustomers.length}`);
    console.log(`📄 Quotes: ${quotes.length}`);
    console.log(`🎨 Designs: ${designs.length}`);
    console.log(`🧾 Invoices: ${createdInvoices.length}`);
    console.log(`💰 Pricing: Comprehensive structure created`);
    
    // Calculate total revenue and statistics
    const totalRevenue = createdInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const paidInvoices = createdInvoices.filter(inv => inv.status === 'paid');
    const paidRevenue = paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const pendingRevenue = totalRevenue - paidRevenue;
    
    console.log('\n💸 Financial Summary:');
    console.log(`  Total Revenue: $${totalRevenue.toFixed(2)}`);
    console.log(`  Paid Revenue: $${paidRevenue.toFixed(2)} (${paidInvoices.length} invoices)`);
    console.log(`  Pending Revenue: $${pendingRevenue.toFixed(2)} (${createdInvoices.length - paidInvoices.length} invoices)`);
    
    console.log('\n🔍 Customer Breakdown:');
    createdCustomers.forEach((customer, index) => {
      const customerInvoices = createdInvoices.filter(inv => inv.customerId.equals(customer._id));
      const customerRevenue = customerInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      console.log(`  ${index + 1}. ${customer.companyName} (${customer.contactName}) - $${customerRevenue.toFixed(2)}`);
    });
    
    console.log('\n📊 Quote Types:');
    const quoteTypeCount = quotes.reduce((acc, quote) => {
      acc[quote.quoteType] = (acc[quote.quoteType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    Object.entries(quoteTypeCount).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    
    console.log('\n🧾 Invoice Status Breakdown:');
    const invoiceStatusCount = createdInvoices.reduce((acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    }, {});
    Object.entries(invoiceStatusCount).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding ApparelQuoter data:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await seedApparelQuoterData();
  await mongoose.connection.close();
  console.log('\n🔌 Database connection closed.');
};

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { seedApparelQuoterData, mainAccount, customers, quotes, designs };
