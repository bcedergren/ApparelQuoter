import { createMocks } from 'node-mocks-http';
import handler from '../../[invoiceId]/payments';
import dbConnect from '@/utils/dbConnect';
import Invoice from '@/models/Invoice';

// Mock the database connection and models
jest.mock('@/utils/dbConnect');
jest.mock('@/models/Invoice');

const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;
const mockInvoice = Invoice as jest.Mocked<typeof Invoice>;

describe('/api/invoices/[invoiceId]/payments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbConnect.mockResolvedValue(undefined);
  });

  describe('GET /api/invoices/[invoiceId]/payments', () => {
    it('should return payments for an invoice', async () => {
      const mockInvoice = {
        _id: 'invoice123',
        payments: [
          {
            _id: 'payment1',
            amount: 500,
            paymentDate: '2024-01-15',
            paymentMethod: 'credit_card',
            reference: 'TXN123'
          }
        ]
      };

      mockInvoice.findById.mockResolvedValue(mockInvoice as any);

      const { req, res } = createMocks({
        method: 'GET',
        query: { invoiceId: 'invoice123' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.payments).toEqual(mockInvoice.payments);
    });

    it('should return 404 if invoice not found', async () => {
      mockInvoice.findById.mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'GET',
        query: { invoiceId: 'nonexistent' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });
  });

  describe('POST /api/invoices/[invoiceId]/payments', () => {
    it('should add a payment to an invoice', async () => {
      const existingInvoice = {
        _id: 'invoice123',
        totalAmount: 1000,
        balanceDue: 1000,
        payments: [],
        save: jest.fn().mockResolvedValue({})
      };

      mockInvoice.findById.mockResolvedValue(existingInvoice as any);

      const paymentData = {
        amount: 500,
        paymentDate: '2024-01-15',
        paymentMethod: 'credit_card',
        reference: 'TXN123'
      };

      const { req, res } = createMocks({
        method: 'POST',
        query: { invoiceId: 'invoice123' },
        body: paymentData
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(existingInvoice.save).toHaveBeenCalled();
      
      // Check that payment was added
      expect(existingInvoice.payments).toHaveLength(1);
      expect(existingInvoice.payments[0]).toMatchObject(paymentData);
    });

    it('should update balance due when payment is added', async () => {
      const existingInvoice = {
        _id: 'invoice123',
        totalAmount: 1000,
        balanceDue: 1000,
        payments: [],
        save: jest.fn().mockResolvedValue({})
      };

      mockInvoice.findById.mockResolvedValue(existingInvoice as any);

      const paymentData = {
        amount: 300,
        paymentDate: '2024-01-15',
        paymentMethod: 'credit_card'
      };

      const { req, res } = createMocks({
        method: 'POST',
        query: { invoiceId: 'invoice123' },
        body: paymentData
      });

      await handler(req, res);

      expect(existingInvoice.balanceDue).toBe(700); // 1000 - 300
    });

    it('should return 400 for invalid payment data', async () => {
      const existingInvoice = {
        _id: 'invoice123',
        save: jest.fn()
      };

      mockInvoice.findById.mockResolvedValue(existingInvoice as any);

      const { req, res } = createMocks({
        method: 'POST',
        query: { invoiceId: 'invoice123' },
        body: { invalid: 'data' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it('should return 404 if invoice not found', async () => {
      mockInvoice.findById.mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'POST',
        query: { invoiceId: 'nonexistent' },
        body: {
          amount: 500,
          paymentDate: '2024-01-15',
          paymentMethod: 'credit_card'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });

    it('should not allow payment amount greater than balance due', async () => {
      const existingInvoice = {
        _id: 'invoice123',
        totalAmount: 1000,
        balanceDue: 500,
        payments: [],
        save: jest.fn()
      };

      mockInvoice.findById.mockResolvedValue(existingInvoice as any);

      const paymentData = {
        amount: 600, // Greater than balance due
        paymentDate: '2024-01-15',
        paymentMethod: 'credit_card'
      };

      const { req, res } = createMocks({
        method: 'POST',
        query: { invoiceId: 'invoice123' },
        body: paymentData
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });
  });

  describe('Error handling', () => {
    it('should return 500 on database error', async () => {
      mockInvoice.findById.mockRejectedValue(new Error('Database error'));

      const { req, res } = createMocks({
        method: 'GET',
        query: { invoiceId: 'invoice123' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
    });
  });
});
