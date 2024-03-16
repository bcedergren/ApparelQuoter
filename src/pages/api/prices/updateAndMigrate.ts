import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/utils/dbConnect';

async function updateAndRestructurePricing(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { db, client } = await connectToDatabase();

	try {
		const pricesCollection = db.collection('Prices');

		// Fetch all documents to update
		const documents = await pricesCollection.find({}).toArray();

		// Update each document
		for (const doc of documents) {
			const { _id, artCost, screenPrinting, ...rest } = doc;

			const updatedDoc = {
				...rest,
				artCost: {
					firstColor: artCost.firstColor,
					additionalColor: artCost.additionalColor,
					flatFee: artCost.flatFee,
					inkMarkup: artCost.inkMarkup,
					inkChargesPerPiece: artCost.inkChargesPerPiece,
					glitterOrPuff: artCost.glitterOrPuff,
					colorMatch: { perColor: artCost.colorMatch },
					inkColorChanges: artCost.inkColorChanges,
				},
				dtgDarkGarmentMarkup: {
					small: ['0'], // Default value
					medium: ['0'], // Default value
					large: ['0'], // Default value
				},
				screenPrinting: {
					...screenPrinting,
					perScreenNew: artCost.perScreenNew,
					perScreenExisting: artCost.perScreenExisting,
				},
				UpdatedAt: new Date(),
			};

			// Remove wholesaleWebsites
			// delete updatedDoc.wholesaleWebsites;

			await pricesCollection.updateOne({ _id }, { $set: updatedDoc });
		}

		res.status(200).json({ message: 'Pricing updated successfully' });
	} catch (error) {
		console.error('Error updating pricing:', error);
		res.status(500).json({ error: 'Unable to update pricing', details: error });
	} finally {
		await client.close();
	}
}

export default updateAndRestructurePricing;
