import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/dbConnect';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { hostname } from 'os';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	const { email } = req.body;

	if (!email) {
		return res.status(400).json({ message: 'Email is required' });
	}

	try {
		const { db } = await connectToDatabase();
		// Case-insensitive email query
		const user = await db
			.collection('User')
			.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		const resetToken = uuidv4();
		const resetTokenExpiry = Date.now() + 3600000; // 1 hour

		const updateResult = await db.collection('User').updateOne(
			{ email: { $regex: new RegExp(`^${email}$`, 'i') } },
			{
				$set: {
					resetToken,
					resetTokenExpiry,
				},
			}
		);

		const transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: parseInt(process.env.SMTP_PORT as string, 10),
			secure: true, // true for port 465, false for other ports
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS,
			},
		});

		const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}&email=${email}`;

		const mailOptions = {
			hostname: process.env.SMTP_HOST,
			port: parseInt(process.env.SMTP_PORT as string, 10),
			from: process.env.SMTP_USERNAME,
			to: email,
			subject: 'Password Reset',
			html: `<p>You requested a password reset</p><p>Click <a href="${resetUrl}">here</a> to reset your password</p>`,
		};

		await transporter.sendMail(mailOptions);

		res.status(200).json({ message: 'Reset link sent' });
	} catch (error) {
		console.error(`Error during password reset process: ${error}`);
		res.status(500).json({ message: 'Internal server error' });
	}
}
