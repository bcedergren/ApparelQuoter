import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/utils/dbConnect';

async function updateDTGPrinting(req: NextApiRequest, res: NextApiResponse) {
	const { db } = await connectToDatabase();

	// Assuming you're sending the ID of the document you want to update in the request body
	const { documentId } = req.body;

	// The new DTGPrinting values you want to set
	const newDTGPrintingValues = {
		small: ['10.00', '8.00', '6.50', '5.00', '4.50', '4.00', '4.00'],
		medium: ['12.00', '10.00', '8.50', '7.00', '6.50', '6.00', '5.50'],
		large: ['14.00', '12.00', '10.50', '9.00', '8.00', '7.5', '6.50'],
	};

	try {
		// Update the document with the given ID
		const result = await db
			.collection('Prices')
			.updateOne(
				{ _id: new ObjectId(documentId) },
				{ $set: { dtgPrinting: newDTGPrintingValues } }
			);

		console.log(result);

		if (result.modifiedCount === 1) {
			res.status(200).json({ message: 'DTGPrinting updated successfully.' });
		} else {
			res
				.status(404)
				.json({ message: 'Document not found or no changes made.' });
		}
	} catch (error) {
		console.error('Error updating DTGPrinting:', error);
		res.status(500).json({ message: 'Failed to update DTGPrinting.', error });
	}
}

export default updateDTGPrinting;
