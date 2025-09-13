import { createMocks } from 'node-mocks-http';
import handler from '../../[reportId]/data';
import dbConnect from '@/utils/dbConnect';
import Report from '@/models/Report';
import Sale from '@/models/Sale';
import Quote from '@/models/Quote';
import Customer from '@/models/Customer';

// Mock the database connection and models
jest.mock('@/utils/dbConnect');
jest.mock('@/models/Report');
jest.mock('@/models/Sale');
jest.mock('@/models/Quote');
jest.mock('@/models/Customer');

const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;
const mockReport = Report as jest.Mocked<typeof Report>;
const mockSale = Sale as jest.Mocked<typeof Sale>;
const mockQuote = Quote as jest.Mocked<typeof Quote>;
const mockCustomer = Customer as jest.Mocked<typeof Customer>;

describe('/api/reports/[reportId]/data', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbConnect.mockResolvedValue(undefined);
  });

  describe('GET /api/reports/[reportId]/data', () => {
    it('should generate sales report data', async () => {
      const mockReportData = {
        _id: 'report123',
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

      const mockSalesData = [
        {
          _id: 'sale1',
          customerId: { contactName: 'John Doe' },
          amount: 1000,
          date: '2024-01-15'
        }
      ];

      mockReport.findById.mockResolvedValue(mockReportData as any);
      mockSale.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockSalesData)
        })
      } as any);

      const { req, res } = createMocks({
        method: 'GET',
        query: { reportId: 'report123' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.data).toBeDefined();
      expect(data.metadata).toBeDefined();
    });

    it('should generate quotes report data', async () => {
      const mockReportData = {
        _id: 'report123',
        reportType: 'quotes',
        filters: {
          status: 'sent'
        },
        columns: ['quoteNumber', 'customer', 'total', 'status']
      };

      const mockQuotesData = [
        {
          _id: 'quote1',
          quoteNumber: 'Q-001',
          customerId: { contactName: 'Jane Doe' },
          total: 1500,
          status: 'sent'
        }
      ];

      mockReport.findById.mockResolvedValue(mockReportData as any);
      mockQuote.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockQuotesData)
        })
      } as any);

      const { req, res } = createMocks({
        method: 'GET',
        query: { reportId: 'report123' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.data).toBeDefined();
    });

    it('should generate customers report data', async () => {
      const mockReportData = {
        _id: 'report123',
        reportType: 'customers',
        filters: {},
        columns: ['contactName', 'email', 'phone', 'createdDate']
      };

      const mockCustomersData = [
        {
          _id: 'customer1',
          contactName: 'John Doe',
          email: 'john@example.com',
          phone: '555-1234',
          createdDate: '2024-01-01'
        }
      ];

      mockReport.findById.mockResolvedValue(mockReportData as any);
      mockCustomer.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockCustomersData)
      } as any);

      const { req, res } = createMocks({
        method: 'GET',
        query: { reportId: 'report123' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.data).toBeDefined();
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

    it('should return 400 for unsupported report type', async () => {
      const mockReportData = {
        _id: 'report123',
        reportType: 'unsupported'
      };

      mockReport.findById.mockResolvedValue(mockReportData as any);

      const { req, res } = createMocks({
        method: 'GET',
        query: { reportId: 'report123' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it('should apply date range filters', async () => {
      const mockReportData = {
        _id: 'report123',
        reportType: 'sales',
        filters: {
          dateRange: {
            start: '2024-01-01',
            end: '2024-01-31'
          }
        }
      };

      mockReport.findById.mockResolvedValue(mockReportData as any);
      mockSale.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([])
        })
      } as any);

      const { req, res } = createMocks({
        method: 'GET',
        query: { reportId: 'report123' }
      });

      await handler(req, res);

      expect(mockSale.find).toHaveBeenCalledWith(
        expect.objectContaining({
          date: {
            $gte: new Date('2024-01-01'),
            $lte: new Date('2024-01-31')
          }
        })
      );
    });

    it('should apply status filters', async () => {
      const mockReportData = {
        _id: 'report123',
        reportType: 'quotes',
        filters: {
          status: 'sent'
        }
      };

      mockReport.findById.mockResolvedValue(mockReportData as any);
      mockQuote.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([])
        })
      } as any);

      const { req, res } = createMocks({
        method: 'GET',
        query: { reportId: 'report123' }
      });

      await handler(req, res);

      expect(mockQuote.find).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'sent'
        })
      );
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
