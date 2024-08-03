import { readFile } from 'fs/promises';
import { resolve } from 'path';

const sendEmailViaMailerAPI = async (
	email: string,
	resetUrl: string
): Promise<void> => {
	// Path to the email template file
	const templatePath = resolve('@/templates/passwordResetTemplate.html');

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

export default sendEmailViaMailerAPI;
