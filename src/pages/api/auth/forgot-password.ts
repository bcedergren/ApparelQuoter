import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/dbConnect';
import { v4 as uuidv4 } from 'uuid';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const sendEmailWithSendGrid = async (
	email: string,
	resetUrl: string,
	retries: number = 0
): Promise<void> => {
	const fromEmail = process.env.SENDGRID_FROM_EMAIL;

	if (!fromEmail) {
		throw new Error('SENDGRID_FROM_EMAIL environment variable is not set');
	}

	const msg = {
		to: email,
		from: fromEmail,
		subject: 'Password Reset',
		html: `<p>You requested a password reset</p><p>Click <a href="${resetUrl}">here</a> to reset your password</p>`,
	};

	try {
		await sgMail.send(msg);
	} catch (error) {
		if (retries < MAX_RETRIES) {
			console.warn(`Retrying email send (${retries + 1}/${MAX_RETRIES})...`);
			await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
			await sendEmailWithSendGrid(email, resetUrl, retries + 1);
		} else {
			throw error;
		}
	}
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

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
		const user = await db
			.collection('users')
			.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		const resetToken = uuidv4();
		const resetTokenExpiry = Date.now() + 3600000; // 1 hour

		await db.collection('User').updateOne(
			{ email: { $regex: new RegExp(`^${email}$`, 'i') } },
			{
				$set: {
					resetToken,
					resetTokenExpiry,
				},
			}
		);

		const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}&email=${email}`;

		await sendEmailWithSendGrid(email, resetUrl);

		res.status(200).json({ message: 'Reset link sent' });
	} catch (error) {
		console.error(`Error during password reset process: ${error}`);
		res.status(500).json({ message: 'Internal server error' });
	}
}
