import React from 'react';
import styles from '@/styles/PricingCard.module.css';
import { Button } from 'react-bootstrap';
import { useRouter } from 'next/router';

interface Plan {
	name: string;
	price: string;
	target: string;
	features: string[];
}

interface PricingCardProps {
	plan: Plan;
	className: string;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, className }) => {
	const router = useRouter();

	const handleRegisterClick = () => {
		router.push('/register');
	};

	return (
		<div className={`${styles.card} ${className}`}>
			<h3>{plan.name}</h3>
			<p>{plan.price}</p>
			<p>{plan.target}</p>
			<ul className={styles.featuresList}>
				{plan.features.map((feature: string, index: number) => (
					<li key={index}>{feature}</li>
				))}
			</ul>
			<Button
				className={styles.registerButton}
				onClick={handleRegisterClick}
			>
				Try for free
			</Button>
		</div>
	);
};

export default PricingCard;
