import { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import Head from 'next/head';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import styles from '@/styles/ContactUs.module.css';
import ContactForm from '@/components/public/ContactForm';

const Contact = () => {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		message: '',
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Handle form submission logic, e.g., send data to the server
		console.log('Form submitted:', formData);
		// Clear form after submission
		setFormData({
			name: '',
			email: '',
			message: '',
		});
	};

	return (
		<>
			<Head>
				<title>Contact Us - ApparelQuoter</title>
			</Head>
			<Header />
			<Container className={styles.contactContainer}>
				<h1>Contact Us</h1>
				<p>
					If you have any questions, feel free to reach out to us by filling out
					the form below.
				</p>

				<ContactForm />
			</Container>
			<Footer />
		</>
	);
};

export default Contact;
