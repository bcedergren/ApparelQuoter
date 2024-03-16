import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/dbConnect';
import { ObjectId } from 'mongodb';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === 'POST') {
		const { db, client } = await connectToDatabase();

		const { quoteId } = req.query; // Get the quote ID from the URL

		if (!quoteId || typeof quoteId !== 'string') {
			return res.status(400).json({ message: 'Invalid quote ID provided' });
		}

		try {
			// Update the quoteType to "Order" for the given quoteId
			const updateResult = await db.collection('Quotes').updateOne(
				{ _id: new ObjectId(quoteId) },
				{ $set: { quoteType: 'Order' } } // Set quoteType to "Order"
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
		} finally {
			await client.close();
		}
	} else {
		// Handle any non-POST requests
		res.setHeader('Allow', ['POST']);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
