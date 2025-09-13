import { createMocks } from 'node-mocks-http';
import handler from '../../[designId]/comments';
import dbConnect from '@/utils/dbConnect';
import Design from '@/models/Design';

// Mock the database connection and models
jest.mock('@/utils/dbConnect');
jest.mock('@/models/Design');

const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;
const mockDesign = Design as jest.Mocked<typeof Design>;

describe('/api/designs/[designId]/comments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbConnect.mockResolvedValue(undefined);
  });

  describe('GET /api/designs/[designId]/comments', () => {
    it('should return comments for a design', async () => {
      const mockDesign = {
        _id: 'design123',
        comments: [
          {
            _id: 'comment1',
            text: 'Great design!',
            author: 'John Doe',
            createdAt: '2024-01-15T10:00:00Z'
          }
        ]
      };

      mockDesign.findById.mockResolvedValue(mockDesign as any);

      const { req, res } = createMocks({
        method: 'GET',
        query: { designId: 'design123' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.comments).toEqual(mockDesign.comments);
    });

    it('should return 404 if design not found', async () => {
      mockDesign.findById.mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'GET',
        query: { designId: 'nonexistent' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });
  });

  describe('POST /api/designs/[designId]/comments', () => {
    it('should add a comment to a design', async () => {
      const existingDesign = {
        _id: 'design123',
        comments: [],
        save: jest.fn().mockResolvedValue({})
      };

      mockDesign.findById.mockResolvedValue(existingDesign as any);

      const commentData = {
        text: 'This looks great!',
        author: 'John Doe',
        x: 100,
        y: 200
      };

      const { req, res } = createMocks({
        method: 'POST',
        query: { designId: 'design123' },
        body: commentData
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(existingDesign.save).toHaveBeenCalled();
      
      // Check that comment was added
      expect(existingDesign.comments).toHaveLength(1);
      expect(existingDesign.comments[0]).toMatchObject({
        text: commentData.text,
        author: commentData.author,
        x: commentData.x,
        y: commentData.y
      });
    });

    it('should return 400 for invalid comment data', async () => {
      const existingDesign = {
        _id: 'design123',
        save: jest.fn()
      };

      mockDesign.findById.mockResolvedValue(existingDesign as any);

      const { req, res } = createMocks({
        method: 'POST',
        query: { designId: 'design123' },
        body: { invalid: 'data' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it('should return 404 if design not found', async () => {
      mockDesign.findById.mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'POST',
        query: { designId: 'nonexistent' },
        body: {
          text: 'Test comment',
          author: 'John Doe'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });

    it('should require text field', async () => {
      const existingDesign = {
        _id: 'design123',
        save: jest.fn()
      };

      mockDesign.findById.mockResolvedValue(existingDesign as any);

      const { req, res } = createMocks({
        method: 'POST',
        query: { designId: 'design123' },
        body: {
          author: 'John Doe'
          // Missing text field
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
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
