import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import DesignsPage from '../designs';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn()
}));

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/app/designs'
  })
}));

// Mock API calls
global.fetch = jest.fn();

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

describe('DesignsPage', () => {
  const mockSession = {
    user: {
      id: 'user123',
      email: 'test@example.com',
      companyId: 'company123'
    }
  };

  const mockDesigns = [
    {
      _id: 'design1',
      designName: 'Logo Design',
      description: 'Company logo design',
      status: 'draft',
      priority: 'high',
      customerId: { contactName: 'John Doe' },
      quoteId: { quoteNumber: 'Q-001' },
      assignedTo: { name: 'Designer 1' },
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      _id: 'design2',
      designName: 'Banner Design',
      description: 'Website banner design',
      status: 'in_progress',
      priority: 'medium',
      customerId: { contactName: 'Jane Smith' },
      quoteId: { quoteNumber: 'Q-002' },
      assignedTo: { name: 'Designer 2' },
      createdAt: '2024-01-16T10:00:00Z'
    }
  ];

  const mockCustomers = [
    { _id: 'customer1', contactName: 'John Doe' },
    { _id: 'customer2', contactName: 'Jane Smith' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated'
    });
  });

  it('should render designs page', () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ designs: mockDesigns, pagination: { total: 2 } })
    });

    render(<DesignsPage />);
    
    expect(screen.getByText('Designs')).toBeInTheDocument();
    expect(screen.getByText('Upload Design')).toBeInTheDocument();
  });

  it('should display designs list', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ designs: mockDesigns, pagination: { total: 2 } })
    });

    render(<DesignsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Logo Design')).toBeInTheDocument();
      expect(screen.getByText('Banner Design')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('should filter designs by status', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ designs: mockDesigns, pagination: { total: 2 } })
    });

    render(<DesignsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Logo Design')).toBeInTheDocument();
    });

    const statusFilter = screen.getByDisplayValue('All Statuses');
    fireEvent.change(statusFilter, { target: { value: 'draft' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=draft')
      );
    });
  });

  it('should filter designs by priority', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ designs: mockDesigns, pagination: { total: 2 } })
    });

    render(<DesignsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Logo Design')).toBeInTheDocument();
    });

    const priorityFilter = screen.getByDisplayValue('All Priorities');
    fireEvent.change(priorityFilter, { target: { value: 'high' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('priority=high')
      );
    });
  });

  it('should filter designs by customer', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ designs: mockDesigns, pagination: { total: 2 } })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ customers: mockCustomers })
      });

    render(<DesignsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Logo Design')).toBeInTheDocument();
    });

    const customerFilter = screen.getByDisplayValue('All Customers');
    fireEvent.change(customerFilter, { target: { value: 'customer1' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('customerId=customer1')
      );
    });
  });

  it('should search designs', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ designs: mockDesigns, pagination: { total: 2 } })
    });

    render(<DesignsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Logo Design')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search designs...');
    fireEvent.change(searchInput, { target: { value: 'Logo' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=Logo')
      );
    });
  });

  it('should handle upload design click', () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ designs: [], pagination: { total: 0 } })
    });

    render(<DesignsPage />);
    
    const uploadButton = screen.getByText('Upload Design');
    fireEvent.click(uploadButton);

    // Should show upload modal or navigate to upload page
    expect(uploadButton).toBeInTheDocument();
  });

  it('should handle view design click', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ designs: mockDesigns, pagination: { total: 2 } })
    });

    render(<DesignsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Logo Design')).toBeInTheDocument();
    });

    const viewButton = screen.getAllByText('View')[0];
    fireEvent.click(viewButton);

    // Should navigate to design details page
    expect(viewButton).toBeInTheDocument();
  });

  it('should handle edit design click', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ designs: mockDesigns, pagination: { total: 2 } })
    });

    render(<DesignsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Logo Design')).toBeInTheDocument();
    });

    const editButton = screen.getAllByText('Edit')[0];
    fireEvent.click(editButton);

    // Should navigate to edit design page
    expect(editButton).toBeInTheDocument();
  });

  it('should handle delete design', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ designs: mockDesigns, pagination: { total: 2 } })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Design deleted' })
      });

    render(<DesignsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Logo Design')).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByText('Delete')[0];
    fireEvent.click(deleteButton);

    // Should show confirmation dialog
    expect(screen.getByText('Are you sure you want to delete this design?')).toBeInTheDocument();
  });

  it('should display status badges correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ designs: mockDesigns, pagination: { total: 2 } })
    });

    render(<DesignsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Draft')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });
  });

  it('should display priority badges correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ designs: mockDesigns, pagination: { total: 2 } })
    });

    render(<DesignsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
    });
  });

  it('should display loading state', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<DesignsPage />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display error state', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<DesignsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading designs')).toBeInTheDocument();
    });
  });

  it('should show empty state when no designs', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ designs: [], pagination: { total: 0 } })
    });

    render(<DesignsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('No designs found')).toBeInTheDocument();
      expect(screen.getByText('Upload your first design to get started')).toBeInTheDocument();
    });
  });

  it('should handle pagination', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        designs: mockDesigns, 
        pagination: { total: 25, page: 1, totalPages: 3 } 
      })
    });

    render(<DesignsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Logo Design')).toBeInTheDocument();
    });

    const nextPageButton = screen.getByText('Next');
    fireEvent.click(nextPageButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2')
      );
    });
  });
});
