import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/utils/dbConnect';

type UserData = {
	companyId: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	role?: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	const {
		companyId,
		firstName,
		lastName,
		email,
		password,
		role = 'user', // Default role if not provided
	}: UserData = req.body;

	const { db } = await connectToDatabase();

	// Check for existing user
	const existingUser = await db.collection('User').findOne({ email });
	if (existingUser) {
		return res.status(422).json({ message: 'User already exists!' });
	}

	const hashedPassword = await bcrypt.hash(password, 12);

	try {
		// Insert user linked to the specified company
		await db.collection('User').insertOne({
			companyId,
			email,
			firstName,
			lastName,
			password: hashedPassword,
			role,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		res.status(201).json({ message: 'User added successfully!' });
	} catch (error) {
		console.error('Failed to add user:', error);
		res.status(500).json({ message: 'Failed to add user' });
	}
}

export default handler;
