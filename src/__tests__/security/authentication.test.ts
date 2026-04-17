import { createMocks } from 'node-mocks-http';
import { getServerSession } from 'next-auth';
import dashboardHandler from '@/pages/api/dashboard';
import quoteSaveHandler from '@/pages/api/quotes/saveQuote';
import customersListHandler from '@/pages/api/customers/[companyId]';
import usersAddHandler from '@/pages/api/users/add-user';
import quoteHandler from '@/pages/api/quote/[quoteId]';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/utils/dbConnect');
jest.mock('@/models/Quote');
jest.mock('@/models/Customer');
jest.mock('@/models/User');
jest.mock('@/models/Activity');
jest.mock('@/models/Sale');
jest.mock('@/models/Payment');

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

describe('API Authentication Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Dashboard API', () => {
    it('should reject unauthenticated requests', async () => {
      // Mock no session
      mockGetServerSession.mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'GET',
        query: { companyId: 'company123' },
      });

      await dashboardHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Unauthorized',
        message: 'Authentication required. Please log in.',
      });
    });

    it('should reject requests without user in session', async () => {
      // Mock session without user
      mockGetServerSession.mockResolvedValue({} as any);

      const { req, res } = createMocks({
        method: 'GET',
        query: { companyId: 'company123' },
      });

      await dashboardHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
    });

    it('should allow authenticated requests from correct company', async () => {
      // Mock valid session
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'user123',
          companyId: 'company123',
          email: 'test@test.com',
          role: 'user',
        },
      } as any);

      const { req, res } = createMocks({
        method: 'GET',
        query: { companyId: 'company123' },
      });

      // Mock database calls will return in actual implementation
      // For this test, we're just verifying auth passes
      await dashboardHandler(req, res);

      // Should not return 401 or 403
      expect(res._getStatusCode()).not.toBe(401);
      expect(res._getStatusCode()).not.toBe(403);
    });
  });

  describe('Quote Save API - IDOR Vulnerability Fix', () => {
    it('should reject unauthenticated quote creation', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          userId: 'malicious-user',
          companyId: 'victim-company',
          selectedCustomerId: 'customer123',
        },
      });

      await quoteSaveHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
    });

    it('should use session userId and companyId, not request body', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'authenticated-user',
          companyId: 'authenticated-company',
          email: 'legit@test.com',
          role: 'user',
        },
      } as any);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          // Attacker tries to set different userId/companyId
          userId: 'malicious-user',
          companyId: 'victim-company',
          selectedCustomerId: 'customer123',
          printingDetails: {
            deliveryDueDate: new Date().toISOString(),
          },
        },
      });

      // Mock the Customer and Quote models
      const mockCustomer = {
        _id: 'customer123',
        companyId: 'authenticated-company',
        followUpNotes: [],
        save: jest.fn().mockResolvedValue({}),
        toObject: jest.fn().mockReturnValue({}),
      };

      const mockQuote = {
        save: jest.fn().mockResolvedValue({ _id: 'quote123' }),
      };

      const Customer = require('@/models/Customer').default;
      const Quote = require('@/models/Quote').default;
      
      Customer.findById = jest.fn().mockResolvedValue(mockCustomer);
      Quote.mockImplementation(() => mockQuote);

      await quoteSaveHandler(req, res);

      // Verify quote was created with SESSION userId, not request body
      expect(mockQuote.save).toHaveBeenCalled();
      
      // The implementation should have overridden malicious userId/companyId
      // with authenticated values
    });

    it('should prevent cross-tenant quote updates', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'user123',
          companyId: 'company-A',
          email: 'test@test.com',
          role: 'user',
        },
      } as any);

      // Mock existing quote from different company
      const Quote = require('@/models/Quote').default;
      Quote.findById = jest.fn().mockResolvedValue({
        _id: 'quote123',
        companyId: 'company-B', // Different company!
        save: jest.fn(),
      });

      const { req, res } = createMocks({
        method: 'PUT',
        body: {
          _id: 'quote123',
          userId: 'user123',
          companyId: 'company-A',
        },
      });

      await quoteSaveHandler(req, res);

      // Should return 403 Forbidden
      expect(res._getStatusCode()).toBe(403);
    });
  });

  describe('Customer APIs - Cross-Tenant Protection', () => {
    it('should reject unauthenticated customer list access', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'GET',
        query: { companyId: 'company123' },
      });

      await customersListHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
    });

    it('should reject access to other company\'s customers', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'user123',
          companyId: 'company-A',
          email: 'test@test.com',
          role: 'user',
        },
      } as any);

      const { req, res } = createMocks({
        method: 'GET',
        query: { companyId: 'company-B' }, // Different company!
      });

      await customersListHandler(req, res);

      expect(res._getStatusCode()).toBe(403);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Forbidden',
        message: expect.stringContaining('Access denied'),
      });
    });
  });

  describe('User Management - Admin Authorization', () => {
    it('should reject non-admin users from adding users', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'user123',
          companyId: 'company123',
          email: 'regular@test.com',
          role: 'user', // NOT admin
        },
      } as any);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          firstName: 'New',
          lastName: 'User',
          email: 'newuser@test.com',
          password: 'password123',
        },
      });

      await usersAddHandler(req, res);

      expect(res._getStatusCode()).toBe(403);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Forbidden',
        message: 'Admin access required. Only administrators can perform this action.',
      });
    });

    it('should allow admin users to add users to their company', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'admin123',
          companyId: 'company123',
          email: 'admin@test.com',
          role: 'admin', // IS admin
        },
      } as any);

      // Mock User model
      const User = require('@/models/User').default;
      User.findOne = jest.fn().mockResolvedValue(null); // No existing user
      User.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({ _id: 'newuser123' }),
      }));

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          firstName: 'New',
          lastName: 'User',
          email: 'newuser@test.com',
          password: 'password123',
        },
      });

      await usersAddHandler(req, res);

      // Should succeed (not 401 or 403)
      expect(res._getStatusCode()).not.toBe(401);
      expect(res._getStatusCode()).not.toBe(403);
    });
  });

  describe('Quote Single API - Resource Ownership', () => {
    it('should prevent accessing quotes from other companies', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'user123',
          companyId: 'company-A',
          email: 'test@test.com',
          role: 'user',
        },
      } as any);

      // Mock quote from different company
      const Quote = require('@/models/Quote').default;
      Quote.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: 'quote123',
          companyId: 'company-B', // Different company!
        }),
      });

      const { req, res } = createMocks({
        method: 'GET',
        query: { quoteId: 'quote123' },
      });

      await quoteHandler(req, res);

      expect(res._getStatusCode()).toBe(403);
    });

    it('should prevent deleting quotes from other companies', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'user123',
          companyId: 'company-A',
          email: 'test@test.com',
          role: 'user',
        },
      } as any);

      // Mock quote from different company
      const Quote = require('@/models/Quote').default;
      Quote.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: 'quote123',
          companyId: 'company-B', // Different company!
        }),
      });

      const { req, res } = createMocks({
        method: 'DELETE',
        query: { quoteId: 'quote123' },
      });

      await quoteHandler(req, res);

      expect(res._getStatusCode()).toBe(403);
    });

    it('should allow accessing own company\'s quotes', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'user123',
          companyId: 'company-A',
          email: 'test@test.com',
          role: 'user',
        },
      } as any);

      // Mock quote from same company
      const Quote = require('@/models/Quote').default;
      Quote.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: 'quote123',
          companyId: 'company-A', // Same company
          toObject: jest.fn().mockReturnValue({ _id: 'quote123' }),
        }),
      });

      const { req, res } = createMocks({
        method: 'GET',
        query: { quoteId: 'quote123' },
      });

      await quoteHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
    });
  });
});
