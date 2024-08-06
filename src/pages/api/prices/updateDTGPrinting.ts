import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Price from '@/models/Price';

export default async function updateDTGPrinting(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { method } = req;

	if (method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).end(`Method ${method} Not Allowed`);
	}

	await dbConnect();

	const { documentId, newDTGPrintingValues } = req.body;

	if (!documentId || !mongoose.Types.ObjectId.isValid(documentId)) {
		return res.status(400).json({ message: 'Invalid or missing document ID' });
	}

	try {
		const result = await Price.findByIdAndUpdate(
			documentId,
			{ $set: { dtgPrinting: newDTGPrintingValues } },
			{ new: true }
		);

		if (!result) {
			return res.status(404).json({ message: 'Document not found' });
		}

		res
			.status(200)
			.json({ message: 'DTGPrinting updated successfully', data: result });
	} catch (error) {
		console.error('Error updating DTGPrinting:', error);
		res.status(500).json({ message: 'Failed to update DTGPrinting.', error });
	}
}
