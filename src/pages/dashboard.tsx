import { useEffect, useState } from 'react';
import Router from 'next/router';
import { Container, Row, Col } from 'react-bootstrap';
import { useSession } from 'next-auth/react';
import Layout from '@/components/Layout';
import {
	DragDropContext,
	Droppable,
	Draggable,
	DropResult,
} from 'react-beautiful-dnd';
import { Quote, QuoteItem } from '@/types/Quote';
import { formatColumnHeader } from '@/utils/formatQuoteType';

interface Order {
	id: string;
	customerName: string;
	items: QuoteItem[];
}

interface OrdersState {
	savedQuotes: Order[];
	openOrders: Order[];
	savedOrders: Order[];
	completedOrders: Order[];
}

const initialOrders: OrdersState = {
	savedQuotes: [],
	openOrders: [],
	savedOrders: [],
	completedOrders: [],
};

interface UpdateResponse {
	message: string;
	quoteId?: string;
	error?: string;
}

const Dashboard = () => {
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
						return initialOrders; // Return some fallback or initial state
					}

					const categorizedQuotes: OrdersState = data.quotes.reduce(
						(acc: OrdersState, quote: Quote) => {
							// Determine the category based on quote.quoteType
							let category: keyof OrdersState; // Ensures category is a valid key of OrdersState

							switch (quote.quoteType) {
								case 'savedQuote':
									category = 'savedQuotes';
									break;
								case 'openOrder':
									category = 'openOrders';
									break;
								case 'savedOrder':
									category = 'savedOrders';
									break;
								case 'completedOrder':
									category = 'completedOrders';
									break;
								default:
									category = 'savedQuotes';
									break;
							}

							const order: Order = transformQuoteToOrder(quote);
							acc[category].push(order);
							return acc;
						},
						{
							savedQuotes: [],
							openOrders: [],
							savedOrders: [],
							completedOrders: [],
						} as OrdersState
					); // Type assertion to match the initial value with OrdersState

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

		if (
			!(source.droppableId in orders) ||
			!(destination.droppableId in orders)
		) {
			// Handle the case where droppableId does not correspond to a key in orders
			console.error('Invalid droppableId');
			return;
		}

		const startKey = source.droppableId as keyof OrdersState;
		const finishKey = destination.droppableId as keyof OrdersState;

		const start = orders[startKey];
		const finish = orders[finishKey];

		if (start === finish) {
			const newOrderItems = Array.from(start);
			const [removed] = newOrderItems.splice(source.index, 1);
			newOrderItems.splice(destination.index, 0, removed);

			const newOrders = {
				...orders,
				[source.droppableId]: newOrderItems,
			};

			setOrders(newOrders);
		} else {
			const startOrderItems = Array.from(start);
			const [removed] = startOrderItems.splice(source.index, 1);
			const finishOrderItems = Array.from(finish);
			finishOrderItems.splice(destination.index, 0, removed);

			const newOrders = {
				...orders,
				[source.droppableId]: startOrderItems,
				[destination.droppableId]: finishOrderItems,
			};

			setOrders(newOrders);
		}

		// Call updateDatabase function after reordering
		updateDatabase(draggableId, destination.droppableId)
			.then((response) => console.log(response.message))
			.catch((error) => console.error('Error updating order:', error));
	};

	function transformQuoteToOrder(quote: Quote): Order {
		return {
			id: quote._id, // Map _id from Quote to id in Order
			customerName: quote.customerName,
			items: quote.items,
			// Set other properties of Order as needed
		};
	}

	async function updateDatabase(
		orderId: string,
		newStatus: string
	): Promise<UpdateResponse> {
		try {
			const endpoint = `/api/status/update`;

			// Construct the request options
			const requestOptions: RequestInit = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ orderId, newStatus }),
			};

			// Make the fetch call to the API endpoint
			const response = await fetch(endpoint, requestOptions);

			// Throw an error if the response is not OK to trigger the catch block
			if (!response.ok) {
				throw new Error(`API call failed with status: ${response.status}`);
			}

			// Parse the response data
			const data: UpdateResponse = await response.json();

			// Return the parsed data
			return data;
		} catch (error) {
			// Log and return the error details
			console.error('Error updating the database:', error);
			return {
				message: 'Failed to update the database',
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	if (status === 'loading') {
		return <p>Loading...</p>;
	}

	return (
		<Layout>
			<Container
				fluid
				className='bg-light text-dark'
			>
				<h1>Dashboard</h1>
				<DragDropContext onDragEnd={onDragEnd}>
					<Row className='flex overflow-auto py-3'>
						{Object.entries(orders).map(([columnId, orderItems]) => (
							<Droppable
								droppableId={columnId}
								key={columnId}
							>
								{(provided) => (
									<Col
										md={2}
										className='mx-4'
									>
										<div
											{...provided.droppableProps}
											ref={provided.innerRef}
											className='bg-secondary rounded'
											style={{ padding: '10px' }}
										>
											<h4 className='text-center mt-2'>
												{formatColumnHeader(columnId)}
											</h4>
											{orderItems.map((item: Order, index: number) => (
												<Draggable
													key={item.id}
													draggableId={item.id}
													index={index}
												>
													{(provided) => (
														<div
															ref={provided.innerRef}
															{...provided.draggableProps}
															{...provided.dragHandleProps}
															className='card my-2'
														>
															<div className='card-body'>
																<h5>{item.customerName}</h5>
																{item.items &&
																	item.items.map((quoteItem: QuoteItem) => (
																		<div key={quoteItem.brandAndStyle}>
																			<div>
																				<strong>
																					{quoteItem.brandAndStyle} -{' '}
																					{quoteItem.color}
																				</strong>
																			</div>
																			{Object.entries(quoteItem.sizes)
																				.filter(([size, qty]) => qty > 0) // Filter out sizes with quantity 0
																				.map(([size, qty]) => (
																					<div key={size}>
																						{size} ({qty})
																					</div>
																				))}
																		</div>
																	))}
															</div>
														</div>
													)}
												</Draggable>
											))}
											{provided.placeholder}
										</div>
									</Col>
								)}
							</Droppable>
						))}
					</Row>
				</DragDropContext>
			</Container>
		</Layout>
	);
};

export default Dashboard;
