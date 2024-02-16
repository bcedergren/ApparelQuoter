import type { NextApiRequest, NextApiResponse } from 'next';
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

			const prices = await db
				.collection('Prices')
				.findOne({ CompanyId: companyId });

			res.status(200).json({ success: true, prices });
		} catch (error) {
			console.error(error);
			res
				.status(500)
				.json({ success: false, message: 'Failed to fetch prices' });
		} finally {
			await client.close();
		}
	} else {
		res.setHeader('Allow', ['GET']);
		res.status(405).end(`Method ${method} Not Allowed`);
	}
}
