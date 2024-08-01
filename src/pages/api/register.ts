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

	if (!planId) {
		return res.status(400).json({ error: 'Plan ID is required' });
	}

	try {
		console.log('Connecting to database...');
		const { db } = await connectToDatabase();

		console.log('Checking for existing user...');
		const existingUser = await db.collection('Users').findOne({ email });
		if (existingUser) {
			console.log('User already exists');
			return res.status(409).json({ error: 'User already exists' });
		}

		let hashedPassword = password;
		if (password) {
			console.log('Hashing password...');
			hashedPassword = await hashPassword(password);
		}

		console.log('Creating Stripe customer...');
		const customer = await stripe.customers.create({
			email,
			name: `${firstName} ${lastName}`,
		});

		console.log('Creating Stripe subscription...');
		const subscription = await stripe.subscriptions.create({
			customer: customer.id,
			items: [{ price: planId }],
			trial_period_days: 7,
		});

		console.log('Creating company...');
		const newCompany = {
			name: companyName,
			createdBy: email,
			createdAt: new Date(),
		};

		const companyResult = await db.collection('Company').insertOne(newCompany);
		const companyId = companyResult.insertedId;

		console.log('Creating user...');
		const newUser = {
			email,
			password: hashedPassword,
			firstName,
			lastName,
			companyId: companyId.toString(),
			stripeCustomerId: customer.id,
			subscriptionId: subscription.id,
			isActive: true,
			role: 'admin',
		};

		const userResult = await db.collection('Users').insertOne(newUser);

		console.log('User created successfully');
		res.status(201).json({
			userId: userResult.insertedId,
			stripeCustomerId: customer.id,
			subscriptionId: subscription.id,
		});
	} catch (error) {
		console.error('Error occurred:', error);
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		res.status(500).json({ error: errorMessage });
	}
}
