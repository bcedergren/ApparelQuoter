import { createMocks } from 'node-mocks-http';
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

describe('Design Workflow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbConnect.mockResolvedValue(undefined);
  });

  describe('Complete Design Workflow', () => {
    it('should create, add versions, add comments, and delete a design', async () => {
      // 1. Create a customer
      const customerData = {
        _id: 'customer123',
        contactName: 'John Doe',
        email: 'john@example.com'
      };

      mockCustomer.findById.mockResolvedValue(customerData as any);

      // 2. Create a quote
      const quoteData = {
        _id: 'quote123',
        quoteNumber: 'Q-001'
      };

      mockQuote.findById.mockResolvedValue(quoteData as any);

      // 3. Create a design
      const designData = {
        companyId: 'company123',
        customerId: 'customer123',
        quoteId: 'quote123',
        designName: 'Logo Design',
        description: 'Company logo design',
        status: 'draft',
        priority: 'high'
      };

      const createdDesign = {
        _id: 'design123',
        ...designData,
        versions: [],
        comments: [],
        currentVersion: 0,
        save: jest.fn().mockResolvedValue(designData)
      };

      mockDesign.create.mockResolvedValue(createdDesign as any);

      // Test design creation
      const { req: createReq, res: createRes } = createMocks({
        method: 'POST',
        body: designData
      });

      const createHandler = require('@/pages/api/designs/index').default;
      await createHandler(createReq, createRes);

      expect(createRes._getStatusCode()).toBe(201);
      expect(mockDesign.create).toHaveBeenCalledWith(designData);

      // 4. Add version to design
      const versionData = {
        fileUrl: '/uploads/design_v1.png',
        description: 'Initial version',
        uploadedBy: 'John Doe'
      };

      const designWithVersion = {
        ...createdDesign,
        versions: [{
          versionNumber: 1,
          ...versionData,
          createdAt: '2024-01-15T10:00:00Z'
        }],
        currentVersion: 1,
        save: jest.fn().mockResolvedValue({ ...designData, versions: [versionData] })
      };

      mockDesign.findById.mockResolvedValue(designWithVersion as any);

      const { req: versionReq, res: versionRes } = createMocks({
        method: 'POST',
        query: { designId: 'design123' },
        body: versionData
      });

      const versionHandler = require('@/pages/api/designs/[designId]/versions').default;
      await versionHandler(versionReq, versionRes);

      expect(versionRes._getStatusCode()).toBe(201);
      expect(designWithVersion.save).toHaveBeenCalled();

      // 5. Add comment to design
      const commentData = {
        text: 'Great design!',
        author: 'John Doe',
        x: 100,
        y: 200
      };

      const designWithComment = {
        ...designWithVersion,
        comments: [{
          ...commentData,
          createdAt: '2024-01-15T11:00:00Z'
        }],
        save: jest.fn().mockResolvedValue({ ...designData, comments: [commentData] })
      };

      mockDesign.findById.mockResolvedValue(designWithComment as any);

      const { req: commentReq, res: commentRes } = createMocks({
        method: 'POST',
        query: { designId: 'design123' },
        body: commentData
      });

      const commentHandler = require('@/pages/api/designs/[designId]/comments').default;
      await commentHandler(commentReq, commentRes);

      expect(commentRes._getStatusCode()).toBe(201);
      expect(designWithComment.save).toHaveBeenCalled();

      // 6. Update design status
      const updatedDesign = {
        ...designWithComment,
        status: 'in_progress',
        save: jest.fn().mockResolvedValue({ ...designData, status: 'in_progress' })
      };

      mockDesign.findById.mockResolvedValue(updatedDesign as any);

      const { req: updateReq, res: updateRes } = createMocks({
        method: 'PUT',
        query: { designId: 'design123' },
        body: { status: 'in_progress' }
      });

      const updateHandler = require('@/pages/api/designs/[designId]').default;
      await updateHandler(updateReq, updateRes);

      expect(updateRes._getStatusCode()).toBe(200);
      expect(updatedDesign.save).toHaveBeenCalled();

      // 7. Get design with all data
      const { req: getReq, res: getRes } = createMocks({
        method: 'GET',
        query: { designId: 'design123' }
      });

      const getHandler = require('@/pages/api/designs/[designId]').default;
      await getHandler(getReq, getRes);

      expect(getRes._getStatusCode()).toBe(200);
      const responseData = JSON.parse(getRes._getData());
      expect(responseData.design.versions).toHaveLength(1);
      expect(responseData.design.comments).toHaveLength(1);
      expect(responseData.design.status).toBe('in_progress');

      // 8. Delete design
      const { req: deleteReq, res: deleteRes } = createMocks({
        method: 'DELETE',
        query: { designId: 'design123' }
      });

      const deleteHandler = require('@/pages/api/designs/[designId]').default;
      await deleteHandler(deleteReq, deleteRes);

      expect(deleteRes._getStatusCode()).toBe(200);
      expect(updatedDesign.deleteOne).toHaveBeenCalled();
    });

    it('should handle file upload workflow', async () => {
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

      const formidable = require('formidable');
      formidable.mockReturnValue(mockForm);

      const fs = require('fs');
      fs.existsSync.mockReturnValue(false);
      fs.mkdirSync.mockImplementation(() => {});
      fs.renameSync.mockImplementation(() => {});

      const path = require('path');
      path.extname.mockReturnValue('.png');
      path.join.mockReturnValue('/public/uploads/designs/uuid.png');

      const { req, res } = createMocks({
        method: 'POST'
      });

      const handler = require('@/pages/api/designs/upload').default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.file).toBeDefined();
      expect(responseData.file.fileName).toBe('test.png');
    });

    it('should handle design search and filtering', async () => {
      const mockDesigns = [
        {
          _id: 'design1',
          designName: 'Logo Design',
          status: 'draft',
          priority: 'high',
          customerId: { contactName: 'John Doe' }
        },
        {
          _id: 'design2',
          designName: 'Banner Design',
          status: 'in_progress',
          priority: 'medium',
          customerId: { contactName: 'Jane Smith' }
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

      mockDesign.countDocuments.mockResolvedValue(2);

      const { req, res } = createMocks({
        method: 'GET',
        query: { status: 'draft', priority: 'high', search: 'Logo' }
      });

      const handler = require('@/pages/api/designs/index').default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.designs).toHaveLength(2);
      expect(mockDesign.find).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'draft',
          priority: 'high',
          $or: expect.arrayContaining([
            expect.objectContaining({ designName: /Logo/i })
          ])
        })
      );
    });
  });

  describe('Error Handling in Design Workflow', () => {
    it('should handle invalid file uploads', async () => {
      const mockFile = {
        originalFilename: 'test.txt',
        filepath: '/tmp/test.txt',
        size: 1024,
        mimetype: 'text/plain'
      };

      const mockForm = {
        parse: jest.fn().mockResolvedValue([
          {},
          { file: mockFile }
        ])
      };

      const formidable = require('formidable');
      formidable.mockReturnValue(mockForm);

      const { req, res } = createMocks({
        method: 'POST'
      });

      const handler = require('@/pages/api/designs/upload').default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it('should handle file size limits', async () => {
      const mockFile = {
        originalFilename: 'large.png',
        filepath: '/tmp/large.png',
        size: 100 * 1024 * 1024, // 100MB
        mimetype: 'image/png'
      };

      const mockForm = {
        parse: jest.fn().mockResolvedValue([
          {},
          { file: mockFile }
        ])
      };

      const formidable = require('formidable');
      formidable.mockReturnValue(mockForm);

      const { req, res } = createMocks({
        method: 'POST'
      });

      const handler = require('@/pages/api/designs/upload').default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it('should handle missing required fields', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: { designName: 'Test Design' } // Missing customerId
      });

      const handler = require('@/pages/api/designs/index').default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });
  });
});
