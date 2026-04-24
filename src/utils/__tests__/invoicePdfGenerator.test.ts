import { generateInvoicePDF } from '../invoicePdfGenerator';
import { Invoice, InvoiceItem } from '@/types/Invoice';
import { Customer } from '@/types/Customer';
import { Company } from '@/types/Company';

// Mock jsPDF
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    setTextColor: jest.fn(),
    setFillColor: jest.fn(),
    text: jest.fn(),
    rect: jest.fn(),
    addPage: jest.fn(),
    save: jest.fn(),
    splitTextToSize: jest.fn((text) => [text]),
    autoTable: jest.fn(function () {
      this.lastAutoTable = { finalY: 120 };
    }),
    internal: {
      pageSize: {
        width: 595.28,
        height: 841.89,
        getWidth: jest.fn(() => 595.28),
        getHeight: jest.fn(() => 841.89)
      }
    }
  }));
});

describe('Invoice PDF Generator', () => {
  const mockInvoice: Invoice = {
    _id: 'invoice123',
    companyId: 'company123',
    customerId: 'customer123',
    invoiceNumber: 'INV-001',
    items: [
      {
        description: 'Test Item 1',
        quantity: 2,
        unitPrice: 100,
        total: 200
      },
      {
        description: 'Test Item 2',
        quantity: 1,
        unitPrice: 150,
        total: 150
      }
    ],
    totalAmount: 350,
    balanceDue: 350,
    status: 'draft',
    invoiceDate: '2024-01-15',
    dueDate: '2024-02-14',
    paymentTerms: 'Net 30',
    notes: 'Thank you for your business!',
    payments: [],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  };

  const mockCustomer: Customer = {
    _id: 'customer123',
    companyId: 'company123',
    companyName: 'Test Company',
    contactName: 'John Doe',
    address: '123 Main St',
    address2: 'Suite 100',
    city: 'Anytown',
    state: 'CA',
    zip: '12345',
    phone: '555-1234',
    email: 'john@testcompany.com',
    followUpNotes: [],
    createdBy: 'user123',
    createdDate: '2024-01-01T00:00:00Z'
  };

  const mockCompany: Company = {
    _id: 'company123',
    name: 'My Company',
    streetAddress: '456 Business Ave',
    city: 'Business City',
    state: 'NY',
    zip: '54321',
    phone: '555-5678',
    email: 'info@mycompany.com',
    paymentMethods: ['credit_card', 'check'],
    salesTax: '8.5',
    creditCardCharge: '3.5',
    offerings: ['apparel', 'printing'],
    quoteIdFormat: 'Q-{YYYY}-{MM}-{DD}-{###}'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateInvoicePDF', () => {
    it('should generate a PDF with invoice data', () => {
      const pdf = generateInvoicePDF({
        invoice: mockInvoice,
        customer: mockCustomer,
        company: mockCompany
      });

      expect(pdf).toBeDefined();
      expect(pdf.text).toHaveBeenCalled();
      expect(pdf.autoTable).toHaveBeenCalled();
    });

    it('should include company information', () => {
      const pdf = generateInvoicePDF({
        invoice: mockInvoice,
        customer: mockCustomer,
        company: mockCompany
      });

      expect(pdf.text).toHaveBeenCalledWith('My Company', expect.any(Number), 25);
      expect(pdf.text).toHaveBeenCalledWith('456 Business Ave', expect.any(Number), 35);
      expect(pdf.text).toHaveBeenCalledWith('Business City, NY 54321', expect.any(Number), 40);
    });

    it('should include customer information', () => {
      const pdf = generateInvoicePDF({
        invoice: mockInvoice,
        customer: mockCustomer,
        company: mockCompany
      });

      expect(pdf.text).toHaveBeenCalledWith('John Doe', expect.any(Number), 95);
      expect(pdf.text).toHaveBeenCalledWith('john@testcompany.com', expect.any(Number), 100);
      expect(pdf.text).toHaveBeenCalledWith('555-1234', expect.any(Number), 105);
    });

    it('should include invoice details', () => {
      const pdf = generateInvoicePDF({
        invoice: mockInvoice,
        customer: mockCustomer,
        company: mockCompany
      });

      expect(pdf.text).toHaveBeenCalledWith('INV-001', expect.any(Number), 35);
      expect(pdf.text).toHaveBeenCalled();
    });

    it('should include items table', () => {
      const pdf = generateInvoicePDF({
        invoice: mockInvoice,
        customer: mockCustomer,
        company: mockCompany
      });

      expect(pdf.autoTable).toHaveBeenCalledWith(
        expect.objectContaining({
          head: [['Description', 'Qty', 'Unit Price', 'Total']],
          body: [
            ['Test Item 1', '2', '$100.00', '$200.00'],
            ['Test Item 2', '1', '$150.00', '$150.00']
          ]
        })
      );
    });

    it('should include totals', () => {
      const pdf = generateInvoicePDF({
        invoice: mockInvoice,
        customer: mockCustomer,
        company: mockCompany
      });

      expect(pdf.text).toHaveBeenCalledWith('Total: $350.00', expect.any(Number), expect.any(Number));
    });

    it('should handle different invoice statuses', () => {
      const paidInvoice = { ...mockInvoice, status: 'paid' as const };
      const pdf = generateInvoicePDF({
        invoice: paidInvoice,
        customer: mockCustomer,
        company: mockCompany
      });

      expect(pdf.rect).toHaveBeenCalled();
    });

    it('should handle missing optional fields', () => {
      const minimalCustomer = {
        ...mockCustomer,
        address2: undefined,
        phone: undefined
      };

      const minimalCompany = {
        ...mockCompany,
        fax: undefined,
        url: undefined
      };

      const pdf = generateInvoicePDF({
        invoice: mockInvoice,
        customer: minimalCustomer,
        company: minimalCompany
      });

      expect(pdf).toBeDefined();
      expect(pdf.text).toHaveBeenCalled();
    });

    it('should handle empty items array', () => {
      const emptyItemsInvoice = { ...mockInvoice, items: [] };
      const pdf = generateInvoicePDF({
        invoice: emptyItemsInvoice,
        customer: mockCustomer,
        company: mockCompany
      });

      expect(pdf.autoTable).toHaveBeenCalledWith(
        expect.objectContaining({
          body: []
        })
      );
    });

    it('should handle zero amounts', () => {
      const zeroAmountInvoice = {
        ...mockInvoice,
        items: [
          {
            description: 'Free Item',
            quantity: 1,
            unitPrice: 0,
            total: 0
          }
        ],
        totalAmount: 0,
        balanceDue: 0
      };

      const pdf = generateInvoicePDF({
        invoice: zeroAmountInvoice,
        customer: mockCustomer,
        company: mockCompany
      });

      expect(pdf.text).toHaveBeenCalledWith('Total: $0.00', expect.any(Number), expect.any(Number));
    });

    it('should format currency correctly', () => {
      const pdf = generateInvoicePDF({
        invoice: mockInvoice,
        customer: mockCustomer,
        company: mockCompany
      });

      // Check that currency formatting is applied
      expect(pdf.autoTable).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.arrayContaining([
            expect.arrayContaining(['$100.00']),
            expect.arrayContaining(['$150.00'])
          ])
        })
      );
    });
  });
});
