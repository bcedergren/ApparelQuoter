import type { NextApiRequest, NextApiResponse } from 'next';
import { hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/utils/dbConnect';
import User from '@/models/User';

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

		await dbConnect();

		const user = await User.findOne({
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

		user.password = hashedPassword;
		user.resetToken = undefined;
		user.resetTokenExpiry = undefined;
		await user.save();

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
