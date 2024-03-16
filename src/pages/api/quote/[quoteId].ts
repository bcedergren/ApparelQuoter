import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/dbConnect';
import { ObjectId } from 'mongodb';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { db, client } = await connectToDatabase();
	const { quoteId } = req.query;

	if (!quoteId || typeof quoteId !== 'string') {
		return res.status(400).json({ message: 'Invalid quote ID provided' });
	}

	if (req.method === 'GET') {
		try {
			const quote = await db
				.collection('Quotes')
				.findOne({ _id: new ObjectId(quoteId) });

			if (quote) {
				const transformedQuote = {
					...quote,
					_id: quote._id.toString(), // Convert ObjectId to string
				};

				res.status(200).json(transformedQuote);
			} else {
				res.status(404).json({ message: 'Quote not found' });
			}
		} catch (error) {
			console.error('Error fetching quote:', error);
			res.status(500).json({ message: 'Failed to fetch quote details' });
		} finally {
			await client.close();
		}
	} else if (req.method === 'DELETE') {
		try {
			const deleteResult = await db
				.collection('Quotes')
				.deleteOne({ _id: new ObjectId(quoteId) });

			if (deleteResult.deletedCount === 1) {
				res.status(200).json({ message: 'Quote successfully deleted' });
			} else {
				res.status(404).json({ message: 'Quote not found' });
			}
		} catch (error) {
			console.error('Error deleting quote:', error);
			res.status(500).json({ message: 'Failed to delete quote' });
		} finally {
			await client.close();
		}
	} else {
		// Handle any other HTTP methods
		res.setHeader('Allow', ['GET', 'DELETE']);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
