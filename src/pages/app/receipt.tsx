import type { NextPage } from 'next';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/app/Layout';

// Example type for receipt items, adjust according to your actual data structure
interface ReceiptItem {
	description: string;
	quantity: number;
	unitPrice: number;
}

const Receipt: NextPage = () => {
	const router = useRouter();
	
	// TEMPORARY: Redirect to dashboard until receipt feature is fully implemented
	// This page currently has placeholder data and is not MVP-ready
	// TODO: Implement real receipt functionality with invoice/quote data
	useEffect(() => {
		router.push('/app/dashboard');
	}, [router]);

	// Placeholder data for a single receipt (will be removed when feature is implemented)
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
