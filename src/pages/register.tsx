import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import Link from 'next/link';
import styles from '@/styles/Login.module.css'; // Assuming styles are defined to match the template's aesthetics
import Icon from '@mdi/react';
import { mdiFacebook, mdiGoogle } from '@mdi/js';
import AccountLayout from '@/components/account/AccountLayout';

const RegistrationPage = () => {
	const [firstName, setFirstName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [termsAccepted, setTermsAccepted] = useState(false);
	const [error, setError] = useState('');

	const router = useRouter();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			setError('Passwords do not match');
			return;
		}

		// Example API call to create user
		const res = await fetch('/api/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				firstName,
				email,
				password,
			}),
		});

		const data = await res.json();

		if (!res.ok) {
			setError(data.message || 'Failed to register.');
			return;
		}

		router.push('/dashboard');
	};

	return (
		<AccountLayout>
			<Container className={styles.loginContainer}>
				<Row className='justify-content-center'>
					<Col className={styles.card}>
						<div className={styles.textCenter}>
							<h3>ApparelQuoter</h3>
						</div>
						<div
							className={`${styles.loginPage} ${styles.bgWhite} ${styles.shadowLg} ${styles.rounded} ${styles.p4} ${styles.mt4} ${styles.positionRelative}`}
						>
							<div className={styles.textCenter}>
								<h5 className='mb-4 pb-2'>Sign Up</h5>
							</div>
							<Form onSubmit={handleSubmit}>
								<Row>
									<Col xs={12}>
										<Form.Group className='mb-3'>
											<Form.Label>First Name *</Form.Label>
											<Form.Control
												type='text'
												value={firstName}
												onChange={(e) => setFirstName(e.target.value)}
												required
												placeholder='First Name :'
											/>
										</Form.Group>
									</Col>
									<Col xs={12}>
										<Form.Group className='mb-3'>
											<Form.Label>Email *</Form.Label>
											<Form.Control
												type='email'
												value={email}
												onChange={(e) => setEmail(e.target.value)}
												required
												placeholder='Email :'
											/>
										</Form.Group>
									</Col>
									<Col xs={12}>
										<Form.Group className='mb-3'>
											<Form.Label>Password *</Form.Label>
											<Form.Control
												type='password'
												value={password}
												onChange={(e) => setPassword(e.target.value)}
												required
												placeholder='Password :'
											/>
										</Form.Group>
									</Col>
									<Col xs={12}>
										<Form.Group className='mb-3'>
											<Form.Label>Confirm Password *</Form.Label>
											<Form.Control
												type='password'
												value={confirmPassword}
												onChange={(e) => setConfirmPassword(e.target.value)}
												required
												placeholder='Confirm Password :'
											/>
										</Form.Group>
									</Col>
									<Col xs={12}>
										<Form.Group className='mb-3'>
											<Form.Check
												type='checkbox'
												label='I Accept Terms And Condition'
												checked={termsAccepted}
												onChange={(e) => setTermsAccepted(e.target.checked)}
											/>
										</Form.Group>
									</Col>
									<Col xs={12}>
										<Button className='btn btn-primary w-100'>Register</Button>
									</Col>
									<Col
										xs={12}
										className='text-center mt-4'
									>
										<h6>Or Signup With</h6>
									</Col>
									<Col
										sm={6}
										className='mt-4'
									>
										<Button
											variant='light'
											className='w-100'
										>
											<Icon
												path={mdiFacebook}
												size={1}
												color='blue'
											/>{' '}
											Facebook
										</Button>
									</Col>
									<Col
										sm={6}
										className='mt-4'
									>
										<Button
											variant='light'
											className='w-100'
										>
											<Icon
												path={mdiGoogle}
												size={1}
												color='red'
											/>{' '}
											Google
										</Button>
									</Col>
									<Col
										xs={12}
										className='text-center mt-3'
									>
										<small className='text-dark me-2'>
											Already have an account?
										</small>
										<Link
											href='/login'
											className='text-dark fw-bold'
										>
											Sign in
										</Link>
									</Col>
								</Row>
							</Form>
						</div>
					</Col>
				</Row>
			</Container>
		</AccountLayout>
	);
};

export default RegistrationPage;
