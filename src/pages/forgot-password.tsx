import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import Link from 'next/link';
import styles from '@/styles/ForgotPassword.module.css';
import Icon from '@mdi/react';
import { mdiHome } from '@mdi/js';
import AccountLayout from '@/components/account/AccountLayout';

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState('');
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

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

			setSuccess('Reset link sent! Please check your email.');
			setError('');
		} catch (err) {
			setError('Failed to send reset link. Please try again.');
			setSuccess('');
		}
	};

	return (
		<AccountLayout>
			<Container className={styles.forgotPasswordContainer}>
				<Row className='justify-content-center'>
					<Col className={styles.forgotPasswordCard}>
						<div className={styles.textCenter}>
							<h3>ApparelQuoter</h3>
						</div>
						<div className={`${styles.title} ${styles.mt4}`}>
							<h5>Forgot Password</h5>
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
							{error && <div className={styles.errorMessage}>{error}</div>}
							{success && (
								<div className={styles.successMessage}>{success}</div>
							)}
							<Button
								type='submit'
								className={styles.btnPrimary}
							>
								Send Reset Link
							</Button>
						</Form>
						<Col
							xs={12}
							className='text-center mt-3'
						>
							<Link
								href='/'
								className='text-dark fw-bold'
							>
								<Icon
									path={mdiHome}
									size={1}
									color='blue'
								/>
							</Link>
						</Col>
					</Col>
				</Row>
			</Container>
		</AccountLayout>
	);
};

export default ForgotPasswordPage;
