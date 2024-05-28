import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { connectToDatabase } from '@/utils/dbConnect';
import stripe from '@/lib/stripe';

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
		const customer = await stripe.customers.create({
			payment_method: paymentMethodId,
			email: email,
			invoice_settings: {
				default_payment_method: paymentMethodId,
			},
		});

		const subscription = await stripe.subscriptions.create({
			customer: customer.id,
			items: [{ price: process.env.STRIPE_PRICE_ID as string }],
			expand: ['latest_invoice.payment_intent'],
		});

		const { db } = await connectToDatabase();
		await db
			.collection('users')
			.updateOne({ email: email }, { $set: { stripeCustomerId: customer.id } });

		res.status(200).json({ subscription });
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		res.status(500).json({ error: errorMessage });
	}
}
