import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/utils/dbConnect';
import Customer from '@/models/Customer';
import { requireAuth, verifyResourceOwnership } from '@/lib/auth';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await dbConnect();

	if (req.method === 'PUT') {
		// SECURITY: Require authentication
		const session = await requireAuth(req, res);
		if (!session) return;

		const { id } = req.query;

		try {
			// SECURITY: First find the customer to verify ownership
			const existingCustomer = await Customer.findById(id);
			
			if (!existingCustomer) {
				return res
					.status(404)
					.json({ success: false, message: 'Customer not found' });
			}

			// SECURITY: Verify customer belongs to user's company
			if (!verifyResourceOwnership(existingCustomer.companyId?.toString(), session.user.companyId, res)) {
				return;
			}

			// Update customer, but prevent changing companyId
			const updateData = { ...req.body };
			delete updateData.companyId; // Never allow companyId to be changed

			const customer = await Customer.findByIdAndUpdate(id, updateData, {
				new: true,
			});
			
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
