import { createMocks } from 'node-mocks-http';
import handler from '../../[designId]/versions';
import dbConnect from '@/utils/dbConnect';
import Design from '@/models/Design';

// Mock the database connection and models
jest.mock('@/utils/dbConnect');
jest.mock('@/models/Design');

const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;
const mockDesign = Design as jest.Mocked<typeof Design>;

describe('/api/designs/[designId]/versions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbConnect.mockResolvedValue(undefined);
  });

  describe('GET /api/designs/[designId]/versions', () => {
    it('should return versions for a design', async () => {
      const mockDesign = {
        _id: 'design123',
        versions: [
          {
            _id: 'version1',
            versionNumber: 1,
            fileUrl: '/uploads/design1_v1.png',
            description: 'Initial version',
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
      expect(data.versions).toEqual(mockDesign.versions);
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

  describe('POST /api/designs/[designId]/versions', () => {
    it('should add a version to a design', async () => {
      const existingDesign = {
        _id: 'design123',
        versions: [],
        currentVersion: 0,
        save: jest.fn().mockResolvedValue({})
      };

      mockDesign.findById.mockResolvedValue(existingDesign as any);

      const versionData = {
        fileUrl: '/uploads/design1_v2.png',
        description: 'Updated design with new colors',
        uploadedBy: 'John Doe'
      };

      const { req, res } = createMocks({
        method: 'POST',
        query: { designId: 'design123' },
        body: versionData
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(existingDesign.save).toHaveBeenCalled();
      
      // Check that version was added
      expect(existingDesign.versions).toHaveLength(1);
      expect(existingDesign.versions[0]).toMatchObject({
        versionNumber: 1,
        fileUrl: versionData.fileUrl,
        description: versionData.description,
        uploadedBy: versionData.uploadedBy
      });
      expect(existingDesign.currentVersion).toBe(1);
    });

    it('should increment version number correctly', async () => {
      const existingDesign = {
        _id: 'design123',
        versions: [
          { versionNumber: 1, fileUrl: '/uploads/v1.png' },
          { versionNumber: 2, fileUrl: '/uploads/v2.png' }
        ],
        currentVersion: 2,
        save: jest.fn().mockResolvedValue({})
      };

      mockDesign.findById.mockResolvedValue(existingDesign as any);

      const versionData = {
        fileUrl: '/uploads/v3.png',
        description: 'Third version'
      };

      const { req, res } = createMocks({
        method: 'POST',
        query: { designId: 'design123' },
        body: versionData
      });

      await handler(req, res);

      expect(existingDesign.versions).toHaveLength(3);
      expect(existingDesign.versions[2].versionNumber).toBe(3);
      expect(existingDesign.currentVersion).toBe(3);
    });

    it('should return 400 for invalid version data', async () => {
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
          fileUrl: '/uploads/test.png',
          description: 'Test version'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });

    it('should require fileUrl field', async () => {
      const existingDesign = {
        _id: 'design123',
        save: jest.fn()
      };

      mockDesign.findById.mockResolvedValue(existingDesign as any);

      const { req, res } = createMocks({
        method: 'POST',
        query: { designId: 'design123' },
        body: {
          description: 'Test version'
          // Missing fileUrl field
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
