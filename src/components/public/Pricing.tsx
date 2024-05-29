import PricingCard from '@/components/public/PricingCard';
import styles from '@/styles/Pricing.module.css';

const plans = [
	{
		id: 'price_1Ov16JLifuqhaGkV8cjqx4Gd',
		name: 'Starter Plan',
		price: '$9.99 /mo',
		target:
			'Small startups or solo entrepreneurs who are just starting out and need basic features to get going.',
		features: [
			'Access for 1 user',
			'Manage up to 10 clients',
			'Basic quoting tools',
			'Limited support (email support only)',
		],
	},
	{
		id: 'price_1Ov160LifuqhaGkVZ7VNwASh',
		name: 'Standard Plan',
		price: '$19.99 /mo',
		target:
			'Small businesses that are growing and need more advanced tools and user access',
		features: [
			'Access for up to 5 users',
			'Manage up to 50 clients',
			'Advanced quoting tools',
			'Order tracking',
			'CRM integration',
			'Priority email support',
		],
	},
	{
		id: 'price_1PJR5iLifuqhaGkVkngdP981',
		name: 'Professional Plan',
		price: '$49.99 /mo',
		target:
			'Medium-sized businesses that require comprehensive management tools and more user access.',
		features: [
			'Access for up to 20 users',
			'Manage up to 200 clients',
			'All Professional Plan features',
			'Invoicing and billing tools',
			'Inventory management',
			'Design collaboration tools',
			'Analytics and reporting',
			'Phone support',
		],
	},
];

interface PricingProps {
	selectedPlan: {
		plan: string;
		setPlan: React.Dispatch<React.SetStateAction<string>>;
	};
	selectedType: {
		type: string;
		setType: React.Dispatch<React.SetStateAction<string>>;
	};
}

const Pricing: React.FC<PricingProps> = ({ selectedPlan, selectedType }) => {
	return (
		<section
			className={styles.pricingSection}
			id='pricing'
		>
			<h2>Our Pricing Plans</h2>
			<div className={styles.pricingCards}>
				{plans.map((plan, index) => (
					<PricingCard
						key={index}
						plan={plan}
						className={styles.pricingCard}
					/>
				))}
			</div>
		</section>
	);
};

export default Pricing;
