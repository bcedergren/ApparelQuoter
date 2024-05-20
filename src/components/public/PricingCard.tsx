import React from 'react';
import Link from 'next/link';
import styles from '@/styles/PricingCard.module.css';

interface Plan {
	name: string;
	price: string;
	target: string;
	features: string[];
}

interface PricingCardProps {
	plan: Plan;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan }) => {
	return (
		<div className={styles.pricingCard}>
			<h3>{plan.name}</h3>
			<h5>{plan.target}</h5>
			<p>{plan.price}</p>
			<ul>
				{plan.features.map((feature: string, index: number) => (
					<li key={index}>{feature}</li>
				))}
			</ul>
			<Link href={`/register?plan=${plan.name}`}>
				<span className={styles.btnPrimary}>Sign Up</span>
			</Link>
		</div>
	);
};

export default PricingCard;
