import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '@/utils/dbConnect';
import stripe from '@/lib/stripe';
import User from '@/models/User';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await getSession({ req });

	if (!session) {
		return res.status(401).json({ error: 'Unauthorized' });
	}

	const { email, paymentMethodId } = req.body;

	try {
		await dbConnect();

		// Create Stripe customer
		const customer = await stripe.customers.create({
			payment_method: paymentMethodId,
			email: email,
			invoice_settings: {
				default_payment_method: paymentMethodId,
			},
		});

		// Create Stripe subscription
		const subscription = await stripe.subscriptions.create({
			customer: customer.id,
			items: [{ price: process.env.STRIPE_PRICE_ID as string }],
			expand: ['latest_invoice.payment_intent'],
		});

		// Update user in MongoDB
		const updatedUser = await User.findOneAndUpdate(
			{ email: email },
			{ stripeCustomerId: customer.id },
			{ new: true }
		);

		if (!updatedUser) {
			return res.status(404).json({ error: 'User not found' });
		}

		res.status(200).json({ subscription });
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		res.status(500).json({ error: errorMessage });
	}
}
