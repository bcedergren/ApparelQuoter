// PricingCard component
import React from 'react';
import { Col, Card, Button } from 'react-bootstrap';
import styles from '@/styles//Pricing.module.css';

interface PricingPlan {
	plan: string;
	price: string;
	features: string[];
}

const PricingCard: React.FC<PricingPlan> = ({ plan, price, features }) => {
	return (
		<Col
			lg={3}
			md={6}
			className='mt-4 pt-2'
		>
			<Card className={styles.pricingCard}>
				<Card.Header className={styles.priceHeader}>
					<h5 className='price-title'>{plan}</h5>
					<h2 className='price'>{price}</h2>
					<p className='mb-0'>/mo</p>
				</Card.Header>
				<Card.Body className={styles.priceBody}>
					{features.map((feature, index) => (
						<p
							key={index}
							className='text-muted mt-2'
						>
							{feature}
						</p>
					))}
				</Card.Body>
				<Card.Footer className={styles.priceFooter}>
					<Button variant='primary'>Buy Now</Button>
				</Card.Footer>
			</Card>
		</Col>
	);
};

export default PricingCard;
