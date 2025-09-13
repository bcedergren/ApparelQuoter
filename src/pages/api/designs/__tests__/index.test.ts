import { createMocks } from 'node-mocks-http';
import handler from '../index';
import dbConnect from '@/utils/dbConnect';
import Design from '@/models/Design';
import Customer from '@/models/Customer';
import Quote from '@/models/Quote';

// Mock the database connection and models
jest.mock('@/utils/dbConnect');
jest.mock('@/models/Design');
jest.mock('@/models/Customer');
jest.mock('@/models/Quote');

const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;
const mockDesign = Design as jest.Mocked<typeof Design>;
const mockCustomer = Customer as jest.Mocked<typeof Customer>;
const mockQuote = Quote as jest.Mocked<typeof Quote>;

describe('/api/designs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbConnect.mockResolvedValue(undefined);
  });

  describe('GET /api/designs', () => {
    it('should return designs with pagination', async () => {
      const mockDesigns = [
        {
          _id: '1',
          designName: 'Test Design',
          status: 'draft',
          customerId: { contactName: 'John Doe' },
          quoteId: { quoteNumber: 'Q-001' }
        }
      ];

      mockDesign.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockDesigns)
            })
          })
        })
      } as any);

      mockDesign.countDocuments.mockResolvedValue(1);

      const { req, res } = createMocks({
        method: 'GET',
        query: { page: '1', limit: '10' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.designs).toEqual(mockDesigns);
      expect(data.pagination).toBeDefined();
    });

    it('should filter designs by status', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { status: 'approved' }
      });

      await handler(req, res);

      expect(mockDesign.find).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'approved' })
      );
    });

    it('should filter designs by customer', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { customerId: 'customer123' }
      });

      await handler(req, res);

      expect(mockDesign.find).toHaveBeenCalledWith(
        expect.objectContaining({ customerId: 'customer123' })
      );
    });

    it('should search designs by name', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { search: 'logo' }
      });

      await handler(req, res);

      expect(mockDesign.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            expect.objectContaining({ designName: /logo/i })
          ])
        })
      );
    });
  });

  describe('POST /api/designs', () => {
    it('should create a new design', async () => {
      const designData = {
        designName: 'Test Design',
        description: 'A test design',
        customerId: 'customer123',
        quoteId: 'quote123',
        priority: 'medium'
      };

      const mockDesign = {
        _id: 'design123',
        ...designData,
        save: jest.fn().mockResolvedValue(designData)
      };

      mockDesign.create.mockResolvedValue(mockDesign as any);
      mockCustomer.findById.mockResolvedValue({ _id: 'customer123', contactName: 'John Doe' } as any);
      mockQuote.findById.mockResolvedValue({ _id: 'quote123', quoteNumber: 'Q-001' } as any);

      const { req, res } = createMocks({
        method: 'POST',
        body: designData
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.design).toBeDefined();
    });

    it('should return 400 for invalid design data', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: { invalid: 'data' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it('should return 404 if customer not found', async () => {
      const designData = {
        designName: 'Test Design',
        customerId: 'nonexistent'
      };

      mockCustomer.findById.mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'POST',
        body: designData
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });

    it('should return 404 if quote not found when provided', async () => {
      const designData = {
        designName: 'Test Design',
        customerId: 'customer123',
        quoteId: 'nonexistent'
      };

      mockCustomer.findById.mockResolvedValue({ _id: 'customer123' } as any);
      mockQuote.findById.mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'POST',
        body: designData
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });
  });

  describe('Error handling', () => {
    it('should return 500 on database error', async () => {
      mockDesign.find.mockRejectedValue(new Error('Database error'));

      const { req, res } = createMocks({
        method: 'GET'
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
    });
  });
});
