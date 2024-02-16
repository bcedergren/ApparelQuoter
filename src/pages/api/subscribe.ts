// pages/api/subscribe.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
	apiVersion: '2023-10-16',
});

const handleSubscription = async (
	req: NextApiRequest,
	res: NextApiResponse
) => {
	if (req.method === 'POST') {
		try {
			const { email, selectedPlan } = req.body;

			// Create a new customer in Stripe
			const customer = await stripe.customers.create({
				email: email,
			});

			// Create the subscription
			const subscription = await stripe.subscriptions.create({
				customer: customer.id,
				items: [{ price: selectedPlan }],
				expand: ['latest_invoice.payment_intent'],
			});

			res.status(200).json({ subscriptionId: subscription.id });
		} catch (error) {
			res
				.status(400)
				.json({ error: 'An error occurred, unable to create subscription' });
		}
	} else {
		res.setHeader('Allow', ['POST']);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
};

// Export the named constant as the default export
export default handleSubscription;
