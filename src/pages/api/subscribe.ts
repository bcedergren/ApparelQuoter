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
			const customer = await stripe.customers.create({ email });

			// Configure trial period for the trial plan
			let subscriptionParams: Stripe.SubscriptionCreateParams = {
				customer: customer.id,
				items: [{ price: selectedPlan }],
				expand: ['latest_invoice.payment_intent'],
			};

			if (selectedPlan === 'trial') {
				const trialEnd = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days from now
				subscriptionParams.trial_end = trialEnd;
			}

			// Create the subscription with the specified parameters
			const subscription = await stripe.subscriptions.create(
				subscriptionParams
			);

			res.status(200).json({ subscriptionId: subscription.id });
		} catch (error) {
			console.error('Subscription creation failed:', error);
			res
				.status(400)
				.json({ error: 'An error occurred, unable to create subscription' });
		}
	} else {
		res.setHeader('Allow', ['POST']);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
};

export default handleSubscription;
