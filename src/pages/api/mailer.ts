import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmailWithRetries = async (
	from: string,
	to: string[],
	subject: string,
	html: string,
	text?: string
) => {
	const MAX_RETRIES = 3;
	const RETRY_DELAY = 1000;
	let retries = 0;

	const msg = {
		from,
		to,
		subject,
		text,
		html,
	};

	while (retries < MAX_RETRIES) {
		try {
			const { data, error } = await resend.emails.send(msg);

			if (!error) {
				console.log(`Email sent successfully to ${to.join(', ')}`);
				return;
			}

			throw new Error(`Failed to send email: ${error.message}`);
		} catch (error) {
			retries += 1;
			console.warn(`Retrying email send (${retries}/${MAX_RETRIES})...`);
			if (retries >= MAX_RETRIES) {
				console.error(
					`Failed to send email after ${MAX_RETRIES} attempts`,
					error
				);
				throw error;
			}
			await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
		}
	}
};

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

	if (!from || !to || !subject || (!text && !html)) {
		console.log('Missing required fields:', { from, to, subject, text, html });
		return res.status(400).json({ message: 'Missing required fields' });
	}

	try {
		await sendEmailWithRetries(
			from,
			Array.isArray(to) ? to : [to],
			subject,
			html,
			text
		);
		console.log('Message sent successfully');
		res.status(200).json({ message: 'Message sent successfully' });
	} catch (error) {
		console.error('Error sending message:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
}
