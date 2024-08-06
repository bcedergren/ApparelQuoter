import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Quote from '@/models/Quote';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === 'POST') {
		await dbConnect();

		const { quoteId } = req.query; // Get the quote ID from the URL

		if (
			!quoteId ||
			typeof quoteId !== 'string' ||
			!mongoose.Types.ObjectId.isValid(quoteId)
		) {
			return res.status(400).json({ message: 'Invalid quote ID provided' });
		}

		try {
			// Update the quoteType to "savedOrder" for the given quoteId
			const updateResult = await Quote.updateOne(
				{ _id: new mongoose.Types.ObjectId(quoteId) },
				{ $set: { quoteType: 'savedOrder', ModifiedAt: new Date() } }
			);

			if (updateResult.matchedCount === 0) {
				return res.status(404).json({ message: 'Quote not found' });
			}

			res
				.status(200)
				.json({ message: 'Quote successfully updated to order', quoteId });
		} catch (error) {
			console.error('Failed to update quote to order:', error);
			res.status(500).json({ error: 'Failed to update quote to order' });
		}
	} else {
		// Handle any non-POST requests
		res.setHeader('Allow', ['POST']);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
