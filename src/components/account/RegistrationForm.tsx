import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import Icon from '@mdi/react';
import { mdiFacebook, mdiGoogle, mdiHome } from '@mdi/js';
import { Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { getStripe } from '@/lib/stripe';
import styles from '@/styles/Register.module.css';

const RegistrationForm = () => {
	const [name, setName] = useState('');
	const [companyName, setCompanyName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [termsAccepted, setTermsAccepted] = useState(false);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const stripe = useStripe();
	const elements = useElements();
	const router = useRouter();

	const isPasswordStrong = (password: string) => {
		const strongPasswordPattern =
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
		return strongPasswordPattern.test(password);
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		if (!name || !companyName || !email || !password || !confirmPassword) {
			setError('All fields are required.');
			return;
		}

		if (!isPasswordStrong(password)) {
			setError(
				'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
			);
			return;
		}

		if (password !== confirmPassword) {
			setError('Passwords do not match');
			return;
		}

		if (!termsAccepted) {
			setError('You must accept the Terms and Conditions');
			return;
		}

		setLoading(true);

		try {
			const response = await axios.post('/api/register', {
				name,
				companyName,
				email,
				password,
			});

			if (response.data.error) {
				setError(response.data.error);
			} else {
				router.push('/dashboard');
			}
		} catch (err) {
			setError('An unexpected error occurred.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			{error && <Alert variant='danger'>{error}</Alert>}
			<Form onSubmit={handleSubmit}>
				<Row>
					<Col xs={12}>
						<Form.Group className={styles.marginBottom}>
							<Form.Label className={styles.formLabel}>Your Name*</Form.Label>
							<Form.Control
								type='text'
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								placeholder='Name'
								className={styles.formControl}
							/>
						</Form.Group>
					</Col>
					<Col xs={12}>
						<Form.Group className={styles.marginBottom}>
							<Form.Label className={styles.formLabel}>
								Company Name*
							</Form.Label>
							<Form.Control
								type='text'
								value={companyName}
								onChange={(e) => setCompanyName(e.target.value)}
								required
								placeholder='Company Name'
								className={styles.formControl}
							/>
						</Form.Group>
					</Col>
					<Col xs={12}>
						<Form.Group className={styles.marginBottom}>
							<Form.Label className={styles.formLabel}>Your Email*</Form.Label>
							<Form.Control
								type='email'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								placeholder='Email'
								className={styles.formControl}
							/>
						</Form.Group>
					</Col>
					<Col xs={12}>
						<Form.Group className={styles.marginBottom}>
							<Form.Label className={styles.formLabel}>Password*</Form.Label>
							<Form.Control
								type='password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								placeholder='Password'
								className={styles.formControl}
							/>
						</Form.Group>
					</Col>
					<Col xs={12}>
						<Form.Group className={styles.marginBottom}>
							<Form.Label className={styles.formLabel}>
								Confirm Password*
							</Form.Label>
							<Form.Control
								type='password'
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								placeholder='Confirm Password'
								className={styles.formControl}
							/>
						</Form.Group>
					</Col>
					<Col xs={12}>
						<Form.Group className={styles.marginBottom}>
							<Form.Check
								type='checkbox'
								label={
									<>
										I Accept the{' '}
										<Link href='/terms'>
											<span className={styles.linkText}>
												Terms And Conditions
											</span>
										</Link>
									</>
								}
								checked={termsAccepted}
								onChange={(e) => setTermsAccepted(e.target.checked)}
								className={styles.formCheck}
								required
							/>
						</Form.Group>
					</Col>
					<Col xs={12}>
						<Button
							type='submit'
							className={styles.btnPrimary}
							disabled={loading}
						>
							{loading ? 'Processing…' : 'Register'}
						</Button>
					</Col>
				</Row>
				<div className={`${styles.orRegisterWith} ${styles.marginTop}`}>
					<h4>Or Register With</h4>
				</div>
				<Row className={styles.marginTop}>
					<Col
						sm={6}
						className={styles.marginBottom}
					>
						<Button
							variant='light'
							className={styles.socialButton}
						>
							<Icon
								path={mdiFacebook}
								size={1}
								color='blue'
								className={styles.socialIcon}
							/>{' '}
							Facebook
						</Button>
					</Col>
					<Col
						sm={6}
						className={styles.marginBottom}
					>
						<Button
							variant='light'
							className={styles.socialButton}
						>
							<Icon
								path={mdiGoogle}
								size={1}
								color='red'
								className={styles.socialIcon}
							/>{' '}
							Google
						</Button>
					</Col>
				</Row>
				<Row>
					<Col className='text-center'>
						<small className='text-dark me-2'>Already have an account?</small>
						<Link
							href='/login'
							className={styles.boldText}
						>
							Login
						</Link>
					</Col>
				</Row>
				<div className={`${styles.homeButton} ${styles.marginTop}`}>
					<Link
						href='/'
						className={styles.boldText}
					>
						<Icon
							path={mdiHome}
							size={1}
							color='blue'
						/>
					</Link>
				</div>
			</Form>
		</>
	);
};

const RegistrationPage = () => {
	return (
		<Elements stripe={getStripe()}>
			<RegistrationForm />
		</Elements>
	);
};

export default RegistrationPage;
