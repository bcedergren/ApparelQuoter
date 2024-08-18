import React from 'react';
import Card from './Card';
import { FaWallet } from 'react-icons/fa';
import styles from '@/styles/Balance.module.css';

interface BalanceProps {
	balanceAmount: string;
	interestRate: string;
}

const Balance: React.FC<BalanceProps> = ({ balanceAmount, interestRate }) => (
	<Card title='Total Balance'>
		<div className={styles.balance}>
			<FaWallet className={styles.balanceIcon} />
			<p className={styles.balanceAmount}>{balanceAmount}</p>
		</div>
		<p className={styles.balanceInterest}>Get {interestRate} interest</p>
		<div className={styles.buttons}>
			<button className='btn btn-primary'>Topup</button>
			<button className='btn btn-success'>Send</button>
		</div>
	</Card>
);

export default Balance;
