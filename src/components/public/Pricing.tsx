// Pricing.tsx
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import PricingCard from './PricingCard';
import styles from '@/styles/Pricing.module.css'; // Import CSS module

const Pricing: React.FC = () => {
	return (
		<section className={styles.pricingSection}>
			<div className='container'>
				<Row className='justify-content-center'>
					<Col
						lg={12}
						className='text-center'
					>
						<h4 className={styles.title}>Our Pricing Plans</h4>
						<p className={styles.paraDesc}>
							Choose the plan that fits your needs.
						</p>
					</Col>
				</Row>
				<Row>
					{pricingPlans.map((plan, index) => (
						<PricingCard
							key={index}
							plan={plan.plan}
							price={plan.price}
							features={plan.features}
						/>
					))}
				</Row>
			</div>
		</section>
	);
};

export default Pricing;

const pricingPlans = [
	{
		plan: 'Starter',
		price: '$0.00',
		features: [
			'Full Access',
			'Enhanced Security',
			'Source Files',
			'1 Domain Free',
		],
	},
	{
		plan: 'Professional',
		price: '$9.99',
		features: [
			'Full Access',
			'Source Files',
			'Enhanced Security',
			'1 Domain Free',
		],
	},
	{
		plan: 'Standard',
		price: '$19.99',
		features: [
			'Full Access',
			'Enhanced Security',
			'Source Files',
			'1 Domain Free',
		],
	},
	{
		plan: 'Premium',
		price: '$29.99',
		features: [
			'Full Access',
			'Source Files',
			'Enhanced Security',
			'1 Domain Free',
		],
	},
];
