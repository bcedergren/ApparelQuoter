import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/dbConnect';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'GET') {
		return res.status(405).end(`Method Not Allowed`);
	}

	const { companyId } = req.query;
	const { client, db } = await connectToDatabase();
	try {
		const prices = await db
			.collection('Prices')
			.findOne({ CompanyId: companyId });

		res.status(200).json({ success: true, prices });
	} catch (error) {
		console.error('Failed to fetch prices:', error);
		res.status(500).json({ success: false, message: 'Failed to fetch prices' });
	} finally {
		await client.close();
	}
}
