import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Price from '@/models/Price';

export default async function updatePricing(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { method } = req;

	if (method === 'POST') {
		await dbConnect();

		try {
			const { _id, ...updateData } = req.body.prices;

			if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
				return res.status(400).json({ message: 'Invalid or missing _id' });
			}

			updateData.UpdatedAt = new Date();

			const result = await Price.findByIdAndUpdate(_id, updateData, {
				new: true,
			});

			if (!result) {
				return res.status(404).json({ message: 'Document not found' });
			}

			res.status(200).json(result);
		} catch (error) {
			console.error('Error updating pricing:', error);
			res
				.status(500)
				.json({ message: 'Unable to update pricing', details: error });
		}
	} else {
		res.setHeader('Allow', ['POST']);
		res.status(405).end(`Method ${method} Not Allowed`);
	}
}
