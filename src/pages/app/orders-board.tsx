import { useEffect, useState } from 'react';
import Router from 'next/router';
import { Container } from 'react-bootstrap';
import { useSession } from 'next-auth/react';
import Layout from '@/components/app/Layout';
import { Quote } from '@/types/Quote';
import { initialOrders, OrdersState } from '@/utils/ordersUtils';
import styles from '@/styles/Ordersboard.module.css';
import { DropResult } from 'react-beautiful-dnd';
import dynamic from 'next/dynamic';

// Dynamic import of OrdersBoardComponent with SSR disabled
const OrdersBoardComponent = dynamic(
	() => import('@/components/app/OrdersBoardComponent'),
	{
		ssr: false,
	}
);

const OrdersBoardPage = () => {
	const { data: session, status } = useSession();
	const [orders, setOrders] = useState<OrdersState>(initialOrders);

	useEffect(() => {
		if (status === 'unauthenticated') {
			Router.push('/login');
		}
	}, [status]);

	useEffect(() => {
		if (status === 'authenticated' && session?.user?.companyId) {
			const fetchOrdersFromAPI = async () => {
				try {
					const response = await fetch(`/api/quotes/${session.user.companyId}`);

					if (!response.ok) {
						throw new Error(`API call failed with status: ${response.status}`);
					}

					const data = await response.json();

					if (!Array.isArray(data.quotes)) {
						console.error('Expected an array of quotes, received:', data);
						return initialOrders;
					}

					const categorizedQuotes: OrdersState = data.quotes.reduce(
						(acc: OrdersState, quote: Quote) => {
							let category: keyof OrdersState;

							switch (quote.quoteType) {
								case 'savedQuotes':
									category = 'savedQuotes';
									break;
								case 'openOrders':
									category = 'openOrders';
									break;
								case 'savedOrders':
									category = 'savedOrders';
									break;
								case 'completedOrders':
									category = 'completedOrders';
									break;
								default:
									category = 'savedQuotes';
									break;
							}

							acc[category].push(quote);
							return acc;
						},
						{ ...initialOrders }
					);

					setOrders(categorizedQuotes);
				} catch (error) {
					console.error('Failed to fetch orders:', error);
					setOrders(initialOrders);
				}
			};

			fetchOrdersFromAPI();
		}
	}, [session, status]);

	const onDragEnd = (result: DropResult) => {
		const { destination, source, draggableId } = result;

		if (!destination) {
			return;
		}

		if (
			destination.droppableId === source.droppableId &&
			destination.index === source.index
		) {
			return;
		}

		const startKey = source.droppableId as keyof OrdersState;
		const finishKey = destination.droppableId as keyof OrdersState;

		const start = orders[startKey];
		const finish = orders[finishKey];

		let updatedOrderId = draggableId;

		// Determine the new quoteType based on the finish column
		let newStatus = finishKey as string;
		let newQuoteType: string;

		switch (newStatus) {
			case 'savedQuotes':
				newQuoteType = 'savedQuotes';
				break;
			case 'openOrders':
				newQuoteType = 'openOrders';
				break;
			case 'savedOrders':
				newQuoteType = 'savedOrders';
				break;
			case 'completedOrders':
				newQuoteType = 'completedOrders';
				break;
			default:
				newQuoteType = 'savedQuotes';
				break;
		}

		if (start === finish) {
			const newOrderItems = Array.from(start);
			const [removed] = newOrderItems.splice(source.index, 1);
			newOrderItems.splice(destination.index, 0, removed);

			const newOrders = {
				...orders,
				[startKey]: newOrderItems,
			};

			setOrders(newOrders);
		} else {
			const startOrderItems = Array.from(start);
			const [removed] = startOrderItems.splice(source.index, 1);
			const finishOrderItems = Array.from(finish);
			finishOrderItems.splice(destination.index, 0, removed);

			const newOrders = {
				...orders,
				[startKey]: startOrderItems,
				[finishKey]: finishOrderItems,
			};

			setOrders(newOrders);
		}

		if (session?.user) {
			updateDatabase(updatedOrderId, newQuoteType, session).catch((error) =>
				console.error('Error updating order:', error)
			);
		}
	};

	return (
		<Layout>
			<Container
				fluid
				className={styles.dashboardContainer}
			>
				<h1>Orders Board</h1>
				<OrdersBoardComponent
					orders={orders}
					onDragEnd={onDragEnd}
				/>
			</Container>
		</Layout>
	);
};

async function updateDatabase(
	orderId: string,
	newStatus: string,
	session: any
) {
	try {
		console.log('Updating order:', orderId, 'to status:', newStatus);
		const updateResponse = await fetch(`/api/quotes/update/${orderId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ status: newStatus }),
		});

		if (!updateResponse.ok) {
			throw new Error(`API call failed with status: ${updateResponse.status}`);
		}

		const updatedOrder = await updateResponse.json();

		console.log('Order updated, creating activity record...');
		const activityResponse = await fetch(`/api/activities/create`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				orderId,
				companyId: session.user.companyId,
				updatedBy: session.user.id,
				activityType: 'status-update',
				message: `Order ${orderId} status changed to ${newStatus} by ${session.user.name}`,
				timestamp: new Date().toISOString(),
			}),
		});

		if (!activityResponse.ok) {
			throw new Error(
				`Activity logging failed with status: ${activityResponse.status}`
			);
		}

		const activityRecord = await activityResponse.json();

		console.log('Activity record created:', activityRecord);

		return { updatedOrder, activityRecord };
	} catch (error) {
		console.error('Error updating the database:', error);
		throw error;
	}
}

export default OrdersBoardPage;
