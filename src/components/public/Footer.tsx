import Link from 'next/link';
import { Link as ScrollLink } from 'react-scroll';
import styles from '@/styles/Footer.module.css';

const Footer = () => (
	<footer className={styles.footer}>
		<ScrollLink
			to='home'
			smooth={true}
			duration={1000}
			className={styles.scrollTop}
		>
			<i className='fa fa-arrow-up'></i>
		</ScrollLink>
		<nav className={styles.nav}>
			<Link href='/privacy'>
				<span className={styles.navLink}>Privacy Policy</span>
			</Link>
			<Link href='/terms'>
				<span className={styles.navLink}>Terms and Conditions</span>
			</Link>
			<Link href='/contact'>
				<span className={styles.navLink}>Contact Us</span>
			</Link>
		</nav>
		<p>© 2024 ApparelQuoter. All rights reserved.</p>
	</footer>
);

export default Footer;
