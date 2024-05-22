import React from 'react';
import Card from './Card';
import { FaWallet } from 'react-icons/fa';
import styles from '@/styles/Balance.module.css';

const Balance: React.FC = () => (
	<Card title='Total Balance'>
		<div className={styles.balance}>
			<FaWallet className={styles.balanceIcon} />
			<p className={styles.balanceAmount}>$26,177.88</p>
		</div>
		<p className={styles.balanceInterest}>Get 6% interest</p>
		<div className={styles.buttons}>
			<button className='btn btn-primary'>Topup</button>
			<button className='btn btn-success'>Send</button>
		</div>
	</Card>
);

export default Balance;
