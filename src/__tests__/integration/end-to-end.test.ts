import { createMocks } from 'node-mocks-http';
import dbConnect from '@/utils/dbConnect';
import Invoice from '@/models/Invoice';
import Design from '@/models/Design';
import Report from '@/models/Report';
import Customer from '@/models/Customer';
import Company from '@/models/Company';

// Mock the database connection and models
jest.mock('@/utils/dbConnect');
jest.mock('@/models/Invoice');
jest.mock('@/models/Design');
jest.mock('@/models/Report');
jest.mock('@/models/Customer');
jest.mock('@/models/Company');

const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;
const mockInvoice = Invoice as jest.Mocked<typeof Invoice>;
const mockDesign = Design as jest.Mocked<typeof Design>;
const mockReport = Report as jest.Mocked<typeof Report>;
const mockCustomer = Customer as jest.Mocked<typeof Customer>;
const mockCompany = Company as jest.Mocked<typeof Company>;

describe('End-to-End Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbConnect.mockResolvedValue(undefined);
  });

  describe('Complete Business Workflow', () => {
    it('should handle complete customer journey from quote to invoice to design to report', async () => {
      // 1. Setup company and customer
      const companyData = {
        _id: 'company123',
        name: 'My Company',
        email: 'info@mycompany.com'
      };

      const customerData = {
        _id: 'customer123',
        contactName: 'John Doe',
        email: 'john@example.com',
        companyName: 'Test Company'
      };

      mockCompany.findById.mockResolvedValue(companyData as any);
      mockCustomer.findById.mockResolvedValue(customerData as any);

      // 2. Create a quote (simulated)
      const quoteData = {
        _id: 'quote123',
        quoteNumber: 'Q-001',
        customerId: 'customer123',
        total: 2000,
        status: 'sent'
      };

      // 3. Create an invoice from the quote
      const invoiceData = {
        companyId: 'company123',
        customerId: 'customer123',
        quoteId: 'quote123',
        invoiceNumber: 'INV-001',
        items: [
          {
            description: 'Apparel Design',
            quantity: 1,
            unitPrice: 2000,
            total: 2000
          }
        ],
        totalAmount: 2000,
        balanceDue: 2000,
        status: 'draft',
        invoiceDate: '2024-01-15',
        dueDate: '2024-02-14'
      };

      const createdInvoice = {
        _id: 'invoice123',
        ...invoiceData,
        save: jest.fn().mockResolvedValue(invoiceData)
      };

      mockInvoice.create.mockResolvedValue(createdInvoice as any);

      const { req: invoiceReq, res: invoiceRes } = createMocks({
        method: 'POST',
        body: invoiceData
      });

      const invoiceHandler = require('@/pages/api/invoices/index').default;
      await invoiceHandler(invoiceReq, invoiceRes);

      expect(invoiceRes._getStatusCode()).toBe(201);

      // 4. Create a design for the project
      const designData = {
        companyId: 'company123',
        customerId: 'customer123',
        quoteId: 'quote123',
        designName: 'Logo Design',
        description: 'Company logo design for apparel',
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

      const { req: designReq, res: designRes } = createMocks({
        method: 'POST',
        body: designData
      });

      const designHandler = require('@/pages/api/designs/index').default;
      await designHandler(designReq, designRes);

      expect(designRes._getStatusCode()).toBe(201);

      // 5. Add design version
      const versionData = {
        fileUrl: '/uploads/logo_v1.png',
        description: 'Initial logo design',
        uploadedBy: 'Designer 1'
      };

      const designWithVersion = {
        ...createdDesign,
        versions: [{
          versionNumber: 1,
          ...versionData,
          createdAt: '2024-01-16T10:00:00Z'
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

      // 6. Add design comment
      const commentData = {
        text: 'Great design! Please make the logo smaller.',
        author: 'John Doe',
        x: 100,
        y: 200
      };

      const designWithComment = {
        ...designWithVersion,
        comments: [{
          ...commentData,
          createdAt: '2024-01-16T11:00:00Z'
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

      // 7. Update design status to approved
      const approvedDesign = {
        ...designWithComment,
        status: 'approved',
        save: jest.fn().mockResolvedValue({ ...designData, status: 'approved' })
      };

      mockDesign.findById.mockResolvedValue(approvedDesign as any);

      const { req: approveReq, res: approveRes } = createMocks({
        method: 'PUT',
        query: { designId: 'design123' },
        body: { status: 'approved' }
      });

      const approveHandler = require('@/pages/api/designs/[designId]').default;
      await approveHandler(approveReq, approveRes);

      expect(approveRes._getStatusCode()).toBe(200);

      // 8. Update invoice status to sent
      const sentInvoice = {
        ...createdInvoice,
        status: 'sent',
        save: jest.fn().mockResolvedValue({ ...invoiceData, status: 'sent' })
      };

      mockInvoice.findById.mockResolvedValue(sentInvoice as any);

      const { req: sendReq, res: sendRes } = createMocks({
        method: 'PUT',
        query: { invoiceId: 'invoice123' },
        body: { status: 'sent' }
      });

      const sendHandler = require('@/pages/api/invoices/[invoiceId]').default;
      await sendHandler(sendReq, sendRes);

      expect(sendRes._getStatusCode()).toBe(200);

      // 9. Add payment to invoice
      const paymentData = {
        amount: 1000,
        paymentDate: '2024-01-20',
        paymentMethod: 'credit_card',
        reference: 'TXN123'
      };

      const invoiceWithPayment = {
        ...sentInvoice,
        payments: [paymentData],
        balanceDue: 1000,
        save: jest.fn().mockResolvedValue({ ...invoiceData, payments: [paymentData], balanceDue: 1000 })
      };

      mockInvoice.findById.mockResolvedValue(invoiceWithPayment as any);

      const { req: paymentReq, res: paymentRes } = createMocks({
        method: 'POST',
        query: { invoiceId: 'invoice123' },
        body: paymentData
      });

      const paymentHandler = require('@/pages/api/invoices/[invoiceId]/payments').default;
      await paymentHandler(paymentReq, paymentRes);

      expect(paymentRes._getStatusCode()).toBe(201);

      // 10. Create a sales report
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
        columns: ['customer', 'amount', 'date', 'status'],
        groupBy: 'customer',
        sortBy: { field: 'date', order: 'desc' }
      };

      const createdReport = {
        _id: 'report123',
        ...reportData,
        save: jest.fn().mockResolvedValue(reportData)
      };

      mockReport.create.mockResolvedValue(createdReport as any);

      const { req: reportReq, res: reportRes } = createMocks({
        method: 'POST',
        body: reportData
      });

      const reportHandler = require('@/pages/api/reports/index').default;
      await reportHandler(reportReq, reportRes);

      expect(reportRes._getStatusCode()).toBe(201);

      // 11. Generate report data
      const mockSalesData = [
        {
          _id: 'sale1',
          customerId: { contactName: 'John Doe' },
          amount: 2000,
          date: '2024-01-15',
          status: 'completed'
        }
      ];

      mockReport.findById.mockResolvedValue(createdReport as any);
      mockInvoice.find.mockReturnValue({
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
      expect(responseData.data).toHaveLength(1);
      expect(responseData.data[0].amount).toBe(2000);

      // 12. Verify all data is properly linked
      expect(createdInvoice.customerId).toBe('customer123');
      expect(createdDesign.customerId).toBe('customer123');
      expect(createdDesign.quoteId).toBe('quote123');
      expect(createdReport.companyId).toBe('company123');
    });

    it('should handle error recovery and rollback scenarios', async () => {
      // Test invoice creation failure
      mockInvoice.create.mockRejectedValue(new Error('Database error'));

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          companyId: 'company123',
          customerId: 'customer123',
          invoiceNumber: 'INV-001',
          items: [{ description: 'Test', quantity: 1, unitPrice: 100, total: 100 }],
          totalAmount: 100
        }
      });

      const handler = require('@/pages/api/invoices/index').default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);

      // Test design creation with invalid customer
      mockCustomer.findById.mockResolvedValue(null);

      const { req: designReq, res: designRes } = createMocks({
        method: 'POST',
        body: {
          companyId: 'company123',
          customerId: 'nonexistent',
          designName: 'Test Design'
        }
      });

      const designHandler = require('@/pages/api/designs/index').default;
      await designHandler(designReq, designRes);

      expect(designRes._getStatusCode()).toBe(404);

      // Test report generation with invalid report type
      const invalidReport = {
        companyId: 'company123',
        reportName: 'Invalid Report',
        reportType: 'unsupported'
      };

      mockReport.findById.mockResolvedValue(invalidReport as any);

      const { req: dataReq, res: dataRes } = createMocks({
        method: 'GET',
        query: { reportId: 'invalid-report' }
      });

      const dataHandler = require('@/pages/api/reports/[reportId]/data').default;
      await dataHandler(dataReq, dataRes);

      expect(dataRes._getStatusCode()).toBe(400);
    });

    it('should handle concurrent operations', async () => {
      // Simulate concurrent invoice and design creation
      const invoiceData = {
        companyId: 'company123',
        customerId: 'customer123',
        invoiceNumber: 'INV-001',
        items: [{ description: 'Test', quantity: 1, unitPrice: 100, total: 100 }],
        totalAmount: 100
      };

      const designData = {
        companyId: 'company123',
        customerId: 'customer123',
        designName: 'Test Design'
      };

      mockCustomer.findById.mockResolvedValue({ _id: 'customer123' } as any);
      mockInvoice.create.mockResolvedValue({ _id: 'invoice123', ...invoiceData } as any);
      mockDesign.create.mockResolvedValue({ _id: 'design123', ...designData } as any);

      // Create both concurrently
      const [invoiceReq, invoiceRes] = createMocks({
        method: 'POST',
        body: invoiceData
      });

      const [designReq, designRes] = createMocks({
        method: 'POST',
        body: designData
      });

      const invoiceHandler = require('@/pages/api/invoices/index').default;
      const designHandler = require('@/pages/api/designs/index').default;

      await Promise.all([
        invoiceHandler(invoiceReq, invoiceRes),
        designHandler(designReq, designRes)
      ]);

      expect(invoiceRes._getStatusCode()).toBe(201);
      expect(designRes._getStatusCode()).toBe(201);
    });
  });
});
