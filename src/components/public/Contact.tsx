import { useState, FormEvent } from 'react';
import styles from '@/styles/Contact.module.css';

const Contact = () => {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		subject: '',
		message: '',
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		// handle form submission
	};

	return (
		<div
			className={styles.contactSection}
			id='contact'
		>
			<h2>Get in touch!</h2>
			<p>
				Have Questions? We&apos;re Here to Help! Contact us to learn how
				ApparelQuoter can streamline your business operations. Let&apos;s get
				started on your journey to success!
			</p>
			<form onSubmit={handleSubmit}>
				<input
					type='text'
					name='name'
					placeholder='Your Name *'
					value={formData.name}
					onChange={handleChange}
					required
				/>
				<input
					type='email'
					name='email'
					placeholder='Your Email *'
					value={formData.email}
					onChange={handleChange}
					required
				/>
				<input
					type='text'
					name='subject'
					placeholder='Subject'
					value={formData.subject}
					onChange={handleChange}
				/>
				<textarea
					name='message'
					placeholder='Your Message'
					value={formData.message}
					onChange={handleChange}
					required
				></textarea>
				<button type='submit'>Send Message</button>
			</form>
		</div>
	);
};

export default Contact;
