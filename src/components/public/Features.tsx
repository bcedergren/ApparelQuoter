import styles from '@/styles/Features.module.css';

const features = [
	{
		title: 'Quote Management',
		text: 'Easily create and manage detailed quotes for your customers with our intuitive quoting system.',
		icon: 'fas fa-file-invoice-dollar',
	},
	{
		title: 'Order Tracking',
		text: 'Keep track of all your orders from start to finish, ensuring timely delivery and customer satisfaction.',
		icon: 'fas fa-shipping-fast',
	},
	{
		title: 'Customer Relationship Management (CRM)',
		text: 'Maintain and nurture your customer relationships with our built-in CRM features, making follow-ups and communication seamless.',
		icon: 'fas fa-users',
	},
	{
		title: 'Invoicing',
		text: 'Generate and send professional invoices directly from the application, streamlining your billing process.',
		icon: 'fas fa-file-invoice',
	},
	{
		title: 'Inventory Management',
		text: 'Manage your inventory efficiently, ensuring you always have the right materials in stock for your orders.',
		icon: 'fas fa-warehouse',
	},
	{
		title: 'Design Collaboration',
		text: 'Collaborate on designs with your team and clients within the application, ensuring everyone is on the same page.',
		icon: 'fas fa-drafting-compass',
	},
	{
		title: 'Analytics and Reporting',
		text: 'Gain insights into your business performance with detailed analytics and reporting features.',
		icon: 'fas fa-chart-line',
	},
	{
		title: 'Customer Support',
		text: 'Receive fast and friendly support whenever you need it, ensuring you can focus on what you do best.',
		icon: 'fas fa-headset',
	},
];

const Features = () => {
	return (
		<div
			className={styles.featuresSection}
			id='features'
		>
			<h2>Features</h2>
			<div className={styles.features}>
				{features.map((feature, index) => (
					<div
						key={index}
						className={styles.featureCard}
					>
						<i className={feature.icon}></i>
						<h3>{feature.title}</h3>
						<p>{feature.text}</p>
					</div>
				))}
			</div>
		</div>
	);
};

export default Features;
