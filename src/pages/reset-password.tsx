import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import Link from 'next/link';
import styles from '@/styles/ForgotPassword.module.css';
import Icon from '@mdi/react';
import { mdiHome } from '@mdi/js';
import AccountLayout from '@/components/account/AccountLayout';
import Image from 'next/image';
import resetPasswordImage from '../../public/resetPassword.png';

const ResetPasswordPage = () => {
	const router = useRouter();
	const { token } = router.query;

	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [alert, setAlert] = useState<{ type: string; message: string } | null>(
		null
	);
	const [isSuccess, setIsSuccess] = useState(false);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			setAlert({ type: 'danger', message: 'Passwords do not match.' });
			console.error('Passwords do not match');
			return;
		}

		// Show the success message immediately
		setAlert({ type: 'info', message: 'Processing your request...' });

		try {
			const res = await fetch('/api/auth/reset-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ token, password }),
			});
			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || 'Failed to reset password.');
			}

			setIsSuccess(true);
			setAlert({
				type: 'success',
				message:
					'Password reset successfully. You can now log in with your new password.',
			});
			setPassword('');
			setConfirmPassword('');
			console.log('Password reset successfully');
		} catch (err) {
			setAlert({
				type: 'danger',
				message: 'Failed to reset password. Please try again.',
			});
			console.error('Failed to reset password', err);
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
								<h4>Reset Password</h4>
							</div>
							<p className={styles.description}>
								Enter your new password below.
							</p>
							<Form onSubmit={handleSubmit}>
								<Form.Group className={styles.formGroup}>
									<Form.Label className={styles.formLabel}>
										New Password
									</Form.Label>
									<Form.Control
										type='password'
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
										className={styles.formControl}
										placeholder='Enter new password'
									/>
								</Form.Group>
								<Form.Group className={styles.formGroup}>
									<Form.Label className={styles.formLabel}>
										Confirm Password
									</Form.Label>
									<Form.Control
										type='password'
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										required
										className={styles.formControl}
										placeholder='Confirm new password'
									/>
								</Form.Group>
								<Button
									type='submit'
									className={styles.btnPrimary}
								>
									Reset Password
								</Button>
								{alert && <Alert variant={alert.type}>{alert.message}</Alert>}
								{isSuccess && (
									<div className={styles.textCenter}>
										<Link
											href='/login'
											legacyBehavior
										>
											<a>Log in</a>
										</Link>{' '}
										with your new password.
									</div>
								)}
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
							src={resetPasswordImage}
							alt='Reset Password Image'
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

export default ResetPasswordPage;
