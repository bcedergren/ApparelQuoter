import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/utils/dbConnect';
import Customer from '@/models/Customer';
import { requireAuth, verifyResourceOwnership } from '@/lib/auth';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await dbConnect();

	if (req.method === 'DELETE') {
		// SECURITY: Require authentication
		const session = await requireAuth(req, res);
		if (!session) return;

		const { id } = req.query;

		try {
			// SECURITY: First find the customer to verify ownership before deletion
			const customer = await Customer.findById(id);
			
			if (!customer) {
				return res
					.status(404)
					.json({ success: false, message: 'Customer not found' });
			}

			// SECURITY: Verify customer belongs to user's company
			if (!verifyResourceOwnership(customer.companyId?.toString(), session.user.companyId, res)) {
				return;
			}

			// Now safe to delete
			await Customer.findByIdAndDelete(id);
			res.status(200).json({ success: true, message: 'Customer deleted' });
		} catch (error) {
			res
				.status(400)
				.json({ success: false, message: 'Failed to delete customer' });
		}
	} else {
		res.status(405).json({ success: false, message: 'Method Not Allowed' });
	}
}
