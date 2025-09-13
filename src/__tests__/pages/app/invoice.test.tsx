import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import InvoicesPage from '../invoice';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn()
}));

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/app/invoice'
  })
}));

// Mock API calls
global.fetch = jest.fn();

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

describe('InvoicesPage', () => {
  const mockSession = {
    user: {
      id: 'user123',
      email: 'test@example.com',
      companyId: 'company123'
    }
  };

  const mockInvoices = [
    {
      _id: 'invoice1',
      invoiceNumber: 'INV-001',
      customerId: { contactName: 'John Doe' },
      invoiceDate: '2024-01-15',
      dueDate: '2024-02-14',
      status: 'draft',
      totalAmount: 1000,
      balanceDue: 1000
    },
    {
      _id: 'invoice2',
      invoiceNumber: 'INV-002',
      customerId: { contactName: 'Jane Smith' },
      invoiceDate: '2024-01-16',
      dueDate: '2024-02-15',
      status: 'sent',
      totalAmount: 1500,
      balanceDue: 1500
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated'
    });
  });

  it('should render invoices page', () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ invoices: mockInvoices, pagination: { total: 2 } })
    });

    render(<InvoicesPage />);
    
    expect(screen.getByText('Invoices')).toBeInTheDocument();
    expect(screen.getByText('Create Invoice')).toBeInTheDocument();
  });

  it('should display invoices list', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ invoices: mockInvoices, pagination: { total: 2 } })
    });

    render(<InvoicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('INV-001')).toBeInTheDocument();
      expect(screen.getByText('INV-002')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('should filter invoices by status', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ invoices: mockInvoices, pagination: { total: 2 } })
    });

    render(<InvoicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('INV-001')).toBeInTheDocument();
    });

    const statusFilter = screen.getByDisplayValue('All Statuses');
    fireEvent.change(statusFilter, { target: { value: 'draft' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=draft')
      );
    });
  });

  it('should search invoices', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ invoices: mockInvoices, pagination: { total: 2 } })
    });

    render(<InvoicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('INV-001')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search invoices...');
    fireEvent.change(searchInput, { target: { value: 'INV-001' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=INV-001')
      );
    });
  });

  it('should handle create invoice click', () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ invoices: [], pagination: { total: 0 } })
    });

    render(<InvoicesPage />);
    
    const createButton = screen.getByText('Create Invoice');
    fireEvent.click(createButton);

    // Should navigate to create invoice page
    expect(createButton).toBeInTheDocument();
  });

  it('should handle view invoice click', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ invoices: mockInvoices, pagination: { total: 2 } })
    });

    render(<InvoicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('INV-001')).toBeInTheDocument();
    });

    const viewButton = screen.getAllByText('View')[0];
    fireEvent.click(viewButton);

    // Should navigate to invoice details page
    expect(viewButton).toBeInTheDocument();
  });

  it('should handle delete invoice', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ invoices: mockInvoices, pagination: { total: 2 } })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Invoice deleted' })
      });

    render(<InvoicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('INV-001')).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByText('Delete')[0];
    fireEvent.click(deleteButton);

    // Should show confirmation dialog
    expect(screen.getByText('Are you sure you want to delete this invoice?')).toBeInTheDocument();
  });

  it('should handle download PDF', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ invoices: mockInvoices, pagination: { total: 2 } })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          invoice: mockInvoices[0],
          customer: { contactName: 'John Doe' },
          company: { name: 'Test Company' }
        })
      });

    // Mock PDF generation
    const mockPdf = {
      save: jest.fn()
    };
    jest.doMock('jspdf', () => jest.fn(() => mockPdf));

    render(<InvoicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('INV-001')).toBeInTheDocument();
    });

    const downloadButton = screen.getAllByText('Download PDF')[0];
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/invoices/invoice1')
      );
    });
  });

  it('should display loading state', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<InvoicesPage />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display error state', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<InvoicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading invoices')).toBeInTheDocument();
    });
  });

  it('should handle pagination', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        invoices: mockInvoices, 
        pagination: { total: 25, page: 1, totalPages: 3 } 
      })
    });

    render(<InvoicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('INV-001')).toBeInTheDocument();
    });

    const nextPageButton = screen.getByText('Next');
    fireEvent.click(nextPageButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2')
      );
    });
  });

  it('should show empty state when no invoices', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ invoices: [], pagination: { total: 0 } })
    });

    render(<InvoicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('No invoices found')).toBeInTheDocument();
      expect(screen.getByText('Create your first invoice to get started')).toBeInTheDocument();
    });
  });
});
