import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/utils/dbConnect';
import Customer from '@/models/Customer';
import CustomerNote from '@/models/CustomerNote';
import { getSession } from 'next-auth/react';
import mongoose from 'mongoose';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') {
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	await dbConnect();

	const session = await getSession({ req });

	if (!session) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	const userId = new mongoose.Types.ObjectId(session.user.id);
	const customerData = {
		...req.body,
		userId,
	};

	try {
		// Save the new customer
		const customer = new Customer(customerData);
		const savedCustomer = await customer.save();

		// Create a follow-up note for the new customer
		const customerNote = new CustomerNote({
			customerId: savedCustomer._id,
			note: `Customer Added: ${savedCustomer.companyName}`,
			createdBy: userId,
			createdAt: new Date(),
		});

		// Save the customer note
		await customerNote.save();

		// Respond with the saved customer data
		res.status(201).json(savedCustomer);
	} catch (error) {
		console.error('Failed to add customer and create note:', error);
		res.status(500).json({ message: 'Failed to add customer' });
	}
}
