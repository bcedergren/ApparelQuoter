import { createMocks } from 'node-mocks-http';
import handler from '../[reportId]';
import dbConnect from '@/utils/dbConnect';
import Report from '@/models/Report';

// Mock the database connection and models
jest.mock('@/utils/dbConnect');
jest.mock('@/models/Report');

const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;
const mockReport = Report as jest.Mocked<typeof Report>;

describe('/api/reports/[reportId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbConnect.mockResolvedValue(undefined);
  });

  describe('GET /api/reports/[reportId]', () => {
    it('should return report details', async () => {
      const mockReportData = {
        _id: 'report123',
        reportName: 'Sales Report',
        reportType: 'sales',
        filters: { dateRange: { start: '2024-01-01', end: '2024-01-31' } },
        columns: ['customer', 'amount', 'date']
      };

      mockReport.findById.mockResolvedValue(mockReportData as any);

      const { req, res } = createMocks({
        method: 'GET',
        query: { reportId: 'report123' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.report).toEqual(mockReportData);
    });

    it('should return 404 if report not found', async () => {
      mockReport.findById.mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'GET',
        query: { reportId: 'nonexistent' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });
  });

  describe('PUT /api/reports/[reportId]', () => {
    it('should update report successfully', async () => {
      const existingReport = {
        _id: 'report123',
        reportName: 'Old Name',
        reportType: 'sales',
        save: jest.fn().mockResolvedValue({})
      };

      mockReport.findById.mockResolvedValue(existingReport as any);

      const updateData = {
        reportName: 'Updated Sales Report',
        filters: { dateRange: { start: '2024-02-01', end: '2024-02-29' } }
      };

      const { req, res } = createMocks({
        method: 'PUT',
        query: { reportId: 'report123' },
        body: updateData
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(existingReport.save).toHaveBeenCalled();
      expect(existingReport.reportName).toBe('Updated Sales Report');
    });

    it('should return 404 if report not found for update', async () => {
      mockReport.findById.mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'PUT',
        query: { reportId: 'nonexistent' },
        body: { reportName: 'Updated' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });

    it('should validate required fields', async () => {
      const existingReport = {
        _id: 'report123',
        save: jest.fn()
      };

      mockReport.findById.mockResolvedValue(existingReport as any);

      const { req, res } = createMocks({
        method: 'PUT',
        query: { reportId: 'report123' },
        body: { invalidField: 'value' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });
  });

  describe('DELETE /api/reports/[reportId]', () => {
    it('should delete report successfully', async () => {
      const existingReport = {
        _id: 'report123',
        deleteOne: jest.fn().mockResolvedValue({})
      };

      mockReport.findById.mockResolvedValue(existingReport as any);

      const { req, res } = createMocks({
        method: 'DELETE',
        query: { reportId: 'report123' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(existingReport.deleteOne).toHaveBeenCalled();
    });

    it('should return 404 if report not found for deletion', async () => {
      mockReport.findById.mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'DELETE',
        query: { reportId: 'nonexistent' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });
  });

  describe('Error handling', () => {
    it('should return 500 on database error', async () => {
      mockReport.findById.mockRejectedValue(new Error('Database error'));

      const { req, res } = createMocks({
        method: 'GET',
        query: { reportId: 'report123' }
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
