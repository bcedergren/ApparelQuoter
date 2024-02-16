import type { NextPage } from 'next';
import Layout from '@/components/Layout';

// Example type for a pricing plan, adjust according to your actual data structure
interface PricingPlan {
	id: string;
	name: string;
	price: number;
	features: string[];
}

const Pricing: NextPage = () => {
	// Placeholder data for pricing plans
	const pricingPlans: PricingPlan[] = [
		{
			id: 'basic',
			name: 'Basic',
			price: 9.99,
			features: ['Feature A', 'Feature B', 'Feature C'],
		},
		{
			id: 'pro',
			name: 'Pro',
			price: 19.99,
			features: [
				'Feature A',
				'Feature B',
				'Feature C',
				'Feature D',
				'Feature E',
			],
		},
		{
			id: 'enterprise',
			name: 'Enterprise',
			price: 49.99,
			features: [
				'Feature A',
				'Feature B',
				'Feature C',
				'Feature D',
				'Feature E',
				'Feature F',
				'Feature G',
			],
		},
	];

	return (
		<Layout>
			<div className='container mt-5'>
				<h1>Pricing Plans</h1>
				<div className='row'>
					{pricingPlans.map((plan) => (
						<div
							key={plan.id}
							className='col-md-4'
						>
							<div className='card mb-4 shadow-sm'>
								<div className='card-header'>
									<h4 className='my-0 font-weight-normal'>{plan.name}</h4>
								</div>
								<div className='card-body'>
									<h1 className='card-title pricing-card-title'>
										${plan.price} <small className='text-muted'>/ mo</small>
									</h1>
									<ul className='list-unstyled mt-3 mb-4'>
										{plan.features.map((feature, index) => (
											<li key={index}>{feature}</li>
										))}
									</ul>
									<button
										type='button'
										className='btn btn-lg btn-block btn-outline-primary'
									>
										Get started
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</Layout>
	);
};

export default Pricing;
