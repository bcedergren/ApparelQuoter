import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/dbConnect';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@/types/User';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	const { email } = req.body;
	const { db } = await connectToDatabase();

	const user = (await db.collection('users').findOne({ email })) as User | null;

	if (!user) {
		return res.status(404).json({ message: 'User not found' });
	}

	const resetToken = uuidv4();
	const resetTokenExpiry = Date.now() + 3600000; // 1 hour

	await db.collection('User').updateOne(
		{ email },
		{
			$set: {
				resetToken,
				resetTokenExpiry,
			},
		}
	);

	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.GMAIL_USER,
			pass: process.env.GMAIL_PASS,
		},
	});

	const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}&email=${email}`;

	const mailOptions = {
		from: process.env.GMAIL_USER,
		to: email,
		subject: 'Password Reset',
		html: `<p>You requested a password reset</p><p>Click <a href="${resetUrl}">here</a> to reset your password</p>`,
	};

	await transporter.sendMail(mailOptions);

	res.status(200).json({ message: 'Reset link sent' });
}
