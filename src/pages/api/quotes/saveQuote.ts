import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/utils/dbConnect';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { db, client } = await connectToDatabase();

	if (req.method === 'POST') {
		try {
			const quote = req.body;

			if (quote._id) {
				const quoteId = quote._id;
				delete quote._id; // Remove _id from the object to prevent conflicts

				const result = await db
					.collection('Quotes')
					.updateOne({ _id: new ObjectId(quoteId) }, { $set: quote });

				if (result.modifiedCount === 0) {
					return res
						.status(404)
						.json({ message: 'Quote not found with provided ID' });
				}

				res.status(200).json({
					message: 'Quote updated successfully',
					quote: { _id: quoteId, ...quote },
				});
			} else {
				const result = await db.collection('Quotes').insertOne(quote);

				// Use insertedId to get the ID of the newly inserted document
				const savedQuoteId = result.insertedId;
				res.status(200).json({
					message: 'Quote saved successfully',
					quote: { _id: savedQuoteId, ...quote },
				});
			}
		} catch (error) {
			console.error('Failed to save or update the quote:', error);
			res.status(500).json({ message: 'Failed to save or update the quote' });
		} finally {
			await client.close();
		}
	} else {
		res.setHeader('Allow', ['POST']);
		res.status(405).json({ message: `Method ${req.method} not allowed` });
	}
}
