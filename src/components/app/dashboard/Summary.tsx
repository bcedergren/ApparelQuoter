import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
	Chart,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';
import { Quote } from '@/types/Quote';
import styles from '@/styles/Summary.module.css';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface SummaryProps {
	data: Quote[];
}

const Summary: React.FC<SummaryProps> = ({ data }) => {
	const chartData = {
		labels: data.map((quote) =>
			quote.CreatedAt ? new Date(quote.CreatedAt).toLocaleDateString() : ''
		),
		datasets: [
			{
				label: 'Sales',
				data: data.map((quote) => quote.summary.totalCost),
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
				<h4 className={styles.title}>Daily sales</h4>
				<span className={styles.iconWrapper}>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						height='24'
						viewBox='0 96 960 960'
						width='24'
						fill='#FFB74D'
					>
						<path d='M796 896h-46v-60h46V896zm120-610H46q-24 0-42 18T-16 346v556q0 24 18 42t42 18h780q24 0 42-18t18-42V346q0-24-18-42t-42-18zM926 902H34V382h892v520zm-520-60H76v-60h330v60zm0-120H76v-60h330v60zm0-120H76v-60h330v60zm470 240h-46v-60h46v60zm0-120h-46v-60h46v60zm0-120h-46v-60h46v60zm0-120h-46V322h46v60zm0 0V202h-60v60h60zm-120-60h-46V202h46v60zm-120-60h-46V202h46v60zm-120-60h-46V202h46v60zm-120-60h-46V202h46v60zm-120-60h-46V202h46v60zm-120-60h-46V202h46v60zm-120-60h-46V202h46v60zm-120-60h-46V202h46v60z' />
					</svg>
				</span>
			</div>
			<p className={styles.subtitle}>Go to columns for details.</p>
			<div className={styles.chartWrapper}>
				<Bar
					data={chartData}
					options={options}
				/>
			</div>
		</div>
	);
};

export default Summary;
