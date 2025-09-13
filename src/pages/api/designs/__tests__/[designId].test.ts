import { createMocks } from 'node-mocks-http';
import handler from '../[designId]';
import dbConnect from '@/utils/dbConnect';
import Design from '@/models/Design';

// Mock the database connection and models
jest.mock('@/utils/dbConnect');
jest.mock('@/models/Design');

const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;
const mockDesign = Design as jest.Mocked<typeof Design>;

describe('/api/designs/[designId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbConnect.mockResolvedValue(undefined);
  });

  describe('GET /api/designs/[designId]', () => {
    it('should return design with populated data', async () => {
      const mockDesignData = {
        _id: 'design123',
        designName: 'Test Design',
        status: 'draft',
        customerId: { contactName: 'John Doe' },
        quoteId: { quoteNumber: 'Q-001' }
      };

      mockDesign.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockDesignData)
      } as any);

      const { req, res } = createMocks({
        method: 'GET',
        query: { designId: 'design123' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.design).toEqual(mockDesignData);
    });

    it('should return 404 if design not found', async () => {
      mockDesign.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      } as any);

      const { req, res } = createMocks({
        method: 'GET',
        query: { designId: 'nonexistent' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });
  });

  describe('PUT /api/designs/[designId]', () => {
    it('should update design successfully', async () => {
      const existingDesign = {
        _id: 'design123',
        designName: 'Old Name',
        status: 'draft',
        save: jest.fn().mockResolvedValue({})
      };

      mockDesign.findById.mockResolvedValue(existingDesign as any);

      const updateData = {
        designName: 'Updated Name',
        status: 'in_progress',
        description: 'Updated description'
      };

      const { req, res } = createMocks({
        method: 'PUT',
        query: { designId: 'design123' },
        body: updateData
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(existingDesign.save).toHaveBeenCalled();
      expect(existingDesign.designName).toBe('Updated Name');
      expect(existingDesign.status).toBe('in_progress');
    });

    it('should return 404 if design not found for update', async () => {
      mockDesign.findById.mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'PUT',
        query: { designId: 'nonexistent' },
        body: { designName: 'Updated' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });

    it('should validate required fields', async () => {
      const existingDesign = {
        _id: 'design123',
        save: jest.fn()
      };

      mockDesign.findById.mockResolvedValue(existingDesign as any);

      const { req, res } = createMocks({
        method: 'PUT',
        query: { designId: 'design123' },
        body: { invalidField: 'value' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });
  });

  describe('DELETE /api/designs/[designId]', () => {
    it('should delete design successfully', async () => {
      const existingDesign = {
        _id: 'design123',
        deleteOne: jest.fn().mockResolvedValue({})
      };

      mockDesign.findById.mockResolvedValue(existingDesign as any);

      const { req, res } = createMocks({
        method: 'DELETE',
        query: { designId: 'design123' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(existingDesign.deleteOne).toHaveBeenCalled();
    });

    it('should return 404 if design not found for deletion', async () => {
      mockDesign.findById.mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'DELETE',
        query: { designId: 'nonexistent' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });
  });

  describe('Error handling', () => {
    it('should return 500 on database error', async () => {
      mockDesign.findById.mockRejectedValue(new Error('Database error'));

      const { req, res } = createMocks({
        method: 'GET',
        query: { designId: 'design123' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
    });
  });
});
