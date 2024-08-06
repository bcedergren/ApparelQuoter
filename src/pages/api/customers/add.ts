import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/utils/dbConnect';
import Customer from '@/models/Customer';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') {
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	await dbConnect();
	const customerData = req.body;

	try {
		const customer = new Customer(customerData);
		const savedCustomer = await customer.save();

		res.status(201).json(savedCustomer);
	} catch (error) {
		console.error('Failed to add customer:', error);
		res.status(500).json({ message: 'Failed to add customer' });
	}
}
