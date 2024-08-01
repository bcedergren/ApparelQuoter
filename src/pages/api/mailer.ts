import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') {
		console.log(`Method ${req.method} Not Allowed`);
		res.setHeader('Allow', ['POST']);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	const { from, to, subject, text, html } = req.body;

	// Check for required fields
	if (!from || !to || !subject || (!text && !html)) {
		console.log('Missing required fields:', { from, to, subject, text, html });
		return res.status(400).json({ message: 'Missing required fields' });
	}

	try {
		const msg = {
			from: from as string,
			to: Array.isArray(to) ? to : [to],
			subject: subject as string,
			text: text as string,
			html: html as string,
		};

		// Send the email using Resend API
		const { data, error } = await resend.emails.send(msg);

		if (error) {
			console.error('Error sending message:', error);
			return res.status(500).json({ message: 'Internal server error' });
		}

		console.log('Message sent successfully');
		res.status(200).json({ message: 'Message sent successfully' });
	} catch (error) {
		console.error('Error sending message:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
}
