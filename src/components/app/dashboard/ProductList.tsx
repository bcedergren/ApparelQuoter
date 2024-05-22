import React from 'react';
import Card from './Card';
import { FaHeadphones, FaShoePrints } from 'react-icons/fa';
import styles from '@/styles/ProductList.module.css';

const ProductList: React.FC = () => (
	<Card title='Top Selling Product'>
		<ul className={styles.productsList}>
			<li>
				<FaHeadphones /> Headphone - $168.09
			</li>
			<li>
				<FaShoePrints /> Shoes - $108.09
			</li>
			<li> Watch - $98.00</li>
		</ul>
	</Card>
);

export default ProductList;
