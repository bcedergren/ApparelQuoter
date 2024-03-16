import React from 'react';
import styles from '@/styles/Home.module.css';

const Footer = () => {
	return (
		<footer className={styles.footer}>
			<span>&copy; {new Date().getFullYear()} ApparelQuoter</span>
		</footer>
	);
};

export default Footer;
