import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import Link from 'next/link';
import styles from '@/styles/Login.module.css';
import Icon from '@mdi/react';
import { mdiFacebook, mdiGoogle, mdiHome } from '@mdi/js';
import AccountLayout from '@/components/account/AccountLayout';
import Image from 'next/image';

const LoginPage = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [rememberMe, setRememberMe] = useState(false);
	const [error, setError] = useState('');

	const router = useRouter();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

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
				<Row className={styles.centerContent}>
					<Col
						md={6}
						lg={5}
						className={styles.card}
					>
						<div className={styles.textCenter}>
							<h1>ApparelQuoter</h1>
						</div>
						<div className={styles.textCenter}>
							<h3>Sign In</h3>
						</div>
						<Form
							className={styles.loginForm}
							onSubmit={handleSubmit}
						>
							<Form.Group className={styles.marginBottom}>
								<Row>
									<Form.Label className={styles.formLabel}>
										Your Email:
									</Form.Label>
								</Row>
								<Form.Control
									type='email'
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									placeholder='Your Email'
									className={styles.formControl}
								/>
							</Form.Group>
							<Form.Group className={styles.marginBottom}>
								<Row>
									<Form.Label className={styles.formLabel}>
										Password:
									</Form.Label>
								</Row>
								<Form.Control
									type='password'
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									placeholder='Password'
									className={styles.formControl}
								/>
							</Form.Group>
							<div
								className={`${styles.rememberMeContainer} ${styles.marginBottom}`}
							>
								<Form.Check
									className={styles.formCheck}
									type='checkbox'
									label='Remember me'
									checked={rememberMe}
									onChange={(e) => setRememberMe(e.target.checked)}
								/>
								<Link
									href='/forgot-password'
									className={styles.textDark}
								>
									Forgot password?
								</Link>
							</div>
							<Button
								type='submit'
								className={styles.btnPrimary}
							>
								Sign in
							</Button>
							<div className={`${styles.orLoginWith} ${styles.marginTop}`}>
								<h4>Or Login With</h4>
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
							<div className={styles.marginTop}>
								<p className={styles.textCenter}>
									<small className='text-dark me-2'>
										Don&apos;t have an account?{' '}
									</small>
									<Link
										href='/register'
										className={styles.boldText}
									>
										Sign Up
									</Link>
								</p>
							</div>
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
					</Col>
					<Col
						md={6}
						lg={5}
						className={styles.imageCol}
					>
						<Image
							src='/signIn.png'
							alt='Sign In Image'
							className={styles.signInImage}
							height={800}
							width={800}
						/>
					</Col>
				</Row>
			</Container>
		</AccountLayout>
	);
};

export default LoginPage;
