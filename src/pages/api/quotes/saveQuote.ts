import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/utils/dbConnect';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res
			.status(405)
			.json({ message: `Method ${req.method} not allowed` });
	}

	const { db, client } = await connectToDatabase();

	try {
		const quote = req.body;

		if (quote._id && quote._id !== '') {
			// Handling update for an existing quote
			const quoteId = new ObjectId(quote._id);
			delete quote._id; // Avoid conflicts during update by removing _id from the payload

			const updateResult = await db
				.collection('Quotes')
				.updateOne({ _id: quoteId }, { $set: quote });

			if (updateResult.modifiedCount === 0) {
				return res
					.status(404)
					.json({ message: 'Quote not found with provided ID' });
			}

			return res.status(200).json({
				message: 'Quote updated successfully',
				quote: { _id: quoteId, ...quote },
			});
		} else {
			// Handling new quote insertion
			delete quote._id;
			const insertResult = await db.collection('Quotes').insertOne(quote);
			const newQuoteId = insertResult.insertedId;

			return res.status(201).json({
				message: 'Quote saved successfully',
				quote: { _id: newQuoteId, ...quote },
			});
		}
	} catch (error) {
		console.error('Failed to save or update the quote:', error);
		return res
			.status(500)
			.json({ message: 'Failed to save or update the quote' });
	} finally {
		await client.close();
	}
}
