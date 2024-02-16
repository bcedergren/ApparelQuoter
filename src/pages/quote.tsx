import type { NextPage } from 'next';
import Layout from '@/components/Layout';

// Example type for quote items, adjust according to your actual data structure
interface QuoteItem {
	description: string;
	quantity: number;
	unitPrice: number;
}

const Quote: NextPage = () => {
	// Placeholder data for a single quote
	const quoteItems: QuoteItem[] = [
		{ description: 'Custom Designed Mug', quantity: 50, unitPrice: 5.0 },
		{ description: 'Personalized Keychain', quantity: 100, unitPrice: 2.5 },
	];

	const calculateTotal = () => {
		return quoteItems.reduce(
			(total, item) => total + item.quantity * item.unitPrice,
			0
		);
	};

	return (
		<Layout>
			<div className='container mt-5'>
				<h1>Quote Details</h1>
				<table className='table'>
					<thead>
						<tr>
							<th>Description</th>
							<th>Quantity</th>
							<th>Unit Price</th>
							<th>Total</th>
						</tr>
					</thead>
					<tbody>
						{quoteItems.map((item, index) => (
							<tr key={index}>
								<td>{item.description}</td>
								<td>{item.quantity}</td>
								<td>${item.unitPrice.toFixed(2)}</td>
								<td>${(item.quantity * item.unitPrice).toFixed(2)}</td>
							</tr>
						))}
						<tr>
							<td colSpan={3}>Grand Total</td>
							<td>${calculateTotal().toFixed(2)}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</Layout>
	);
};

export default Quote;
