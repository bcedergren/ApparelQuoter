import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/utils/dbConnect';
import Price from '@/models/Price';

export default async function updateAndRestructurePricing(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { method } = req;

	if (method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).end(`Method ${method} Not Allowed`);
	}

	await dbConnect();

	try {
		// Fetch all documents to update
		const documents = await Price.find({}).exec();

		// Update each document
		for (const doc of documents) {
			const { _id, artCost, screenPrinting, ...rest } = doc.toObject();

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

			// Update the document in the database
			await Price.findByIdAndUpdate(_id, updatedDoc);
		}

		res.status(200).json({ message: 'Pricing updated successfully' });
	} catch (error) {
		console.error('Error updating pricing:', error);
		res.status(500).json({ error: 'Unable to update pricing', details: error });
	}
}
