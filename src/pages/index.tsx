import { useEffect } from 'react';
import Router from 'next/router';
import { Container } from 'react-bootstrap';
import { useSession } from 'next-auth/react';
import PublicLayout from '@/components/public/Layout';
import Hero from '@/components/public/Hero';

const Home = () => {
	const { data: session } = useSession();

	useEffect(() => {
		if (session) {
			Router.push('/dashboard');
		}
	}, [session]);

	return (
		<PublicLayout>
			<Hero />
			<Container className='my-5 py-5 bg-white'>
				{/* Content sections for features, testimonials, etc. go here */}
			</Container>
		</PublicLayout>
	);
};

export default Home;
