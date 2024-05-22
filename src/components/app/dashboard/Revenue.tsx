import React from 'react';
import { Line } from 'react-chartjs-2';
import Card from './Card';
import styles from '@/styles/Revenue.module.css';
import '@/chartjs-setup';

const Revenue: React.FC = () => {
	const data = {
		labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
		datasets: [
			{
				label: 'Income',
				data: [16500, 14500, 16000, 17000, 18000, 20000, 22000],
				borderColor: '#4caf50',
				fill: false,
			},
			{
				label: 'Expenses',
				data: [9000, 10500, 11000, 10000, 9500, 11500, 12500],
				borderColor: '#f44336',
				fill: false,
			},
		],
	};

	return (
		<Card title='Revenue'>
			<p className={styles.totalProfit}>Total Profit: $10,840</p>
			<Line data={data} />
		</Card>
	);
};

export default Revenue;
