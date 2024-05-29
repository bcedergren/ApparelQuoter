import { Container } from 'react-bootstrap';
import Head from 'next/head';
import GenericHeader from '@/components/public/GenericHeader';
import Footer from '@/components/public/Footer';
import styles from '@/styles/Privacy.module.css';

const Privacy = () => {
	return (
		<>
			<Head>
				<title>Privacy Policy - ApparelQuoter</title>
			</Head>
			<GenericHeader />
			<Container className={styles.privacyContainer}>
				<h1>Privacy Policy</h1>
				<p>Last updated: 6/1/2024</p>

				<section className={styles.section}>
					<h2>1. Introduction</h2>
					<p>
						At ApparelQuoter, we are committed to protecting your privacy. This
						Privacy Policy explains how we collect, use, disclose, and safeguard
						your information when you visit our website.
					</p>
				</section>

				<section className={styles.section}>
					<h2>2. Information We Collect</h2>
					<p>
						We may collect information about you in a variety of ways. The
						information we may collect on the Site includes:
					</p>
					<ul>
						<li>
							Personal Data: Personally identifiable information, such as your
							name, shipping address, email address, and telephone number, and
							demographic information, such as your age, gender, hometown, and
							interests, that you voluntarily give to us when you register with
							the Site or when you choose to participate in various activities
							related to the Site.
						</li>
						<li>
							Derivative Data: Information our servers automatically collect
							when you access the Site, such as your IP address, your browser
							type, your operating system, your access times, and the pages you
							have viewed directly before and after accessing the Site.
						</li>
					</ul>
				</section>

				<section className={styles.section}>
					<h2>3. Use of Your Information</h2>
					<p>
						Having accurate information about you permits us to provide you with
						a smooth, efficient, and customized experience. Specifically, we may
						use information collected about you via the Site to:
					</p>
					<ul>
						<li>Create and manage your account.</li>
						<li>Process your transactions.</li>
						<li>Email you regarding your account or order.</li>
						<li>Improve our services and product offerings.</li>
						<li>
							Monitor and analyze usage and trends to improve your experience
							with the Site.
						</li>
						<li>Respond to product and customer service requests.</li>
					</ul>
				</section>

				<section className={styles.section}>
					<h2>4. Disclosure of Your Information</h2>
					<p>
						We may share information we have collected about you in certain
						situations. Your information may be disclosed as follows:
					</p>
					<ul>
						<li>
							By Law or to Protect Rights: If we believe the release of
							information about you is necessary to respond to legal process, to
							investigate or remedy potential violations of our policies, or to
							protect the rights, property, and safety of others, we may share
							your information as permitted or required by any applicable law,
							rule, or regulation.
						</li>
						<li>
							Business Transfers: We may share or transfer your information in
							connection with, or during negotiations of, any merger, sale of
							company assets, financing, or acquisition of all or a portion of
							our business to another company.
						</li>
						<li>
							Third-Party Service Providers: We may share your information with
							third parties that perform services for us or on our behalf,
							including payment processing, data analysis, email delivery,
							hosting services, customer service, and marketing assistance.
						</li>
					</ul>
				</section>

				<section className={styles.section}>
					<h2>5. Security of Your Information</h2>
					<p>
						We use administrative, technical, and physical security measures to
						help protect your personal information. While we have taken
						reasonable steps to secure the personal information you provide to
						us, please be aware that despite our efforts, no security measures
						are perfect or impenetrable, and no method of data transmission can
						be guaranteed against any interception or other type of misuse.
					</p>
				</section>

				<section className={styles.section}>
					<h2>6. Policy for Children</h2>
					<p>
						We do not knowingly solicit information from or market to children
						under the age of 13. If we learn we have collected information from
						a child under age 13 without verification of parental consent, we
						will delete that information as quickly as possible. If you believe
						we might have any information from or about a child under 13, please
						contact us at support@apparelquoter.com.
					</p>
				</section>

				<section className={styles.section}>
					<h2>7. Changes to This Privacy Policy</h2>
					<p>
						We may update this Privacy Policy from time to time in order to
						reflect, for example, changes to our practices or for other
						operational, legal, or regulatory reasons.
					</p>
				</section>

				<section className={styles.section}>
					<h2>8. Contact Us</h2>
					<p>
						If you have questions or comments about this Privacy Policy, please
						contact us at: support@apparelquoter.com.
					</p>
				</section>
			</Container>
			<Footer />
		</>
	);
};

export default Privacy;
