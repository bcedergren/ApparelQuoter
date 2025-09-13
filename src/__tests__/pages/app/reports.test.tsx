import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import ReportsPage from '../reports';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn()
}));

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/app/reports'
  })
}));

// Mock API calls
global.fetch = jest.fn();

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

describe('ReportsPage', () => {
  const mockSession = {
    user: {
      id: 'user123',
      email: 'test@example.com',
      companyId: 'company123'
    }
  };

  const mockReports = [
    {
      _id: 'report1',
      reportName: 'Monthly Sales Report',
      reportType: 'sales',
      description: 'Monthly sales analysis',
      createdAt: '2024-01-15T10:00:00Z',
      lastGenerated: '2024-01-15T10:00:00Z',
      generatedBy: { name: 'User 1' }
    },
    {
      _id: 'report2',
      reportName: 'Customer Analysis',
      reportType: 'customers',
      description: 'Customer behavior analysis',
      createdAt: '2024-01-16T10:00:00Z',
      lastGenerated: '2024-01-16T10:00:00Z',
      generatedBy: { name: 'User 2' }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated'
    });
  });

  it('should render reports page', () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ reports: mockReports, pagination: { total: 2 } })
    });

    render(<ReportsPage />);
    
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Create Report')).toBeInTheDocument();
  });

  it('should display reports list', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ reports: mockReports, pagination: { total: 2 } })
    });

    render(<ReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Monthly Sales Report')).toBeInTheDocument();
      expect(screen.getByText('Customer Analysis')).toBeInTheDocument();
      expect(screen.getByText('Sales')).toBeInTheDocument();
      expect(screen.getByText('Customers')).toBeInTheDocument();
    });
  });

  it('should filter reports by type', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ reports: mockReports, pagination: { total: 2 } })
    });

    render(<ReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Monthly Sales Report')).toBeInTheDocument();
    });

    const typeFilter = screen.getByDisplayValue('All Types');
    fireEvent.change(typeFilter, { target: { value: 'sales' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('reportType=sales')
      );
    });
  });

  it('should search reports', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ reports: mockReports, pagination: { total: 2 } })
    });

    render(<ReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Monthly Sales Report')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search reports...');
    fireEvent.change(searchInput, { target: { value: 'Monthly' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=Monthly')
      );
    });
  });

  it('should handle create report click', () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ reports: [], pagination: { total: 0 } })
    });

    render(<ReportsPage />);
    
    const createButton = screen.getByText('Create Report');
    fireEvent.click(createButton);

    // Should navigate to create report page
    expect(createButton).toBeInTheDocument();
  });

  it('should handle view report click', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ reports: mockReports, pagination: { total: 2 } })
    });

    render(<ReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Monthly Sales Report')).toBeInTheDocument();
    });

    const viewButton = screen.getAllByText('View')[0];
    fireEvent.click(viewButton);

    // Should navigate to report details page
    expect(viewButton).toBeInTheDocument();
  });

  it('should handle edit report click', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ reports: mockReports, pagination: { total: 2 } })
    });

    render(<ReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Monthly Sales Report')).toBeInTheDocument();
    });

    const editButton = screen.getAllByText('Edit')[0];
    fireEvent.click(editButton);

    // Should navigate to edit report page
    expect(editButton).toBeInTheDocument();
  });

  it('should handle generate report click', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reports: mockReports, pagination: { total: 2 } })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          data: [{ customer: 'John Doe', amount: 1000 }],
          metadata: { totalRecords: 1 }
        })
      });

    render(<ReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Monthly Sales Report')).toBeInTheDocument();
    });

    const generateButton = screen.getAllByText('Generate')[0];
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/reports/report1/data')
      );
    });
  });

  it('should handle export report click', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reports: mockReports, pagination: { total: 2 } })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          data: [{ customer: 'John Doe', amount: 1000 }],
          metadata: { totalRecords: 1 }
        })
      });

    render(<ReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Monthly Sales Report')).toBeInTheDocument();
    });

    const exportButton = screen.getAllByText('Export')[0];
    fireEvent.click(exportButton);

    // Should show export options
    expect(exportButton).toBeInTheDocument();
  });

  it('should handle delete report', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reports: mockReports, pagination: { total: 2 } })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Report deleted' })
      });

    render(<ReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Monthly Sales Report')).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByText('Delete')[0];
    fireEvent.click(deleteButton);

    // Should show confirmation dialog
    expect(screen.getByText('Are you sure you want to delete this report?')).toBeInTheDocument();
  });

  it('should display report type badges correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ reports: mockReports, pagination: { total: 2 } })
    });

    render(<ReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Sales')).toBeInTheDocument();
      expect(screen.getByText('Customers')).toBeInTheDocument();
    });
  });

  it('should display last generated date', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ reports: mockReports, pagination: { total: 2 } })
    });

    render(<ReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('01/15/2024')).toBeInTheDocument();
      expect(screen.getByText('01/16/2024')).toBeInTheDocument();
    });
  });

  it('should display loading state', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<ReportsPage />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display error state', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<ReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading reports')).toBeInTheDocument();
    });
  });

  it('should show empty state when no reports', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ reports: [], pagination: { total: 0 } })
    });

    render(<ReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('No reports found')).toBeInTheDocument();
      expect(screen.getByText('Create your first report to get started')).toBeInTheDocument();
    });
  });

  it('should handle pagination', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        reports: mockReports, 
        pagination: { total: 25, page: 1, totalPages: 3 } 
      })
    });

    render(<ReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Monthly Sales Report')).toBeInTheDocument();
    });

    const nextPageButton = screen.getByText('Next');
    fireEvent.click(nextPageButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2')
      );
    });
  });

  it('should handle report generation error', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ reports: mockReports, pagination: { total: 2 } })
      })
      .mockRejectedValueOnce(new Error('Generation failed'));

    render(<ReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Monthly Sales Report')).toBeInTheDocument();
    });

    const generateButton = screen.getAllByText('Generate')[0];
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Error generating report')).toBeInTheDocument();
    });
  });
});
