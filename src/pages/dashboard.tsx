import { useEffect } from 'react';
import Router from 'next/router';
import { Container, Row, Col } from 'react-bootstrap';
import { useSession } from 'next-auth/react';
import { FaUserCircle } from 'react-icons/fa';
import Layout from '../components/Layout'; // Update the import path as per your file structure

const Dashboard = () => {
	const { data: session, status } = useSession();

	useEffect(() => {
		// Redirect to login page if not authenticated
		if (status === 'unauthenticated') {
			Router.push('/login');
		}
	}, [status]);

	if (status === 'loading') {
		return <p>Loading...</p>;
	}

	return (
		<Layout>
			{' '}
			{/* Wrap the page content with the Layout component */}
			<Container className='mt-5'>
				<Row className='justify-content-center'>
					<Col
						md={8}
						className='text-center'
					>
						<h1>Dashboard</h1>
						{session && (
							<div>
								<FaUserCircle size={50} />
								<h2>Welcome, {session.user?.name || 'Guest'}!</h2>
								<p>You are now logged in.</p>
							</div>
						)}
					</Col>
				</Row>
			</Container>
		</Layout>
	);
};

export default Dashboard;
