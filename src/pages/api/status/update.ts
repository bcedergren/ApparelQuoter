import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Quote from '@/models/Quote';

interface UpdateStatusResponse {
	message: string;
	error?: string;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<UpdateStatusResponse>
) {
	await dbConnect();

	if (req.method === 'POST') {
		try {
			const { orderId, newStatus } = req.body;

			// Check if the orderId and newStatus are provided
			if (!orderId || !newStatus) {
				return res.status(400).json({
					message: 'Missing orderId or newStatus in the request body',
				});
			}

			// Perform the update operation
			const result = await Quote.findByIdAndUpdate(
				orderId,
				{ quoteType: newStatus },
				{ new: true }
			);

			// Check if the document was found and updated
			if (!result) {
				return res
					.status(404)
					.json({ message: 'Order not found with provided ID' });
			}

			res.status(200).json({ message: 'Order status updated successfully' });
		} catch (error: unknown) {
			console.error('Failed to update order status:', error);

			// Check if the error is an instance of the Error class
			if (error instanceof Error) {
				res.status(500).json({
					message: 'Failed to update order status',
					error: error.message,
				});
			} else {
				// Handle cases where the error is not an Error object
				res.status(500).json({
					message: 'Failed to update order status',
					error: 'An unknown error occurred',
				});
			}
		}
	} else {
		// Method Not Allowed
		res.setHeader('Allow', ['POST']);
		res.status(405).json({ message: `Method ${req.method} not allowed` });
	}
}
