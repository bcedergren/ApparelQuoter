import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import Link from 'next/link';
import styles from '@/styles/Login.module.css';
import Icon from '@mdi/react';
import { mdiFacebook, mdiGoogle, mdiHome } from '@mdi/js';
import AccountLayout from '@/components/account/AccountLayout';

const LoginPage = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [rememberMe, setRememberMe] = useState(false);
	const [error, setError] = useState('');

	const router = useRouter();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		console.log('loggin in');

		const result = await signIn('credentials', {
			redirect: false,
			email,
			password,
			rememberMe: rememberMe.toString(),
			callbackUrl: `${window.location.origin}/dashboard`,
		});

		if (result?.error) {
			setError(result.error);
		} else if (result && result.ok) {
			router.push(result.url || '/dashboard');
		}
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
								<h5 className='mb-4 pb-2'>Sign In</h5>
							</div>
							<Form className={styles.loginForm}>
								<Row>
									<Col xs={12}>
										<Form.Group className='mb-3'>
											<Form.Label className={styles.formLabel}>
												Your Email *
											</Form.Label>
											<Form.Control
												type='email'
												value={email}
												onChange={(e) => setEmail(e.target.value)}
												required
												placeholder='Your Email :'
											/>
										</Form.Group>
									</Col>
									<Col xs={12}>
										<Form.Group className='mb-3'>
											<Form.Label className={styles.formLabel}>
												Password *
											</Form.Label>
											<Form.Control
												type='password'
												value={password}
												onChange={(e) => setPassword(e.target.value)}
												required
												placeholder='Password :'
											/>
										</Form.Group>
									</Col>
									<Col
										xs={12}
										className='d-flex justify-content-between'
									>
										<Form.Check
											type='checkbox'
											label='Remember me'
											checked={rememberMe}
											onChange={(e) => setRememberMe(e.target.checked)}
											className='mb-3'
										/>
										<Link
											href='/forgot-password'
											className={styles.textDark}
										>
											Forgot password?
										</Link>
									</Col>
									<Col xs={12}>
										<Button
											className='btn btn-primary w-100'
											onClick={handleSubmit}
										>
											Sign in
										</Button>
									</Col>
									<Col
										xs={12}
										className='text-center mt-4'
									>
										<h6 className='mb-0'>Or Login With</h6>
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
											/>
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
										<p className='mb-0'>
											<small className='text-dark me-2'>
												Don&apos;t have an account ?
											</small>
											<Link
												href='/register'
												className='text-dark fw-bold'
											>
												Sign Up
											</Link>
										</p>
									</Col>
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
								</Row>
							</Form>
						</div>
					</Col>
				</Row>
			</Container>
		</AccountLayout>
	);
};

export default LoginPage;
