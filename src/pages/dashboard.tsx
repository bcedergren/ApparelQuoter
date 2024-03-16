import { useEffect } from 'react';
import Router from 'next/router';
import { Container, Row, Col } from 'react-bootstrap';
import { useSession } from 'next-auth/react';
import Layout from '@/components/Layout';

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

	console.log(session);

	return (
		<Layout>
			<Container fluid>
				<Row>
					<Col
						md={12}
						lg={12}
						style={{ paddingLeft: 0 }}
					>
						<h1>Dashboard</h1>
					</Col>
				</Row>
			</Container>
		</Layout>
	);
};

export default Dashboard;
