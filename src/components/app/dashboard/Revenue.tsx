import React from 'react';
import { Line } from 'react-chartjs-2';
import Card from './Card';
import styles from '@/styles/Revenue.module.css';
import '@/chartjs-setup';

interface RevenueProps {
	data: {
		labels: string[];
		datasets: {
			label: string;
			data: number[];
			borderColor: string;
			fill: boolean;
		}[];
	};
	totalProfit: string;
}

const Revenue: React.FC<RevenueProps> = ({ data, totalProfit }) => {
	const defaultData = {
		labels: data?.labels || [],
		datasets: data?.datasets || [
			{
				label: 'Income',
				data: [],
				borderColor: '#4caf50',
				fill: false,
			},
			{
				label: 'Expenses',
				data: [],
				borderColor: '#f44336',
				fill: false,
			},
		],
	};

	return (
		<Card title='Revenue'>
			<p className={styles.totalProfit}>
				Total Profit: {totalProfit || '$0.00'}
			</p>
			<Line data={defaultData} />
		</Card>
	);
};

export default Revenue;
