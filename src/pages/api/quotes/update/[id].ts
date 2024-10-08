import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Quote from '@/models/Quote';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await dbConnect();

	const { id } = req.query;

	console.log('ID:', id);

	if (!id || Array.isArray(id)) {
		return res.status(400).json({ message: 'A valid Quote ID is required' });
	}

	switch (req.method) {
		case 'GET':
			return getQuote(req, res, id);

		case 'PUT':
			return updateQuote(req, res, id);

		default:
			return res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}

// Function to handle getting a quote by ID
async function getQuote(req: NextApiRequest, res: NextApiResponse, id: string) {
	try {
		console.log('Attempting to fetch quote with ID:', id);

		// Validate and convert the id to ObjectId
		if (!mongoose.Types.ObjectId.isValid(id)) {
			console.error(`Invalid ObjectId: ${id}`);
			return res.status(400).json({ message: 'Invalid quote ID' });
		}

		const objectId = new mongoose.Types.ObjectId(id);
		const quote = await Quote.findById(objectId);

		console.log('Fetched quote total cost:', quote.summary.totalCost);

		if (!quote) {
			console.error(`Quote with ID ${id} not found`);
			return res.status(404).json({ message: 'Quote not found' });
		}

		console.log('Quote fetched successfully');
		return res.status(200).json(quote);
	} catch (error: any) {
		console.error('Failed to fetch quote:', error);
		return res
			.status(500)
			.json({ message: 'Failed to fetch quote', error: error.message });
	}
}

// Function to handle updating a quote's status by ID
async function updateQuote(
	req: NextApiRequest,
	res: NextApiResponse,
	id: string
) {
	const { status: quoteType } = req.body; // Retrieve the new quoteType from the body

	if (!quoteType) {
		return res.status(400).json({ message: 'Quote type (status) is required' });
	}

	try {
		console.log('Attempting to update quote with ID:', id);
		console.log('New quoteType:', quoteType);

		// Ensure id is treated as ObjectId
		if (!mongoose.Types.ObjectId.isValid(id)) {
			console.error(`Invalid ObjectId: ${id}`);
			return res.status(400).json({ message: 'Invalid quote ID' });
		}

		const objectId = new mongoose.Types.ObjectId(id);

		const updatedQuote = await Quote.findByIdAndUpdate(
			objectId,
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
		return res
			.status(200)
			.json({ message: 'Order updated successfully', updatedQuote });
	} catch (error: any) {
		console.error('Failed to update quote:', error);
		return res
			.status(500)
			.json({ message: 'Failed to update quote', error: error.message });
	}
}
