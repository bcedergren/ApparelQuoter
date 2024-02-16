import { useEffect } from 'react';
import Router from 'next/router';
import { Button, Container } from 'react-bootstrap';
import { useSession, signIn } from 'next-auth/react'; // Import signIn
import { FaSignInAlt } from 'react-icons/fa';
import Link from 'next/link';

const Home = () => {
	const { data: session, status } = useSession();

	useEffect(() => {
		// Redirect to dashboard if authenticated
		if (session) {
			Router.push('/dashboard');
		}
	}, [session, status]);

	const handleLogin = () => {
		signIn(); // Trigger the sign-in flow
	};

	return (
		<Container className='text-center mt-5'>
			{/* Login Button */}
			<Button
				onClick={handleLogin}
				variant='primary'
			>
				<FaSignInAlt /> Login
			</Button>
		</Container>
	);
};

export default Home;
