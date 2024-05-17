import { useEffect } from 'react';
import Router from 'next/router';
import { useSession } from 'next-auth/react';
import PublicLayout from '@/components/public/Layout';
import Headline from '@/components/public/Headline';
import Services from '@/components/public/Services';
import Pricing from '@/components/public/Pricing';
import Contact from '@/components/public/Contact';

const Home = () => {
	const { data: session } = useSession();

	useEffect(() => {
		if (session) {
			Router.push('/dashboard');
		}
	}, [session]);

	return (
		<PublicLayout>
			<div id='home'>
				<Headline />
			</div>
			<div id='service'>
				<Services />
			</div>
			<div id='pricing'>
				<Pricing />
			</div>
			<div id='contact'>
				<Contact />
			</div>
		</PublicLayout>
	);
};

export default Home;
