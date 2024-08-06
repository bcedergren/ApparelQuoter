import { useState, FormEvent } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import Link from 'next/link';
import styles from '@/styles/ForgotPassword.module.css';
import Icon from '@mdi/react';
import { mdiHome } from '@mdi/js';
import AccountLayout from '@/components/account/AccountLayout';
import Image from 'next/image';
import forgotPasswordImage from '../../public/forgotPassword.png';

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState('');
	const [alert, setAlert] = useState<{ type: string; message: string } | null>(
		null
	);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		// Show the success message immediately
		setAlert({ type: 'info', message: 'Processing your request...' });

		try {
			const res = await fetch('/api/auth/forgot-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email }),
			});
			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || 'Failed to send reset link.');
			}

			setAlert({
				type: 'success',
				message: 'Reset link sent! Please check your email.',
			});
		} catch (err) {
			setAlert({
				type: 'danger',
				message: 'Failed to send reset link. Please try again.',
			});
		}
	};

	return (
		<AccountLayout>
			<Container className={styles.forgotPasswordContainer}>
				<Row className={styles.forgotPasswordCardContainer}>
					<Col
						md={6}
						lg={5}
						className={styles.forgotPasswordCard}
					>
						<div>
							<div className={styles.textCenter}>
								<Image
									src='/logo.png'
									alt='logo'
									className={styles.logo}
									height={50}
									width={200}
								/>
							</div>
							<div className={`${styles.title} ${styles.mt4}`}>
								<h4>Forgot Password</h4>
							</div>
							<p className={styles.description}>
								Enter your email address to receive a password reset link.
							</p>
							<Form onSubmit={handleSubmit}>
								<Form.Group className={styles.formGroup}>
									<Form.Label className={styles.formLabel}>
										Email Address
									</Form.Label>
									<Form.Control
										type='email'
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
										className={styles.formControl}
										placeholder='Enter your email'
									/>
								</Form.Group>
								<Button
									type='submit'
									className={styles.btnPrimary}
								>
									Send Reset Link
								</Button>
								{alert && <Alert variant={alert.type}>{alert.message}</Alert>}
							</Form>
							<div className={`${styles.textCenter} ${styles.mt4}`}>
								<Link
									href='/'
									className={styles.textDark}
								>
									<Icon
										path={mdiHome}
										size={1}
										color='blue'
									/>
								</Link>
							</div>
						</div>
					</Col>
					<Col
						md={6}
						lg={5}
						className={styles.imageCol}
					>
						<Image
							src={forgotPasswordImage}
							alt='Forgot Password Image'
							className={styles.forgotPasswordImage}
							width={800}
							height={800}
						/>
					</Col>
				</Row>
			</Container>
		</AccountLayout>
	);
};

export default ForgotPasswordPage;
