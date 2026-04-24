import { createMocks } from 'node-mocks-http';
import { getServerSession } from 'next-auth';
import checkoutSessionHandler from '@/pages/api/stripe/checkout-session';
import webhookHandler from '@/pages/api/stripe/webhooks';
import Stripe from 'stripe';

jest.mock('next-auth');
jest.mock('@/utils/dbConnect');
jest.mock('@/models/User');
jest.mock('stripe');
jest.mock('micro', () => ({
  buffer: jest.fn().mockResolvedValue(Buffer.from('test')),
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

describe('Stripe Integration Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Checkout Session Creation', () => {
    it('should reject unauthenticated checkout attempts', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          priceId: 'price_123',
        },
      });

      await checkoutSessionHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: 'Unauthorized - Please log in to subscribe',
      });
    });

    it('should require priceId in request', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'user123',
          companyId: 'company123',
          email: 'test@test.com',
          role: 'user',
        },
      } as any);

      const { req, res } = createMocks({
        method: 'POST',
        body: {}, // No priceId
      });

      await checkoutSessionHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        success: false,
        error: 'Price ID is required',
      });
    });

    it('should include user metadata in checkout session', async () => {
      const userId = 'user123';
      const companyId = 'company123';
      const email = 'test@test.com';

      mockGetServerSession.mockResolvedValue({
        user: {
          id: userId,
          companyId: companyId,
          email: email,
          role: 'user',
          stripeCustomerId: 'cus_123',
        },
      } as any);

      // Mock Stripe
      const mockCreate = jest.fn().mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      });

      const StripeMock = Stripe as jest.MockedClass<typeof Stripe>;
      StripeMock.prototype.checkout = {
        sessions: {
          create: mockCreate,
        },
      } as any;

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          priceId: 'price_123',
        },
      });

      await checkoutSessionHandler(req, res);

      // Verify metadata includes user info
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            userId: userId,
            companyId: companyId,
          }),
        })
      );
    });

    it('should return standardized response format', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'user123',
          companyId: 'company123',
          email: 'test@test.com',
          role: 'user',
        },
      } as any);

      // Mock Stripe
      const StripeMock = Stripe as jest.MockedClass<typeof Stripe>;
      StripeMock.prototype.checkout = {
        sessions: {
          create: jest.fn().mockResolvedValue({
            id: 'cs_test_123',
            url: 'https://checkout.stripe.com/pay/cs_test_123',
          }),
        },
      } as any;

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          priceId: 'price_123',
        },
      });

      await checkoutSessionHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual({
        success: true,
        session: {
          id: expect.any(String),
          url: expect.stringContaining('https://'),
        },
      });
    });
  });

  describe('Webhook Security', () => {
    it('should reject webhooks without signature', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {}, // No stripe-signature
      });

      await webhookHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it('should reject webhooks with invalid signature', async () => {
      // Mock Stripe webhook verification to throw error
      const StripeMock = Stripe as jest.MockedClass<typeof Stripe>;
      StripeMock.prototype.webhooks = {
        constructEvent: jest.fn().mockImplementation(() => {
          throw new Error('Invalid signature');
        }),
      } as any;

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'stripe-signature': 'invalid_signature',
        },
      });

      await webhookHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getData()).toContain('Invalid signature');
    });

    it('should handle checkout.session.completed event', async () => {
      // Mock successful signature verification
      const StripeMock = Stripe as jest.MockedClass<typeof Stripe>;
      StripeMock.prototype.webhooks = {
        constructEvent: jest.fn().mockReturnValue({
          type: 'checkout.session.completed',
          data: {
            object: {
              id: 'cs_test_123',
              customer: 'cus_123',
              subscription: 'sub_123',
              metadata: {
                userId: 'user123',
                companyId: 'company123',
              },
            },
          },
        }),
      } as any;

      const User = require('@/models/User').default;
      User.findByIdAndUpdate = jest.fn().mockResolvedValue({
        _id: 'user123',
        stripeCustomerId: 'cus_123',
        subscriptionId: 'sub_123',
      });

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'stripe-signature': 'valid_signature',
        },
      });

      await webhookHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        expect.objectContaining({
          stripeCustomerId: 'cus_123',
          subscriptionId: 'sub_123',
          subscriptionStatus: 'active',
        })
      );
    });
  });

  describe('Mailer API - Internal Security', () => {
    it('should reject requests without API key', async () => {
      const mailerHandler = require('@/pages/api/mailer').default;

      const { req, res } = createMocks({
        method: 'POST',
        headers: {}, // No API key
        body: {
          from: 'test@test.com',
          to: 'recipient@test.com',
          subject: 'Test',
          html: '<p>Test</p>',
        },
      });

      // Set environment variable
      process.env.MAILER_API_KEY = 'secret-key-123';

      await mailerHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        message: 'Unauthorized - Invalid API key',
      });
    });

    it('should reject requests with invalid API key', async () => {
      const mailerHandler = require('@/pages/api/mailer').default;

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'x-internal-api-key': 'wrong-key',
        },
        body: {
          from: 'test@test.com',
          to: 'recipient@test.com',
          subject: 'Test',
          html: '<p>Test</p>',
        },
      });

      process.env.MAILER_API_KEY = 'secret-key-123';

      await mailerHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
    });

    it('should accept requests with valid API key', async () => {
      const mailerHandler = require('@/pages/api/mailer').default;

      // Mock Resend
      jest.mock('resend', () => ({
        Resend: jest.fn().mockImplementation(() => ({
          emails: {
            send: jest.fn().mockResolvedValue({
              data: { id: 'email_123' },
              error: null,
            }),
          },
        })),
      }));

      const validApiKey = 'secret-key-123';
      process.env.MAILER_API_KEY = validApiKey;

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'x-internal-api-key': validApiKey,
        },
        body: {
          from: 'test@test.com',
          to: ['recipient@test.com'],
          subject: 'Test',
          html: '<p>Test</p>',
        },
      });

      await mailerHandler(req, res);

      // Should not be 401
      expect(res._getStatusCode()).not.toBe(401);
    });
  });
});
