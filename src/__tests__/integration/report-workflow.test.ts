import { createMocks } from 'node-mocks-http';
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

describe('Report Workflow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbConnect.mockResolvedValue(undefined);
  });

  describe('Complete Report Workflow', () => {
    it('should create, generate data, and delete a report', async () => {
      // 1. Create a sales report
      const reportData = {
        companyId: 'company123',
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

      const createdReport = {
        _id: 'report123',
        ...reportData,
        save: jest.fn().mockResolvedValue(reportData)
      };

      mockReport.create.mockResolvedValue(createdReport as any);

      // Test report creation
      const { req: createReq, res: createRes } = createMocks({
        method: 'POST',
        body: reportData
      });

      const createHandler = require('@/pages/api/reports/index').default;
      await createHandler(createReq, createRes);

      expect(createRes._getStatusCode()).toBe(201);
      expect(mockReport.create).toHaveBeenCalledWith(reportData);

      // 2. Generate report data
      const mockSalesData = [
        {
          _id: 'sale1',
          customerId: { contactName: 'John Doe' },
          amount: 1000,
          date: '2024-01-15'
        },
        {
          _id: 'sale2',
          customerId: { contactName: 'Jane Smith' },
          amount: 1500,
          date: '2024-01-20'
        }
      ];

      mockReport.findById.mockResolvedValue(createdReport as any);
      mockSale.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockSalesData)
        })
      } as any);

      const { req: dataReq, res: dataRes } = createMocks({
        method: 'GET',
        query: { reportId: 'report123' }
      });

      const dataHandler = require('@/pages/api/reports/[reportId]/data').default;
      await dataHandler(dataReq, dataRes);

      expect(dataRes._getStatusCode()).toBe(200);
      const responseData = JSON.parse(dataRes._getData());
      expect(responseData.data).toHaveLength(2);
      expect(responseData.metadata).toBeDefined();

      // 3. Update report configuration
      const updatedReport = {
        ...createdReport,
        reportName: 'Updated Sales Report',
        filters: {
          dateRange: {
            start: '2024-02-01',
            end: '2024-02-29'
          }
        },
        save: jest.fn().mockResolvedValue({ ...reportData, reportName: 'Updated Sales Report' })
      };

      mockReport.findById.mockResolvedValue(updatedReport as any);

      const { req: updateReq, res: updateRes } = createMocks({
        method: 'PUT',
        query: { reportId: 'report123' },
        body: { reportName: 'Updated Sales Report' }
      });

      const updateHandler = require('@/pages/api/reports/[reportId]').default;
      await updateHandler(updateReq, updateRes);

      expect(updateRes._getStatusCode()).toBe(200);
      expect(updatedReport.save).toHaveBeenCalled();

      // 4. Get report details
      const { req: getReq, res: getRes } = createMocks({
        method: 'GET',
        query: { reportId: 'report123' }
      });

      const getHandler = require('@/pages/api/reports/[reportId]').default;
      await getHandler(getReq, getRes);

      expect(getRes._getStatusCode()).toBe(200);
      const getResponseData = JSON.parse(getRes._getData());
      expect(getResponseData.report.reportName).toBe('Updated Sales Report');

      // 5. Delete report
      const { req: deleteReq, res: deleteRes } = createMocks({
        method: 'DELETE',
        query: { reportId: 'report123' }
      });

      const deleteHandler = require('@/pages/api/reports/[reportId]').default;
      await deleteHandler(deleteReq, deleteRes);

      expect(deleteRes._getStatusCode()).toBe(200);
      expect(updatedReport.deleteOne).toHaveBeenCalled();
    });

    it('should handle different report types', async () => {
      // Test quotes report
      const quotesReportData = {
        companyId: 'company123',
        reportName: 'Quotes Report',
        reportType: 'quotes',
        filters: { status: 'sent' },
        columns: ['quoteNumber', 'customer', 'total', 'status']
      };

      const mockQuotesData = [
        {
          _id: 'quote1',
          quoteNumber: 'Q-001',
          customerId: { contactName: 'John Doe' },
          total: 1000,
          status: 'sent'
        }
      ];

      mockReport.findById.mockResolvedValue(quotesReportData as any);
      mockQuote.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockQuotesData)
        })
      } as any);

      const { req, res } = createMocks({
        method: 'GET',
        query: { reportId: 'quotes-report' }
      });

      const handler = require('@/pages/api/reports/[reportId]/data').default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.data).toHaveLength(1);
      expect(responseData.data[0].quoteNumber).toBe('Q-001');

      // Test customers report
      const customersReportData = {
        companyId: 'company123',
        reportName: 'Customers Report',
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

      mockReport.findById.mockResolvedValue(customersReportData as any);
      mockCustomer.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockCustomersData)
      } as any);

      const { req: customerReq, res: customerRes } = createMocks({
        method: 'GET',
        query: { reportId: 'customers-report' }
      });

      await handler(customerReq, customerRes);

      expect(customerRes._getStatusCode()).toBe(200);
      const customerResponseData = JSON.parse(customerRes._getData());
      expect(customerResponseData.data).toHaveLength(1);
      expect(customerResponseData.data[0].contactName).toBe('John Doe');
    });

    it('should handle report search and filtering', async () => {
      const mockReports = [
        {
          _id: 'report1',
          reportName: 'Monthly Sales Report',
          reportType: 'sales',
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          _id: 'report2',
          reportName: 'Customer Analysis',
          reportType: 'customers',
          createdAt: '2024-01-16T10:00:00Z'
        }
      ];

      mockReport.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockReports)
          })
        })
      } as any);

      mockReport.countDocuments.mockResolvedValue(2);

      const { req, res } = createMocks({
        method: 'GET',
        query: { reportType: 'sales', search: 'Monthly' }
      });

      const handler = require('@/pages/api/reports/index').default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.reports).toHaveLength(2);
      expect(mockReport.find).toHaveBeenCalledWith(
        expect.objectContaining({
          reportType: 'sales',
          $or: expect.arrayContaining([
            expect.objectContaining({ reportName: /Monthly/i })
          ])
        })
      );
    });

    it('should handle report data generation with filters', async () => {
      const reportData = {
        companyId: 'company123',
        reportName: 'Filtered Sales Report',
        reportType: 'sales',
        filters: {
          dateRange: {
            start: '2024-01-01',
            end: '2024-01-31'
          },
          status: 'completed'
        },
        columns: ['customer', 'amount', 'date', 'status']
      };

      const mockSalesData = [
        {
          customerId: { contactName: 'John Doe' },
          amount: 1000,
          date: '2024-01-15',
          status: 'completed'
        }
      ];

      mockReport.findById.mockResolvedValue(reportData as any);
      mockSale.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockSalesData)
        })
      } as any);

      const { req, res } = createMocks({
        method: 'GET',
        query: { reportId: 'filtered-report' }
      });

      const handler = require('@/pages/api/reports/[reportId]/data').default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(mockSale.find).toHaveBeenCalledWith(
        expect.objectContaining({
          date: {
            $gte: new Date('2024-01-01'),
            $lte: new Date('2024-01-31')
          },
          status: 'completed'
        })
      );
    });
  });

  describe('Error Handling in Report Workflow', () => {
    it('should handle unsupported report types', async () => {
      const reportData = {
        companyId: 'company123',
        reportName: 'Invalid Report',
        reportType: 'unsupported'
      };

      mockReport.findById.mockResolvedValue(reportData as any);

      const { req, res } = createMocks({
        method: 'GET',
        query: { reportId: 'invalid-report' }
      });

      const handler = require('@/pages/api/reports/[reportId]/data').default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it('should handle missing report data', async () => {
      mockReport.findById.mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'GET',
        query: { reportId: 'nonexistent' }
      });

      const handler = require('@/pages/api/reports/[reportId]/data').default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });

    it('should handle database errors during data generation', async () => {
      const reportData = {
        companyId: 'company123',
        reportName: 'Sales Report',
        reportType: 'sales'
      };

      mockReport.findById.mockResolvedValue(reportData as any);
      mockSale.find.mockRejectedValue(new Error('Database error'));

      const { req, res } = createMocks({
        method: 'GET',
        query: { reportId: 'error-report' }
      });

      const handler = require('@/pages/api/reports/[reportId]/data').default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
    });
  });
});
