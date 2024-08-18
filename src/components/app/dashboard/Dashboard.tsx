import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Card from './Card';
import Summary from './DailySales';
import ActivityList from './ActivityList';
import TransactionList from './TransactionList';
import Balance from './Balance';
import Revenue from './Revenue';
import SalesByCategory from './SalesByCategory';
import OrderList from './OrderList';
import ProductList from './ProductList';
import styles from '@/styles/Dashboard.module.css';
import { FaChartBar, FaBoxOpen, FaUsers, FaDollarSign } from 'react-icons/fa';

const Dashboard: React.FC<{ data: any }> = ({ data }) => {
	console.log(data);

	// Calculate the percentage of new sales
	const totalSales = data.totalSales || 0;
	const newSales = data.newSales || 0;
	const newSalesPercentage =
		totalSales > 0 ? ((newSales / totalSales) * 100).toFixed(2) : 0;

	return (
		<Container
			fluid
			className={styles.dashboardContainer}
		>
			<Row className='mt-4'>
				<Col md={3}>
					<Card
						title='Sales'
						value={totalSales.toLocaleString()}
						subtitle={`${newSalesPercentage}% New Sales`}
						icon={FaChartBar}
						color='#D1C4E9'
					/>
				</Col>
				<Col md={3}>
					<Card
						title='Orders'
						value={(data.totalOrders || 0).toLocaleString()}
						subtitle={`${data.newOrders || 0} New Orders`}
						icon={FaBoxOpen}
						color='#BBDEFB'
					/>
				</Col>
				<Col md={3}>
					<Card
						title='Customers'
						value={(data.totalCustomers || 0).toLocaleString()}
						subtitle={`${data.newCustomers || 0} New Customers`}
						icon={FaUsers}
						color='#FFCDD2'
					/>
				</Col>
				<Col md={3}>
					<Card
						title='Income'
						value={`${(data.totalPayments || 0).toLocaleString()} M`}
						subtitle={`$${data.weeklyIncome || 0} This Week`}
						icon={FaDollarSign}
						color='#C8E6C9'
					/>
				</Col>
			</Row>
			<Row className='mt-4'>
				<Col md={12}>
					<Summary data={data.recentActivities || []} />
				</Col>
			</Row>
			<Row className='mt-4'>
				<Col md={4}>
					<ActivityList activities={data.recentActivities || []} />
				</Col>
				<Col md={4}>
					<TransactionList transactions={data.transactions || []} />
				</Col>
				<Col md={4}>
					<Balance
						balanceAmount={data.balance || '0'}
						interestRate='6%'
					/>
				</Col>
			</Row>
			<Row className='mt-4'>
				<Col md={6}>
					<Revenue
						data={data.revenueData || { labels: [], datasets: [] }}
						totalProfit='$10,840'
					/>
				</Col>
				<Col md={6}>
					<SalesByCategory
						data={data.salesByCategory || { labels: [], datasets: [] }}
						totalSales='1992'
					/>
				</Col>
			</Row>
			<Row className='mt-4'>
				<Col md={6}>
					<OrderList orders={data.orders || []} />
				</Col>
				<Col md={6}>
					<ProductList products={data.products || []} />
				</Col>
			</Row>
		</Container>
	);
};

export default Dashboard;
