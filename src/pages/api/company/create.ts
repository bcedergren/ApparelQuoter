import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/utils/dbConnect';
import Company from '@/models/Company';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { method } = req;

	if (method === 'POST') {
		await dbConnect();

		try {
			const company = new Company(req.body);
			const result = await company.save();

			res.status(201).json({ success: true, data: result });
		} catch (error) {
			console.error(error);
			res.status(400).json({ success: false, message: 'Data creation failed' });
		}
	} else {
		res.setHeader('Allow', ['POST']);
		res.status(405).end(`Method ${method} Not Allowed`);
	}
}
