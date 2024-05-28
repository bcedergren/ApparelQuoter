import { NextApiRequest, NextApiResponse } from 'next';
import { hashPassword } from '@/lib/password';
import { connectToDatabase } from '@/utils/dbConnect';
import stripe from '@/lib/stripe';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { email, password, firstName, lastName, companyName, planId } =
		req.body;

	try {
		const { db } = await connectToDatabase();

		const existingUser = await db.collection('users').findOne({ email });
		if (existingUser) {
			return res.status(409).json({ error: 'User already exists' });
		}

		const hashedPassword = await hashPassword(password);

		const customer = await stripe.customers.create({
			email,
			name: `${firstName} ${lastName}`,
		});

		const subscription = await stripe.subscriptions.create({
			customer: customer.id,
			items: [{ price: planId }],
			trial_period_days: 7,
		});

		console.log(subscription);

		const newUser = {
			email,
			password: hashedPassword,
			firstName,
			lastName,
			companyId: companyName,
			stripeCustomerId: customer.id,
			subscriptionId: subscription.id,
			isActive: true,
		};

		console.log(newUser);

		const result = await db.collection('users').insertOne(newUser);

		console.log(result);

		res.status(201).json({
			userId: result.insertedId,
			stripeCustomerId: customer.id,
			subscriptionId: subscription.id,
		});
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		res.status(500).json({ error: errorMessage });
	}
}
