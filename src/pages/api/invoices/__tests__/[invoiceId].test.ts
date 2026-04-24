import { createMocks } from 'node-mocks-http';
import handler from '../[invoiceId]';
import dbConnect from '@/utils/dbConnect';
import Invoice from '@/models/Invoice';
import Customer from '@/models/Customer';
import Company from '@/models/Company';

// Mock the database connection and models
jest.mock('@/utils/dbConnect');
jest.mock('@/models/Invoice');
jest.mock('@/models/Customer');
jest.mock('@/models/Company');

const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;
const mockInvoice = Invoice as jest.Mocked<typeof Invoice>;
const mockCustomer = Customer as jest.Mocked<typeof Customer>;
const mockCompany = Company as jest.Mocked<typeof Company>;

describe('/api/invoices/[invoiceId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbConnect.mockResolvedValue(undefined);
  });

  describe('GET /api/invoices/[invoiceId]', () => {
    it('should return invoice with populated data', async () => {
      const mockInvoiceData = {
        _id: 'invoice123',
        invoiceNumber: 'INV-001',
        customerId: { contactName: 'John Doe', email: 'john@example.com' },
        companyId: { name: 'Test Company' },
        totalAmount: 1000,
        status: 'draft'
      };

      mockInvoice.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockInvoiceData)
      } as any);

      const { req, res } = createMocks({
        method: 'GET',
        query: { invoiceId: 'invoice123' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.invoice).toEqual(mockInvoiceData);
    });

    it('should return 404 if invoice not found', async () => {
      mockInvoice.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      } as any);

      const { req, res } = createMocks({
        method: 'GET',
        query: { invoiceId: 'nonexistent' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });
  });

  describe('PUT /api/invoices/[invoiceId]', () => {
    it('should update invoice successfully', async () => {
      const existingInvoice = {
        _id: 'invoice123',
        invoiceNumber: 'INV-001',
        status: 'draft',
        save: jest.fn().mockResolvedValue({})
      };

      mockInvoice.findById.mockResolvedValue(existingInvoice as any);

      const updateData = {
        status: 'sent',
        notes: 'Updated notes'
      };

      const { req, res } = createMocks({
        method: 'PUT',
        query: { invoiceId: 'invoice123' },
        body: updateData
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(existingInvoice.save).toHaveBeenCalled();
    });

    it('should return 404 if invoice not found for update', async () => {
      mockInvoice.findById.mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'PUT',
        query: { invoiceId: 'nonexistent' },
        body: { status: 'sent' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });

    it('should validate required fields', async () => {
      const existingInvoice = {
        _id: 'invoice123',
        save: jest.fn()
      };

      mockInvoice.findById.mockResolvedValue(existingInvoice as any);

      const { req, res } = createMocks({
        method: 'PUT',
        query: { invoiceId: 'invoice123' },
        body: { invalidField: 'value' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });
  });

  describe('DELETE /api/invoices/[invoiceId]', () => {
    it('should delete invoice successfully', async () => {
      const existingInvoice = {
        _id: 'invoice123',
        deleteOne: jest.fn().mockResolvedValue({})
      };

      mockInvoice.findById.mockResolvedValue(existingInvoice as any);

      const { req, res } = createMocks({
        method: 'DELETE',
        query: { invoiceId: 'invoice123' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(existingInvoice.deleteOne).toHaveBeenCalled();
    });

    it('should return 404 if invoice not found for deletion', async () => {
      mockInvoice.findById.mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'DELETE',
        query: { invoiceId: 'nonexistent' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
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

// Prevent Next route validator errors when test files are under `pages`.
export default function __testFileRoutePlaceholder() {
  return null;
}
