import { Link } from 'react-scroll';
import styles from '@/styles/Footer.module.css';

const Footer = () => (
	<footer className={styles.footer}>
		<Link
			to='home'
			smooth={true}
			duration={1000}
			className={styles.scrollTop}
		>
			<i className='fa fa-arrow-up'></i>
		</Link>
		<p>© 2024 ApparelQuoter. All rights reserved.</p>
	</footer>
);

export default Footer;
