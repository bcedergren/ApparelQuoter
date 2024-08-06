import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import Icon from '@mdi/react';
import { mdiFacebook, mdiGoogle, mdiHome } from '@mdi/js';
import { Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import { signIn, useSession } from 'next-auth/react';
import axios from 'axios';
import { getStripe } from '@/lib/stripe';
import styles from '@/styles/Register.module.css';

const RegistrationForm = () => {
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [companyName, setCompanyName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [planId, setPlanId] = useState('');
	const [termsAccepted, setTermsAccepted] = useState(false);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState(false);

	const stripe = useStripe();
	const elements = useElements();
	const router = useRouter();
	const { data: session, status } = useSession();

	useEffect(() => {
		// Extract planId from query parameters
		const { planId } = router.query;
		if (planId) {
			setPlanId(planId as string);
		}

		// Handle Google sign-in and capture the session data
		if (status === 'authenticated' && session?.user?.email) {
			setIsGoogleAuthenticated(true);
			setEmail(session.user.email);
			const nameParts = session.user.name ? session.user.name.split(' ') : [];
			setFirstName(nameParts[0] || '');
			setLastName(nameParts[1] || '');
		}
	}, [router.query, status, session]);

	const handleGoogleSignIn = async (session: any) => {
		setLoading(true);

		try {
			console.log(session.user);
			// Wait for additional form submission to capture company name
		} catch (err) {
			if (axios.isAxiosError(err)) {
				setError(err.response?.data?.error || 'An unexpected error occurred.');
			} else if (err instanceof Error) {
				setError(err.message);
			} else {
				setError('An unexpected error occurred.');
			}
		} finally {
			setLoading(false);
		}
	};

	const isPasswordStrong = (password: string) => {
		const strongPasswordPattern =
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
		return strongPasswordPattern.test(password);
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		if (
			!firstName ||
			!lastName ||
			!companyName ||
			!email ||
			(!password && !isGoogleAuthenticated) ||
			(!confirmPassword && !isGoogleAuthenticated) ||
			!planId
		) {
			setError('All fields are required.');
			return;
		}

		if (!isGoogleAuthenticated && !isPasswordStrong(password)) {
			setError(
				'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
			);
			return;
		}

		if (!isGoogleAuthenticated && password !== confirmPassword) {
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
				firstName,
				lastName,
				companyName,
				email,
				password: password,
				planId,
			});

			if (response.data.error) {
				setError(response.data.error);
			} else {
				router.push('/app/dashboard');
			}
		} catch (err) {
			if (axios.isAxiosError(err)) {
				setError(err.response?.data?.error || 'An unexpected error occurred.');
			} else if (err instanceof Error) {
				setError(err.message);
			} else {
				setError('An unexpected error occurred.');
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<Form onSubmit={handleSubmit}>
			{error && <Alert variant='danger'>{error}</Alert>}
			<Row>
				<Col xs={12}>
					<Form.Group className={styles.marginBottom}>
						<Form.Label className={styles.formLabel}>Company Name*</Form.Label>
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
				<Col md={6}>
					<Form.Group className={styles.marginBottom}>
						<Form.Label className={styles.formLabel}>First Name*</Form.Label>
						<Form.Control
							type='text'
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
							required
							placeholder='First Name'
							className={styles.formControl}
						/>
					</Form.Group>
				</Col>
				<Col md={6}>
					<Form.Group className={styles.marginBottom}>
						<Form.Label className={styles.formLabel}>Last Name*</Form.Label>
						<Form.Control
							type='text'
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
							required
							placeholder='Last Name'
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
									<Link
										href='/terms'
										target='_blank'
									>
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
			{!isGoogleAuthenticated && (
				<div className={`${styles.orRegisterWith} ${styles.marginTop}`}>
					<h4>Or Register With</h4>
					<Row className={styles.marginTop}>
						<Col
							sm={6}
							className={styles.marginBottom}
						>
							<Button
								variant='light'
								className={styles.socialButton}
								onClick={() => signIn('facebook')}
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
								onClick={() => signIn('google')}
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
				</div>
			)}
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
