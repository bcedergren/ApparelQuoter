import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import Link from 'next/link';
import styles from '@/styles/ForgotPassword.module.css';
import Icon from '@mdi/react';
import { mdiHome } from '@mdi/js';
import AccountLayout from '@/components/account/AccountLayout';
import Image from 'next/image';
import forgotPasswordImage from '../../public/forgotPassword.png';

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
				<Row className={styles.forgotPasswordCardContainer}>
					<Col
						md={6}
						lg={5}
						className={styles.forgotPasswordCard}
					>
						<div>
							<div className={styles.textCenter}>
								<h1>ApparelQuoter</h1>
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
							width={600}
							height={600}
						/>
					</Col>
				</Row>
			</Container>
		</AccountLayout>
	);
};

export default ForgotPasswordPage;
