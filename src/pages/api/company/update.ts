import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/dbConnect';
import { ObjectId } from 'mongodb';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
): Promise<void> {
	if (req.method === 'POST') {
		const { client, db } = await connectToDatabase();
		try {
			const { _id, updatedBy, ...updateData } = req.body;

			// Add updatedAt and updatedBy fields to the update data
			updateData.updatedAt = new Date().toISOString();
			updateData.updatedBy = updatedBy;

			const updatedCompany = await db
				.collection('Company')
				.updateOne({ _id: new ObjectId(_id) }, { $set: updateData });

			if (updatedCompany.modifiedCount === 1) {
				res
					.status(200)
					.json({ success: true, message: 'Company updated successfully' });
			} else {
				res.status(404).json({ success: false, message: 'Company not found' });
			}
		} catch (error) {
			console.error(error);
			res
				.status(500)
				.json({
					success: false,
					message: 'Failed to update company information',
				});
		}
	} else {
		res.setHeader('Allow', ['POST']);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
