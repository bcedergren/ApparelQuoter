import type { NextPage } from 'next';
import Layout from '@/components/Layout';

// Example type for receipt items, adjust according to your actual data structure
interface ReceiptItem {
	description: string;
	quantity: number;
	unitPrice: number;
}

const Receipt: NextPage = () => {
	// Placeholder data for a single receipt
	const receiptItems: ReceiptItem[] = [
		{ description: 'T-Shirt', quantity: 2, unitPrice: 25.0 },
		{ description: 'Jeans', quantity: 1, unitPrice: 40.0 },
	];

	const calculateTotal = () => {
		return receiptItems.reduce(
			(total, item) => total + item.quantity * item.unitPrice,
			0
		);
	};

	return (
		<Layout>
			<div className='container mt-5'>
				<h1>Receipt</h1>
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
						{receiptItems.map((item, index) => (
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

export default Receipt;
