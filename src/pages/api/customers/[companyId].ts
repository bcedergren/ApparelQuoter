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
	const { db, client } = await connectToDatabase();

	try {
		const customers = await db
			.collection('Customer')
			.find({ companyId: companyId })
			.toArray();

		res.status(200).json({ success: true, customers });
	} catch (error) {
		console.error('Failed to fetch customers:', error);
		res.status(500).json({ message: 'Failed to fetch customers' });
	} finally {
		await client.close();
	}
}
