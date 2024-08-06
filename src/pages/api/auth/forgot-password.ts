import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import dbConnect from '@/utils/dbConnect';
import User from '@/models/User';

const sendEmailViaMailerAPI = async (
	email: string,
	resetUrl: string
): Promise<void> => {
	// Path to the email template file
	const templatePath = resolve('public/emails/passwordResetTemplate.html');

	let emailTemplate;
	try {
		// Read the email template file
		emailTemplate = await readFile(templatePath, 'utf8');
	} catch (error) {
		console.error('Error reading email template:', error);
		throw new Error('Failed to read email template.');
	}

	// Insert the reset URL into the email template
	const emailHtml = emailTemplate.replace('{{resetUrl}}', resetUrl);

	const payload = {
		from: process.env.EMAIL_FROM,
		to: email,
		subject: 'Password Reset',
		html: emailHtml,
	};

	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BASE_URL}/api/mailer`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			}
		);

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(
				`Failed to send email: ${response.statusText} - ${errorText}`
			);
		}

		console.log(`Email sent successfully to ${email}`);
	} catch (error) {
		console.error('Error sending email:', error);
		throw new Error('Failed to send email.');
	}
};

// Handler for the password reset request
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		console.log(`Method ${req.method} Not Allowed`);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	const { email } = req.body;

	if (!email) {
		console.error('Email is required');
		return res.status(400).json({ message: 'Email is required' });
	}

	try {
		await dbConnect();

		const user = await User.findOne({
			email: { $regex: new RegExp(`^${email}$`, 'i') },
		});

		if (!user) {
			// Return success message even if user is not found to prevent email enumeration
			console.log(`No user found with email ${email}`);
			return res
				.status(200)
				.json({ message: 'If the email exists, a reset link has been sent' });
		}

		const resetToken = jwt.sign({ email }, process.env.JWT_SECRET!, {
			expiresIn: '1h',
		});
		const resetTokenExpiry = Date.now() + 3600000; // 1 hour

		user.resetToken = resetToken;
		user.resetTokenExpiry = resetTokenExpiry;
		await user.save();

		// Generate the correct reset URL
		const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;

		await sendEmailViaMailerAPI(email, resetUrl);

		res
			.status(200)
			.json({ message: 'If the email exists, a reset link has been sent' });
	} catch (error) {
		console.error(`Error during password reset process: ${error}`);
		res.status(500).json({ message: 'Internal server error' });
	}
}
