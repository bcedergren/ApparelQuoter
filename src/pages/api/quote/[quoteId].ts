import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Quote from '@/models/Quote';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { method } = req;
	const { quoteId } = req.query;

	if (
		!quoteId ||
		typeof quoteId !== 'string' ||
		!mongoose.Types.ObjectId.isValid(quoteId)
	) {
		return res.status(400).json({ message: 'Invalid quote ID provided' });
	}

	await dbConnect();

	if (method === 'GET') {
		try {
			const quote = await Quote.findById(quoteId).exec();

			if (quote) {
				res.status(200).json(quote);
			} else {
				res.status(404).json({ message: 'Quote not found' });
			}
		} catch (error) {
			console.error('Error fetching quote:', error);
			res.status(500).json({ message: 'Failed to fetch quote details' });
		}
	} else if (method === 'DELETE') {
		try {
			const deleteResult = await Quote.findByIdAndDelete(quoteId).exec();

			if (deleteResult) {
				res.status(200).json({ message: 'Quote successfully deleted' });
			} else {
				res.status(404).json({ message: 'Quote not found' });
			}
		} catch (error) {
			console.error('Error deleting quote:', error);
			res.status(500).json({ message: 'Failed to delete quote' });
		}
	} else {
		// Handle any other HTTP methods
		res.setHeader('Allow', ['GET', 'DELETE']);
		res.status(405).end(`Method ${method} Not Allowed`);
	}
}
