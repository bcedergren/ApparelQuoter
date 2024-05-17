import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/dbConnect';
import bcrypt from 'bcryptjs';
import { User } from '@/types/User';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	const { token, email, password } = req.body;

	const { db } = await connectToDatabase();

	const user = (await db.collection('User').findOne({ email })) as User | null;

	if (
		!user ||
		user.resetToken !== token ||
		user.resetTokenExpiry! < Date.now()
	) {
		return res.status(400).json({ message: 'Invalid or expired token' });
	}

	const hashedPassword = await bcrypt.hash(password, 12);

	await db.collection('User').updateOne(
		{ email },
		{
			$set: {
				password: hashedPassword,
				resetToken: null,
				resetTokenExpiry: null,
			},
		}
	);

	res.status(200).json({ message: 'Password reset successfully' });
}
