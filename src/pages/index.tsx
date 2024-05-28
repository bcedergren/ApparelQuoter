import { useState } from 'react';
import Head from 'next/head';
import Header from '@/components/public/Header';
import Features from '@/components/public/Features';
import Pricing from '@/components/public/Pricing';
import Contact from '@/components/public/Contact';
import Footer from '@/components/public/Footer';
import styles from '@/styles/Index.module.css';
import Headline from '@/components/public/Headline';

const Home = () => {
	const [selectedPlan, setSelectedPlan] = useState<string>(
		'price_1NDCWcIMQotP1KSIBt3qrxLB'
	);
	const [selectedType, setSelectedType] = useState<string>('monthly');

	return (
		<>
			<Head>
				<title>ApparelQuoter</title>
				<link
					rel='stylesheet'
					href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css'
				/>
			</Head>
			<Header />
			<main className={styles.main}>
				<section
					id='home'
					className={styles.homeSection}
				>
					<Headline />
				</section>
				<section
					id='services'
					className={styles.servicesSection}
				>
					<Features />
				</section>
				<section
					id='pricing'
					className={styles.pricingSection}
				>
					<Pricing
						selectedPlan={{ plan: selectedPlan, setPlan: setSelectedPlan }}
						selectedType={{ type: selectedType, setType: setSelectedType }}
					/>
				</section>
				<section
					id='contact'
					className={styles.contactSection}
				>
					<Contact />
				</section>
			</main>
			<Footer />
		</>
	);
};

export default Home;
