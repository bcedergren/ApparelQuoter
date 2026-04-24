import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import authOptions from '@/pages/api/auth/[...nextauth]';
import Stripe from 'stripe';
import { CustomSession } from '@/types/CustomUser';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }

  try {
    // Require authentication
    const session = await getServerSession(req, res, authOptions) as CustomSession | null;
    
    if (!session || !session.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Please log in to subscribe'
      });
    }

    const { productId, priceId } = req.body;

    // Use priceId if provided, otherwise fall back to productId for backward compatibility
    const stripePriceId = priceId || productId;

    if (!stripePriceId) {
      return res.status(400).json({
        success: false,
        error: 'Price ID is required'
      });
    }

    console.log('Creating checkout session for user:', session.user.email);
    console.log('Price ID:', stripePriceId);

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: session.user.stripeCustomerId || undefined,
      customer_email: !session.user.stripeCustomerId ? session.user.email : undefined,
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/app/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/subscribe`,
      metadata: {
        userId: session.user.id,
        companyId: session.user.companyId,
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          companyId: session.user.companyId,
        },
      },
    });

    if (!checkoutSession.url) {
      throw new Error('Failed to generate checkout URL');
    }

    console.log('Checkout session created successfully:', checkoutSession.id);

    // Return standardized response format
    return res.status(200).json({
      success: true,
      session: {
        id: checkoutSession.id,
        url: checkoutSession.url,
      },
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create checkout session',
    });
  }
}
