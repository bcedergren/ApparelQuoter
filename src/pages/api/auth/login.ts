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

	const { db } = await connectToDatabase();
	const user = await db.collection('users').findOne({ email });

	if (!user) {
		return res.status(401).json({ message: 'Invalid email or password' });
	}

	const isValid = await verifyPassword(password, user.password);

	if (!isValid) {
		return res.status(401).json({ message: 'Invalid email or password' });
	}

	// Handle successful login
	res.status(200).json({ message: 'Login successful' });
}
