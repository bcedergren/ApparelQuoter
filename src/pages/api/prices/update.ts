import { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import Price from '@/models/Price';
import { requireAuth } from '@/lib/auth';

const updatePrice = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method !== 'POST') {
		return res.status(405).json({ message: 'Method Not Allowed' });
	}

	// SECURITY: Require authentication
	const session = await requireAuth(req, res);
	if (!session) return;

	const { prices } = req.body;

	console.log('Prices being updated');

	if (!prices) {
		return res.status(400).json({ message: 'Invalid data provided' });
	}

	try {
		// SECURITY: First verify price document belongs to user's company
		const priceObjectId = new mongoose.Types.ObjectId(prices._id as string);
		const existingPrice = await Price.findById(priceObjectId);

		if (!existingPrice) {
			return res.status(404).json({ message: 'Price document not found' });
		}

		// SECURITY: Verify ownership
		if (existingPrice.companyId?.toString() !== session.user.companyId) {
			return res.status(403).json({ message: 'Forbidden - Access denied' });
		}

		// Update, but ensure companyId cannot be changed
		const updateData = { ...prices };
		updateData.companyId = session.user.companyId;

		const updatedPrice = await Price.findOneAndUpdate(
			{ _id: priceObjectId },
			{ $set: updateData },
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
