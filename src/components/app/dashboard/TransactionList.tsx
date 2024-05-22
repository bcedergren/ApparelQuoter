import React from 'react';
import Card from './Card';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import styles from '@/styles/TransactionList.module.css';

const TransactionList: React.FC = () => (
	<Card title='Transactions'>
		<ul className={styles.transactionsList}>
			<li>
				<FaArrowDown /> Electricity Bill - $16.44
			</li>
			<li>
				<FaArrowUp /> Shaun Park - $36.11
			</li>
			<li>
				<FaArrowUp /> Amy Diaz - $66.44
			</li>
			<li>
				<FaArrowDown /> Netflix - $32.00
			</li>
			<li>
				<FaArrowUp /> Daisy Anderson - $10.08
			</li>
			<li>
				<FaArrowDown /> Oscar Garner - $22.00
			</li>
		</ul>
	</Card>
);

export default TransactionList;
