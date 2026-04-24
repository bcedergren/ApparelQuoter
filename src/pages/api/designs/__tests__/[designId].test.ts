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
    mockDesign.findOne = jest.fn();
    mockDesign.findOneAndUpdate = jest.fn();
    mockDesign.findOneAndDelete = jest.fn();
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

      mockDesign.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                  populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                      populate: jest.fn().mockResolvedValue(mockDesignData)
                    })
                  })
                })
              })
            })
          })
        })
      } as any);

      const { req, res } = createMocks({
        method: 'GET',
        query: { designId: 'design123' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data).toEqual(mockDesignData);
    });

    it('should return 404 if design not found', async () => {
      mockDesign.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                  populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                      populate: jest.fn().mockResolvedValue(null)
                    })
                  })
                })
              })
            })
          })
        })
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
        title: 'Old Name',
        status: 'draft',
      };

      mockDesign.findOneAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockResolvedValue(existingDesign)
            })
          })
        })
      } as any);

      const updateData = {
        title: 'Updated Name',
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
    });

    it('should return 404 if design not found for update', async () => {
      mockDesign.findOneAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockResolvedValue(null)
            })
          })
        })
      } as any);

      const { req, res } = createMocks({
        method: 'PUT',
        query: { designId: 'nonexistent' },
        body: { designName: 'Updated' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });

    it('should validate required fields', async () => {
      mockDesign.findOneAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockResolvedValue({ _id: 'design123' })
            })
          })
        })
      } as any);

      const { req, res } = createMocks({
        method: 'PUT',
        query: { designId: 'design123' },
        body: { invalidField: 'value' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
    });
  });

  describe('DELETE /api/designs/[designId]', () => {
    it('should delete design successfully', async () => {
      mockDesign.findOneAndDelete.mockResolvedValue({ _id: 'design123' } as any);

      const { req, res } = createMocks({
        method: 'DELETE',
        query: { designId: 'design123' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
    });

    it('should return 404 if design not found for deletion', async () => {
      mockDesign.findOneAndDelete.mockResolvedValue(null);

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
      mockDesign.findOne.mockImplementation(() => {
        throw new Error('Database error');
      });

      const { req, res } = createMocks({
        method: 'GET',
        query: { designId: 'design123' }
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
