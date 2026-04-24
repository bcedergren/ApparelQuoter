import { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Sale from '@/models/Sale';
import { requireAuth } from '@/lib/auth';

const createSale = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method !== 'POST') {
		return res.status(405).json({ message: 'Method not allowed' });
	}

	// SECURITY: Require authentication
	const session = await requireAuth(req, res);
	if (!session) return;

	const { orderId, saleDate, totalAmount } = req.body;

	if (!orderId || !saleDate || !totalAmount) {
		return res.status(400).json({ message: 'Missing required fields' });
	}

	try {
		// Connect to the database if not already connected
		await dbConnect();

		// Convert the ids to ObjectId
		const orderObjectId = mongoose.Types.ObjectId.isValid(orderId)
			? new mongoose.Types.ObjectId(orderId as string)
			: null;

		if (!orderObjectId) {
			return res.status(400).json({ message: 'Invalid ObjectId provided' });
		}

		// SECURITY: Use session companyId and userId instead of trusting request body
		const companyObjectId = new mongoose.Types.ObjectId(session.user.companyId);
		const salesPersonObjectId = new mongoose.Types.ObjectId(session.user.id);

		// Create the sale record with ObjectIds
		const sale = new Sale({
			orderId: orderObjectId,
			companyId: companyObjectId,
			salesPersonId: salesPersonObjectId,
			saleDate,
			totalAmount,
		});

		const savedSale = await sale.save();

		return res.status(201).json(savedSale);
	} catch (error) {
		console.error('Error creating sale record:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
};

export default createSale;
