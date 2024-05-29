import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/utils/dbConnect';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
): Promise<void> {
	const { method } = req;

	if (method === 'GET') {
		const { client, db } = await connectToDatabase();
		try {
			const { companyId } = req.query;

			if (typeof companyId !== 'string' || !ObjectId.isValid(companyId)) {
				return res
					.status(400)
					.json({ success: false, message: 'Invalid company ID' });
			}

			const objectId = new ObjectId(companyId);
			const company = await db.collection('Company').findOne({ _id: objectId });

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
		} finally {
			await client.close();
		}
	} else {
		res.status(405).json({ success: false, message: 'Method not allowed' });
	}
}
