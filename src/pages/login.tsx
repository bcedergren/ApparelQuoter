import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import PublicLayout from '@/components/public/Layout';

const LoginPage = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const router = useRouter();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		let result;
		try {
			result = await signIn('credentials', {
				redirect: false, // Set to false to handle redirects manually
				email,
				password,
			});

			console.log(result);
		} catch (error) {
			console.error('Login error:', error);
			setError('Failed to log in');
			return; // Early return on error
		}

		if (result?.error) {
			setError(result.error);
		} else if (!result?.error && result?.ok) {
			// Redirect to dashboard after login
			window.location.href = '/dashboard';
		}
	};

	return (
		<PublicLayout>
			<Container>
				<Row>
					<Col md={{ span: 6, offset: 3 }}>
						<h2>Login</h2>
						{error && <Alert variant='danger'>{error}</Alert>}
						<Form onSubmit={handleSubmit}>
							<Form.Group className='mb-3'>
								<Form.Label>Email</Form.Label>
								<Form.Control
									type='email'
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
							</Form.Group>
							<Form.Group className='mb-3'>
								<Form.Label>Password</Form.Label>
								<Form.Control
									type='password'
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
								/>
							</Form.Group>
							<div className='d-grid gap-2 text-center'>
								<Button
									variant='primary'
									type='submit'
									className='me-2'
								>
									Login
								</Button>
								<span>{"Don't have an account?"}</span>
								<Button
									variant='secondary'
									onClick={() => router.push('/register')}
									className='ms-2'
								>
									Register
								</Button>
							</div>
						</Form>
					</Col>
				</Row>
			</Container>
		</PublicLayout>
	);
};

export default LoginPage;
