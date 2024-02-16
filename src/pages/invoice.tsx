import type { NextPage } from 'next';
import Layout from '../components/Layout'; // Adjust the import path according to your project structure

// Example type for invoice items, adjust according to your actual data structure
interface InvoiceItem {
	description: string;
	quantity: number;
	unitPrice: number;
}

const Invoice: NextPage = () => {
	// Placeholder data for a single invoice
	const invoiceItems: InvoiceItem[] = [
		{ description: 'Custom T-Shirt', quantity: 3, unitPrice: 20.0 },
		{ description: 'Custom Hat', quantity: 2, unitPrice: 15.0 },
	];

	const calculateTotal = () => {
		return invoiceItems.reduce(
			(total, item) => total + item.quantity * item.unitPrice,
			0
		);
	};

	return (
		<Layout>
			<div className='container mt-5'>
				<h1>Invoice Details</h1>
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
						{invoiceItems.map((item, index) => (
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

export default Invoice;
