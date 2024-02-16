import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/dbConnect';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { method } = req;
	const { client, db } = await connectToDatabase();

	if (method === 'POST') {
		try {
			const result = await db.collection('Company').insertOne(req.body);

			res.status(201).json({ success: true, data: result });
		} catch (error) {
			console.error(error);
			res.status(400).json({ success: false, message: 'Data creation failed' });
		} finally {
			await client.close();
		}
	} else {
		res.setHeader('Allow', ['POST']);
		res.status(405).end(`Method ${method} Not Allowed`);
	}
}
