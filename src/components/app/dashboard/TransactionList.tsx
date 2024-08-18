import React from 'react';
import Card from './Card';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import styles from '@/styles/TransactionList.module.css';

interface Transaction {
	type: 'credit' | 'debit';
	description: string;
	amount: string;
}

interface TransactionListProps {
	transactions: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => (
	<Card title='Transactions'>
		<ul className={styles.transactionsList}>
			{transactions && transactions.length > 0 ? (
				transactions.map((transaction, index) => (
					<li key={index}>
						{transaction.type === 'credit' ? <FaArrowUp /> : <FaArrowDown />}{' '}
						{transaction.description} - {transaction.amount}
					</li>
				))
			) : (
				<li>No transactions available</li>
			)}
		</ul>
	</Card>
);

export default TransactionList;
