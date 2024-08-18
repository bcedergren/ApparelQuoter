import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import Card from './Card';
import styles from '@/styles/SalesByCategory.module.css';
import '@/chartjs-setup';

interface SalesByCategoryProps {
	data: {
		labels: string[];
		datasets: {
			data: number[];
			backgroundColor: string[];
		}[];
	};
	totalSales: string;
}

const SalesByCategory: React.FC<SalesByCategoryProps> = ({
	data,
	totalSales,
}) => {
	const defaultData = {
		labels: data?.labels || [],
		datasets: data?.datasets || [
			{
				data: [],
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
			<p className={styles.totalSales}>Total: {totalSales || '0'}</p>
			<Doughnut data={defaultData} />
		</Card>
	);
};

export default SalesByCategory;
