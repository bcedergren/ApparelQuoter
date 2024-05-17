import React, { ReactNode } from 'react';
import { Container } from 'react-bootstrap';
import styles from '@/styles/AccountLayout.module.css';

interface AccountLayoutProps {
	children: ReactNode;
}

const AccountLayout: React.FC<AccountLayoutProps> = ({ children }) => {
	return (
		<div className={styles.accountContainer}>
			<Container>{children}</Container>
		</div>
	);
};

export default AccountLayout;
