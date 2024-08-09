import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/utils/dbConnect';
import Customer from '@/models/Customer';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await dbConnect();

	if (req.method === 'PUT') {
		const { id } = req.query;

		try {
			const customer = await Customer.findByIdAndUpdate(id, req.body, {
				new: true,
			});
			if (!customer) {
				return res
					.status(404)
					.json({ success: false, message: 'Customer not found' });
			}
			res.status(200).json({ success: true, customer });
		} catch (error) {
			res
				.status(400)
				.json({ success: false, message: 'Failed to update customer' });
		}
	} else {
		res.status(405).json({ success: false, message: 'Method Not Allowed' });
	}
}
