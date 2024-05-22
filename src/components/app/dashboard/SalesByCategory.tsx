import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import Card from './Card';
import styles from '@/styles/SalesByCategory.module.css';
import '@/chartjs-setup';

const SalesByCategory: React.FC = () => {
	const data = {
		labels: ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Toys'],
		datasets: [
			{
				data: [1992, 1567, 1423, 1123, 890],
				backgroundColor: [
					'#ff6384',
					'#36a2eb',
					'#cc65fe',
					'#ffce56',
					'#009688',
				],
			},
		],
	};

	return (
		<Card title='Sales by Category'>
			<p className={styles.totalSales}>Total: 1992</p>
			<Doughnut data={data} />
		</Card>
	);
};

export default SalesByCategory;
