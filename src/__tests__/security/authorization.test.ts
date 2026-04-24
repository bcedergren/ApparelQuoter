import { createMocks } from 'node-mocks-http';
import { getServerSession } from 'next-auth';
import userUpdateHandler from '@/pages/api/users/[id]';
import customerUpdateHandler from '@/pages/api/customers/update/[id]';
import customerDeleteHandler from '@/pages/api/customers/delete/[id]';
import companyUpdateHandler from '@/pages/api/company/update';
import statusUpdateHandler from '@/pages/api/status/update';

jest.mock('next-auth');
jest.mock('@/utils/dbConnect');
jest.mock('@/models/User');
jest.mock('@/models/Customer');
jest.mock('@/models/Company');
jest.mock('@/models/Quote');

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

describe('API Authorization Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Update - Role-Based Access Control', () => {
    it('should allow users to update their own profile', async () => {
      const userId = 'user123';

      mockGetServerSession.mockResolvedValue({
        user: {
          id: userId,
          companyId: 'company123',
          email: 'test@test.com',
          role: 'user',
        },
      } as any);

      const User = require('@/models/User').default;
      User.findById = jest.fn().mockResolvedValue({
        _id: userId,
        companyId: 'company123',
        save: jest.fn(),
      });

      User.findByIdAndUpdate = jest.fn().mockResolvedValue({
        _id: userId,
        firstName: 'Updated',
        lastName: 'Name',
      });

      const { req, res } = createMocks({
        method: 'PUT',
        query: { id: userId },
        body: {
          firstName: 'Updated',
          lastName: 'Name',
        },
      });

      await userUpdateHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
    });

    it('should prevent regular users from updating other users', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'user123',
          companyId: 'company123',
          email: 'test@test.com',
          role: 'user', // NOT admin
        },
      } as any);

      const User = require('@/models/User').default;
      User.findById = jest.fn().mockResolvedValue({
        _id: 'otherUser456',
        companyId: 'company123',
      });

      const { req, res } = createMocks({
        method: 'PUT',
        query: { id: 'otherUser456' }, // Different user
        body: {
          firstName: 'Hacked',
        },
      });

      await userUpdateHandler(req, res);

      expect(res._getStatusCode()).toBe(403);
    });

    it('should allow admins to update users in their company', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'admin123',
          companyId: 'company123',
          email: 'admin@test.com',
          role: 'admin',
        },
      } as any);

      const User = require('@/models/User').default;
      User.findById = jest.fn().mockResolvedValue({
        _id: 'user456',
        companyId: 'company123', // Same company
      });

      User.findByIdAndUpdate = jest.fn().mockResolvedValue({
        _id: 'user456',
        role: 'user',
      });

      const { req, res } = createMocks({
        method: 'PUT',
        query: { id: 'user456' },
        body: {
          firstName: 'Updated',
          role: 'user',
        },
      });

      await userUpdateHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
    });

    it('should prevent admins from updating users in other companies', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'admin123',
          companyId: 'company-A',
          email: 'admin@test.com',
          role: 'admin',
        },
      } as any);

      const User = require('@/models/User').default;
      User.findById = jest.fn().mockResolvedValue({
        _id: 'user456',
        companyId: 'company-B', // Different company!
      });

      const { req, res } = createMocks({
        method: 'PUT',
        query: { id: 'user456' },
        body: {
          firstName: 'Hacked',
        },
      });

      await userUpdateHandler(req, res);

      expect(res._getStatusCode()).toBe(403);
    });

    it('should prevent regular users from changing roles', async () => {
      const userId = 'user123';

      mockGetServerSession.mockResolvedValue({
        user: {
          id: userId,
          companyId: 'company123',
          email: 'test@test.com',
          role: 'user',
        },
      } as any);

      const User = require('@/models/User').default;
      User.findById = jest.fn().mockResolvedValue({
        _id: userId,
        companyId: 'company123',
        role: 'user',
      });

      User.findByIdAndUpdate = jest.fn().mockImplementation((id, updateData) => {
        // Verify role is NOT in updateData
        expect(updateData.role).toBeUndefined();
        return Promise.resolve({ _id: userId });
      });

      const { req, res } = createMocks({
        method: 'PUT',
        query: { id: userId },
        body: {
          firstName: 'Test',
          role: 'admin', // Trying to elevate privileges!
        },
      });

      await userUpdateHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
    });

    it('should prevent users from deleting themselves', async () => {
      const userId = 'user123';

      mockGetServerSession.mockResolvedValue({
        user: {
          id: userId,
          companyId: 'company123',
          email: 'test@test.com',
          role: 'admin',
        },
      } as any);

      const User = require('@/models/User').default;
      User.findById = jest.fn().mockResolvedValue({
        _id: userId,
        companyId: 'company123',
      });

      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: userId },
      });

      await userUpdateHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData()).message).toContain('Cannot delete your own account');
    });
  });

  describe('Customer Update/Delete - Ownership Verification', () => {
    it('should prevent updating customers from other companies', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'user123',
          companyId: 'company-A',
          email: 'test@test.com',
          role: 'user',
        },
      } as any);

      const Customer = require('@/models/Customer').default;
      Customer.findById = jest.fn().mockResolvedValue({
        _id: 'customer123',
        companyId: 'company-B', // Different company!
      });

      const { req, res } = createMocks({
        method: 'PUT',
        query: { id: 'customer123' },
        body: {
          companyName: 'Hacked Company',
        },
      });

      await customerUpdateHandler(req, res);

      expect(res._getStatusCode()).toBe(403);
    });

    it('should prevent deleting customers from other companies', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'user123',
          companyId: 'company-A',
          email: 'test@test.com',
          role: 'user',
        },
      } as any);

      const Customer = require('@/models/Customer').default;
      Customer.findById = jest.fn().mockResolvedValue({
        _id: 'customer123',
        companyId: 'company-B', // Different company!
      });

      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: 'customer123' },
      });

      await customerDeleteHandler(req, res);

      expect(res._getStatusCode()).toBe(403);
    });

    it('should prevent changing customer companyId', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'user123',
          companyId: 'company-A',
          email: 'test@test.com',
          role: 'user',
        },
      } as any);

      const Customer = require('@/models/Customer').default;
      Customer.findById = jest.fn().mockResolvedValue({
        _id: 'customer123',
        companyId: 'company-A',
      });

      Customer.findByIdAndUpdate = jest.fn().mockImplementation((id, updateData) => {
        // Verify companyId is removed from update
        expect(updateData.companyId).toBeUndefined();
        return Promise.resolve({ _id: 'customer123' });
      });

      const { req, res } = createMocks({
        method: 'PUT',
        query: { id: 'customer123' },
        body: {
          companyName: 'Updated',
          companyId: 'company-B', // Trying to transfer to another company!
        },
      });

      await customerUpdateHandler(req, res);

      // Should succeed but companyId change rejected
      expect(res._getStatusCode()).toBe(200);
    });
  });

  describe('Company Update - Self-Update Only', () => {
    it('should prevent updating other companies', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'user123',
          companyId: 'company-A',
          email: 'test@test.com',
          role: 'admin',
        },
      } as any);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          _id: 'company-B', // Trying to update different company!
          name: 'Hacked Company',
        },
      });

      await companyUpdateHandler(req, res);

      expect(res._getStatusCode()).toBe(403);
    });

    it('should allow users to update their own company', async () => {
      const companyId = 'company123';

      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'user123',
          companyId: companyId,
          email: 'test@test.com',
          role: 'admin',
        },
      } as any);

      const Company = require('@/models/Company').default;
      Company.updateOne = jest.fn().mockResolvedValue({
        modifiedCount: 1,
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          _id: companyId,
          name: 'Updated Company Name',
        },
      });

      await companyUpdateHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
    });
  });

  describe('Status Update - Order Ownership', () => {
    it('should prevent status updates for other companies\' orders', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'user123',
          companyId: 'company-A',
          email: 'test@test.com',
          role: 'user',
        },
      } as any);

      const Quote = require('@/models/Quote').default;
      Quote.findById = jest.fn().mockResolvedValue({
        _id: 'order123',
        companyId: 'company-B', // Different company!
      });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          orderId: 'order123',
          newStatus: 'completed',
        },
      });

      await statusUpdateHandler(req, res);

      expect(res._getStatusCode()).toBe(403);
    });
  });
});
