import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import styles from '@/styles/ContactForm.module.css';

const ContactForm = () => {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		message: '',
	});
	const [alert, setAlert] = useState<{ type: string; message: string } | null>(
		null
	);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const response = await axios.post('/api/contact', formData);
			setAlert({ type: 'success', message: response.data.message });
			setFormData({ name: '', email: '', message: '' });
		} catch (error) {
			if (axios.isAxiosError(error)) {
				setAlert({
					type: 'danger',
					message: error.response?.data?.message || 'An error occurred',
				});
			} else {
				setAlert({ type: 'danger', message: 'An unexpected error occurred' });
			}
		}
	};

	return (
		<div className={styles.contactForm}>
			{alert && <Alert variant={alert.type}>{alert.message}</Alert>}
			<Form onSubmit={handleSubmit}>
				<Form.Group className='mb-3'>
					<Form.Label>Name</Form.Label>
					<Form.Control
						type='text'
						name='name'
						value={formData.name}
						onChange={handleChange}
						required
					/>
				</Form.Group>
				<Form.Group className='mb-3'>
					<Form.Label>Email</Form.Label>
					<Form.Control
						type='email'
						name='email'
						value={formData.email}
						onChange={handleChange}
						required
					/>
				</Form.Group>
				<Form.Group className='mb-3'>
					<Form.Label>Message</Form.Label>
					<Form.Control
						as='textarea'
						name='message'
						rows={5}
						value={formData.message}
						onChange={handleChange}
						required
					/>
				</Form.Group>
				<Button
					type='submit'
					variant='primary'
				>
					Submit
				</Button>
			</Form>
		</div>
	);
};

export default ContactForm;
