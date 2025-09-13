import { createMocks } from 'node-mocks-http';
import dbConnect from '@/utils/dbConnect';
import Invoice from '@/models/Invoice';
import Customer from '@/models/Customer';
import Company from '@/models/Company';
import User from '@/models/User';

// Mock the database connection and models
jest.mock('@/utils/dbConnect');
jest.mock('@/models/Invoice');
jest.mock('@/models/Customer');
jest.mock('@/models/Company');
jest.mock('@/models/User');

const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;
const mockInvoice = Invoice as jest.Mocked<typeof Invoice>;
const mockCustomer = Customer as jest.Mocked<typeof Customer>;
const mockCompany = Company as jest.Mocked<typeof Company>;
const mockUser = User as jest.Mocked<typeof User>;

describe('Invoice Workflow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbConnect.mockResolvedValue(undefined);
  });

  describe('Complete Invoice Workflow', () => {
    it('should create, update, add payment, and delete an invoice', async () => {
      // 1. Create a customer
      const customerData = {
        _id: 'customer123',
        contactName: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234',
        companyName: 'Test Company'
      };

      mockCustomer.findById.mockResolvedValue(customerData as any);
      mockCustomer.create.mockResolvedValue(customerData as any);

      // 2. Create a company
      const companyData = {
        _id: 'company123',
        name: 'My Company',
        email: 'info@mycompany.com',
        phone: '555-5678'
      };

      mockCompany.findById.mockResolvedValue(companyData as any);

      // 3. Create an invoice
      const invoiceData = {
        companyId: 'company123',
        customerId: 'customer123',
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
        invoiceDate: '2024-01-15',
        dueDate: '2024-02-14'
      };

      const createdInvoice = {
        _id: 'invoice123',
        ...invoiceData,
        save: jest.fn().mockResolvedValue(invoiceData)
      };

      mockInvoice.create.mockResolvedValue(createdInvoice as any);

      // Test invoice creation
      const { req: createReq, res: createRes } = createMocks({
        method: 'POST',
        body: invoiceData
      });

      const createHandler = require('@/pages/api/invoices/index').default;
      await createHandler(createReq, createRes);

      expect(createRes._getStatusCode()).toBe(201);
      expect(mockInvoice.create).toHaveBeenCalledWith(invoiceData);

      // 4. Update invoice status
      const updatedInvoice = {
        ...createdInvoice,
        status: 'sent',
        save: jest.fn().mockResolvedValue({ ...invoiceData, status: 'sent' })
      };

      mockInvoice.findById.mockResolvedValue(updatedInvoice as any);

      const { req: updateReq, res: updateRes } = createMocks({
        method: 'PUT',
        query: { invoiceId: 'invoice123' },
        body: { status: 'sent' }
      });

      const updateHandler = require('@/pages/api/invoices/[invoiceId]').default;
      await updateHandler(updateReq, updateRes);

      expect(updateRes._getStatusCode()).toBe(200);
      expect(updatedInvoice.save).toHaveBeenCalled();

      // 5. Add payment to invoice
      const paymentData = {
        amount: 50,
        paymentDate: '2024-01-20',
        paymentMethod: 'credit_card',
        reference: 'TXN123'
      };

      const invoiceWithPayment = {
        ...updatedInvoice,
        payments: [paymentData],
        balanceDue: 50,
        save: jest.fn().mockResolvedValue({ ...invoiceData, payments: [paymentData], balanceDue: 50 })
      };

      mockInvoice.findById.mockResolvedValue(invoiceWithPayment as any);

      const { req: paymentReq, res: paymentRes } = createMocks({
        method: 'POST',
        query: { invoiceId: 'invoice123' },
        body: paymentData
      });

      const paymentHandler = require('@/pages/api/invoices/[invoiceId]/payments').default;
      await paymentHandler(paymentReq, paymentRes);

      expect(paymentRes._getStatusCode()).toBe(201);
      expect(invoiceWithPayment.save).toHaveBeenCalled();

      // 6. Get invoice with payments
      const { req: getReq, res: getRes } = createMocks({
        method: 'GET',
        query: { invoiceId: 'invoice123' }
      });

      const getHandler = require('@/pages/api/invoices/[invoiceId]').default;
      await getHandler(getReq, getRes);

      expect(getRes._getStatusCode()).toBe(200);
      const responseData = JSON.parse(getRes._getData());
      expect(responseData.invoice.payments).toHaveLength(1);
      expect(responseData.invoice.balanceDue).toBe(50);

      // 7. Delete invoice
      const { req: deleteReq, res: deleteRes } = createMocks({
        method: 'DELETE',
        query: { invoiceId: 'invoice123' }
      });

      const deleteHandler = require('@/pages/api/invoices/[invoiceId]').default;
      await deleteHandler(deleteReq, deleteRes);

      expect(deleteRes._getStatusCode()).toBe(200);
      expect(invoiceWithPayment.deleteOne).toHaveBeenCalled();
    });

    it('should handle invoice PDF generation workflow', async () => {
      const invoiceData = {
        _id: 'invoice123',
        invoiceNumber: 'INV-001',
        customerId: { contactName: 'John Doe', email: 'john@example.com' },
        companyId: { name: 'My Company', email: 'info@mycompany.com' },
        totalAmount: 1000,
        status: 'sent'
      };

      mockInvoice.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(invoiceData)
      } as any);

      const { req, res } = createMocks({
        method: 'GET',
        query: { invoiceId: 'invoice123' }
      });

      const handler = require('@/pages/api/invoices/[invoiceId]').default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.invoice).toBeDefined();
      expect(responseData.invoice.invoiceNumber).toBe('INV-001');
    });

    it('should handle invoice search and filtering', async () => {
      const mockInvoices = [
        {
          _id: 'invoice1',
          invoiceNumber: 'INV-001',
          status: 'draft',
          customerId: { contactName: 'John Doe' }
        },
        {
          _id: 'invoice2',
          invoiceNumber: 'INV-002',
          status: 'sent',
          customerId: { contactName: 'Jane Smith' }
        }
      ];

      mockInvoice.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockInvoices)
            })
          })
        })
      } as any);

      mockInvoice.countDocuments.mockResolvedValue(2);

      const { req, res } = createMocks({
        method: 'GET',
        query: { status: 'draft', search: 'John' }
      });

      const handler = require('@/pages/api/invoices/index').default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.invoices).toHaveLength(2);
      expect(mockInvoice.find).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'draft',
          $or: expect.arrayContaining([
            expect.objectContaining({ 'customerId.contactName': /John/i })
          ])
        })
      );
    });
  });

  describe('Error Handling in Invoice Workflow', () => {
    it('should handle database connection errors', async () => {
      mockDbConnect.mockRejectedValue(new Error('Database connection failed'));

      const { req, res } = createMocks({
        method: 'GET',
        query: { invoiceId: 'invoice123' }
      });

      const handler = require('@/pages/api/invoices/[invoiceId]').default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
    });

    it('should handle invalid invoice data', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: { invalid: 'data' }
      });

      const handler = require('@/pages/api/invoices/index').default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it('should handle payment amount exceeding balance', async () => {
      const existingInvoice = {
        _id: 'invoice123',
        totalAmount: 100,
        balanceDue: 50,
        payments: [],
        save: jest.fn()
      };

      mockInvoice.findById.mockResolvedValue(existingInvoice as any);

      const { req, res } = createMocks({
        method: 'POST',
        query: { invoiceId: 'invoice123' },
        body: {
          amount: 100, // Exceeds balance due
          paymentDate: '2024-01-20',
          paymentMethod: 'credit_card'
        }
      });

      const handler = require('@/pages/api/invoices/[invoiceId]/payments').default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });
  });
});
