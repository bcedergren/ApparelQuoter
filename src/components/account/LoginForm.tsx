import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Icon from '@mdi/react';
import { mdiFacebook, mdiGoogle, mdiHome } from '@mdi/js';
import styles from '@/styles/Login.module.css';

const LoginForm = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [rememberMe, setRememberMe] = useState(false);
	const [error, setError] = useState('');
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const result = await signIn('credentials', {
			redirect: false,
			email,
			password,
		});

		if (result?.error) {
			setError(result.error);
		} else {
			router.push('/app/dashboard');
		}
	};

	return (
		<Form onSubmit={handleSubmit}>
			{error && <Alert variant='danger'>{error}</Alert>}
			<Form.Group className={styles.marginBottom}>
				<Form.Label className={styles.formLabel}>Your Email</Form.Label>
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
				<Form.Label className={styles.formLabel}>Password</Form.Label>
				<Form.Control
					type='password'
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					placeholder='Password'
					className={styles.formControl}
				/>
			</Form.Group>
			<Form.Group className={styles.marginBottom}>
				<Form.Check
					type='checkbox'
					label='Remember me'
					checked={rememberMe}
					onChange={(e) => setRememberMe(e.target.checked)}
					className={styles.formCheck}
				/>
			</Form.Group>
			<Form.Group
				className={`d-flex justify-content-end ${styles.marginBottom}`}
			>
				<Link
					href='/forgot-password'
					className={styles.linkText}
				>
					Forgot password?
				</Link>
			</Form.Group>
			<Button
				type='submit'
				className={styles.btnPrimary}
			>
				Sign In
			</Button>
			<div className={`${styles.textCenter} ${styles.marginTop}`}>
				<small className='text-dark me-2'>Or Login With</small>
				<div className={styles.socialLogin}>
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
				</div>
				<small className='text-dark me-2'>Don&apos;t have an account?</small>
				<Link
					href='/register'
					className={styles.boldText}
				>
					Sign Up
				</Link>
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
	);
};

export default LoginForm;
