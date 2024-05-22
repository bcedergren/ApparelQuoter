import React from 'react';
import styles from '@/styles/AppFooter.module.css';

interface FooterProps {
	isCollapsed: boolean;
}

const Footer: React.FC<FooterProps> = ({ isCollapsed }) => {
	return (
		<footer className={isCollapsed ? styles.footerCollapsed : styles.footer}>
			<p>Copyright © 2024 ApparelQuoter. All rights reserved.</p>
		</footer>
	);
};

export default Footer;
