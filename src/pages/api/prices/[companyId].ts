import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Price from '@/models/Price';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'GET') {
		return res.status(405).end(`Method Not Allowed`);
	}

	const { companyId } = req.query;

	console.log('Company ID:', companyId);

	if (!companyId || !mongoose.Types.ObjectId.isValid(companyId as string)) {
		return res
			.status(400)
			.json({ success: false, message: 'Invalid company ID' });
	}

	await dbConnect();

	try {
		const prices = await Price.findOne({ CompanyId: companyId });

		console.log('Fetched prices:', prices);

		if (!prices) {
			return res
				.status(404)
				.json({ success: false, message: 'Prices not found' });
		}

		res.status(200).json({ success: true, prices });
	} catch (error) {
		console.error('Failed to fetch prices:', error);
		res.status(500).json({ success: false, message: 'Failed to fetch prices' });
	}
}
