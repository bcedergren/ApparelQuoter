import { createMocks } from 'node-mocks-http';
import handler from '../index';
import dbConnect from '@/utils/dbConnect';
import Design from '@/models/Design';

// Mock the database connection and models
jest.mock('@/utils/dbConnect');
jest.mock('@/models/Design');

const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;
const mockDesign = Design as jest.Mocked<typeof Design>;

describe('/api/designs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbConnect.mockResolvedValue(undefined);
    mockDesign.find = jest.fn();
    mockDesign.countDocuments = jest.fn();
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
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                  skip: jest.fn().mockReturnValue({
                    limit: jest.fn().mockResolvedValue(mockDesigns)
                  })
                })
              })
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
        expect.objectContaining({ customerId: expect.anything() })
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
            expect.objectContaining({
              title: expect.objectContaining({ $regex: 'logo' })
            })
          ])
        })
      );
    });
  });

  describe('POST /api/designs', () => {
    it('should return 400 for invalid design data', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: { invalid: 'data' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
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

// Prevent Next route validator errors when test files are under `pages`.
export default function __testFileRoutePlaceholder() {
  return null;
}
