import React, { useEffect, useState } from 'react';
import Router from 'next/router';
import { Container, Row, Col } from 'react-bootstrap';
import { useSession } from 'next-auth/react';
import Card from './Card';
import Summary from './Summary';
import ActivityList from './ActivityList';
import TransactionList from './TransactionList';
import Balance from './Balance';
import Revenue from './Revenue';
import SalesByCategory from './SalesByCategory';
import OrderList from './OrderList';
import ProductList from './ProductList';
import styles from '@/styles/Dashboard.module.css';
import { FaChartBar, FaBoxOpen, FaUsers, FaDollarSign } from 'react-icons/fa';
import { Quote } from '@/types/Quote';

const Dashboard: React.FC = () => {
	const { data: session, status } = useSession();
	const [quotes, setQuotes] = useState([]);

	useEffect(() => {
		if (status === 'unauthenticated') {
			Router.push('/login');
		} else if (status === 'authenticated') {
			fetch(`/api/quotes/${session.user.companyId}`)
				.then((res) => res.json())
				.then((data) => setQuotes(data.quotes))
				.catch((error) => console.error('Error fetching quotes:', error));
		}
	}, [status]);

	if (status === 'loading') {
		return <p>Loading...</p>;
	}

	return (
		<Container
			fluid
			className={styles.dashboardContainer}
		>
			<Row className='mt-4'>
				<Col md={3}>
					<Card
						title='Sales'
						value='98,225'
						subtitle='94% New Sales'
						icon={FaChartBar}
						color='#D1C4E9'
					/>
				</Col>
				<Col md={3}>
					<Card
						title='Orders'
						value='24,017'
						subtitle='552 New Orders'
						icon={FaBoxOpen}
						color='#BBDEFB'
					/>
				</Col>
				<Col md={3}>
					<Card
						title='Customers'
						value='92,251'
						subtitle='390 New Customers'
						icon={FaUsers}
						color='#FFCDD2'
					/>
				</Col>
				<Col md={3}>
					<Card
						title='Income'
						value='9.5 M'
						subtitle='$2.1 M This Week'
						icon={FaDollarSign}
						color='#C8E6C9'
					/>
				</Col>
			</Row>
			<Row className='mt-4'>
				<Col md={6}>
					<Summary data={quotes} />
				</Col>
				<Col md={6}>
					<Balance />
				</Col>
			</Row>
			<Row className='mt-4'>
				<Col md={4}>
					<ActivityList />
				</Col>
				<Col md={4}>
					<TransactionList />
				</Col>
				<Col md={4}>
					<Balance />
				</Col>
			</Row>
			<Row className='mt-4'>
				<Col md={6}>
					<Revenue />
				</Col>
				<Col md={6}>
					<SalesByCategory />
				</Col>
			</Row>
			<Row className='mt-4'>
				<Col md={6}>
					<OrderList />
				</Col>
				<Col md={6}>
					<ProductList />
				</Col>
			</Row>
		</Container>
	);
};

export default Dashboard;
