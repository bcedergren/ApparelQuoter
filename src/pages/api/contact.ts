import type { NextApiRequest, NextApiResponse } from 'next';
import sgMail from '@sendgrid/mail';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	const { name, email, message } = req.body;

	if (!name || !email || !message) {
		return res.status(400).json({ message: 'All fields are required' });
	}

	try {
		// Set SendGrid API key
		sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

		const msg = {
			to: process.env.CONTACT_EMAIL,
			from: process.env.SENDGRID_FROM_EMAIL as string,
			subject: `Contact Form Submission from ${name}`,
			html: `<p><strong>Name:</strong> ${name}</p>
				   <p><strong>Email:</strong> ${email}</p>
				   <p><strong>Message:</strong> ${message}</p>`,
		};

		// Send the email
		await sgMail.send(msg);

		res.status(200).json({ message: 'Message sent successfully' });
	} catch (error) {
		console.error(`Error sending message: ${error}`);
		res.status(500).json({ message: 'Internal server error' });
	}
}
