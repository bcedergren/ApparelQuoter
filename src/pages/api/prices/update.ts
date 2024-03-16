import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/utils/dbConnect';

async function updatePricing(req: NextApiRequest, res: NextApiResponse) {
	const { db, client } = await connectToDatabase();

	try {
		const { _id } = req.body.prices;
		const objectId = new ObjectId(_id);
		const prices = db.collection('Prices');

		const updateData = {
			...req.body.prices,
			UpdatedAt: new Date(),
		};

		delete updateData._id;

		const result = await prices.findOneAndUpdate(
			{ _id: objectId },
			{ $set: updateData }
		);

		if (!result) {
			console.error('Document not found with _id:', _id);
			return res.status(404).json({ error: 'Document not found' });
		}

		res.status(200).json(result.value);
	} catch (error) {
		console.error('Error updating pricing:', error);
		res.status(500).json({ error: 'Unable to update pricing', details: error });
	} finally {
		await client.close();
	}
}

export default updatePricing;
