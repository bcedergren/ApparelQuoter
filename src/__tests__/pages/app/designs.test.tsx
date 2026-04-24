import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import DesignsPage from '../../../pages/app/designs';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/app/designs',
  }),
}));

global.fetch = jest.fn();
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

describe('DesignsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state while auth is loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: jest.fn(),
    } as any);

    render(<DesignsPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
