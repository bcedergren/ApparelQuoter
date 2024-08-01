import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyPassword } from '@/lib/password';
import { connectToDatabase } from '@/utils/dbConnect';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ message: 'Email and password are required' });
	}

	try {
		const { db } = await connectToDatabase();
		const user = await db.collection('users').findOne({ email });

		console.log('User:', user);

		if (!user || typeof user.password !== 'string') {
			console.log('Invalid user or password not a string');
			return res.status(401).json({ message: 'Invalid email or password' });
		}

		const isValid = await verifyPassword(password, user.password);

		if (!isValid) {
			return res.status(401).json({ message: 'Invalid email or password' });
		}

		// Handle successful login
		res.status(200).json({ message: 'Login successful' });
	} catch (error) {
		console.error('Error:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
}
