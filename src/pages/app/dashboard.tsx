import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Router from 'next/router';
import Layout from '@/components/app/Layout';
import Dashboard from '@/components/app/dashboard/Dashboard';

const DashboardPage: React.FC = () => {
	const { data: session, status } = useSession();

	useEffect(() => {
		if (status === 'unauthenticated') {
			Router.push('/login');
		}
	}, [status]);

	if (status === 'loading') {
		return <p>Loading...</p>;
	}

	return (
		<Layout>
			<Dashboard />
		</Layout>
	);
};

export default DashboardPage;
