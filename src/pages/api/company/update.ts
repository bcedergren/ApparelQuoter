import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/utils/dbConnect';
import Company from '@/models/Company';
import { requireAuth } from '@/lib/auth';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
): Promise<void> {
	if (req.method === 'POST') {
		// SECURITY: Require authentication
		const session = await requireAuth(req, res);
		if (!session) return;

		await dbConnect();
		try {
			const { _id, ...updateData } = req.body;

			// SECURITY: Verify user is updating their own company
			if (_id !== session.user.companyId) {
				return res.status(403).json({
					success: false,
					message: 'Forbidden - You can only update your own company'
				});
			}

			// Add updatedAt and use session userId for updatedBy
			updateData.updatedAt = new Date().toISOString();
			updateData.updatedBy = session.user.id;

			const updatedCompany = await Company.updateOne(
				{ _id: session.user.companyId }, // Always use session companyId
				{ $set: updateData }
			);

			if (updatedCompany.modifiedCount === 1) {
				res
					.status(200)
					.json({ success: true, message: 'Company updated successfully' });
			} else {
				res.status(404).json({ success: false, message: 'Company not found' });
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({
				success: false,
				message: 'Failed to update company information',
			});
		}
	} else {
		res.setHeader('Allow', ['POST']);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
