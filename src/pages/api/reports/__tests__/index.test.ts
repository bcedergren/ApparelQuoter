import { createMocks } from 'node-mocks-http';
import handler from '../index';
import dbConnect from '@/utils/dbConnect';
import Report from '@/models/Report';

// Mock the database connection and models
jest.mock('@/utils/dbConnect');
jest.mock('@/models/Report');

const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;
const mockReport = Report as jest.Mocked<typeof Report>;

describe('/api/reports', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbConnect.mockResolvedValue(undefined);
  });

  describe('GET /api/reports', () => {
    it('should return reports with pagination', async () => {
      const mockReports = [
        {
          _id: '1',
          reportName: 'Sales Report',
          reportType: 'sales',
          createdAt: '2024-01-01'
        }
      ];

      mockReport.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockReports)
          })
        })
      } as any);

      mockReport.countDocuments.mockResolvedValue(1);

      const { req, res } = createMocks({
        method: 'GET',
        query: { page: '1', limit: '10' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.reports).toEqual(mockReports);
      expect(data.pagination).toBeDefined();
    });

    it('should filter reports by type', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { reportType: 'sales' }
      });

      await handler(req, res);

      expect(mockReport.find).toHaveBeenCalledWith(
        expect.objectContaining({ reportType: 'sales' })
      );
    });

    it('should search reports by name', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { search: 'monthly' }
      });

      await handler(req, res);

      expect(mockReport.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            expect.objectContaining({ reportName: /monthly/i })
          ])
        })
      );
    });
  });

  describe('POST /api/reports', () => {
    it('should create a new report', async () => {
      const reportData = {
        reportName: 'Monthly Sales Report',
        reportType: 'sales',
        filters: {
          dateRange: {
            start: '2024-01-01',
            end: '2024-01-31'
          }
        },
        columns: ['customer', 'amount', 'date'],
        groupBy: 'customer',
        sortBy: { field: 'date', order: 'desc' }
      };

      const mockReport = {
        _id: 'report123',
        ...reportData,
        save: jest.fn().mockResolvedValue(reportData)
      };

      mockReport.create.mockResolvedValue(mockReport as any);

      const { req, res } = createMocks({
        method: 'POST',
        body: reportData
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.report).toBeDefined();
    });

    it('should return 400 for invalid report data', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: { invalid: 'data' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it('should validate required fields', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          reportType: 'sales'
          // Missing reportName
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });
  });

  describe('Error handling', () => {
    it('should return 500 on database error', async () => {
      mockReport.find.mockRejectedValue(new Error('Database error'));

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
