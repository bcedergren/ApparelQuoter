import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Quote from '@/models/Quote';
import { requireAuth, verifyResourceOwnership } from '@/lib/auth';

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
		// SECURITY: Require authentication
		const session = await requireAuth(req, res);
		if (!session) return;

		try {
			const { orderId, newStatus } = req.body;

			// Check if the orderId and newStatus are provided
			if (!orderId || !newStatus) {
				return res.status(400).json({
					message: 'Missing orderId or newStatus in the request body',
				});
			}

			// SECURITY: First verify order belongs to user's company
			const order = await Quote.findById(orderId);

			if (!order) {
				return res
					.status(404)
					.json({ message: 'Order not found with provided ID' });
			}

			// SECURITY: Verify ownership
			if (!verifyResourceOwnership(order.companyId?.toString(), session.user.companyId, res)) {
				return;
			}

			// Perform the update operation
			const result = await Quote.findByIdAndUpdate(
				orderId,
				{ quoteType: newStatus },
				{ new: true }
			);

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
