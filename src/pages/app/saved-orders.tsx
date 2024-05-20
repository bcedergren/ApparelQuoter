import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type { NextPage } from 'next';
import Link from 'next/link';
import { Modal } from 'react-bootstrap';
import Layout from '@/components/app/Layout';
import { Quote } from '@/types/Quote';

const SavedOrders: NextPage = () => {
	const { data: session, status } = useSession();
	const [orders, setOrders] = useState<Quote[]>([]);
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchOrders = async () => {
			try {
				if (status === 'authenticated' && session?.user?.companyId) {
					const companyId = session?.user?.companyId;
					const response = await fetch(
						`/api/quotes/${companyId}?quoteType=savedOrders`
					);
					if (!response.ok) {
						throw new Error('Failed to fetch orders');
					}
					const data = await response.json();

					setOrders(data.quotes);
				}
			} catch (err) {
				setError('Failed to load orders');
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		fetchOrders();
	}, [session, status]);

	const sendToComplete = async (orderId: string) => {
		// Implementation similar to OpenOrders
	};

	const deleteOrder = async () => {
		// Implementation similar to OpenOrders
	};

	const openModal = (orderId: string) => {
		setSelectedOrderId(orderId);
		setIsModalOpen(true);
	};

	if (loading) {
		return <Layout>Loading...</Layout>;
	}

	if (error) {
		return (
			<Layout>
				<div>Error: {error}</div>
			</Layout>
		);
	}

	return (
		<Layout>
			{/* Confirmation Modal */}
			{isModalOpen && (
				<Modal
					show={isModalOpen}
					onHide={() => setIsModalOpen(false)}
				>
					<Modal.Header closeButton>
						<Modal.Title>Confirm Deletion</Modal.Title>
					</Modal.Header>
					<Modal.Body>Are you sure you want to delete this order?</Modal.Body>
					<Modal.Footer>
						<button
							className='btn btn-secondary'
							onClick={() => setIsModalOpen(false)}
						>
							Cancel
						</button>
						<button
							className='btn btn-danger'
							onClick={deleteOrder}
						>
							Delete
						</button>
					</Modal.Footer>
				</Modal>
			)}
			<div className='container mt-5'>
				<h1>Saved Orders</h1>

				{orders.length > 0 ? (
					<ul className='list-group'>
						{orders.map((order) => (
							<li
								key={order._id}
								className='list-group-item'
							>
								<Link
									href={`/quote-details/${order._id}`}
									className='text-decoration-none'
								>
									<h5 className='mb-1'>Order ID: {order._id}</h5>
								</Link>
								{/* Display the date underneath the Quote ID */}
								{order.CreatedAt && (
									<small className='d-block'>
										{new Date(order.CreatedAt).toLocaleDateString()}
									</small>
								)}{' '}
								<p className='mb-1'>Customer: {order.customerName}</p>
								<p className='mb-1'>
									Total: ${order.summary.totalCost.toFixed(2)}
								</p>
								<div className='d-flex justify-content-between'>
									<button
										className='btn btn-primary'
										onClick={() => sendToComplete(order._id)}
									>
										Send to Complete
									</button>
									<button
										className='btn btn-danger'
										onClick={() => openModal(order._id)}
									>
										Delete Order
									</button>
								</div>
							</li>
						))}
					</ul>
				) : (
					<p>There are no saved orders.</p>
				)}
			</div>
		</Layout>
	);
};

export default SavedOrders;
