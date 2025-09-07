import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Router from 'next/router';
import Layout from '@/components/app/Layout';
import Dashboard from '@/components/app/dashboard/Dashboard';
import { Container, Spinner, Alert } from 'react-bootstrap';

const DashboardPage: React.FC = () => {
	const { data: session, status } = useSession();
	const [dashboardData, setDashboardData] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (status === 'unauthenticated') {
			Router.push('/login');
		} else if (status === 'authenticated') {
			const companyId = session?.user?.companyId;

			if (companyId) {
				fetch(`/api/dashboard?companyId=${companyId}`)
					.then((res) => res.json())
					.then((data) => {
						setDashboardData(data);
						setLoading(false);
					})
					.catch((error) => {
						console.error('Error fetching dashboard data:', error);
						setError('Failed to load dashboard data');
						setLoading(false);
					});
			} else {
				setError('Company ID is missing');
				setLoading(false);
			}
		}
	}, [status, session?.user?.companyId]);

	if (status === 'loading' || loading) {
		return (
			<Container className='text-center'>
				<Spinner
					animation='border'
					role='status'
				></Spinner>
			</Container>
		);
	}

	if (error) {
		return (
			<Container className='mt-4'>
				<Alert variant='danger'>{error}</Alert>
			</Container>
		);
	}

	return (
		<Layout>
			<Dashboard data={dashboardData} />
		</Layout>
	);
};

export default DashboardPage;
