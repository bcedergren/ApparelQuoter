import type { NextPage } from 'next';
import Layout from '@/components/Layout';

const Customers: NextPage = () => {
	// Placeholder data for customer names
	const customerNames = [
		'Alice Smith',
		'Bob Johnson',
		'Charlie Brown',
		'Diana Prince',
	];

	return (
		<Layout>
			<div className='container mt-5'>
				<h1>Customers</h1>
				<ul>
					{customerNames.map((name, index) => (
						<li key={index}>{name}</li>
					))}
				</ul>
			</div>
		</Layout>
	);
};

export default Customers;
