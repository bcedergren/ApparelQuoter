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
	const { status: quoteType } = req.body; // Retrieve the new quoteType from the body

	try {
		console.log('Attempting to update quote with ID:', id);
		console.log('New quoteType:', quoteType);

		const updatedQuote = await Quote.findByIdAndUpdate(
			id,
			{ quoteType }, // Update the quoteType field
			{
				new: true,
				runValidators: true,
			}
		);

		if (!updatedQuote) {
			console.error(`Quote with ID ${id} not found`);
			return res.status(404).json({ message: 'Quote not found' });
		}

		console.log('Quote updated successfully');
		res
			.status(200)
			.json({ message: 'Order updated successfully', updatedQuote });
	} catch (error: Error | any) {
		console.error('Failed to update quote:', error);
		res
			.status(500)
			.json({ message: 'Failed to update quote', error: error.message });
	}
}
