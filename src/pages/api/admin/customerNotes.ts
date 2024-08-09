import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/utils/dbConnect';
import Customer from '@/models/Customer';
import { Types } from 'mongoose';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') {
		return res
			.status(405)
			.json({ message: `Method ${req.method} Not Allowed` });
	}

	try {
		console.log('Connecting to database...');
		await dbConnect();
		console.log('Database connected successfully.');

		// Find all customers
		const customers = await Customer.find({});

		// Iterate through each customer and update their follow-up notes
		for (const customer of customers) {
			// Convert Mongoose document to plain object
			const followUpNotes = customer.followUpNotes.map((note) => {
				return {
					addedDate: note.addedDate || new Date(),
					addedBy: note.addedBy || new Types.ObjectId('defaultUserId'),
					date: note.date || new Date(),
					note: note.note,
				};
			});

			// Assign the updated follow-up notes back to the customer
			customer.followUpNotes = followUpNotes as any;

			// Save the updated customer
			await customer.save();
		}

		console.log('All customers updated successfully.');
		res.status(200).json({ message: 'All customers updated successfully.' });
	} catch (error) {
		if (error instanceof Error) {
			// Handle the error as an instance of Error
			console.error('Failed to update customers:', error.message);
			res
				.status(500)
				.json({ message: 'Failed to update customers.', error: error.message });
		} else {
			// Handle other unknown error types
			console.error(
				'Failed to update customers due to an unknown error:',
				error
			);
			res
				.status(500)
				.json({
					message: 'Failed to update customers due to an unknown error.',
				});
		}
	}
}
