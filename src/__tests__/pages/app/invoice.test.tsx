import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import InvoicesPage from '../../../pages/app/invoice';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/app/invoice',
  }),
}));

global.fetch = jest.fn();
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

describe('InvoicesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: {
        user: { id: 'u1', email: 'test@example.com', companyId: 'c1' },
        expires: '2099-01-01T00:00:00.000Z',
      } as any,
      status: 'authenticated',
      update: jest.fn(),
    } as any);
  });

  it('renders invoice table data', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          invoices: [
            {
              _id: 'i1',
              invoiceNumber: 'INV-001',
              customerId: { contactName: 'John Doe' },
              invoiceDate: '2024-01-15',
              dueDate: '2024-02-14',
              status: 'draft',
              totalAmount: 1000,
              balanceDue: 1000,
            },
          ],
          pagination: { page: 1, limit: 10, total: 1, pages: 1 },
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ customers: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ company: { name: 'Acme' } }) });

    render(<InvoicesPage />);

    await waitFor(() => {
      expect(screen.getByText('Invoices')).toBeInTheDocument();
      expect(screen.getByText('Create Invoice')).toBeInTheDocument();
      expect(screen.getByText('INV-001')).toBeInTheDocument();
    });
  });

  it('renders error banner when API fails', async () => {
    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({ ok: true, json: async () => ({ customers: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ company: null }) });

    render(<InvoicesPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch invoices')).toBeInTheDocument();
    });
  });
});
