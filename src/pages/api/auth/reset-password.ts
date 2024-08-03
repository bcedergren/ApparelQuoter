import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/dbConnect';
import { hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	const { token, password } = req.body;

	if (!token || !password) {
		console.error('Missing required fields');
		return res.status(400).json({ message: 'Missing required fields' });
	}

	try {
		const secret = process.env.JWT_SECRET as string;
		const decoded = jwt.verify(token, secret) as { email: string };
		const email = decoded.email;

		const { db } = await connectToDatabase();
		console.log('Connected to database');

		const user = await db.collection('Users').findOne({
			email,
			resetToken: token,
			resetTokenExpiry: { $gt: Date.now() },
		});

		if (!user) {
			console.error('Invalid or expired token');
			return res.status(400).json({ message: 'Invalid or expired token.' });
		}

		const hashedPassword = await hash(password, 10);
		console.log('Password hashed successfully');

		await db.collection('Users').updateOne(
			{ email },
			{
				$set: {
					password: hashedPassword,
					resetToken: null,
					resetTokenExpiry: null,
				},
			}
		);

		console.log('Password updated successfully');
		res.status(200).json({ message: 'Password reset successfully.' });
	} catch (error) {
		if (error instanceof jwt.JsonWebTokenError) {
			console.error('Invalid token', error);
			return res.status(400).json({ message: 'Invalid token' });
		}
		console.error('Internal server error', error);
		res.status(500).json({ message: 'Internal server error' });
	}
}
