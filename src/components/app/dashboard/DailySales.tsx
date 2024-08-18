import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Quote } from '@/types/Quote';
import styles from '@/styles/DailySales.module.css';

interface DailySalesProps {
	data: Quote[];
}

const DailySales: React.FC<DailySalesProps> = ({ data }) => {
	if (!data || !Array.isArray(data)) {
		return <p>No data available</p>;
	}

	const oneYearAgo = new Date();
	oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

	const filteredData = data.filter((quote) => {
		const quoteDate = quote.CreatedAt ? new Date(quote.CreatedAt) : undefined;

		// Ensure quote.summary and quote.summary.totalCost are defined before accessing them
		return quote.summary?.totalCost > 0 && quoteDate && quoteDate >= oneYearAgo;
	});

	if (filteredData.length === 0) {
		return <p>No sales data available for the past year.</p>;
	}

	const chartData = {
		labels: filteredData.map((quote) =>
			quote.CreatedAt ? new Date(quote.CreatedAt).toLocaleDateString() : ''
		),
		datasets: [
			{
				label: 'Sales',
				data: filteredData.map((quote) => quote.summary.totalCost),
				backgroundColor: '#FFB74D',
				borderColor: '#FFB74D',
				borderWidth: 1,
				borderRadius: 10,
			},
		],
	};

	const options = {
		scales: {
			y: {
				beginAtZero: true,
				ticks: {
					color: '#9E9E9E',
				},
				grid: {
					color: '#E0E0E0',
				},
			},
			x: {
				ticks: {
					color: '#9E9E9E',
				},
				grid: {
					color: '#E0E0E0',
				},
			},
		},
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				backgroundColor: '#616161',
				titleColor: '#fff',
				bodyColor: '#fff',
				borderColor: '#FFB74D',
				borderWidth: 1,
			},
		},
	};

	return (
		<div className={styles.card}>
			<div className={styles.header}>
				<h4 className={styles.title}>Daily Sales</h4>
			</div>
			<div className={styles.chartWrapper}>
				<Bar
					data={chartData}
					options={options}
				/>
			</div>
		</div>
	);
};

export default DailySales;
