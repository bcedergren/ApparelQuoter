import { createMocks } from 'node-mocks-http';
import handler from '../index';
import dbConnect from '@/utils/dbConnect';
import Invoice from '@/models/Invoice';
import Customer from '@/models/Customer';
import Company from '@/models/Company';
import User from '@/models/User';

// Mock the database connection
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

describe('/api/invoices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbConnect.mockResolvedValue(undefined);
  });

  describe('GET /api/invoices', () => {
    it('should return invoices with pagination', async () => {
      const mockInvoices = [
        {
          _id: '1',
          invoiceNumber: 'INV-001',
          customerId: { contactName: 'John Doe' },
          totalAmount: 1000,
          status: 'draft'
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

      mockInvoice.countDocuments.mockResolvedValue(1);

      const { req, res } = createMocks({
        method: 'GET',
        query: { page: '1', limit: '10' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.invoices).toEqual(mockInvoices);
      expect(data.pagination).toBeDefined();
    });

    it('should filter invoices by status', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { status: 'paid' }
      });

      await handler(req, res);

      expect(mockInvoice.find).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'paid' })
      );
    });

    it('should search invoices by customer name', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { search: 'John' }
      });

      await handler(req, res);

      expect(mockInvoice.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            expect.objectContaining({ 'customerId.contactName': /John/i })
          ])
        })
      );
    });
  });

  describe('POST /api/invoices', () => {
    it('should create a new invoice', async () => {
      const invoiceData = {
        customerId: 'customer123',
        items: [
          {
            description: 'Test Item',
            quantity: 1,
            unitPrice: 100,
            total: 100
          }
        ],
        totalAmount: 100,
        invoiceDate: '2024-01-01',
        dueDate: '2024-01-31'
      };

      const mockInvoice = {
        _id: 'invoice123',
        ...invoiceData,
        save: jest.fn().mockResolvedValue(invoiceData)
      };

      mockInvoice.create.mockResolvedValue(mockInvoice as any);
      mockCustomer.findById.mockResolvedValue({ _id: 'customer123', contactName: 'John Doe' } as any);

      const { req, res } = createMocks({
        method: 'POST',
        body: invoiceData
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.invoice).toBeDefined();
    });

    it('should return 400 for invalid invoice data', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: { invalid: 'data' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it('should return 404 if customer not found', async () => {
      const invoiceData = {
        customerId: 'nonexistent',
        items: [{ description: 'Test', quantity: 1, unitPrice: 100, total: 100 }],
        totalAmount: 100
      };

      mockCustomer.findById.mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'POST',
        body: invoiceData
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });
  });

  describe('Error handling', () => {
    it('should return 500 on database error', async () => {
      mockInvoice.find.mockRejectedValue(new Error('Database error'));

      const { req, res } = createMocks({
        method: 'GET'
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
    });
  });
});
