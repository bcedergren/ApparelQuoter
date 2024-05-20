import { Container } from 'react-bootstrap';
import Head from 'next/head';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import styles from '@/styles/Terms.module.css';

const Terms = () => {
	return (
		<>
			<Head>
				<title>Terms and Conditions - ApparelQuoter</title>
			</Head>
			<Header />
			<Container className={styles.termsContainer}>
				<h1>Terms and Conditions</h1>
				<p>Last updated: [Date]</p>

				<section className={styles.section}>
					<h2>1. Introduction</h2>
					<p>
						Welcome to ApparelQuoter. These terms and conditions outline the
						rules and regulations for the use of our website and services.
					</p>
				</section>

				<section className={styles.section}>
					<h2>2. Acceptance of Terms</h2>
					<p>
						By accessing and using our services, you accept and agree to be
						bound by the terms and provision of this agreement.
					</p>
				</section>

				<section className={styles.section}>
					<h2>3. Privacy Policy</h2>
					<p>
						Your privacy is very important to us. Please read our{' '}
						<a href='/privacy'>Privacy Policy</a> for more information.
					</p>
				</section>

				<section className={styles.section}>
					<h2>4. Use of Service</h2>
					<p>
						You agree to use the service only for lawful purposes and in
						accordance with these terms.
					</p>
				</section>

				<section className={styles.section}>
					<h2>5. Account Responsibilities</h2>
					<p>
						You are responsible for maintaining the confidentiality of your
						account and password, and for restricting access to your computer.
					</p>
				</section>

				<section className={styles.section}>
					<h2>6. Termination</h2>
					<p>
						We may terminate or suspend access to our service immediately,
						without prior notice or liability, for any reason whatsoever.
					</p>
				</section>

				<section className={styles.section}>
					<h2>7. Changes to Terms</h2>
					<p>
						We reserve the right, at our sole discretion, to modify or replace
						these terms at any time. It is your responsibility to check this
						page periodically for changes.
					</p>
				</section>

				<section className={styles.section}>
					<h2>8. Contact Us</h2>
					<p>
						If you have any questions about these terms, please contact us at
						support@apparelquoter.com.
					</p>
				</section>
			</Container>
			<Footer />
		</>
	);
};

export default Terms;
