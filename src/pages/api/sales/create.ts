import { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Sale from '@/models/Sale';

const createSale = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method !== 'POST') {
		return res.status(405).json({ message: 'Method not allowed' });
	}

	const { orderId, companyId, salesPersonId, saleDate, totalAmount } = req.body;

	if (!orderId || !companyId || !salesPersonId || !saleDate || !totalAmount) {
		return res.status(400).json({ message: 'Missing required fields' });
	}

	try {
		// Connect to the database if not already connected
		await dbConnect();

		// Convert the ids to ObjectId
		const orderObjectId = mongoose.Types.ObjectId.isValid(orderId)
			? new mongoose.Types.ObjectId(orderId as string)
			: null;
		const companyObjectId = mongoose.Types.ObjectId.isValid(companyId)
			? new mongoose.Types.ObjectId(companyId as string)
			: null;
		const salesPersonObjectId = mongoose.Types.ObjectId.isValid(salesPersonId)
			? new mongoose.Types.ObjectId(salesPersonId as string)
			: null;

		if (!orderObjectId || !companyObjectId || !salesPersonObjectId) {
			return res.status(400).json({ message: 'Invalid ObjectId provided' });
		}

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
