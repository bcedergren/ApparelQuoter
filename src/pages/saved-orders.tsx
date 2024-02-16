import type { NextPage } from 'next';
import Layout from '@/components/Layout';

// Example type for an order, expand according to your actual data structure
interface Order {
	id: string;
	date: string;
	total: number;
	status: string;
}

const SavedOrders: NextPage = () => {
	// Placeholder data for saved orders
	const orders: Order[] = [
		{ id: 'SO001', date: '2024-02-14', total: 100.0, status: 'Pending' },
		{ id: 'SO002', date: '2024-02-15', total: 150.5, status: 'Completed' },
		{ id: 'SO003', date: '2024-02-16', total: 200.0, status: 'Shipped' },
	];

	return (
		<Layout>
			<div className='container mt-5'>
				<h1>Saved Orders</h1>
				<div className='list-group'>
					{orders.map((order) => (
						<a
							href='#'
							key={order.id}
							className='list-group-item list-group-item-action'
						>
							<div className='d-flex w-100 justify-content-between'>
								<h5 className='mb-1'>Order ID: {order.id}</h5>
								<small>{order.date}</small>
							</div>
							<p className='mb-1'>Total: ${order.total.toFixed(2)}</p>
							<small>Status: {order.status}</small>
						</a>
					))}
				</div>
			</div>
		</Layout>
	);
};

export default SavedOrders;
