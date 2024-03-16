import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import PublicLayout from '@/components/public/Layout';

const RegistrationPage = () => {
	const [companyName, setCompanyName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [plan, setPlan] = useState('');
	const [error, setError] = useState('');

	const router = useRouter();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		// Check if passwords match
		if (password !== confirmPassword) {
			setError('Passwords do not match');
			return; // Early return if passwords don't match
		}

		// Step 1: Create Company
		const companyRes = await fetch('/api/company/create', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ companyName }),
		});

		if (!companyRes.ok) {
			const companyErr = await companyRes.json();
			setError(companyErr.message || 'Failed to create company.');
			return;
		}
		const company = await companyRes.json();

		// Step 2: Register User
		const userRes = await fetch('/api/users/add-user', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				companyId: company.data.insertedId, // Assuming this is the ID of the created company
				email,
				password, // Make sure to hash passwords on the server side
				role: 'admin', // Setting user role as admin
			}),
		});

		if (!userRes.ok) {
			const userErr = await userRes.json();
			setError(userErr.message || 'Failed to create user.');
			return;
		}

		// Step 3: Subscribe to Plan
		const subscriptionRes = await fetch('/api/subscribe', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, plan }),
		});

		if (!subscriptionRes.ok) {
			const subscriptionErr = await subscriptionRes.json();
			setError(
				subscriptionErr.error || 'Failed to subscribe to the selected plan.'
			);
			return;
		}

		// Redirect or show success message
		router.push('/dashboard');
	};

	return (
		<PublicLayout>
			<Container>
				<Row>
					<Col md={{ span: 6, offset: 3 }}>
						<h2>Register</h2>
						{error && <Alert variant='danger'>{error}</Alert>}
						<Form onSubmit={handleSubmit}>
							<Form.Group className='mb-3'>
								<Form.Label>Company Name</Form.Label>
								<Form.Control
									type='text'
									value={companyName}
									onChange={(e) => setCompanyName(e.target.value)}
									required
								/>
							</Form.Group>
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
							<Form.Group className='mb-3'>
								<Form.Label>Confirm Password</Form.Label>
								<Form.Control
									type='password'
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required
								/>
							</Form.Group>
							<Form.Group className='mb-3'>
								<Form.Label>Plan</Form.Label>
								<Form.Select
									value={plan}
									onChange={(e) => setPlan(e.target.value)}
									required
								>
									<option value=''>Select a plan</option>
									<option value='trial'>Trial</option>
									<option value='small'>Small Shop</option>
									<option value='medium'>Medium Shop</option>
									<option value='large'>Large Shop</option>
								</Form.Select>
							</Form.Group>
							<div className='d-grid gap-2  text-center'>
								<Button
									variant='primary'
									type='submit'
								>
									Register
								</Button>
								Already have an account?
								<Button
									variant='secondary'
									onClick={() => router.push('/login')}
								>
									Login
								</Button>
							</div>
						</Form>
					</Col>
				</Row>
			</Container>
		</PublicLayout>
	);
};

export default RegistrationPage;
