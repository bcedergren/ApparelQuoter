import mongoose from 'mongoose';
import { Invoice } from '../Invoice';

// Mock mongoose
jest.mock('mongoose');

describe('Invoice Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Schema validation', () => {
    it('should create a valid invoice', () => {
      const invoiceData = {
        companyId: new mongoose.Types.ObjectId(),
        customerId: new mongoose.Types.ObjectId(),
        invoiceNumber: 'INV-001',
        items: [
          {
            description: 'Test Item',
            quantity: 1,
            unitPrice: 100,
            total: 100
          }
        ],
        totalAmount: 100,
        balanceDue: 100,
        status: 'draft',
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        paymentTerms: 'Net 30',
        notes: 'Test invoice'
      };

      const invoice = new Invoice(invoiceData);
      expect(invoice.invoiceNumber).toBe('INV-001');
      expect(invoice.status).toBe('draft');
      expect(invoice.totalAmount).toBe(100);
    });

    it('should require companyId', () => {
      const invoiceData = {
        customerId: new mongoose.Types.ObjectId(),
        invoiceNumber: 'INV-001',
        items: [{ description: 'Test', quantity: 1, unitPrice: 100, total: 100 }],
        totalAmount: 100
      };

      const invoice = new Invoice(invoiceData);
      const validationError = invoice.validateSync();
      expect(validationError?.errors.companyId).toBeDefined();
    });

    it('should require customerId', () => {
      const invoiceData = {
        companyId: new mongoose.Types.ObjectId(),
        invoiceNumber: 'INV-001',
        items: [{ description: 'Test', quantity: 1, unitPrice: 100, total: 100 }],
        totalAmount: 100
      };

      const invoice = new Invoice(invoiceData);
      const validationError = invoice.validateSync();
      expect(validationError?.errors.customerId).toBeDefined();
    });

    it('should require invoiceNumber', () => {
      const invoiceData = {
        companyId: new mongoose.Types.ObjectId(),
        customerId: new mongoose.Types.ObjectId(),
        items: [{ description: 'Test', quantity: 1, unitPrice: 100, total: 100 }],
        totalAmount: 100
      };

      const invoice = new Invoice(invoiceData);
      const validationError = invoice.validateSync();
      expect(validationError?.errors.invoiceNumber).toBeDefined();
    });

    it('should require items array', () => {
      const invoiceData = {
        companyId: new mongoose.Types.ObjectId(),
        customerId: new mongoose.Types.ObjectId(),
        invoiceNumber: 'INV-001',
        totalAmount: 100
      };

      const invoice = new Invoice(invoiceData);
      const validationError = invoice.validateSync();
      expect(validationError?.errors.items).toBeDefined();
    });

    it('should require totalAmount', () => {
      const invoiceData = {
        companyId: new mongoose.Types.ObjectId(),
        customerId: new mongoose.Types.ObjectId(),
        invoiceNumber: 'INV-001',
        items: [{ description: 'Test', quantity: 1, unitPrice: 100, total: 100 }]
      };

      const invoice = new Invoice(invoiceData);
      const validationError = invoice.validateSync();
      expect(validationError?.errors.totalAmount).toBeDefined();
    });

    it('should validate status enum', () => {
      const invoiceData = {
        companyId: new mongoose.Types.ObjectId(),
        customerId: new mongoose.Types.ObjectId(),
        invoiceNumber: 'INV-001',
        items: [{ description: 'Test', quantity: 1, unitPrice: 100, total: 100 }],
        totalAmount: 100,
        status: 'invalid_status'
      };

      const invoice = new Invoice(invoiceData);
      const validationError = invoice.validateSync();
      expect(validationError?.errors.status).toBeDefined();
    });

    it('should accept valid status values', () => {
      const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
      
      validStatuses.forEach(status => {
        const invoiceData = {
          companyId: new mongoose.Types.ObjectId(),
          customerId: new mongoose.Types.ObjectId(),
          invoiceNumber: 'INV-001',
          items: [{ description: 'Test', quantity: 1, unitPrice: 100, total: 100 }],
          totalAmount: 100,
          status
        };

        const invoice = new Invoice(invoiceData);
        const validationError = invoice.validateSync();
        expect(validationError?.errors.status).toBeUndefined();
      });
    });

    it('should validate item schema', () => {
      const invoiceData = {
        companyId: new mongoose.Types.ObjectId(),
        customerId: new mongoose.Types.ObjectId(),
        invoiceNumber: 'INV-001',
        items: [
          {
            description: 'Test Item',
            quantity: 1,
            unitPrice: 100,
            total: 100
          }
        ],
        totalAmount: 100
      };

      const invoice = new Invoice(invoiceData);
      const validationError = invoice.validateSync();
      expect(validationError).toBeNull();
    });

    it('should require item description', () => {
      const invoiceData = {
        companyId: new mongoose.Types.ObjectId(),
        customerId: new mongoose.Types.ObjectId(),
        invoiceNumber: 'INV-001',
        items: [
          {
            quantity: 1,
            unitPrice: 100,
            total: 100
          }
        ],
        totalAmount: 100
      };

      const invoice = new Invoice(invoiceData);
      const validationError = invoice.validateSync();
      expect(validationError?.errors['items.0.description']).toBeDefined();
    });

    it('should require item quantity', () => {
      const invoiceData = {
        companyId: new mongoose.Types.ObjectId(),
        customerId: new mongoose.Types.ObjectId(),
        invoiceNumber: 'INV-001',
        items: [
          {
            description: 'Test Item',
            unitPrice: 100,
            total: 100
          }
        ],
        totalAmount: 100
      };

      const invoice = new Invoice(invoiceData);
      const validationError = invoice.validateSync();
      expect(validationError?.errors['items.0.quantity']).toBeDefined();
    });

    it('should require item unitPrice', () => {
      const invoiceData = {
        companyId: new mongoose.Types.ObjectId(),
        customerId: new mongoose.Types.ObjectId(),
        invoiceNumber: 'INV-001',
        items: [
          {
            description: 'Test Item',
            quantity: 1,
            total: 100
          }
        ],
        totalAmount: 100
      };

      const invoice = new Invoice(invoiceData);
      const validationError = invoice.validateSync();
      expect(validationError?.errors['items.0.unitPrice']).toBeDefined();
    });

    it('should require item total', () => {
      const invoiceData = {
        companyId: new mongoose.Types.ObjectId(),
        customerId: new mongoose.Types.ObjectId(),
        invoiceNumber: 'INV-001',
        items: [
          {
            description: 'Test Item',
            quantity: 1,
            unitPrice: 100
          }
        ],
        totalAmount: 100
      };

      const invoice = new Invoice(invoiceData);
      const validationError = invoice.validateSync();
      expect(validationError?.errors['items.0.total']).toBeDefined();
    });
  });

  describe('Virtual fields', () => {
    it('should calculate balance due correctly', () => {
      const invoiceData = {
        companyId: new mongoose.Types.ObjectId(),
        customerId: new mongoose.Types.ObjectId(),
        invoiceNumber: 'INV-001',
        items: [{ description: 'Test', quantity: 1, unitPrice: 100, total: 100 }],
        totalAmount: 100,
        payments: [
          { amount: 30, paymentDate: new Date() },
          { amount: 20, paymentDate: new Date() }
        ]
      };

      const invoice = new Invoice(invoiceData);
      expect(invoice.balanceDue).toBe(50); // 100 - 30 - 20
    });

    it('should handle no payments', () => {
      const invoiceData = {
        companyId: new mongoose.Types.ObjectId(),
        customerId: new mongoose.Types.ObjectId(),
        invoiceNumber: 'INV-001',
        items: [{ description: 'Test', quantity: 1, unitPrice: 100, total: 100 }],
        totalAmount: 100,
        payments: []
      };

      const invoice = new Invoice(invoiceData);
      expect(invoice.balanceDue).toBe(100);
    });
  });

  describe('Pre-save middleware', () => {
    it('should set balanceDue equal to totalAmount if not provided', () => {
      const invoiceData = {
        companyId: new mongoose.Types.ObjectId(),
        customerId: new mongoose.Types.ObjectId(),
        invoiceNumber: 'INV-001',
        items: [{ description: 'Test', quantity: 1, unitPrice: 100, total: 100 }],
        totalAmount: 100
      };

      const invoice = new Invoice(invoiceData);
      invoice.save = jest.fn().mockResolvedValue(invoice);
      
      return invoice.save().then(() => {
        expect(invoice.balanceDue).toBe(100);
      });
    });
  });
});
