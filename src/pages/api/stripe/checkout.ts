import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import stripe from '@/lib/stripeServer'
import { CustomSession } from '@/types/CustomUser'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }

  const session = (await getServerSession(req, res, authOptions)) as CustomSession | null
  if (!session?.user) {
    return res.status(401).json({
      error: {
        code: 'no-access',
        message: 'You are not signed in.',
      },
    })
  }

  try {
    const { productId } = req.body as { productId?: string }
    if (!productId) {
      return res.status(400).json({
        error: {
          code: 'missing-product',
          message: 'A Stripe price ID is required.',
        },
      })
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: session.user.stripeCustomerId,
      line_items: [{ price: productId, quantity: 1 }],
      success_url:
        process.env.NEXT_PUBLIC_WEBSITE_URL + `?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.NEXT_PUBLIC_WEBSITE_URL,
      subscription_data: {
        metadata: {
          payingUserId: session.user.id,
        },
      },
    })

    if (!checkoutSession.url) {
      return res.status(500).json({
        error: {
          code: 'stripe-error',
          message: 'Could not create checkout session',
        },
      })
    }

    return res.status(200).json({ session: checkoutSession })
  } catch (error) {
    console.error('Stripe checkout session error:', error)
    return res.status(500).json({
      error: {
        code: 'stripe-error',
        message: 'Failed to create checkout session',
      },
    })
  }
}
