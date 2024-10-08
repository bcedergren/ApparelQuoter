import {
	DragDropContext,
	Droppable,
	Draggable,
	DropResult,
} from 'react-beautiful-dnd';
import { Quote } from '@/types/Quote';
import { OrdersState } from '@/utils/ordersUtils';
import { formatColumnHeader } from '@/utils/formatQuoteType';
import styles from '@/styles/Ordersboard.module.css';
import Link from 'next/link';
import { Button, Row } from 'react-bootstrap';

interface OrdersBoardComponentProps {
	orders: OrdersState;
	onDragEnd: (result: DropResult) => void;
	onCloseOrder: (orderId: string) => void; // Add onCloseOrder prop
}

const OrdersBoardComponent: React.FC<OrdersBoardComponentProps> = ({
	orders,
	onDragEnd,
	onCloseOrder,
}) => {
	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<div className={styles.board}>
				{Object.entries(orders)
					.filter(([columnId]) => columnId !== 'closedOrders') // Filter out 'closedOrders'
					.map(([columnId, orderItems]) => (
						<Droppable
							droppableId={columnId}
							key={columnId}
						>
							{(provided) => (
								<div
									{...provided.droppableProps}
									ref={provided.innerRef}
									className={styles.column}
								>
									<div className={styles.columnHeader}>
										<h4>{formatColumnHeader(columnId)}</h4>
									</div>
									{orderItems.map((item: Quote, index: number) => (
										<Draggable
											key={item._id}
											draggableId={item._id}
											index={index}
										>
											{(provided) => (
												<div
													ref={provided.innerRef}
													{...provided.draggableProps}
													{...provided.dragHandleProps}
													className={styles.card}
												>
													<div className={styles.cardBody}>
														<h5 className={styles.cardTitle}>
															{item.customerName}
														</h5>
														<p className={styles.quoteId}>
															Quote Number: {item.quoteId}
														</p>
														{item.items &&
															item.items.map((quoteItem) => (
																<div
																	key={quoteItem.brandAndStyle}
																	className={styles.cardText}
																>
																	<strong>
																		{quoteItem.brandAndStyle} -{' '}
																		{quoteItem.color}
																	</strong>
																	{Object.entries(quoteItem.sizes)
																		.filter(([size, qty]) => qty > 0) // Filter out sizes with quantity 0
																		.map(([size, qty]) => (
																			<div key={size}>
																				{size} ({qty})
																			</div>
																		))}
																</div>
															))}
														<Link href={`/app/quote-details/${item._id}`}>
															-View Quote-
														</Link>
														{/* Archive link for completed orders */}
														{columnId === 'completedOrders' && (
															<Row>
																<Button
																	onClick={() => onCloseOrder(item._id)}
																	className={styles.closeOrderButton}
																>
																	Close Order
																</Button>
															</Row>
														)}
													</div>
												</div>
											)}
										</Draggable>
									))}
									{provided.placeholder}
								</div>
							)}
						</Droppable>
					))}
			</div>
		</DragDropContext>
	);
};

export default OrdersBoardComponent;
