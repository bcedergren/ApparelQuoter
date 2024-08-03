import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') {
		console.log(`Method ${req.method} Not Allowed`);
		res.setHeader('Allow', ['POST']);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	const { name, email, message } = req.body;

	if (!name || !email || !message) {
		console.log('Missing required fields:', { name, email, message });
		return res.status(400).json({ message: 'All fields are required' });
	}

	try {
		// Verify environment variables
		console.log('Environment Variables:', {
			NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
			EMAIL_FROM: process.env.CONTACT_EMAIL,
			CONTACT_EMAIL: process.env.CONTACT_EMAIL,
		});

		// Use absolute URL for the mailer API
		const mailerUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/mailer`;

		console.log('Sending request to mailer API:', {
			mailerUrl,
			payload: {
				from: process.env.CONTACT_EMAIL,
				to: process.env.CONTACT_EMAIL,
				subject: `Contact Form Submission from ${name}`,
				html: `<p><strong>Name:</strong> ${name}</p>
					   <p><strong>Email:</strong> ${email}</p>
					   <p><strong>Message:</strong> ${message}</p>`,
			},
		});

		// Send a request to the generic mailer API
		const response = await fetch(mailerUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				from: process.env.CONTACT_EMAIL,
				to: process.env.CONTACT_EMAIL,
				subject: `Contact Form Submission from ${name}`,
				html: `<p><strong>Name:</strong> ${name}</p>
					   <p><strong>Email:</strong> ${email}</p>
					   <p><strong>Message:</strong> ${message}</p>`,
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(
				'Failed to send message:',
				response.status,
				response.statusText,
				errorText
			);
			throw new Error(`Failed to send message: ${response.statusText}`);
		}
		res.status(200).json({ message: 'Message sent successfully' });
	} catch (error) {
		console.error('Error sending message:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
}
