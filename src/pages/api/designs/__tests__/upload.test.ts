import { createMocks } from 'node-mocks-http';
import handler from '../upload';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Mock formidable and fs
jest.mock('formidable');
jest.mock('fs');
jest.mock('path');

const mockFormidable = formidable as jest.Mocked<typeof formidable>;
const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;

describe('/api/designs/upload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/designs/upload', () => {
    it('should upload a file successfully', async () => {
      const mockFile = {
        originalFilename: 'test.png',
        filepath: '/tmp/test.png',
        size: 1024,
        mimetype: 'image/png'
      };

      const mockForm = {
        parse: jest.fn().mockResolvedValue([
          {}, // fields
          { file: mockFile } // files
        ])
      };

      mockFormidable.mockReturnValue(mockForm as any);
      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation(() => {});
      mockFs.renameSync.mockImplementation(() => {});
      mockPath.extname.mockReturnValue('.png');
      mockPath.join.mockReturnValue('/public/uploads/designs/uuid.png');

      const { req, res } = createMocks({
        method: 'POST'
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.file).toBeDefined();
      expect(data.file.fileName).toBe('test.png');
      expect(data.file.fileUrl).toContain('/uploads/designs/');
    });

    it('should create upload directory if it does not exist', async () => {
      const mockFile = {
        originalFilename: 'test.png',
        filepath: '/tmp/test.png',
        size: 1024,
        mimetype: 'image/png'
      };

      const mockForm = {
        parse: jest.fn().mockResolvedValue([{}, { file: mockFile }])
      };

      mockFormidable.mockReturnValue(mockForm as any);
      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation(() => {});
      mockFs.renameSync.mockImplementation(() => {});
      mockPath.extname.mockReturnValue('.png');
      mockPath.join.mockReturnValue('/public/uploads/designs/uuid.png');

      const { req, res } = createMocks({
        method: 'POST'
      });

      await handler(req, res);

      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('uploads/designs'),
        { recursive: true }
      );
    });

    it('should return 400 if no file uploaded', async () => {
      const mockForm = {
        parse: jest.fn().mockResolvedValue([{}, {}]) // No files
      };

      mockFormidable.mockReturnValue(mockForm as any);

      const { req, res } = createMocks({
        method: 'POST'
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it('should filter files by allowed types', async () => {
      const mockFile = {
        originalFilename: 'test.txt',
        filepath: '/tmp/test.txt',
        size: 1024,
        mimetype: 'text/plain'
      };

      const mockForm = {
        parse: jest.fn().mockResolvedValue([{}, { file: mockFile }])
      };

      mockFormidable.mockReturnValue(mockForm as any);

      const { req, res } = createMocks({
        method: 'POST'
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it('should accept file when parser returns it', async () => {
      const mockFile = {
        originalFilename: 'large.png',
        filepath: '/tmp/large.png',
        size: 100 * 1024 * 1024, // 100MB
        mimetype: 'image/png'
      };

      const mockForm = {
        parse: jest.fn().mockResolvedValue([{}, { file: mockFile }])
      };

      mockFormidable.mockReturnValue(mockForm as any);

      const { req, res } = createMocks({
        method: 'POST'
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
    });

    it('should return 405 for non-POST methods', async () => {
      const { req, res } = createMocks({
        method: 'GET'
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });

    it('should return 401 if not authenticated', async () => {
      const { getServerSession } = require('next-auth/next');
      jest.mocked(getServerSession).mockResolvedValueOnce(null);

      const { req, res } = createMocks({
        method: 'POST'
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
    });
  });

  describe('Error handling', () => {
    it('should return 500 on upload error', async () => {
      const mockForm = {
        parse: jest.fn().mockRejectedValue(new Error('Upload error'))
      };

      mockFormidable.mockReturnValue(mockForm as any);

      const { req, res } = createMocks({
        method: 'POST'
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
