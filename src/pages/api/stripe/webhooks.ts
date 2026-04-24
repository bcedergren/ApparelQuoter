import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import dbConnect from '@/utils/dbConnect';
import User from '@/models/User';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// Disable body parsing, need raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    console.error('No Stripe signature found in request headers');
    return res.status(400).send('No signature');
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).send('Webhook secret not configured');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      webhookSecret
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  await dbConnect();

  console.log('Processing webhook event:', event.type);

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('Checkout session completed:', session.id);
        console.log('Customer:', session.customer);
        console.log('Subscription:', session.subscription);
        console.log('Metadata:', session.metadata);

        // Update user with subscription info
        const userId = session.metadata?.userId;
        
        if (userId) {
          const updateData: any = {
            stripeCustomerId: session.customer as string,
            subscriptionId: session.subscription as string,
            subscriptionStatus: 'active',
          };

          await User.findByIdAndUpdate(userId, updateData);
          
          console.log(`Updated user ${userId} with subscription data`);
        } else {
          console.warn('No userId found in checkout session metadata');
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        console.log('Subscription updated:', subscription.id);
        console.log('Status:', subscription.status);
        console.log('Metadata:', subscription.metadata);

        // Update user subscription status
        const result = await User.findOneAndUpdate(
          { subscriptionId: subscription.id },
          {
            subscriptionStatus: subscription.status,
            stripeCustomerId: subscription.customer as string,
          }
        );

        if (result) {
          console.log(`Updated subscription status for user: ${result._id}`);
        } else {
          // If not found by subscriptionId, try by metadata userId
          const userId = subscription.metadata?.userId;
          if (userId) {
            await User.findByIdAndUpdate(userId, {
              subscriptionId: subscription.id,
              subscriptionStatus: subscription.status,
              stripeCustomerId: subscription.customer as string,
            });
            console.log(`Updated user ${userId} with subscription ${subscription.id}`);
          } else {
            console.warn(`No user found for subscription ${subscription.id}`);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        console.log('Subscription deleted:', subscription.id);

        // Handle cancellation - set status but keep subscription ID for reference
        await User.findOneAndUpdate(
          { subscriptionId: subscription.id },
          {
            subscriptionStatus: 'canceled',
          }
        );

        console.log(`Subscription ${subscription.id} canceled`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        console.log('Payment succeeded for invoice:', invoice.id);

        // Update payment status
        await User.findOneAndUpdate(
          { stripeCustomerId: invoice.customer as string },
          {
            paymentStatus: 'succeeded',
            subscriptionStatus: 'active', // Ensure active on successful payment
          }
        );
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        console.log('Payment failed for invoice:', invoice.id);
        console.log('Customer:', invoice.customer);

        // Notify user of payment failure
        const user = await User.findOneAndUpdate(
          { stripeCustomerId: invoice.customer as string },
          {
            paymentStatus: 'failed',
            subscriptionStatus: 'past_due',
          }
        );

        if (user) {
          console.log(`Payment failed for user: ${user.email}`);
          // TODO: Send email notification to user about failed payment
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ 
      error: 'Webhook processing failed',
      message: error.message 
    });
  }
}
