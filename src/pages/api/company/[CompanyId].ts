import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Company from '@/models/Company';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
): Promise<void> {
	const { method } = req;

	if (method === 'GET') {
		await dbConnect();
		try {
			const { companyId } = req.query;

			if (
				typeof companyId !== 'string' ||
				!mongoose.Types.ObjectId.isValid(companyId)
			) {
				return res
					.status(400)
					.json({ success: false, message: 'Invalid company ID' });
			}

			const company = await Company.findById(companyId);

			if (company) {
				res.status(200).json({ success: true, company });
			} else {
				res.status(404).json({ success: false, message: 'Company not found' });
			}
		} catch (error) {
			console.error('Error fetching company:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to fetch company information',
			});
		}
	} else {
		res.status(405).json({ success: false, message: 'Method not allowed' });
	}
}
