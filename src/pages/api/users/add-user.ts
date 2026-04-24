import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import dbConnect from '@/utils/dbConnect';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';

type UserData = {
	companyId?: string; // Optional now since we use session companyId
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

	// SECURITY: Only admins can add users
	const session = await requireAdmin(req, res);
	if (!session) return;

	const {
		firstName,
		lastName,
		email,
		password,
		role = 'user', // Default role if not provided
	}: UserData = req.body;

	// SECURITY: Use session companyId instead of trusting request body
	const companyId = session.user.companyId;

	await dbConnect();

	// Check for existing user
	const existingUser = await User.findOne({ email });
	if (existingUser) {
		return res.status(422).json({ message: 'User already exists!' });
	}

	const hashedPassword = await bcrypt.hash(password, 12);

	try {
		// Insert user linked to the specified company
		const newUser = new User({
			companyId,
			firstName,
			lastName,
			email,
			password: hashedPassword,
			role,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		await newUser.save();

		res.status(201).json({ message: 'User added successfully!' });
	} catch (error) {
		console.error('Failed to add user:', error);
		res.status(500).json({ message: 'Failed to add user' });
	}
}

export default handler;
