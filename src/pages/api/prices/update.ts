import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/utils/dbConnect';

async function updatePricing(req: NextApiRequest, res: NextApiResponse) {
	const { client, db } = await connectToDatabase();

	try {
		const pricing = db.collection('Pricing');

		const pricingId = req.query.pricingId as string;
		const updateData = {
			...req.body,
			UpdatedAt: new Date(),
		};

		const result = await pricing.updateOne(
			{ _id: new ObjectId(pricingId) },
			{ $set: updateData }
		);

		if (result.matchedCount === 0) {
			return res.status(404).json({ error: 'Document not found' });
		}

		res.status(200).json(result);
	} catch (error) {
		res.status(500).json({ error: 'Unable to update pricing' });
	} finally {
		await client.close();
	}
}

export default updatePricing;
