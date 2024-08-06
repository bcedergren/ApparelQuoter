import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/utils/dbConnect';
import Quote from '@/models/Quote';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { method } = req;

	if (method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).json({ message: `Method ${method} not allowed` });
	}

	await dbConnect();

	try {
		const quote = req.body;

		if (quote._id && quote._id !== '') {
			// Handling update for an existing quote
			const quoteId = quote._id;
			delete quote._id; // Avoid conflicts during update by removing _id from the payload

			const updateResult = await Quote.findByIdAndUpdate(quoteId, quote, {
				new: true,
			});

			if (!updateResult) {
				return res
					.status(404)
					.json({ message: 'Quote not found with provided ID' });
			}

			return res.status(200).json({
				message: 'Quote updated successfully',
				quote: updateResult,
			});
		} else {
			// Handling new quote insertion
			const newQuote = new Quote(quote);
			const savedQuote = await newQuote.save();

			return res.status(201).json({
				message: 'Quote saved successfully',
				quote: savedQuote,
			});
		}
	} catch (error) {
		console.error('Failed to save or update the quote:', error);
		return res
			.status(500)
			.json({ message: 'Failed to save or update the quote' });
	}
}
