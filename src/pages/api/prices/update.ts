import { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import Price from '@/models/Price';

const updatePrice = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method !== 'POST') {
		return res.status(405).json({ message: 'Method Not Allowed' });
	}

	const { prices, companyId } = req.body;

	console.log('Prices being updated');

	if (!companyId || !prices) {
		return res.status(400).json({ message: 'Invalid data provided' });
	}

	try {
		// Convert _id to ObjectId
		const priceObjectId = new mongoose.Types.ObjectId(prices._id as string);
		const updatedPrice = await Price.findOneAndUpdate(
			{ _id: priceObjectId },
			{ $set: prices },
			{ new: true } // Ensure the updated document is returned
		);

		if (!updatedPrice) {
			return res.status(404).json({ message: 'Price document not found' });
		}

		res
			.status(200)
			.json({ message: 'Prices updated successfully', data: updatedPrice });
	} catch (error) {
		console.error('Error updating prices:', error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

export default updatePrice;
