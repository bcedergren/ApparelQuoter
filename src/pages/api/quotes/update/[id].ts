import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/utils/dbConnect';
import Quote from '@/models/Quote';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'PUT') {
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	await dbConnect();

	const { id } = req.query;
	const quoteData = req.body;

	try {
		const updatedQuote = await Quote.findByIdAndUpdate(id, quoteData, {
			new: true,
			runValidators: true,
		});

		if (!updatedQuote) {
			return res.status(404).json({ message: 'Quote not found' });
		}

		res.status(200).json(updatedQuote);
	} catch (error) {
		console.error('Failed to update quote:', error);
		res.status(500).json({ message: 'Failed to update quote' });
	}
}
