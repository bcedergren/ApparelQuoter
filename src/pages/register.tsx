import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import Link from 'next/link';
import styles from '@/styles/Register.module.css';
import Icon from '@mdi/react';
import { mdiFacebook, mdiGoogle, mdiHome } from '@mdi/js';
import AccountLayout from '@/components/account/AccountLayout';
import Image from 'next/image';
import registerImage from '../../public/signUp.png'; // Update the path to the image accordingly

const RegistrationPage = () => {
	const [name, setName] = useState('');
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

		const res = await fetch('/api/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name,
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
			<Container className={styles.registerContainer}>
				<Row className={styles.centerContent}>
					<Col
						md={6}
						lg={5}
						className={styles.card}
					>
						<div className={styles.textCenter}>
							<h1>ApparelQuoter</h1>
						</div>
						<div
							className={`${styles.loginPage} ${styles.bgWhite} ${styles.shadowLg} ${styles.rounded} ${styles.p4} ${styles.mt4} ${styles.positionRelative}`}
						>
							<div className={styles.textCenter}>
								<h3
									className={`${styles.marginBottom} ${styles.paddingBottom}`}
								>
									Sign Up
								</h3>
							</div>
							<Form onSubmit={handleSubmit}>
								<Row>
									<Col xs={12}>
										<Form.Group className={styles.marginBottom}>
											<Form.Label className={styles.formLabel}>
												Your Name*
											</Form.Label>
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
												Your Email*
											</Form.Label>
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
											<Form.Label className={styles.formLabel}>
												Password*
											</Form.Label>
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
											/>
										</Form.Group>
									</Col>
									<Col xs={12}>
										<Button className={styles.btnPrimary}>Register</Button>
									</Col>
									<Col
										xs={12}
										className={`${styles.textCenter} ${styles.marginTop}`}
									>
										<h6>Or Signup With</h6>
									</Col>
									<Col
										sm={6}
										className={styles.marginTop}
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
										className={styles.marginTop}
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
									<Col
										xs={12}
										className={`${styles.textCenter} ${styles.marginTop}`}
									>
										<small className='text-dark me-2'>
											Already have an account?{' '}
										</small>
										<Link
											href='/login'
											className={styles.boldText}
										>
											Sign in
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
						</div>
					</Col>
					<Col
						md={6}
						lg={5}
						className={styles.imageCol}
					>
						<Image
							src={registerImage}
							alt='Register Image'
							className={styles.registerImage}
							height={600}
							width={600}
						/>
					</Col>
				</Row>
			</Container>
		</AccountLayout>
	);
};

export default RegistrationPage;
