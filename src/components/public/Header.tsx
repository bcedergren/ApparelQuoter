import Link from 'next/link';
import { Link as ScrollLink } from 'react-scroll';
import styles from '@/styles/Header.module.css';

const Header = () => (
	<header className={styles.header}>
		<div className={styles.container}>
			<div className={styles.logo}>
				<Link href='/'>ApparelQuoter</Link>
			</div>
			<nav className={styles.nav}>
				<ScrollLink
					to='home'
					smooth={true}
					duration={500}
					className={styles.navLink}
				>
					Home
				</ScrollLink>
				<ScrollLink
					to='features'
					smooth={true}
					duration={500}
					className={styles.navLink}
				>
					Features
				</ScrollLink>
				<ScrollLink
					to='pricing'
					smooth={true}
					duration={500}
					className={styles.navLink}
				>
					Pricing
				</ScrollLink>
				{/* <ScrollLink
					to='testimonials'
					smooth={true}
					duration={500}
					className={styles.navLink}
				>
					Testimonials
				</ScrollLink> */}
				<ScrollLink
					to='contact'
					smooth={true}
					duration={500}
					className={styles.navLink}
				>
					Contact
				</ScrollLink>
				<Link
					href='/login'
					className={styles.navLink}
				>
					Login
				</Link>
			</nav>
		</div>
	</header>
);

export default Header;
