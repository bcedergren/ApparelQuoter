import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/utils/dbConnect';
import Price from '@/models/Price';
import { requireAuth } from '@/lib/auth';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { method } = req;

	if (method === 'POST') {
		// SECURITY: Require authentication
		const session = await requireAuth(req, res);
		if (!session) return;

		await dbConnect();
		const priceData = req.body;

		// SECURITY: Always use session companyId, never trust request body
		priceData.companyId = session.user.companyId;

		try {
			const price = new Price(priceData);
			const savedPrice = await price.save();

			res.status(201).json({ success: true, data: savedPrice });
		} catch (error) {
			console.error(error);
			res.status(400).json({ success: false, message: 'Data creation failed' });
		}
	} else {
		res.setHeader('Allow', ['POST']);
		res.status(405).end(`Method ${method} Not Allowed`);
	}
}
