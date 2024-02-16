import type { NextPage } from 'next';
import Layout from '../components/Layout'; // Adjust the import path according to your project structure

// Example type for an order, adjust according to your actual data structure
interface OpenOrder {
	id: string;
	date: string;
	customerName: string;
	estimatedCompletion: string;
}

const OpenOrders: NextPage = () => {
	// Placeholder data for open orders
	const openOrders: OpenOrder[] = [
		{
			id: 'OO001',
			date: '2024-02-14',
			customerName: 'Alice Smith',
			estimatedCompletion: '2024-02-20',
		},
		{
			id: 'OO002',
			date: '2024-02-15',
			customerName: 'Bob Johnson',
			estimatedCompletion: '2024-02-22',
		},
		{
			id: 'OO003',
			date: '2024-02-16',
			customerName: 'Charlie Brown',
			estimatedCompletion: '2024-02-25',
		},
	];

	return (
		<Layout>
			<div className='container mt-5'>
				<h1>Open Orders</h1>
				<ul className='list-group'>
					{openOrders.map((order) => (
						<li
							key={order.id}
							className='list-group-item'
						>
							<div className='d-flex w-100 justify-content-between'>
								<h5 className='mb-1'>Order ID: {order.id}</h5>
								<small>Ordered: {order.date}</small>
							</div>
							<p className='mb-1'>Customer: {order.customerName}</p>
							<small>Estimated Completion: {order.estimatedCompletion}</small>
						</li>
					))}
				</ul>
			</div>
		</Layout>
	);
};

export default OpenOrders;
