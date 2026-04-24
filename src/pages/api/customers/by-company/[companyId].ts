import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Customer from '@/models/Customer';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'GET') {
		res.setHeader('Allow', ['GET']);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	const { companyId } = req.query;

	if (!companyId || !mongoose.Types.ObjectId.isValid(companyId as string)) {
		return res.status(400).json({ message: 'Invalid company ID' });
	}

	await dbConnect();

	try {
		const customers = await Customer.find({ companyId: companyId });

		res.status(200).json({ success: true, customers });
	} catch (error) {
		console.error('Failed to fetch customers:', error);
		res.status(500).json({ message: 'Failed to fetch customers' });
	}
}
