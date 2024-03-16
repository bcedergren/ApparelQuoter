import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/utils/dbConnect';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
): Promise<void> {
	const { method, query } = req;

	if (method === 'GET') {
		const { client, db } = await connectToDatabase();
		try {
			const companyId = query.CompanyId as string;
			const objectId = new ObjectId(companyId);
			const company = await db.collection('Company').findOne({ _id: objectId });

			if (company) {
				res.status(200).json({ success: true, company });
			} else {
				res.status(404).json({ success: false, message: 'Company not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({
				success: false,
				message: 'Failed to fetch company information',
			});
		} finally {
			await client.close();
		}
	}
}
