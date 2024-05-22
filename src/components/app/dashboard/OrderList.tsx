import React from 'react';
import Card from './Card';
import { FaShippingFast, FaBoxOpen } from 'react-icons/fa';
import styles from '@/styles/OrderList.module.css';

const OrderList: React.FC = () => (
	<Card title='Recent Orders'>
		<ul className={styles.ordersList}>
			<li>
				<FaShippingFast /> Luke Ivory - Headphone - $56.07
			</li>
			<li>
				<FaBoxOpen /> Andy King - Nike Sport - $88.00
			</li>
			<li>
				<FaShippingFast /> Laurie Fox - Sunglasses - $126.04
			</li>
		</ul>
	</Card>
);

export default OrderList;
