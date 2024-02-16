import type { NextPage } from 'next';
import Layout from '@/components/Layout';

// Example type for an order, adjust according to your actual data structure
interface CompletedOrder {
	id: string;
	date: string;
	customerName: string;
	total: number;
}

const CompletedOrders: NextPage = () => {
	// Placeholder data for completed orders
	const completedOrders: CompletedOrder[] = [
		{
			id: 'CO001',
			date: '2024-02-14',
			customerName: 'Alice Smith',
			total: 120.0,
		},
		{
			id: 'CO002',
			date: '2024-02-15',
			customerName: 'Bob Johnson',
			total: 200.5,
		},
		{
			id: 'CO003',
			date: '2024-02-16',
			customerName: 'Charlie Brown',
			total: 180.0,
		},
	];

	return (
		<Layout>
			<div className='container mt-5'>
				<h1>Completed Orders</h1>
				<div className='list-group'>
					{completedOrders.map((order) => (
						<a
							key={order.id}
							className='list-group-item list-group-item-action'
						>
							<div className='d-flex w-100 justify-content-between'>
								<h5 className='mb-1'>Order ID: {order.id}</h5>
								<small>{order.date}</small>
							</div>
							<p className='mb-1'>Customer: {order.customerName}</p>
							<p className='mb-1'>Total: ${order.total.toFixed(2)}</p>
						</a>
					))}
				</div>
			</div>
		</Layout>
	);
};

export default CompletedOrders;
