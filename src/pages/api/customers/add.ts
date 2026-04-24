import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/utils/dbConnect';
import Customer from '@/models/Customer';
import CustomerNote from '@/models/CustomerNote';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import mongoose from 'mongoose';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') {
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	await dbConnect();

	try {
		const session = await getServerSession(req, res, authOptions);

		if (!session || !session.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const { companyId } = req.query;
		const userId = session.user.id;

		// Convert userId and companyId to ObjectId
		const userIdObject = new mongoose.Types.ObjectId(userId);
		const companyIdObject = new mongoose.Types.ObjectId(companyId as string);

		// Prepare the customer data including createdBy and createdDate
		const customerData = {
			...req.body,
			createdBy: userIdObject,
			createdDate: new Date(),
			companyId: companyIdObject,
		};

		// Save the new customer
		const customer = new Customer(customerData);
		const savedCustomer = await customer.save();

		// Create a follow-up note for the new customer
		const customerNote = new CustomerNote({
			customerId: savedCustomer._id,
			note: `Customer Added: ${savedCustomer.companyName}`,
			createdBy: userIdObject,
			createdAt: new Date(),
		});

		// Save the customer note
		await customerNote.save();

		// Respond with the saved customer data
		res.status(201).json(savedCustomer);
	} catch (error) {
		if (error instanceof Error) {
			console.error('Failed to add customer and create note:', error.message);
			res
				.status(500)
				.json({ message: 'Failed to add customer', error: error.message });
		} else {
			console.error('An unknown error occurred');
			res
				.status(500)
				.json({ message: 'Failed to add customer due to an unknown error' });
		}
	}
}
