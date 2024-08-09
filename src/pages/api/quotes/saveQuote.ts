import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/utils/dbConnect';
import Quote from '@/models/Quote';
import Customer from '@/models/Customer';
import { Types } from 'mongoose';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') {
		console.log(`Invalid request method: ${req.method}`);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	try {
		console.log('Connecting to database...');
		await dbConnect();
		console.log('Database connected successfully.');

		const quoteData = req.body;
		console.log('Received quote data');

		// Remove _id if it's an empty string
		if (!quoteData._id) {
			console.log('Removing empty _id from quote data.');
			delete quoteData._id;
		}

		// Ensure totalDueDays is set
		if (!quoteData.totalDueDays) {
			const currentDate = new Date();
			const deliveryDueDate = new Date(
				quoteData.printingDetails.deliveryDueDate
			);
			quoteData.totalDueDays = Math.ceil(
				(deliveryDueDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24)
			);
			console.log(`Calculated totalDueDays: ${quoteData.totalDueDays}`);
		}

		// Ensure each item has a quoteType
		quoteData.items.forEach((item: any, index: number) => {
			if (!item.quoteType) {
				const errorMessage = `quoteType is required for item at index ${index}`;
				console.error(errorMessage);
				throw new Error(errorMessage);
			}
		});

		// Add userId to the quoteData
		const userId = quoteData.userId;
		if (!userId) {
			const errorMessage = 'User ID is required to save the quote';
			console.error(errorMessage);
			throw new Error(errorMessage);
		}
		console.log(`User ID: ${userId}`);

		const quote = new Quote({ ...quoteData, createdBy: userId });
		const savedQuote = await quote.save();
		console.log('Quote saved successfully with ID:', savedQuote._id);

		// Create a customer note
		const customerNote = {
			date: new Date(),
			note: `Quote created with ID: ${savedQuote._id}`,
			addedBy: new Types.ObjectId(userId), // Ensure addedBy is an ObjectId
			addedDate: new Date(),
		};

		console.log(customerNote);

		const customer = await Customer.findById(quoteData.selectedCustomerId);

		if (!customer) {
			return res.status(404).json({ message: 'Customer not found' });
		}

		// Convert follow-up notes to plain objects and ensure all required fields are present
		customer.followUpNotes = customer.followUpNotes.map((note) => {
			const noteObject = note.toObject ? note.toObject() : note; // Convert to plain object if not already
			return {
				...noteObject,
				addedDate: noteObject.addedDate || new Date(),
				addedBy: noteObject.addedBy || new Types.ObjectId(userId), // Ensure addedBy is an ObjectId
				date: noteObject.date || new Date(),
			};
		});

		// Add the new customer note
		customer.followUpNotes.push(customerNote as any);
		await customer.save();

		console.log('Customer note saved successfully.');

		res.status(201).json(savedQuote);
	} catch (error) {
		console.error('Failed to add quote:', error);

		if (error instanceof Error) {
			res
				.status(500)
				.json({ message: `Failed to add quote: ${error.message}` });
		} else {
			res
				.status(500)
				.json({ message: 'Failed to add quote due to an unknown error' });
		}
	}
}
