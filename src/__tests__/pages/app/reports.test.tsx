import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import ReportsPage from '../../../pages/app/reports';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/app/reports',
  }),
}));

global.fetch = jest.fn();
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

describe('ReportsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state while auth is loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: jest.fn(),
    } as any);

    render(<ReportsPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
