import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/utils/dbConnect';

type UserData = {
	companyName: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	plan: string; // Added plan to UserData
	[key: string]: any;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	const {
		companyName,
		firstName,
		lastName,
		email,
		password,
		plan, // Added plan to the destructured object
		...companyDetails
	}: UserData = req.body;
	const { db } = await connectToDatabase();

	// Check for existing user
	const existingUser = await db.collection('User').findOne({ email });
	if (existingUser) {
		return res.status(422).json({ message: 'User already exists!' });
	}

	const hashedPassword = await bcrypt.hash(password, 12);

	try {
		// Insert company
		const companyResult = await db
			.collection('Company')
			.insertOne({ companyName, ...companyDetails });
		const companyId = companyResult.insertedId;

		// Insert user linked to company
		await db.collection('User').insertOne({
			companyId,
			email,
			firstName,
			lastName,
			password: hashedPassword,
			role: 'admin',
			createdAt: new Date(),
			updatedAt: new Date(),
			plan, // Store the selected plan for the user
		});

		res.status(201).json({ message: 'User and company created!' });
	} catch (error) {
		console.error('Registration failed:', error);
		res.status(500).json({ message: 'Registration failed' });
	}
}

export default handler;
